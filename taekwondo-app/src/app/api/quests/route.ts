import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =====================================================================
// GET /api/quests — Ambil misi harian member hari ini (auto-assign jika belum)
// Auth: Cookie auth_token → middleware inject x-user-id & x-user-role
// =====================================================================
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== "MEMBER") {
      return NextResponse.json(
        { error: "Forbidden: Hanya Member yang dapat memiliki Daily Quest" },
        { status: 403 }
      );
    }

    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) {
      return NextResponse.json({ error: "Profil Member tidak ditemukan" }, { status: 404 });
    }

    // Batasan waktu "Hari Ini"
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Cek misi yang sudah ditugaskan hari ini
    const existingLogs = await prisma.dailyQuestLog.findMany({
      where: {
        memberId: member.id,
        assignedAt: { gte: today, lt: tomorrow }
      },
      include: { quest: true },
      orderBy: { assignedAt: "asc" }
    });

    if (existingLogs.length > 0) {
      return NextResponse.json({ success: true, data: existingLogs });
    }

    // Auto-assign: kalkulasi umur
    let age = 15;
    if (member.dateOfBirth) {
      const now = new Date();
      const birth = new Date(member.dateOfBirth);
      age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    }

    const memberBelt = member.currentBelt.toUpperCase();

    // Ambil daftar sabuk untuk mencari UUID yang cocok dengan nama sabuk member
    const dbBelts = await prisma.beltRank.findMany();
    const memberBeltRecord = dbBelts.find(b => 
      b.name.toUpperCase().includes(memberBelt) || memberBelt.includes(b.name.toUpperCase())
    );
    const memberBeltId = memberBeltRecord ? memberBeltRecord.id : null;

    const allQuests = await prisma.questLibrary.findMany({ include: { requirements: true } });

    // Filter quest yang cocok untuk member
    const eligibleQuests = allQuests.filter(q => {
      if (!q.requirements || q.requirements.length === 0) return true;
      return q.requirements.some(req => {
        if (age < req.minAge || age > req.maxAge) return false;
        if (req.allowedBeltIds && req.allowedBeltIds.length > 0) {
          if (!memberBeltId) return false;
          const beltMatch = req.allowedBeltIds.includes(memberBeltId);
          if (!beltMatch) return false;
        }
        return true;
      });
    });

    if (eligibleQuests.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Acak dan ambil 3 quest (1 per kategori jika memungkinkan)
    const categories = ["FITNESS", "TECHNICAL", "DISCIPLINE", "THEORY"];
    const selectedQuests: typeof eligibleQuests = [];

    for (const cat of categories) {
      const pool = eligibleQuests.filter(q => q.category === cat);
      if (pool.length > 0) {
        selectedQuests.push(pool[Math.floor(Math.random() * pool.length)]);
      }
    }

    // Jika kurang dari 3, isi dari sisa quest yang belum dipilih
    if (selectedQuests.length < 3) {
      const selectedIds = new Set(selectedQuests.map(q => q.id));
      const remaining = eligibleQuests
        .filter(q => !selectedIds.has(q.id))
        .sort(() => 0.5 - Math.random());
      selectedQuests.push(...remaining.slice(0, 3 - selectedQuests.length));
    }

    const newLogs = await Promise.all(
      selectedQuests.map(q =>
        prisma.dailyQuestLog.create({
          data: { memberId: member.id, questId: q.id },
          include: { quest: true }
        })
      )
    );

    return NextResponse.json({ success: true, data: newLogs });

  } catch (error: any) {
    console.error("[GET_QUESTS_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat mengambil Daily Quests" },
      { status: 500 }
    );
  }
}

// =====================================================================
// POST /api/quests — Selesaikan sebuah misi harian
// Auth: Cookie auth_token → middleware inject x-user-id & x-user-role
// Body: { logId: string }
// =====================================================================
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== "MEMBER") {
      return NextResponse.json(
        { error: "Forbidden: Hanya Member yang dapat menyelesaikan misi" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { logId } = body;

    if (!logId) {
      return NextResponse.json({ error: "logId wajib diisi" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) {
      return NextResponse.json({ error: "Profil Member tidak ditemukan" }, { status: 404 });
    }

    // Cari log & validasi kepemilikan (keamanan: harus milik member yang login)
    const existingLog = await prisma.dailyQuestLog.findUnique({
      where: { id: logId },
      include: { quest: true }
    });

    if (!existingLog) {
      return NextResponse.json({ error: "Misi tidak ditemukan" }, { status: 404 });
    }

    if (existingLog.memberId !== member.id) {
      return NextResponse.json(
        { error: "Forbidden: Misi ini bukan milik Anda" },
        { status: 403 }
      );
    }

    // Jika sudah selesai, kembalikan tanpa mengubah apapun (idempotent)
    if (existingLog.completed) {
      return NextResponse.json({
        success: true,
        data: existingLog,
        message: "Misi ini sudah diselesaikan sebelumnya",
        alreadyCompleted: true
      });
    }

    // Tandai selesai, tambah XP, dan catat ke XpLog dalam satu transaksi
    const [updatedLog, updatedMember, newXpLog] = await prisma.$transaction([
      prisma.dailyQuestLog.update({
        where: { id: logId },
        data: {
          completed: true,
          completedAt: new Date(),
          videoUrl: body.videoUrl || null,
          notes: body.notes || null,
        },
        include: { quest: true }
      }),
      prisma.member.update({
        where: { id: member.id },
        data: { progress: { increment: existingLog.quest.baseXp } }
      }),
      prisma.xpLog.create({
        data: {
          memberId: member.id,
          amount: existingLog.quest.baseXp,
          source: "DAILY_QUEST",
          referenceId: existingLog.id,
          description: `Menyelesaikan Misi: ${existingLog.quest.title}`
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: updatedLog,
      newProgress: updatedMember.progress,
      xpGained: updatedLog.quest.baseXp
    });

  } catch (error: any) {
    console.error("[POST_QUESTS_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat menyelesaikan misi" },
      { status: 500 }
    );
  }
}
