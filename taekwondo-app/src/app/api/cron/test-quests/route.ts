import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const member = await prisma.member.findFirst({
      where: { memberNumber: 'TKD-2026-0089' }
    });
    
    if (!member) return NextResponse.json({ error: "Member not found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingLogs = await prisma.dailyQuestLog.findMany({
      where: { memberId: member.id, assignedAt: { gte: today, lt: tomorrow } },
      include: { quest: true }
    });

    if (existingLogs.length > 0) {
      return NextResponse.json({ status: "EXISTING", logs: existingLogs });
    }

    const dbBelts = await prisma.beltRank.findMany();
    const memberBelt = member.currentBelt.toUpperCase();
    const memberBeltRecord = dbBelts.find(b => 
      b.name.toUpperCase().includes(memberBelt) || memberBelt.includes(b.name.toUpperCase())
    );

    const memberBeltId = memberBeltRecord ? memberBeltRecord.id : null;

    const allQuests = await prisma.questLibrary.findMany({ include: { requirements: true } });

    let age = 15;
    if (member.dateOfBirth) {
      const now = new Date();
      const birth = new Date(member.dateOfBirth);
      age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    }

    const eligibleQuests = allQuests.filter(q => {
      if (!q.requirements || q.requirements.length === 0) return true;
      return q.requirements.some(req => {
        if (age < req.minAge || age > req.maxAge) return false;
        if (req.allowedBeltIds && req.allowedBeltIds.length > 0) {
          if (!memberBeltId) return false;
          const beltMatch = req.allowedBeltIds.includes(memberBeltId);
          if (!beltMatch) return false;
        }
        return true;
      });
    });

    if (eligibleQuests.length === 0) {
      return NextResponse.json({ status: "NO_ELIGIBLE", dbBelts, memberBelt, allQuests });
    }

    // Try creating one
    try {
      const newLog = await prisma.dailyQuestLog.create({
        data: { memberId: member.id, questId: eligibleQuests[0].id },
        include: { quest: true }
      });
      return NextResponse.json({ status: "CREATED", log: newLog });
    } catch (createErr: any) {
      return NextResponse.json({ status: "CREATE_ERROR", message: createErr.message, stack: createErr.stack });
    }

  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack });
  }
}
