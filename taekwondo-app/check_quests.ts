import { prisma } from './src/lib/prisma';
async function run() {
  const belts = await prisma.beltRank.count();
  const quests = await prisma.questLibrary.count();
  const logs = await prisma.dailyQuestLog.count();
  console.log({ belts, quests, logs });
  
  if (quests > 0) {
    const sample = await prisma.questLibraryRequirement.findFirst();
    console.log("Sample req:", sample);
  }
}
run().finally(() => prisma.$disconnect());
