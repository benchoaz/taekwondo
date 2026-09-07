import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mapping nama hari Indonesia ke index JS (0=Minggu, 1=Senin, dst)
const HARI_MAP: Record<string, number> = {
  'minggu': 0, 'senin': 1, 'selasa': 2, 'rabu': 3,
  'kamis': 4, 'jumat': 5, 'sabtu': 6
};

// Konversi "17:30" ke menit dari tengah malam
function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// GET: Cek status apakah member sudah absen hari ini
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const headerUserId = request.headers.get('x-user-id');
    const paramId = searchParams.get('memberId');
    const targetId = paramId || headerUserId;

    if (!targetId) {
      return NextResponse.json({ error: "memberId diperlukan" }, { status: 400 });
    }

    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { id: targetId },
          { userId: targetId },
          ...(headerUserId ? [{ userId: headerUserId }] : []),
          { user: { email: targetId } },
          { memberNumber: targetId },
          { memberNumber: targetId.replace('#', '') }
        ]
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
    }

    const now = new Date();
    const wibDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    const today = new Date(`${wibDateStr}T00:00:00.000Z`);

    const attendance = await prisma.attendance.findFirst({
      where: {
        memberId: member.id,
        date: today,
        present: true
      },
      include: {
        schedule: true
      }
    });

    return NextResponse.json({
      attended: !!attendance,
      attendance: attendance || null
    });
  } catch (error: any) {
    console.error("Error fetching today check-in status:", error);
    return NextResponse.json({ error: "Gagal memuat status absensi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, latitude, longitude } = body;
    const headerUserId = request.headers.get('x-user-id');
    const targetId = memberId || headerUserId;

    if (!targetId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Cari member fleksibel (ID Member, User ID, Session User ID, Email, atau Nomor Anggota)
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { id: targetId },
          { userId: targetId },
          ...(headerUserId ? [{ userId: headerUserId }] : []),
          { user: { email: targetId } },
          { memberNumber: targetId },
          { memberNumber: targetId.replace('#', '') }
        ]
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
    }

    const targetMemberId = member.id;
    const now = new Date();

    // ================================================================
    // 1. VALIDASI GEOFENCING (Radius Dojang dengan Toleransi GPS)
    // ================================================================
    const setting = await prisma.setting.findUnique({ where: { id: "default" } });
    if (setting?.dojangLat && setting?.dojangLng && latitude && longitude) {
      const R = 6371e3;
      const lat1 = setting.dojangLat * Math.PI / 180;
      const lat2 = latitude * Math.PI / 180;
      const deltaLat = (latitude - setting.dojangLat) * Math.PI / 180;
      const deltaLng = (longitude - setting.dojangLng) * Math.PI / 180;
      const a = Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
      const distance = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

      // Berikan toleransi akurasi GPS HP (buffer min 250 meter)
      const allowedRadius = Math.max(setting.dojangRadius || 100, 250);

      if (distance > allowedRadius) {
        return NextResponse.json({
          code: "OUT_OF_RADIUS",
          error: `Anda berada di luar area dojang`,
          detail: `Jarak Anda terdeteksi ${distance} meter dari dojang (maksimum toleransi: ${allowedRadius} meter). Pastikan Anda berada di area latihan.`,
          distance,
          maxRadius: allowedRadius,
        }, { status: 400 });
      }
    }

    // ================================================================
    // 2. VALIDASI JADWAL — Berdasarkan Waktu WIB (Asia/Jakarta, UTC+7)
    // ================================================================
    const wibDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const todayIndex = wibDate.getDay(); // 0=Minggu, 1=Senin, dst (WIB)
    const hariIniNama = Object.keys(HARI_MAP).find(k => HARI_MAP[k] === todayIndex) || '';

    // Ambil semua jadwal yang hari-nya cocok dengan hari ini
    const allSchedules = await prisma.schedule.findMany();
    const todaySchedules = allSchedules.filter(s =>
      HARI_MAP[s.dayOfWeek.toLowerCase()] === todayIndex
    );

    if (todaySchedules.length === 0) {
      const hariFormatted = hariIniNama.charAt(0).toUpperCase() + hariIniNama.slice(1);
      return NextResponse.json({
        code: "NO_SCHEDULE",
        error: `Tidak ada jadwal latihan hari ${hariFormatted}`,
        detail: `Hari ini (${hariFormatted}) tidak ada jadwal latihan terdaftar. Absen mandiri hanya dibuka pada hari latihan.`,
      }, { status: 400 });
    }

    // ================================================================
    // 3. VALIDASI JAM — Berdasarkan Menit WIB (Asia/Jakarta)
    //    Toleransi: 60 menit sebelum mulai s.d. 60 menit setelah selesai
    // ================================================================
    const TOLERANSI_MENIT = 60;
    const nowMinutes = wibDate.getHours() * 60 + wibDate.getMinutes();

    let activeSchedule = todaySchedules.find(s => {
      const start = timeToMinutes(s.startTime) - TOLERANSI_MENIT;
      const end = timeToMinutes(s.endTime) + TOLERANSI_MENIT;
      return nowMinutes >= start && nowMinutes <= end;
    });

    if (!activeSchedule) {
      const jadwalList = todaySchedules
        .map(s => `${s.className}: ${s.startTime}–${s.endTime} WIB`)
        .join(', ');

      return NextResponse.json({
        code: "OUT_OF_TIME",
        error: `Di luar jam latihan`,
        detail: `Absen hanya bisa dilakukan mulai 60 menit sebelum hingga 60 menit setelah latihan berakhir. Jadwal hari ini: ${jadwalList}`,
        todaySchedules: todaySchedules.map(s => ({
          className: s.className,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      }, { status: 400 });
    }

    // ================================================================
    // 4. SIMPAN ABSEN
    // ================================================================
    const wibDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    const today = new Date(`${wibDateStr}T00:00:00.000Z`);

    const existing = await prisma.attendance.findFirst({
      where: { memberId: targetMemberId, date: today }
    });

    if (existing) {
      // Sudah absen hari ini — update saja (tidak tambah koin lagi)
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          present: true,
          scheduleId: activeSchedule.id,
          checkInTime: now,
          latitude: latitude ?? existing.latitude,
          longitude: longitude ?? existing.longitude,
        }
      });
      return NextResponse.json({
        success: true,
        message: `Absensi diperbarui — ${activeSchedule.className}`,
        data: updated,
        schedule: {
          className: activeSchedule.className,
          startTime: activeSchedule.startTime,
          endTime: activeSchedule.endTime,
        }
      });
    }

    // Absen baru — catat + berikan Dojang Coins
    const ATTENDANCE_COINS = 10;
    const [newAttendance] = await prisma.$transaction([
      prisma.attendance.create({
        data: {
          memberId: targetMemberId,
          scheduleId: activeSchedule.id,
          date: today,
          present: true,
          checkInTime: now,
          latitude,
          longitude,
        }
      }),
      prisma.member.update({
        where: { id: targetMemberId },
        data: { dojangCoins: { increment: ATTENDANCE_COINS } }
      }),
      prisma.dojangCoinLog.create({
        data: {
          memberId: targetMemberId,
          amount: ATTENDANCE_COINS,
          source: "ATTENDANCE",
          description: `Hadir latihan ${activeSchedule.className} (+${ATTENDANCE_COINS} DC)`
        }
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Absensi berhasil — ${activeSchedule.className}`,
      data: newAttendance,
      coinsGained: ATTENDANCE_COINS,
      schedule: {
        className: activeSchedule.className,
        startTime: activeSchedule.startTime,
        endTime: activeSchedule.endTime,
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating check-in:", error);
    return NextResponse.json({ error: "Gagal mencatat absensi: " + (error?.message || "Internal error") }, { status: 500 });
  }
}
