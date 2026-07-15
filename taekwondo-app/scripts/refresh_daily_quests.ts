import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("==================================================");
  console.log("🔄 ME-RESET DAN REFRESH DAILY QUEST UNTUK TESTING");
  console.log("==================================================");

  try {
    // Hapus seluruh log harian (agar bisa memicu auto-assign ulang dari bank data quest baru)
    const deleteLogs = await prisma.dailyQuestLog.deleteMany({});
    console.log(`🧹 Berhasil menghapus ${deleteLogs.count} log misi murid lama di database.`);

    // Bersihkan juga log XP/koin terkait agar saldo progres bisa diuji dari awal jika diinginkan
    const deleteXpLogs = await prisma.xpLog.deleteMany({ where: { source: "DAILY_QUEST" } });
    console.log(`🧹 Berhasil menghapus ${deleteXpLogs.count} riwayat log XP daily quest.`);

    const deleteCoinLogs = await prisma.dojangCoinLog.deleteMany({ where: { source: "DAILY_QUEST" } });
    console.log(`🧹 Berhasil menghapus ${deleteCoinLogs.count} riwayat log koin daily quest.`);

    console.log("\n✅ Database siap! Silakan reload halaman Daily Quest di aplikasi Flutter Web untuk melihat 3 misi harian acak yang baru.");
    console.log("==================================================");

  } catch (e: any) {
    console.error("❌ Terjadi error saat me-reset log quest:", e);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
