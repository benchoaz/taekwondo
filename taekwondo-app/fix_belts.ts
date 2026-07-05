import { prisma } from './src/lib/prisma';

const masterBelts = [
  "Sabuk Putih (10 Geup)",
  "Sabuk Kuning (9 Geup)",
  "Kuning Strip Hijau (8 Geup)",
  "Sabuk Hijau (7 Geup)",
  "Hijau Strip Biru (6 Geup)",
  "Sabuk Biru (5 Geup)",
  "Biru Strip Merah (4 Geup)",
  "Sabuk Merah (3 Geup)",
  "Merah Strip Hitam 1 (2 Geup)",
  "Merah Strip Hitam 2 (1 Geup)",
  "Sabuk Hitam (1 Dan)"
];

const normalizeBelt = (str: string) => str.toUpperCase().replace(/SABUK|GEUP|DAN|[^A-Z0-9]/g, '');

async function run() {
  console.log("Fixing BeltRank table...");
  const dbBelts = await prisma.beltRank.findMany();
  for (const b of dbBelts) {
    const norm = normalizeBelt(b.name);
    const correct = masterBelts.find(m => normalizeBelt(m) === norm || normalizeBelt(m).includes(norm) || norm.includes(normalizeBelt(m)));
    if (correct && correct !== b.name) {
      await prisma.beltRank.update({ where: { id: b.id }, data: { name: correct } });
      console.log(`Updated BeltRank: ${b.name} -> ${correct}`);
    }
  }

  console.log("Fixing Member table...");
  const members = await prisma.member.findMany();
  for (const m of members) {
    const norm = normalizeBelt(m.currentBelt);
    const correct = masterBelts.find(master => normalizeBelt(master) === norm || normalizeBelt(master).includes(norm) || norm.includes(normalizeBelt(master)));
    if (correct && correct !== m.currentBelt) {
      await prisma.member.update({ where: { id: m.id }, data: { currentBelt: correct } });
      console.log(`Updated Member ${m.fullName}: ${m.currentBelt} -> ${correct}`);
    }
  }
}
run().finally(() => prisma.$disconnect());
