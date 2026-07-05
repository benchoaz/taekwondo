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
