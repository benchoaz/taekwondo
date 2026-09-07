const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Migrating database for Video table & Setting social media columns...");

  // 1. Create Video table if not exists
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Video" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "youtube_url" TEXT NOT NULL,
      "category" TEXT NOT NULL DEFAULT 'DOKUMENTASI',
      "order" INTEGER NOT NULL DEFAULT 0,
      "is_active" BOOLEAN NOT NULL DEFAULT true,
      "author_name" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
    );
  `);
  console.log("✔ Video table created or verified.");

  // 2. Add social media columns to Setting table if not exist
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "tiktok_url" TEXT;
    ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "facebook_url" TEXT;
    ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "instagram_url" TEXT;
    ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "telegram_url" TEXT;
    ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "youtube_url" TEXT;
  `);
  console.log("✔ Social media columns added or verified in Setting.");

  // 3. Seed default curated club videos if empty
  const videoCount = await prisma.video.count();
  if (videoCount === 0) {
    await prisma.video.createMany({
      data: [
        {
          title: "Highlight Kejuaraan Taekwondo White Tiger Kraksaan",
          description: "Cuplikan aksi para atlet White Tiger Kraksaan dalam kompetisi kejuaraan regional dan provinsi meraih medali kebanggaan.",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          category: "KEJUARAAN",
          order: 1,
          authorName: "Admin Dojang",
        },
        {
          title: "Demonstrasi Teknik Poomsae & Atraksi Tendangan",
          description: "Peragaan keindahan dan kedisiplinan jurus Poomsae resmi Kukkiwon bersama Sabeum Nim.",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          category: "LATIHAN",
          order: 2,
          authorName: "Coach White Tiger",
        },
        {
          title: "Dokumentasi Ujian Kenaikan Tingkat (UKT)",
          description: "Momen perjuangan para sabuk putih hingga merah dalam menguji fisik, mental, dan pemecahan papan (Kyukpa).",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          category: "UKT",
          order: 3,
          authorName: "Admin Dojang",
        }
      ]
    });
    console.log("✔ Seeded initial public showcase videos.");
  }

  // 4. Update default setting social links if unset
  const setting = await prisma.setting.findUnique({ where: { id: "default" } });
  if (setting) {
    await prisma.setting.update({
      where: { id: "default" },
      data: {
        tiktokUrl: setting.tiktokUrl || "https://www.tiktok.com/@whitetigerkraksaan",
        instagramUrl: setting.instagramUrl || "https://www.instagram.com/whitetigerkraksaan",
        facebookUrl: setting.facebookUrl || "https://www.facebook.com/whitetigerkraksaan",
        telegramUrl: setting.telegramUrl || "https://t.me/whitetigerkraksaan",
        youtubeUrl: setting.youtubeUrl || "https://www.youtube.com/@whitetigerkraksaan",
      }
    });
    console.log("✔ Default social links configured in Setting.");
  }

  console.log("Migration completed successfully!");
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
