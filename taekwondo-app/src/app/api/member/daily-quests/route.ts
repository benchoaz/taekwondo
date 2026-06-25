import { NextResponse } from "next/server";
import { PrismaClient, QuestCategory } from "@prisma/client";

const prisma = new PrismaClient();

// Get Daily Quests for a Member
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Member ID is required' }, { status: 400 });
    }

    // 1. Fetch Member to check Age and Belt
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    // Calculate age (Default to 10 if not set, or maybe we just pass 10 for now)
    let age = 10;
    if (member.dateOfBirth) {
      const diff = Date.now() - member.dateOfBirth.getTime();
      age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }

    // 2. See if there are already assignments for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingLogs = await prisma.dailyQuestLog.findMany({
      where: {
        memberId: memberId,
        assignedAt: {
          gte: todayStart,
        }
      },
      include: {
        quest: true,
      }
    });

    if (existingLogs.length >= 3) {
      return NextResponse.json({ success: true, data: existingLogs });
    }

    // If not, we generate new quests for today.
    // Clean up any incomplete quests from today to regenerate
    await prisma.dailyQuestLog.deleteMany({
      where: {
        memberId: memberId,
        assignedAt: {
          gte: todayStart,
        }
      }
    });

    // 3. Fetch all possible quests that match the member's age
    const matchingQuests = await prisma.questLibrary.findMany({
      where: {
        requirements: {
          some: {
            minAge: { lte: age },
            maxAge: { gte: age },
          }
        }
      }
    });

    // Separate by category
    const fitnessQuests = matchingQuests.filter(q => q.category === QuestCategory.FITNESS);
    const technicalQuests = matchingQuests.filter(q => q.category === QuestCategory.TECHNICAL);
    const disciplineQuests = matchingQuests.filter(q => q.category === QuestCategory.DISCIPLINE);

    // Pick 1 random from each (or fallback if empty)
    const selectedQuests = [];
    if (fitnessQuests.length > 0) {
      selectedQuests.push(fitnessQuests[Math.floor(Math.random() * fitnessQuests.length)]);
    }
    if (technicalQuests.length > 0) {
      selectedQuests.push(technicalQuests[Math.floor(Math.random() * technicalQuests.length)]);
    }
    if (disciplineQuests.length > 0) {
      selectedQuests.push(disciplineQuests[Math.floor(Math.random() * disciplineQuests.length)]);
    }

    // Assign them
    const newLogs = await Promise.all(selectedQuests.map(quest => {
      return prisma.dailyQuestLog.create({
        data: {
          memberId: memberId,
          questId: quest.id,
        },
        include: {
          quest: true,
        }
      });
    }));

    return NextResponse.json({ success: true, data: newLogs });

  } catch (error: any) {
    console.error('Failed to get daily quests:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Complete a Daily Quest
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { logId, notes, videoUrl } = body;

    if (!logId) {
      return NextResponse.json({ success: false, error: 'logId is required' }, { status: 400 });
    }

    const updatedLog = await prisma.dailyQuestLog.update({
      where: { id: logId },
      data: {
        completed: true,
        completedAt: new Date(),
        notes: notes || null,
        videoUrl: videoUrl || null,
      },
      include: {
        quest: true,
      }
    });

    // Here we can also add XP to the user's progress
    const member = await prisma.member.update({
      where: { id: updatedLog.memberId },
      data: {
        progress: {
          increment: updatedLog.quest.baseXp,
        }
      }
    });

    return NextResponse.json({ success: true, data: updatedLog, newProgress: member.progress });
  } catch (error: any) {
    console.error('Failed to complete quest:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
