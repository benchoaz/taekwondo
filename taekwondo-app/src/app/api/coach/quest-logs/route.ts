import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || (userRole !== "COACH" && userRole !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden: Hanya Pelatih dan Admin yang dapat mengakses log." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const completed = searchParams.get("completed");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let whereClause: any = {};
    
    if (completed === "true") {
      whereClause.completed = true;
    } else if (completed === "false") {
      whereClause.completed = false;
    }

    // Hanya tampilkan yang memerlukan upload video atau sudah di-upload videonya
    whereClause.quest = {
      requireVideo: true
    };

    if (startDate || endDate) {
      whereClause.assignedAt = {};
      if (startDate) {
        whereClause.assignedAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.assignedAt.lte = new Date(endDate);
      }
    }

    const logs = await prisma.dailyQuestLog.findMany({
      where: whereClause,
      include: {
        quest: true,
        member: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        assignedAt: "desc"
      }
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    console.error("[GET_COACH_QUEST_LOGS_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat mengambil log misi murid." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || (userRole !== "COACH" && userRole !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden: Hanya Pelatih dan Admin yang dapat melakukan approval." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { logId, action, notes } = body; // action: 'APPROVE' or 'REJECT'

    if (!logId || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: "Data logId atau action tidak valid" }, { status: 400 });
    }

    const existingLog = await prisma.dailyQuestLog.findUnique({
      where: { id: logId },
      include: { quest: true }
    });

    if (!existingLog) {
      return NextResponse.json({ error: "Log misi tidak ditemukan" }, { status: 404 });
    }

    if (existingLog.completed) {
      return NextResponse.json({ error: "Misi ini sudah disetujui sebelumnya" }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const DAILY_QUEST_COINS = 5;
      
      const [updatedLog, updatedMember] = await prisma.$transaction([
        prisma.dailyQuestLog.update({
          where: { id: logId },
          data: {
            completed: true,
            completedAt: new Date(),
            notes: notes || "Disetujui oleh Pelatih"
          },
          include: { quest: true }
        }),
        prisma.member.update({
          where: { id: existingLog.memberId },
          data: {
            progress: { increment: existingLog.quest.baseXp },
            dojangCoins: { increment: DAILY_QUEST_COINS }
          }
        }),
        prisma.xpLog.create({
          data: {
            memberId: existingLog.memberId,
            amount: existingLog.quest.baseXp,
            source: "DAILY_QUEST",
            referenceId: existingLog.id,
            description: `Misi Disetujui Pelatih: ${existingLog.quest.title}`
          }
        }),
        prisma.dojangCoinLog.create({
          data: {
            memberId: existingLog.memberId,
            amount: DAILY_QUEST_COINS,
            source: "DAILY_QUEST",
            referenceId: existingLog.id,
            description: `Reward Misi Video: ${existingLog.quest.title}`
          }
        })
      ]);

      return NextResponse.json({
        success: true,
        message: "Misi berhasil disetujui, reward telah didistribusikan.",
        data: updatedLog
      });

    } else {
      // REJECT: Tandai log notes alasan penolakan, siswa bisa upload ulang video.
      const updatedLog = await prisma.dailyQuestLog.update({
        where: { id: logId },
        data: {
          completed: false,
          notes: notes || "Ditolak oleh Pelatih. Silakan rekam ulang gerakan Anda."
        }
      });

      return NextResponse.json({
        success: true,
        message: "Misi ditolak. Siswa dipersilakan mengunggah video perbaikan.",
        data: updatedLog
      });
    }

  } catch (error: any) {
    console.error("[PUT_COACH_QUEST_LOGS_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat memproses approval misi." },
      { status: 500 }
    );
  }
}
