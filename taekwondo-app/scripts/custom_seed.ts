import { prisma } from '../src/lib/prisma';

async function run() {
  console.log("Starting custom seeding...");

  // 1. Seed Belt Ranks
  const belts = [
    { name: "Sabuk Putih (10 Geup)", level: 1 },
    { name: "Sabuk Kuning (8 Geup)", level: 2 },
    { name: "Sabuk Kuning Strip Hijau (7 Geup)", level: 3 },
    { name: "Sabuk Hijau (6 Geup)", level: 4 },
    { name: "Sabuk Hijau Strip Biru (5 Geup)", level: 5 },
    { name: "Sabuk Biru (4 Geup)", level: 6 },
    { name: "Biru Strip Merah (3 Geup)", level: 7 },
    { name: "Sabuk Merah (2 Geup)", level: 8 },
    { name: "Sabuk Merah Strip Hitam (1 Geup)", level: 9 },
    { name: "Sabuk Hitam (Dan 1+)", level: 10 },
  ];

  let prevBeltId: string | null = null;
  for (const b of belts) {
    const existing = await prisma.beltRank.findFirst({ where: { name: b.name } });
    if (!existing) {
      const created = await prisma.beltRank.create({
        data: {
          name: b.name,
          level: b.level,
        }
      });
      console.log(`Seeded BeltRank: ${b.name}`);
      if (prevBeltId) {
        await prisma.beltRank.update({
          where: { id: prevBeltId },
          data: { nextBeltId: created.id }
        });
      }
      prevBeltId = created.id;
    } else {
      prevBeltId = existing.id;
    }
  }

  // 2. Seed Quest Library
  const defaultQuests = [
    { title: "Push Up Rutin", description: "Lakukan push up sebanyak 20 kali di pagi hari", baseXp: 50, category: "FITNESS" as const },
    { title: "Peregangan Pagi", description: "Lakukan peregangan poomsae selama 10 menit", baseXp: 30, category: "FITNESS" as const },
    { title: "Latihan Kick Basic", description: "Lakukan tendangan Ap Chagi sebanyak 30 kali", baseXp: 60, category: "TECHNICAL" as const },
  ];

  for (const q of defaultQuests) {
    const existing = await prisma.questLibrary.findFirst({ where: { title: q.title } });
    if (!existing) {
      await prisma.questLibrary.create({
        data: {
          title: q.title,
          description: q.description,
          baseXp: q.baseXp,
          category: q.category,
        }
      });
      console.log(`Seeded Quest: ${q.title}`);
    }
  }

  console.log("Custom seeding completed successfully!");
}

run()
  .catch(err => {
    console.error("Seeding error:", err);
  })
  .finally(() => {
    prisma.$disconnect();
  });
