import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== CHECKING GAMIFICATION DATA IN DATABASE ===");

  try {
    const questLibraryCount = await prisma.questLibrary.count();
    console.log(`Quest Library Count: ${questLibraryCount}`);

    const questRequirementsCount = await prisma.questRequirement.count();
    console.log(`Quest Requirements Count: ${questRequirementsCount}`);

    const dailyQuestLogsCount = await prisma.dailyQuestLog.count();
    console.log(`Daily Quest Logs Count: ${dailyQuestLogsCount}`);

    if (dailyQuestLogsCount > 0) {
      const sampleLogs = await prisma.dailyQuestLog.findMany({
        take: 5,
        orderBy: { completedAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          quest: { select: { title: true } }
        }
      });
      console.log("\nRecent Daily Quest Logs:");
      console.log(JSON.stringify(sampleLogs, null, 2));
    } else {
      console.log("\nNo Daily Quest Logs found.");
    }

    const models = Object.keys(prisma).filter(k => !k.startsWith("_") && !k.startsWith("$"));
    const pointModels = models.filter(m => m.toLowerCase().includes("point") || m.toLowerCase().includes("coin") || m.toLowerCase().includes("exp") || m.toLowerCase().includes("transaction") || m.toLowerCase().includes("log"));
    console.log("\nPoint/Coin/Exp/Log Models:", pointModels);

    for (const model of pointModels) {
      try {
        const count = await (prisma as any)[model].count();
        console.log(`- ${model} Count: ${count}`);
        if (count > 0) {
          const sample = await (prisma as any)[model].findMany({ take: 3 });
          console.log(`  Sample ${model}:`, JSON.stringify(sample, null, 2));
        }
      } catch (e: any) {
        console.log(`- ${model}: Could not query (${e.message})`);
      }
    }

  } catch (error) {
    console.error("Error running gamification check:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
