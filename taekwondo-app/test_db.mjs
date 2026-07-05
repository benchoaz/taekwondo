import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const member = await prisma.member.findFirst({ where: { fullName: 'Member' } });
  console.log('Member Belt:', member?.currentBelt);
  
  const belts = await prisma.beltRank.findMany();
  console.log('Belts:', belts.map(b => b.name).join(', '));
  
  const memberBeltRecord = belts.find(b => 
    member?.currentBelt.toUpperCase().includes(b.name.toUpperCase())
  );
  console.log('Matched Belt ID:', memberBeltRecord?.id);
  
  const quests = await prisma.questLibrary.findMany({ include: { requirements: true } });
  console.log('Total Quests in Library:', quests.length);
  
  const eligible = quests.filter(q => {
    return q.requirements.some(req => {
      const beltAllowed = memberBeltRecord ? req.allowedBeltIds.includes(memberBeltRecord.id) : false;
      return beltAllowed;
    });
  });
  console.log('Eligible Quests:', eligible.length);
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const logs = await prisma.dailyQuestLog.findMany({
    where: { memberId: member?.id, assignedAt: { gte: today, lt: tomorrow } }
  });
  console.log('Logs for today:', logs.length);
  
  // Delete logs so they regenerate
  const deleted = await prisma.dailyQuestLog.deleteMany({
    where: { memberId: member?.id, assignedAt: { gte: today, lt: tomorrow } }
  });
  console.log('Deleted logs:', deleted.count);
  
  // Update belt to remove duplicate
  if (member?.currentBelt === 'Sabuk Sabuk Merah (2 Geup)') {
    await prisma.member.update({
      where: { id: member.id },
      data: { currentBelt: 'Sabuk Merah (2 Geup)' }
    });
    console.log('Updated belt name.');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
