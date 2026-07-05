import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

async function main() {
  const result = await prisma.member.updateMany({
    where: { currentBelt: 'Sabuk Sabuk Merah (2 Geup)' },
    data: { currentBelt: 'Sabuk Merah (2 Geup)' }
  });
  console.log('Fixed belt names:', result.count);

  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const deleted = await prisma.dailyQuestLog.deleteMany({
    where: { assignedAt: { gte: today, lt: tomorrow } }
  });
  console.log('Deleted today quest logs:', deleted.count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
