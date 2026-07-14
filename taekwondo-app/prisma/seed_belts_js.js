const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const belts = [
  { id: "Sabuk Putih (10 Geup)", name: "Sabuk Putih (10 Geup)", level: 1 },
  { id: "Sabuk Kuning (9 Geup)", name: "Sabuk Kuning (9 Geup)", level: 2 },
  { id: "Sabuk Kuning Strip Hijau (8 Geup)", name: "Sabuk Kuning Strip Hijau (8 Geup)", level: 3 },
  { id: "Sabuk Hijau (7 Geup)", name: "Sabuk Hijau (7 Geup)", level: 4 },
  { id: "Sabuk Hijau Strip Biru (6 Geup)", name: "Sabuk Hijau Strip Biru (6 Geup)", level: 5 },
  { id: "Sabuk Biru (5 Geup)", name: "Sabuk Biru (5 Geup)", level: 6 },
  { id: "Sabuk Biru Strip Merah (4 Geup)", name: "Sabuk Biru Strip Merah (4 Geup)", level: 7 },
  { id: "Sabuk Merah (3 Geup)", name: "Sabuk Merah (3 Geup)", level: 8 },
  { id: "Sabuk Merah Strip Hitam (2 Geup)", name: "Sabuk Merah Strip Hitam (2 Geup)", level: 9 },
  { id: "Sabuk Merah Strip Hitam (1 Geup)", name: "Sabuk Merah Strip Hitam (1 Geup)", level: 10 },
  { id: "Sabuk Hitam (Dan 1)", name: "Sabuk Hitam (Dan 1)", level: 11 },
  { id: "Sabuk Hitam (Dan 2)", name: "Sabuk Hitam (Dan 2)", level: 12 },
  { id: "Sabuk Hitam (Dan 3)", name: "Sabuk Hitam (Dan 3)", level: 13 },
];

async function main() {
  console.log("Seeding BeltRanks...");
  for (const belt of belts) {
    await prisma.beltRank.upsert({
      where: { name: belt.name },
      update: { level: belt.level, id: belt.id },
      create: {
        id: belt.id,
        name: belt.name,
        level: belt.level,
      },
    });
  }
  console.log("BeltRanks seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
