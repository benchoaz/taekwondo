import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build query conditions
    let whereCondition: any = {};
    if (status) {
      whereCondition.status = status;
    }

    const achievements = await prisma.achievement.findMany({
      where: whereCondition,
      include: {
        member: {
          select: {
            id: true,
            fullName: true,
            selfieUrl: true,
            currentBelt: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(achievements);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json({ error: "Gagal mengambil data prestasi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, title, eventName, date, rank, photoUrl, certificateUrl, status } = body;

    if (!memberId || !title || !eventName || !date) {
      return NextResponse.json({ error: "Data wajib tidak lengkap" }, { status: 400 });
    }

    // Ganjaran XP untuk Prestasi (misalnya: Emas +500, Perak +300, Lainnya +200)
    let rewardXp = 200;
    if (rank === "Emas" || rank === "Juara 1") {
      rewardXp = 500;
    } else if (rank === "Perak" || rank === "Juara 2") {
      rewardXp = 300;
    }

    const isApproved = status === "APPROVED";

    const newAchievement = await prisma.$transaction(async (tx) => {
      const ach = await tx.achievement.create({
        data: {
          memberId,
          title,
          eventName,
          date: new Date(date),
          rank,
          photoUrl,
          certificateUrl,
          status: status || "PENDING"
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

      if (isApproved) {
        // Increment progress (XP) member
        await tx.member.update({
          where: { id: memberId },
          data: { progress: { increment: rewardXp } }
        });

        // Catat di log XP
        await tx.xpLog.create({
          data: {
            memberId,
            amount: rewardXp,
            source: "TOURNAMENT",
            referenceId: ach.id,
            description: `Meraih Prestasi: ${title} di ${eventName}`
          }
        });
      }

      return ach;
    });

    return NextResponse.json(newAchievement, { status: 201 });
  } catch (error) {
    console.error("Error creating achievement:", error);
    return NextResponse.json({ error: "Gagal menambahkan prestasi" }, { status: 500 });
  }
}
