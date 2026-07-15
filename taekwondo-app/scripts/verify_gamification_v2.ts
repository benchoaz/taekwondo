import { prisma } from "../src/lib/prisma";

async function verifyDatabase() {
  console.log("==================================================");
  console.log("🔍 MEMULAI VERIFIKASI DATA DATABASE (VPS via Tunnel)");
  console.log("==================================================");

  try {
    // 1. Verifikasi Sabuk (BeltRank)
    const dbBelts = await prisma.beltRank.findMany({ orderBy: { level: 'asc' } });
    console.log(`\n1. Sabuk (BeltRank) Ranks: ${dbBelts.length} entries`);
    dbBelts.forEach(b => console.log(`   - [Lvl ${b.level}] ID: ${b.id} | Name: ${b.name}`));

    // 2. Verifikasi Kurikulum
    const categoriesCount = await prisma.curriculumCategory.count();
    const materialsCount = await prisma.curriculumMaterial.count();
    console.log(`\n2. Kurikulum (LMS):`);
    console.log(`   - Kategori (CurriculumCategory) Count: ${categoriesCount}`);
    console.log(`   - Materi (CurriculumMaterial) Count: ${materialsCount}`);

    // Cek anomali kategori tanpa sabuk
    const orphanCategories = await prisma.curriculumCategory.findMany({
      where: { NOT: { beltId: { in: dbBelts.map(b => b.id) } } }
    });
    console.log(`   - Broken Category -> Belt Ranks: ${orphanCategories.length} entries`);

    // 3. Verifikasi Quests
    const questsCount = await prisma.questLibrary.count();
    const requirementsCount = await prisma.questRequirement.count();
    console.log(`\n3. Daily Quests:`);
    console.log(`   - Quest Library (QuestLibrary) Count: ${questsCount}`);
    console.log(`   - Quest Requirements Count: ${requirementsCount}`);

    // Cek log quest
    const totalLogs = await prisma.dailyQuestLog.count();
    console.log(`   - Total Misi Murid Dikerjakan (DailyQuestLog): ${totalLogs} entries`);

    // Cek validitas allowedBeltIds di QuestRequirement
    console.log(`\n4. Validasi Relasi QuestRequirement:`);
    const reqs = await prisma.questRequirement.findMany({ include: { quest: true } });
    let brokenReqs = 0;
    for (const req of reqs) {
      if (req.allowedBeltIds && req.allowedBeltIds.length > 0) {
        const invalidBelts = req.allowedBeltIds.filter(id => !dbBelts.map(b => b.id).includes(id));
        if (invalidBelts.length > 0) {
          console.log(`   ❌ WARNING: Quest "${req.quest.title}" memiliki allowedBeltId tidak valid:`, invalidBelts);
          brokenReqs++;
        }
      }
    }
    if (brokenReqs === 0) {
      console.log(`   ✅ Semua allowedBeltIds dalam QuestRequirement valid dengan BeltRank!`);
    }

    // 5. Cek 4 Tipe Quest yang di-seed
    const libraryQuests = await prisma.questLibrary.findMany();
    console.log(`\n5. Sebaran Tipe Quest:`);
    const quizQuests = libraryQuests.filter(q => q.quizQuestions !== null);
    const videoUploadQuests = libraryQuests.filter(q => q.requireVideo === true);
    const watchVideoQuests = libraryQuests.filter(q => q.videoUrl !== null && q.requireVideo === false);
    const claimQuests = libraryQuests.filter(q => q.quizQuestions === null && q.requireVideo === false && q.videoUrl === null);

    console.log(`   - Jawab Pertanyaan (Quiz): ${quizQuests.length} quest`);
    quizQuests.forEach(q => console.log(`     * "${q.title}"`));
    console.log(`   - Upload Video: ${videoUploadQuests.length} quest`);
    videoUploadQuests.forEach(q => console.log(`     * "${q.title}"`));
    console.log(`   - Nonton Video: ${watchVideoQuests.length} quest`);
    watchVideoQuests.forEach(q => console.log(`     * "${q.title}"`));
    console.log(`   - Hanya Klaim (Check-in): ${claimQuests.length} quest`);
    claimQuests.forEach(q => console.log(`     * "${q.title}"`));

    console.log("\n==================================================");
    console.log("✅ VERIFIKASI SELESAI!");
    console.log("==================================================");

  } catch (e: any) {
    console.error("❌ Terjadi error saat verifikasi database:", e);
  }
}

verifyDatabase();
