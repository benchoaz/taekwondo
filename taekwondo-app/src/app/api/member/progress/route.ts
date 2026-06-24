import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ success: false, message: 'Missing memberId' }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        uktEntries: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        attendances: true,
      }
    });

    if (!member) {
      return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
    }

    // Get current belt and next belt requirements
    const currentBeltRank = await prisma.beltRank.findFirst({
      where: { name: member.currentBelt }
    });

    let nextBeltRank = null;
    if (currentBeltRank?.nextBeltId) {
      nextBeltRank = await prisma.beltRank.findUnique({
        where: { id: currentBeltRank.nextBeltId }
      });
    }

    // Calculate current stats
    const totalClasses = 20; // Dummy baseline for now
    const attendanceCount = member.attendances.length;
    const attendancePercent = totalClasses > 0 ? (attendanceCount / totalClasses) * 100 : 0;

    const latestUkt = member.uktEntries[0];
    const techScore = latestUkt?.basicTechScore || 0;
    const poomsaeScore = latestUkt?.poomsaeScore || 0;
    const physicalScore = latestUkt?.physicalScore || 0;

    // Virtual Coach Rules Processing
    const rules = await prisma.virtualCoachRule.findMany();
    const recommendations: string[] = [];

    rules.forEach(rule => {
      // Evaluate conditions safely
      let conditionMet = false;
      if (rule.condition.includes('TECH_SCORE') && techScore > 0 && techScore < 70) conditionMet = true;
      if (rule.condition.includes('POOMSAE_SCORE') && poomsaeScore > 0 && poomsaeScore < 70) conditionMet = true;
      if (rule.condition.includes('ATTENDANCE') && attendancePercent < 80) conditionMet = true;

      if (conditionMet) {
        recommendations.push(rule.recommend);
      }
    });

    // Default virtual coach if no rules but scores are low
    if (recommendations.length === 0) {
       if (poomsaeScore > 0 && poomsaeScore < 75) recommendations.push('Fokus perbaiki kuda-kuda Poomsae Anda di rumah.');
       if (physicalScore > 0 && physicalScore < 75) recommendations.push('Tambahkan porsi lari pagi dan sit up harian.');
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        currentBelt: currentBeltRank,
        nextBeltRequirement: nextBeltRank,
        stats: {
          attendancePercent: Math.round(attendancePercent),
          techScore,
          poomsaeScore,
          physicalScore
        },
        virtualCoach: recommendations
      }
    });

  } catch (error: any) {
    console.error('Error fetching member progress:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
