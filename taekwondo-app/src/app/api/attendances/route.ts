import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to parse date strictly
function parseDate(dateStr: string): Date {
  const date = new Date(dateStr);
  // Reset time to start of day in UTC to avoid timezone issues
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json({ error: "Parameter date diperlukan (YYYY-MM-DD)" }, { status: 400 });
    }

    const targetDate = parseDate(dateParam);

    const attendances = await prisma.attendance.findMany({
      where: {
        date: targetDate
      },
      include: {
        member: {
          select: {
            fullName: true,
            memberNumber: true
          }
        }
      }
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return NextResponse.json({ error: "Gagal mengambil data absensi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, records } = body;

    if (!date || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: "Data tidak valid. Membutuhkan date dan records array." }, { status: 400 });
    }

    const targetDate = parseDate(date);

    // Use transaction to safely replace attendances for the given date
    await prisma.$transaction(async (tx) => {
      // 1. Get all existing attendances for this date to preserve IDs if possible, or just delete and recreate
      // Deleting and recreating is simpler and works since Attendance isn't deeply linked to other tables
      await tx.attendance.deleteMany({
        where: { date: targetDate }
      });

      // 2. Insert new records
      const attendancesToCreate = records.map((record: any) => ({
        memberId: record.memberId,
        date: targetDate,
        present: record.present,
      }));

      if (attendancesToCreate.length > 0) {
        await tx.attendance.createMany({
          data: attendancesToCreate
        });
      }
    });

    return NextResponse.json({ success: true, message: "Absensi berhasil disimpan" }, { status: 200 });
  } catch (error) {
    console.error("Error saving attendances:", error);
    return NextResponse.json({ error: "Gagal menyimpan absensi" }, { status: 500 });
  }
}
