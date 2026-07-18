import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notify";

// POST /api/quests/library/[id]/distribute
// Distribusikan quest langsung ke DailyQuestLog semua member yang eligible hari ini
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || (userRole !== "COACH" && userRole !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden: Hanya Pelatih dan Admin yang berhak mendistribusikan misi." },
        { status: 403 }
      );
    }

    // Ambil data quest
    const quest = await prisma.questLibrary.findUnique({
      where: { id },
      include: { requirements: true }
    });

    if (!quest) {
      return NextResponse.json({ error: "Misi tidak ditemukan" }, { status: 404 });
    }

    if (!quest.isActive) {
      return NextResponse.json({ error: "Misi ini sedang tidak aktif. Aktifkan dulu sebelum didistribusikan." }, { status: 400 });
    }

    // Batasan waktu "Hari Ini"
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Ambil semua member
    const allMembers = await prisma.member.findMany({
      where: { status: { notIn: ['PENDING_VERIFICATION', 'INACTIVE', 'REJECTED'] } }
    });

    const normalizeBelt = (str: string) => str.toUpperCase().replace(/SABUK|GEUP|DAN|[^A-Z0-9]/g, '');

    let distributed = 0;
    let skipped = 0;

    for (const member of allMembers) {
      // Cek eligibility
      let eligible = true;
      if (quest.requirements && quest.requirements.length > 0) {
        const req = quest.requirements[0];

        // Cek usia
        let age = 15;
        if (member.dateOfBirth) {
          const now = new Date();
          const birth = new Date(member.dateOfBirth);
          age = now.getFullYear() - birth.getFullYear();
          const m = now.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
        }
        if (age < req.minAge || age > req.maxAge) eligible = false;

        // Cek sabuk
        if (eligible && req.allowedBeltIds && req.allowedBeltIds.length > 0) {
          const normMember = normalizeBelt(member.currentBelt);
          const dbBelts = await prisma.beltRank.findMany();
          const beltRecord = dbBelts.find(b => {
            const normDb = normalizeBelt(b.name);
            return normDb === normMember || normDb.includes(normMember) || normMember.includes(normDb);
          });
          if (!beltRecord || !req.allowedBeltIds.includes(beltRecord.id)) {
            eligible = false;
          }
        }
      }

      if (!eligible) { skipped++; continue; }

      // Cek apakah quest ini sudah ada di log member hari ini
      const existingLog = await prisma.dailyQuestLog.findFirst({
        where: {
          memberId: member.id,
          questId: id,
          assignedAt: { gte: today, lt: tomorrow }
        }
      });

      if (existingLog) { skipped++; continue; }

      // Tambahkan ke DailyQuestLog hari ini
      await prisma.dailyQuestLog.create({
        data: { memberId: member.id, questId: id }
      });
      distributed++;

      // Kirim push notification via FCM ke member ini
      try {
        await notifyUser({
          userId: member.userId,
          title: '⚔️ Misi Baru Tersedia!',
          message: `Pelatih baru saja mengirimkan misi khusus untukmu: "${quest.title}". Selesaikan sekarang dan raih XP!`,
          type: 'QUEST',
          link: '/quest',
        });
      } catch (notifyErr) {
        console.error(`[DISTRIBUTE_NOTIFY_ERROR] memberId=${member.id}:`, notifyErr);
        // Jangan gagalkan distribusi hanya karena notifikasi error
      }
    }

    return NextResponse.json({
      success: true,
      message: `Misi berhasil didistribusikan ke ${distributed} member! (${skipped} dilewati: tidak eligible atau sudah punya).`,
      distributed,
      skipped
    });

  } catch (error: any) {
    console.error("[DISTRIBUTE_QUEST_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendistribusikan misi." },
      { status: 500 }
    );
  }
}



