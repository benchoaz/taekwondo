import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Basic Security: Vercel CRON passes a bearer token
    const authHeader = req.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
      process.env.NODE_ENV === "production"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[CRON] Starting Auto-Pilot Quest Distribution...");

    const today = new Date();
    const isMonday = today.getDay() === 1; // 0 = Sunday, 1 = Monday

    // 1. Get all active missions that need to be distributed
    const activeQuests = await prisma.questLibrary.findMany({
      where: {
        isActive: true,
        frequency: {
          in: isMonday ? ["DAILY", "WEEKLY"] : ["DAILY"],
        },
      },
      include: {
        requirements: true,
      },
    });

    console.log(`[CRON] Found ${activeQuests.length} active quests to distribute.`);

    if (activeQuests.length === 0) {
      return NextResponse.json({ message: "No active quests to distribute today." });
    }

    // 2. Get all active members with their current belt
    const members = await prisma.member.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        currentBeltId: true,
      },
    });

    console.log(`[CRON] Found ${members.length} active members.`);

    // 3. Prepare bulk inserts for DailyQuestLog
    const logsToInsert: any[] = [];
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const endOfWeek = new Date();
    const daysUntilSunday = today.getDay() === 0 ? 0 : 7 - today.getDay();
    endOfWeek.setDate(today.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);

    for (const quest of activeQuests) {
      // Determine expiration
      const expiresAt = quest.frequency === "WEEKLY" ? endOfWeek : endOfDay;

      // Extract allowed belt IDs if there are requirements
      let allowedBelts: string[] | null = null;
      if (quest.requirements.length > 0) {
        allowedBelts = quest.requirements[0].allowedBeltIds;
      }

      for (const member of members) {
        // Check if member is eligible based on belt
        if (
          allowedBelts === null ||
          allowedBelts.length === 0 ||
          (member.currentBeltId && allowedBelts.includes(member.currentBeltId))
        ) {
          logsToInsert.push({
            memberId: member.id,
            questId: quest.id,
            completed: false,
            assignedAt: new Date(),
            expiresAt: expiresAt,
          });
        }
      }
    }

    if (logsToInsert.length > 0) {
      // 4. Execute Bulk Insert
      const result = await prisma.dailyQuestLog.createMany({
        data: logsToInsert,
        skipDuplicates: true, // Prevents crashing if it somehow runs twice
      });
      console.log(`[CRON] Distributed ${result.count} quests successfully.`);
      return NextResponse.json({ success: true, count: result.count });
    }

    return NextResponse.json({ success: true, message: "No eligible members found for the active quests." });

  } catch (error: any) {
    console.error("[CRON_ERROR]", error);
    return NextResponse.json({ error: "Failed to distribute quests." }, { status: 500 });
  }
}
