import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, eventName, date, rank, photoUrl, certificateUrl, status } = body;

    const updatedAchievement = await prisma.achievement.update({
      where: { id },
      data: {
        title,
        eventName,
        ...(date && { date: new Date(date) }),
        rank,
        photoUrl,
        certificateUrl,
        status
      },
      include: {
        member: {
          select: {
            id: true,
            fullName: true,
            selfieUrl: true,
            currentBelt: true
          }
        }
      }
    });

    return NextResponse.json(updatedAchievement);
  } catch (error) {
    console.error("Error updating achievement:", error);
    return NextResponse.json({ error: "Gagal memperbarui prestasi" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.achievement.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting achievement:", error);
    return NextResponse.json({ error: "Gagal menghapus prestasi" }, { status: 500 });
  }
}
