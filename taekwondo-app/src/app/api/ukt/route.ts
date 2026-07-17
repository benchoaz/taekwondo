import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ============================================================
// Helper: Hitung statistik kehadiran member dalam N bulan terakhir
// ============================================================
async function getAttendanceStats(memberId: string, periodMonths: number) {
  const since = new Date();
  since.setMonth(since.getMonth() - periodMonths);
  since.setHours(0, 0, 0, 0);

  // Total sesi latihan yang ada dalam periode (dari Schedule × jumlah minggu)
  const schedules = await prisma.schedule.findMany();
  const weeksInPeriod = Math.round(periodMonths * 4.33); // rata-rata minggu per bulan
  const totalSesiTerjadwal = schedules.length * weeksInPeriod;

  // Kehadiran aktual member
  const attendances = await prisma.attendance.findMany({
    where: {
      memberId,
      present: true,
      date: { gte: since },
    },
  });

  const totalHadir = attendances.length;
  const persen = totalSesiTerjadwal > 0
    ? Math.round((totalHadir / totalSesiTerjadwal) * 100)
    : 100; // Jika tidak ada jadwal, anggap 100%

  return { totalHadir, totalSesiTerjadwal, persen, since };
}

// ============================================================
// GET /api/ukt — Info UKT terdekat + status registrasi member
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let memberId = searchParams.get("memberId");

    // Resolusi otomatis jika memberId yang dikirim adalah userId
    if (memberId) {
      const resolvedMember = await prisma.member.findFirst({
        where: {
          OR: [
            { id: memberId },
            { userId: memberId }
          ]
        }
      });
      if (resolvedMember) {
        memberId = resolvedMember.id;
      }
    }

    const exam = await prisma.uktExam.findFirst({
      where: { status: "UPCOMING" },
      orderBy: { date: "asc" },
      include: {
        participants: {
          include: { member: true }
        }
      }
    });

    if (!exam) {
      return NextResponse.json({ error: "Belum ada jadwal UKT terdekat." }, { status: 404 });
    }

    let registration = null;
    let eligibility = null;

    if (memberId) {
      registration = await prisma.uktParticipant.findFirst({
        where: { uktExamId: exam.id, memberId }
      });

      // Sertakan info kelayakan kehadiran jika ada setting
      const setting = await prisma.setting.findUnique({ where: { id: "default" } });
      
      // Dinamis normalisasi list dokumen murid agar sinkron dengan pengaturan admin terbaru
      if (registration && setting) {
        const uktReqs = (setting.uktRequirements as string[]) || [];
        const currentDocs = (registration.uploadedDocs as Record<string, any>) || {};
        const normalizedDocs: Record<string, any> = {};

        // 1. Masukkan dokumen yang saat ini wajib di pengaturan dojang
        for (const reqName of uktReqs) {
          normalizedDocs[reqName] = currentDocs[reqName] || "";
        }

        // 2. Tetap pertahankan bukti upload dokumen lama jika murid sudah terlanjur mengunggahnya
        for (const [docName, docUrl] of Object.entries(currentDocs)) {
          if (docUrl && !normalizedDocs[docName]) {
            normalizedDocs[docName] = docUrl;
          }
        }

        registration.uploadedDocs = normalizedDocs;
      }

      const req = (setting?.uktRequirements as Record<string, any>) || {};
      const periodMonths = req.periodMonths || 3;
      const minPercent = req.minAttendancePercent || 0;
      const minSessions = req.minAttendanceSessions || 0;

      if (minPercent > 0 || minSessions > 0) {
        const stats = await getAttendanceStats(memberId, periodMonths);
        eligibility = {
          totalHadir: stats.totalHadir,
          totalSesiTerjadwal: stats.totalSesiTerjadwal,
          persentaseKehadiran: stats.persen,
          periodMonths,
          minAttendancePercent: minPercent,
          minAttendanceSessions: minSessions,
          eligible: stats.persen >= minPercent && stats.totalHadir >= minSessions,
          sejak: stats.since.toISOString().split('T')[0],
        };
      }
    }

    return NextResponse.json({ exam, registration, eligibility });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// POST /api/ukt — Daftar UKT (dengan validasi kehadiran opsional)
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { memberId, uktExamId, targetBelt, uploadedDocs } = body;

    if (!memberId || !uktExamId || !targetBelt) {
      return NextResponse.json({ error: "Data registrasi tidak lengkap." }, { status: 400 });
    }

    // Resolusi otomatis jika memberId yang dikirim adalah userId
    const resolvedMember = await prisma.member.findFirst({
      where: {
        OR: [
          { id: memberId },
          { userId: memberId }
        ]
      }
    });

    if (!resolvedMember) {
      return NextResponse.json({ error: "Data siswa tidak ditemukan." }, { status: 404 });
    }
    memberId = resolvedMember.id;

    // --------------------------------------------------------
    // Cek apakah sudah terdaftar di UKT ini
    // --------------------------------------------------------
    const alreadyRegistered = await prisma.uktParticipant.findFirst({
      where: { uktExamId, memberId }
    });
    if (alreadyRegistered) {
      return NextResponse.json({ error: "Anda sudah terdaftar di UKT ini." }, { status: 400 });
    }

    // --------------------------------------------------------
    // Ambil konfigurasi syarat kehadiran dari Setting
    // --------------------------------------------------------
    const setting = await prisma.setting.findUnique({ where: { id: "default" } });
    const req = (setting?.uktRequirements as Record<string, any>) || {};
    const minPercent: number = req.minAttendancePercent || 0;
    const minSessions: number = req.minAttendanceSessions || 0;
    const periodMonths: number = req.periodMonths || 3;

    // --------------------------------------------------------
    // Validasi kehadiran (hanya jika syarat dikonfigurasi > 0)
    // --------------------------------------------------------
    if (minPercent > 0 || minSessions > 0) {
      const stats = await getAttendanceStats(memberId, periodMonths);

      const gagalPersen = minPercent > 0 && stats.persen < minPercent;
      const gagalSesi = minSessions > 0 && stats.totalHadir < minSessions;

      if (gagalPersen || gagalSesi) {
        const pesanDetail: string[] = [];
        if (gagalPersen) {
          pesanDetail.push(
            `Kehadiran Anda ${stats.persen}% (minimal ${minPercent}%)`
          );
        }
        if (gagalSesi) {
          pesanDetail.push(
            `Jumlah sesi hadir ${stats.totalHadir} sesi (minimal ${minSessions} sesi)`
          );
        }

        return NextResponse.json({
          error: "Syarat kehadiran belum terpenuhi untuk mendaftar UKT.",
          detail: pesanDetail.join(" & "),
          attendance: {
            totalHadir: stats.totalHadir,
            totalSesiTerjadwal: stats.totalSesiTerjadwal,
            persentaseKehadiran: stats.persen,
            periodMonths,
            minAttendancePercent: minPercent,
            minAttendanceSessions: minSessions,
            sejak: stats.since.toISOString().split('T')[0],
          }
        }, { status: 400 });
      }
    }

    // --------------------------------------------------------
    // Daftarkan peserta UKT
    // --------------------------------------------------------
    const registration = await prisma.uktParticipant.create({
      data: {
        memberId,
        uktExamId,
        targetBelt,
        status: "PENDING",
        uploadedDocs: uploadedDocs || {}
      }
    });

    // Hitung biaya UKT dari setting
    const uktFeesMap = (setting?.uktFees as Record<string, any> | null) || {};
    const feeToCharge = uktFeesMap[targetBelt] !== undefined && uktFeesMap[targetBelt] !== null
      ? parseFloat(uktFeesMap[targetBelt])
      : (setting?.uktFee || 150000);

    // Buat tagihan pembayaran otomatis
    const payment = await prisma.payment.create({
      data: {
        memberId,
        amount: feeToCharge,
        purpose: `Pendaftaran UKT (${targetBelt.split(" (")[0]})`,
        status: "PENDING"
      }
    });

    // Hitung statistik kehadiran untuk ditampilkan di respons
    const stats = minPercent > 0 || minSessions > 0
      ? await getAttendanceStats(memberId, periodMonths)
      : null;

    return NextResponse.json({
      success: true,
      registration,
      payment,
      ...(stats && {
        attendance: {
          totalHadir: stats.totalHadir,
          persentaseKehadiran: stats.persen,
          periodMonths,
        }
      })
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
