import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ success: false, message: 'Missing memberId' }, { status: 400 });
    }

    const allBadges = await prisma.badge.findMany();
    const earnedBadges = await prisma.memberBadge.findMany({
      where: { memberId }
    });

    const result = allBadges.map(badge => {
      const earnedRecord = earnedBadges.find(eb => eb.badgeId === badge.id);
      return {
        id: badge.id,
        name: badge.name,
        iconUrl: badge.iconUrl,
        description: badge.description,
        condition: badge.condition,
        unlocked: earnedRecord != null,
        earnedAt: earnedRecord?.earnedAt || null,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
