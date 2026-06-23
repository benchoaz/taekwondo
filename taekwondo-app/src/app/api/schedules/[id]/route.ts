import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { dayOfWeek, startTime, endTime, className, location, coachId } = body;

    const updatedSchedule = await prisma.schedule.update({
      where: { id },
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

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json({ error: "Gagal memperbarui jadwal latihan" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.schedule.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json({ error: "Gagal menghapus jadwal latihan" }, { status: 500 });
  }
}
