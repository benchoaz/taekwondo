import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { questId, logId, answers } = body;

    if ((!questId && !logId) || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) {
      return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
    }

    // Resolve dailyQuestLog and quest
    let questLog = null;
    let quest = null;

    if (logId) {
      questLog = await prisma.dailyQuestLog.findUnique({
        where: { id: logId },
        include: { quest: true }
      });
      if (questLog) {
        quest = questLog.quest;
      }
    }

    if (!quest && questId) {
      quest = await prisma.questLibrary.findUnique({
        where: { id: questId }
      });
      if (quest) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        questLog = await prisma.dailyQuestLog.findFirst({
          where: {
            memberId: member.id,
            questId: quest.id,
            assignedAt: { gte: today, lt: tomorrow }
          }
        });
      }
    }

    if (!quest || !questLog) {
      return NextResponse.json({ error: "Quest ini belum ditugaskan atau tidak ditemukan" }, { status: 404 });
    }

    if (questLog.completed) {
      return NextResponse.json({ error: "Quest ini sudah diselesaikan" }, { status: 400 });
    }

    // Validasi Jawaban
    const quizQuestions: any = quest.quizQuestions || [];
    if (quizQuestions.length === 0) {
      return NextResponse.json({ error: "Quest ini tidak memiliki kuis" }, { status: 400 });
    }

    if (answers.length !== quizQuestions.length) {
      return NextResponse.json({ error: "Harap jawab semua pertanyaan" }, { status: 400 });
    }

    let isAllCorrect = true;
    for (let i = 0; i < quizQuestions.length; i++) {
      const dbAnswer = quizQuestions[i].correctAnswer ?? quizQuestions[i].answer;
      if (answers[i] !== dbAnswer) {
        isAllCorrect = false;
        break;
      }
    }

    if (!isAllCorrect) {
      return NextResponse.json({ success: false, error: "Terdapat jawaban yang salah. Silakan coba lagi!" }, { status: 400 });
    }

    // Jika benar semua, selesaikan quest
    await prisma.$transaction([
      prisma.dailyQuestLog.update({
        where: { id: questLog.id },
        data: {
          completed: true,
          completedAt: new Date()
        }
      }),
      prisma.member.update({
        where: { id: member.id },
        data: { progress: member.progress + quest.baseXp }
      }),
      prisma.xpLog.create({
        data: {
          memberId: member.id,
          amount: quest.baseXp,
          source: "DAILY_QUEST",
          referenceId: questLog.id,
          description: `Menyelesaikan Kuis: ${quest.title}`
        }
      })
    ]);

    return NextResponse.json({ success: true, message: `Berhasil! +${quest.baseXp} XP` });
  } catch (error: any) {
    console.error("Submit Quiz Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
