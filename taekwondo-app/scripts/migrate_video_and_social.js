const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://taekwondo_user:taekwondo_password@postgres:5432/taekwondo_academy?schema=public',
});

async function main() {
  console.log("Migrating database for Video table & Setting social media columns via pg...");

  const client = await pool.connect();
  try {
    // 1. Create Video table if not exists
    await client.query(`
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
    await client.query(`
      ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "tiktok_url" TEXT;
      ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "facebook_url" TEXT;
      ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "instagram_url" TEXT;
      ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "telegram_url" TEXT;
      ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "youtube_url" TEXT;
    `);
    console.log("✔ Social media columns added or verified in Setting.");

    // 3. Seed default curated club videos if table is empty
    const checkRes = await client.query(`SELECT COUNT(*) FROM "Video";`);
    const count = parseInt(checkRes.rows[0].count, 10);
    if (count === 0) {
      await client.query(`
        INSERT INTO "Video" ("id", "title", "description", "youtube_url", "category", "order", "is_active", "author_name", "createdAt", "updatedAt")
        VALUES 
          ('vid-seed-1', 'Highlight Kejuaraan Taekwondo White Tiger Kraksaan', 'Cuplikan aksi para atlet White Tiger Kraksaan dalam kompetisi kejuaraan regional dan provinsi meraih medali kebanggaan.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'KEJUARAAN', 1, true, 'Admin Dojang', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('vid-seed-2', 'Demonstrasi Teknik Poomsae & Atraksi Tendangan', 'Peragaan keindahan dan kedisiplinan jurus Poomsae resmi Kukkiwon bersama Sabeum Nim.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'LATIHAN', 2, true, 'Coach White Tiger', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('vid-seed-3', 'Dokumentasi Ujian Kenaikan Tingkat (UKT)', 'Momen perjuangan para sabuk putih hingga merah dalam menguji fisik, mental, dan pemecahan papan (Kyukpa).', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'LATIHAN', 3, true, 'Admin Dojang', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT ("id") DO NOTHING;
      `);
      console.log("✔ Seeded initial public showcase videos.");
    }

    // 4. Update default setting social links if unset
    await client.query(`
      UPDATE "Setting" 
      SET 
        "app_apk_url" = COALESCE("app_apk_url", 'https://play.google.com/store/apps/details?id=com.whitetigerkraksaan.member'),
        "tiktok_url" = COALESCE("tiktok_url", 'https://www.tiktok.com/@whitetigerkraksaan'),
        "instagram_url" = COALESCE("instagram_url", 'https://www.instagram.com/whitetigerkraksaan'),
        "facebook_url" = COALESCE("facebook_url", 'https://www.facebook.com/whitetigerkraksaan'),
        "telegram_url" = COALESCE("telegram_url", 'https://t.me/whitetigerkraksaan'),
        "youtube_url" = COALESCE("youtube_url", 'https://www.youtube.com/@whitetigerkraksaan')
      WHERE "id" = 'default';
    `);
    console.log("✔ Default social links configured in Setting.");

    console.log("Migration completed successfully!");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});
