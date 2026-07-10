import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ============================================================
// GET /api/ukt/eligibility?memberId=xxx
// Cek kelayakan UKT member — bisa ditampilkan di APK sebelum daftar
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json({ error: "memberId diperlukan" }, { status: 400 });
    }

    const member = await prisma.member.findFirst({
      where: { OR: [{ id: memberId }, { userId: memberId }] },
      select: {
        id: true,
        fullName: true,
        currentBelt: true,
        memberNumber: true,
        createdAt: true,
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
    }

    // Ambil konfigurasi dari Setting
    const setting = await prisma.setting.findUnique({ where: { id: "default" } });
    const req = (setting?.uktRequirements as Record<string, any>) || {};
    const minPercent: number = req.minAttendancePercent || 0;
    const minSessions: number = req.minAttendanceSessions || 0;
    const periodMonths: number = req.periodMonths || 3;
    const requireSppLunas: boolean = req.requireSppLunas || false;

    const checks: Record<string, { passed: boolean; info: string }> = {};

    // ── 1. CEK KEHADIRAN ──
    if (minPercent > 0 || minSessions > 0) {
      const since = new Date();
      since.setMonth(since.getMonth() - periodMonths);
      since.setHours(0, 0, 0, 0);

      const schedules = await prisma.schedule.findMany();
      const weeksInPeriod = Math.round(periodMonths * 4.33);
      const totalSesiTerjadwal = schedules.length * weeksInPeriod;

      const attendances = await prisma.attendance.findMany({
        where: { memberId: member.id, present: true, date: { gte: since } }
      });

      const totalHadir = attendances.length;
      const persen = totalSesiTerjadwal > 0
        ? Math.round((totalHadir / totalSesiTerjadwal) * 100)
        : 100;

      const passedPersen = minPercent === 0 || persen >= minPercent;
      const passedSesi = minSessions === 0 || totalHadir >= minSessions;

      checks.kehadiran = {
        passed: passedPersen && passedSesi,
        info: `${totalHadir} dari ${totalSesiTerjadwal} sesi (${persen}%) dalam ${periodMonths} bulan terakhir` +
          (minPercent > 0 ? ` — min. ${minPercent}%` : '') +
          (minSessions > 0 ? ` — min. ${minSessions} sesi` : ''),
      };
    } else {
      checks.kehadiran = { passed: true, info: "Tidak ada syarat kehadiran minimum" };
    }

    // ── 2. CEK SPP LUNAS ──
    if (requireSppLunas) {
      const sppTunggakan = await prisma.sPPRecord.findFirst({
        where: { memberId: member.id, status: { in: ["UNPAID", "OVERDUE"] } },
        orderBy: { dueDate: "asc" }
      });
      checks.spp = {
        passed: !sppTunggakan,
        info: sppTunggakan
          ? `Ada tunggakan SPP bulan ${sppTunggakan.month}/${sppTunggakan.year}`
          : "SPP lunas",
      };
    } else {
      checks.spp = { passed: true, info: "Syarat SPP tidak dikonfigurasi" };
    }

    // ── 3. CEK UKT TERDEKAT TERSEDIA ──
    const exam = await prisma.uktExam.findFirst({
      where: { status: "UPCOMING" },
      orderBy: { date: "asc" }
    });
    checks.jadwalUkt = {
      passed: !!exam,
      info: exam
        ? `UKT tersedia: ${exam.title} — ${new Date(exam.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
        : "Belum ada jadwal UKT tersedia",
    };

    // ── 4. CEK BELUM TERDAFTAR ──
    if (exam) {
      const alreadyRegistered = await prisma.uktParticipant.findFirst({
        where: { uktExamId: exam.id, memberId: member.id }
      });
      checks.belumTerdaftar = {
        passed: !alreadyRegistered,
        info: alreadyRegistered ? "Sudah terdaftar di UKT ini" : "Belum terdaftar",
      };
    }

    const allPassed = Object.values(checks).every(c => c.passed);

    return NextResponse.json({
      member: {
        id: member.id,
        fullName: member.fullName,
        currentBelt: member.currentBelt,
        memberNumber: member.memberNumber,
      },
      eligible: allPassed,
      checks,
      config: {
        minAttendancePercent: minPercent,
        minAttendanceSessions: minSessions,
        periodMonths,
        requireSppLunas,
        isAttendanceRequired: minPercent > 0 || minSessions > 0,
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
