import { prisma } from '../src/lib/prisma';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('--- REFRESHING QUESTS DATA IN DATABASE ---');

  // 1. Update Video URL untuk "Tata Cara Hormat di Dojang"
  const hormatQuest = await prisma.questLibrary.updateMany({
    where: {
      title: {
        contains: 'Tata Cara Hormat',
        mode: 'insensitive'
      }
    },
    data: {
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      requireVideo: false
    }
  });
  console.log(`Updated Hormat Quest count: ${hormatQuest.count}`);

  // 2. Update Video URL untuk "Pentingnya Pemanasan Sendi"
  const pemanasanQuest = await prisma.questLibrary.updateMany({
    where: {
      title: {
        contains: 'Pemanasan Sendi',
        mode: 'insensitive'
      }
    },
    data: {
      videoUrl: 'https://www.youtube.com/watch?v=68Tj9gWekN4',
      requireVideo: false
    }
  });
  console.log(`Updated Pemanasan Quest count: ${pemanasanQuest.count}`);

  // 3. Reset daily logs hari ini agar quest kembali berstatus "Ambil" untuk testing
  const resetLogs = await prisma.dailyQuestLog.deleteMany({
    where: {
      assignedAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  });
  console.log(`Deleted today's quest logs to refresh: ${resetLogs.count}`);
  
  console.log('--- REFRESH SUCCESSFUL ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
