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

    // Jika sudah ada 3+ quest hari ini → kembalikan semua (termasuk yang di-distribute admin)
    // Jangan early-return dengan angka tetap — selalu kembalikan semua log hari ini
    if (existingLogs.length >= 3) {
      return NextResponse.json({ success: true, data: existingLogs });
    }

    // Jika ada beberapa (< 3), cek apakah perlu auto-assign tambahan
    // Tapi tetap sertakan yang ada dalam respons akhir

    // Auto-assign: kalkulasi umur
    let age = 15;
    if (member.dateOfBirth) {
      const now = new Date();
      const birth = new Date(member.dateOfBirth);
      age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    }

    // Normalize string: hapus karakter non-alfanumerik serta kata SABUK, GEUP, DAN untuk pencocokan akurat
    const normalizeBelt = (str: string) => str.toUpperCase().replace(/SABUK|GEUP|DAN|[^A-Z0-9]/g, '');
    const normMemberBelt = normalizeBelt(member.currentBelt);

    // Ambil daftar sabuk untuk mencari UUID yang cocok dengan nama sabuk member
    const dbBelts = await prisma.beltRank.findMany();
    const memberBeltRecord = dbBelts.find(b => {
      const normDbBelt = normalizeBelt(b.name);
      return normDbBelt === normMemberBelt || normDbBelt.includes(normMemberBelt) || normMemberBelt.includes(normDbBelt);
    });
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

    // Acak kategori agar bervariasi tiap hari
    const categories = ["FITNESS", "TECHNICAL", "DISCIPLINE", "THEORY"].sort(() => 0.5 - Math.random());
    const selectedQuests: typeof eligibleQuests = [];

    for (const cat of categories) {
      if (selectedQuests.length >= 3) break;

      const pool = eligibleQuests.filter(q => q.category === cat);
      if (pool.length > 0) {
        // Cari quest di pool yang tipenya tidak menduplikasi tipe yang sudah terpilih
        // Tipe: Nonton Video (videoUrl tidak null & requireVideo false)
        const hasWatch = selectedQuests.some(s => s.videoUrl !== null && !s.requireVideo);
        const hasQuiz = selectedQuests.some(s => s.quizQuestions !== null);

        let filteredPool = pool;
        if (hasWatch) {
          filteredPool = filteredPool.filter(q => !(q.videoUrl !== null && !q.requireVideo));
        }
        if (hasQuiz) {
          filteredPool = filteredPool.filter(q => q.quizQuestions === null);
        }

        // Jika pool ter-filter kosong, gunakan pool asal agar ada backup
        const finalPool = filteredPool.length > 0 ? filteredPool : pool;
        const chosen = finalPool[Math.floor(Math.random() * finalPool.length)];
        selectedQuests.push(chosen);
      }
    }

    // Hitung berapa quest yang masih perlu di-auto-assign (isi hingga 3 total)
    const existingQuestIds = new Set(existingLogs.map((l: any) => l.questId));
    const neededCount = 3 - existingLogs.length;

    // Filter eligible quest yang belum ada di existing log
    const eligibleNew = eligibleQuests.filter(q => !existingQuestIds.has(q.id));

    if (neededCount > 0 && eligibleNew.length > 0) {
      // Pilih dari kategori yang belum ada
      const selectedQuests: typeof eligibleNew = [];
      const categories = ["FITNESS", "TECHNICAL", "DISCIPLINE", "THEORY"].sort(() => 0.5 - Math.random());
      for (const cat of categories) {
        if (selectedQuests.length >= neededCount) break;
        const pool = eligibleNew.filter(q => q.category === cat && !selectedQuests.find(s => s.id === q.id));
        if (pool.length > 0) {
          selectedQuests.push(pool[Math.floor(Math.random() * pool.length)]);
        }
      }
      // Isi sisa jika kurang
      if (selectedQuests.length < neededCount) {
        const selectedIds = new Set(selectedQuests.map(q => q.id));
        const remaining = eligibleNew.filter(q => !selectedIds.has(q.id)).slice(0, neededCount - selectedQuests.length);
        selectedQuests.push(...remaining);
      }

      const newLogs = await Promise.all(
        selectedQuests.map(q =>
          prisma.dailyQuestLog.create({
            data: { memberId: member.id, questId: q.id },
            include: { quest: true }
          })
        )
      );

      // Gabungkan: quest lama (termasuk dari admin) + quest baru auto-assign
      return NextResponse.json({ success: true, data: [...existingLogs, ...newLogs] });
    }

    // Tidak ada yang baru, kembalikan semua yang ada (termasuk quest dari admin)
    return NextResponse.json({ success: true, data: existingLogs });

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

    // Jika quest memerlukan upload video, jangan langsung tandai selesai (completed) dan jangan beri reward.
    // Simpan videoUrl dan biarkan status pending menunggu approval pelatih.
    if (existingLog.quest.requireVideo) {
      if (!body.videoUrl) {
        return NextResponse.json({ error: "videoUrl wajib disertakan untuk misi video" }, { status: 400 });
      }

      const updatedLog = await prisma.dailyQuestLog.update({
        where: { id: logId },
        data: {
          completed: false,
          videoUrl: body.videoUrl,
          notes: body.notes || "Menunggu penilaian pelatih"
        },
        include: { quest: true }
      });

      return NextResponse.json({
        success: true,
        data: updatedLog,
        message: "Video berhasil diunggah. Menunggu persetujuan pelatih untuk mendapatkan reward.",
        pendingApproval: true
      });
    }

    // Tandai selesai, tambah XP, +5 DC, dan catat ke log dalam satu transaksi (untuk misi non-video)
    const DAILY_QUEST_COINS = 5;
    const [updatedLog, updatedMember] = await prisma.$transaction([
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
        data: {
          progress: { increment: existingLog.quest.baseXp },
          dojangCoins: { increment: DAILY_QUEST_COINS },
        }
      }),
      prisma.xpLog.create({
        data: {
          memberId: member.id,
          amount: existingLog.quest.baseXp,
          source: "DAILY_QUEST",
          referenceId: existingLog.id,
          description: `Menyelesaikan Misi: ${existingLog.quest.title}`
        }
      }),
      prisma.dojangCoinLog.create({
        data: {
          memberId: member.id,
          amount: DAILY_QUEST_COINS,
          source: "DAILY_QUEST",
          referenceId: existingLog.id,
          description: `Reward Misi Harian: ${existingLog.quest.title}`
        }
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: updatedLog,
      newProgress: updatedMember.progress,
      xpGained: updatedLog.quest.baseXp,
      coinsGained: DAILY_QUEST_COINS,
    });

  } catch (error: any) {
    console.error("[POST_QUESTS_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat menyelesaikan misi" },
      { status: 500 }
    );
  }
}
