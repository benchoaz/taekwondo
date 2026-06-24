import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let whereClause = {};
    if (userId) {
      // Find coach id by userId
      const coach = await prisma.coach.findUnique({ where: { userId } });
      if (coach) {
        whereClause = { coachId: coach.id };
      } else {
        // If not a coach, return empty schedules
        return NextResponse.json([]);
      }
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
            danRank: true
          }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Gagal mengambil jadwal latihan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dayOfWeek, startTime, endTime, className, location, coachId } = body;

    if (!dayOfWeek || !startTime || !endTime || !className || !location || !coachId) {
      return NextResponse.json({ error: "Semua data jadwal harus diisi" }, { status: 400 });
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        dayOfWeek,
        startTime,
        endTime,
        className,
        location,
        coachId
      },
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
            danRank: true
          }
        }
      }
    });

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: "Gagal membuat jadwal latihan" }, { status: 500 });
  }
}
