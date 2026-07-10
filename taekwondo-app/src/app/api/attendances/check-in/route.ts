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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, latitude, longitude } = body;

    if (!memberId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Cari member berdasarkan id atau userId
    const member = await prisma.member.findFirst({
      where: {
        OR: [{ id: memberId }, { userId: memberId }]
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
    }

    const targetMemberId = member.id;
    const now = new Date();

    // ================================================================
    // 1. VALIDASI GEOFENCING (Radius Dojang)
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

      if (distance > setting.dojangRadius) {
        return NextResponse.json({
          error: `Anda berada di luar area dojang`,
          detail: `Jarak Anda ${distance} meter dari dojang. Maksimal radius absen: ${setting.dojangRadius} meter.`,
          distance,
          maxRadius: setting.dojangRadius,
        }, { status: 400 });
      }
    }

    // ================================================================
    // 2. VALIDASI JADWAL — Cek apakah hari ini ada jadwal latihan
    // ================================================================
    const todayIndex = now.getDay(); // 0=Minggu, 1=Senin, dst
    const hariIniNama = Object.keys(HARI_MAP).find(k => HARI_MAP[k] === todayIndex) || '';

    // Ambil semua jadwal yang hari-nya cocok dengan hari ini
    const allSchedules = await prisma.schedule.findMany();
    const todaySchedules = allSchedules.filter(s =>
      HARI_MAP[s.dayOfWeek.toLowerCase()] === todayIndex
    );

    if (todaySchedules.length === 0) {
      const hariFormatted = hariIniNama.charAt(0).toUpperCase() + hariIniNama.slice(1);
      return NextResponse.json({
        error: `Tidak ada jadwal latihan hari ${hariFormatted}`,
        detail: `Absen hanya bisa dilakukan pada hari latihan. Silakan cek jadwal latihan Anda.`,
      }, { status: 400 });
    }

    // ================================================================
    // 3. VALIDASI JAM — Cek apakah sekarang dalam rentang waktu latihan
    //    Toleransi: 30 menit sebelum mulai s.d. 30 menit setelah selesai
    // ================================================================
    const TOLERANSI_MENIT = 30;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let activeSchedule = todaySchedules.find(s => {
      const start = timeToMinutes(s.startTime) - TOLERANSI_MENIT;
      const end = timeToMinutes(s.endTime) + TOLERANSI_MENIT;
      return nowMinutes >= start && nowMinutes <= end;
    });

    if (!activeSchedule) {
      // Format jadwal hari ini untuk info ke murid
      const jadwalList = todaySchedules
        .map(s => `${s.className}: ${s.startTime}–${s.endTime}`)
        .join(', ');

      return NextResponse.json({
        error: `Absen belum/sudah melewati jam latihan`,
        detail: `Absen hanya bisa dilakukan 30 menit sebelum s.d. 30 menit setelah latihan berakhir. Jadwal hari ini: ${jadwalList}`,
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
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

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
    return NextResponse.json({ error: "Gagal mencatat absensi" }, { status: 500 });
  }
}
