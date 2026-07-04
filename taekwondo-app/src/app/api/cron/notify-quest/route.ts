import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notify';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

    // Ambil semua member aktif
    const activeMembers = await prisma.member.findMany({
      where: { status: { notIn: ['PENDING_VERIFICATION', 'INACTIVE', 'REJECTED'] } },
      select: { id: true },
    });

    let sentCount = 0;

    for (const member of activeMembers) {
      // Cek apakah ada quest yang belum selesai hari ini (assigned hari ini, belum completed)
      const incompleteLogs = await prisma.dailyQuestLog.findMany({
        where: {
          memberId: member.id,
          assignedAt: { gte: startOfDay },
          completed: false,
        },
      });

      if (incompleteLogs.length > 0) {
        await notifyUser({
          userId: member.id,
          title: '⚔️ Quest Harian Belum Selesai!',
          message: `Kamu masih punya ${incompleteLogs.length} quest yang belum diselesaikan hari ini. Jangan biarkan streak-mu putus!`,
          type: 'QUEST',
          link: '/m/quests',
        });
        sentCount++;
      }
    }

    return NextResponse.json({ success: true, notified: sentCount });
  } catch (error: any) {
    console.error('notify-quest cron error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
