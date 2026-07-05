import { prisma } from './src/lib/prisma';

async function test() {
  const user = await prisma.user.findFirst({
    where: { member: { memberNumber: 'TKD-2026-0089' } },
    include: { member: true }
  });
  if (!user) return console.log("User not found");
  
  const member = user.member;
  console.log("Member:", member.fullName, member.currentBelt);
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingLogs = await prisma.dailyQuestLog.findMany({
    where: { memberId: member.id, assignedAt: { gte: today, lt: tomorrow } },
    include: { quest: true },
    orderBy: { assignedAt: "asc" }
  });
  
  console.log("Existing Logs:", existingLogs.length);
  
  if (existingLogs.length > 0) return;
  
  // Auto-assign simulation
  const dbBelts = await prisma.beltRank.findMany();
  console.log("DB Belts:", dbBelts.map(b => b.name));
  
  const memberBelt = member.currentBelt.toUpperCase();
  const memberBeltRecord = dbBelts.find(b => 
    b.name.toUpperCase().includes(memberBelt) || memberBelt.includes(b.name.toUpperCase())
  );
  
  console.log("Matched Belt:", memberBeltRecord?.name);
  
  const allQuests = await prisma.questLibrary.findMany({ include: { requirements: true } });
  console.log("All Quests count:", allQuests.length);
  
  const eligibleQuests = allQuests.filter(q => {
    if (!q.requirements || q.requirements.length === 0) return true;
    return q.requirements.some(req => {
      // ignore age for now
      if (req.allowedBeltIds && req.allowedBeltIds.length > 0) {
        if (!memberBeltRecord) return false;
        const beltMatch = req.allowedBeltIds.includes(memberBeltRecord.id);
        if (!beltMatch) return false;
      }
      return true;
    });
  });
  
  console.log("Eligible Quests:", eligibleQuests.length);
  
}
test().finally(() => prisma.$disconnect());
