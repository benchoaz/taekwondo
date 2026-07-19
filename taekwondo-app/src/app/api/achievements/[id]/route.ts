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

    // Get current state to prevent double XP reward
    const currentAchievement = await prisma.achievement.findUnique({
      where: { id },
      select: { status: true, memberId: true, title: true, eventName: true, rank: true }
    });

    if (!currentAchievement) {
      return NextResponse.json({ error: "Prestasi tidak ditemukan" }, { status: 404 });
    }

    const wasApproved = currentAchievement.status === "APPROVED";
    const isNowApproved = status === "APPROVED";

    // Ganjaran XP (Emas +500, Perak +300, Lainnya +200)
    let rewardXp = 200;
    const finalRank = rank || currentAchievement.rank;
    if (finalRank === "Emas" || finalRank === "Juara 1") {
      rewardXp = 500;
    } else if (finalRank === "Perak" || finalRank === "Juara 2") {
      rewardXp = 300;
    }

    const updatedAchievement = await prisma.$transaction(async (tx) => {
      const ach = await tx.achievement.update({
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

      // Award XP only on new approval
      if (isNowApproved && !wasApproved) {
        await tx.member.update({
          where: { id: currentAchievement.memberId },
          data: { progress: { increment: rewardXp } }
        });

        await tx.xpLog.create({
          data: {
            memberId: currentAchievement.memberId,
            amount: rewardXp,
            source: "TOURNAMENT",
            referenceId: id,
            description: `Meraih Prestasi: ${title || currentAchievement.title} di ${eventName || currentAchievement.eventName}`
          }
        });
      }

      return ach;
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
