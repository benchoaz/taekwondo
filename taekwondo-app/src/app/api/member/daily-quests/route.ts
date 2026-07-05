import { NextResponse } from "next/server";
import { QuestCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const existingLogs = await prisma.dailyQuestLog.findMany({
      where: {
        memberId: memberId,
        assignedAt: {
          gte: todayStart,
          lt: todayEnd,
        }
      },
      include: {
        quest: true,
      },
      orderBy: { assignedAt: "asc" }
    });

    if (existingLogs.length >= 3) {
      return NextResponse.json({ success: true, data: existingLogs });
    }

    // Jika kurang dari 3, hapus HANYA yang belum selesai (jangan hapus yang sudah completed!)
    // Ini mencegah XP hilang jika quest sudah diselesaikan sebelum regenerasi
    await prisma.dailyQuestLog.deleteMany({
      where: {
        memberId: memberId,
        completed: false,  // ← FIX: hanya hapus yang belum selesai
        assignedAt: {
          gte: todayStart,
          lt: todayEnd,
        }
      }
    });

    // Normalize string: hapus semua karakter selain huruf dan angka untuk pencocokan akurat
    const normalizeBelt = (str: string) => str.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const normMemberBelt = normalizeBelt(member.currentBelt);

    // 3. Fetch all possible quests that match the member's age and belt
    const dbBelts = await prisma.beltRank.findMany();
    const memberBeltRecord = dbBelts.find(b => {
      const normDbBelt = normalizeBelt(b.name);
      return normDbBelt.includes(normMemberBelt) || normMemberBelt.includes(normDbBelt);
    });
    const memberBeltId = memberBeltRecord ? memberBeltRecord.id : null;

    const allQuests = await prisma.questLibrary.findMany({
      where: {
        requirements: {
          some: {
            minAge: { lte: age },
            maxAge: { gte: age },
          }
        }
      },
      include: { requirements: true }
    });

    const eligibleQuests = allQuests.filter(q => {
      if (!q.requirements || q.requirements.length === 0) return true;
      return q.requirements.some(req => {
        if (req.allowedBeltIds && req.allowedBeltIds.length > 0) {
          if (!memberBeltId) return false;
          return req.allowedBeltIds.includes(memberBeltId);
        }
        return true;
      });
    });

    // Separate by category
    const fitnessQuests = eligibleQuests.filter(q => q.category === QuestCategory.FITNESS);
    const technicalQuests = eligibleQuests.filter(q => q.category === QuestCategory.TECHNICAL);
    const disciplineQuests = eligibleQuests.filter(q => q.category === QuestCategory.DISCIPLINE);
    const theoryQuests = eligibleQuests.filter(q => q.category === QuestCategory.THEORY);

    // Pick 1 random from each (or fallback if empty)
    const selectedQuests = [];
    if (fitnessQuests.length > 0) {
      selectedQuests.push(fitnessQuests[Math.floor(Math.random() * fitnessQuests.length)]);
    }
    if (technicalQuests.length > 0) {
      selectedQuests.push(technicalQuests[Math.floor(Math.random() * technicalQuests.length)]);
    }
    if (disciplineQuests.length > 0 || theoryQuests.length > 0) {
      const disciplinePool = [...disciplineQuests, ...theoryQuests];
      selectedQuests.push(disciplinePool[Math.floor(Math.random() * disciplinePool.length)]);
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

    // Securely update with transaction and log XP
    const existingLog = await prisma.dailyQuestLog.findUnique({
      where: { id: logId },
      include: { quest: true }
    });

    if (!existingLog) {
      return NextResponse.json({ success: false, error: 'Log not found' }, { status: 404 });
    }

    const [updatedLog, member, xpLog] = await prisma.$transaction([
      prisma.dailyQuestLog.update({
        where: { id: logId },
        data: {
          completed: true,
          completedAt: new Date(),
          notes: notes || null,
          videoUrl: videoUrl || null,
        },
        include: { quest: true }
      }),
      prisma.member.update({
        where: { id: existingLog.memberId },
        data: { progress: { increment: existingLog.quest.baseXp } }
      }),
      prisma.xpLog.create({
        data: {
          memberId: existingLog.memberId,
          amount: existingLog.quest.baseXp,
          source: "DAILY_QUEST",
          referenceId: existingLog.id,
          description: `Menyelesaikan Misi: ${existingLog.quest.title}`
        }
      })
    ]);

    return NextResponse.json({ success: true, data: updatedLog, newProgress: member.progress });
  } catch (error: any) {
    console.error('Failed to complete quest:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
