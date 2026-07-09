import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyUser } from '@/lib/notify';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const overdueInvoices = await prisma.sppInvoice.findMany({
      where: {
        status: { in: ['UNPAID', 'OVERDUE'] },
        dueDate: { lt: new Date() },
      },
      include: { member: true },
    });

    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    let sentCount = 0;

    for (const invoice of overdueInvoices) {
      // Update status ke OVERDUE jika masih UNPAID
      if (invoice.status === 'UNPAID') {
        await prisma.sppInvoice.update({ where: { id: invoice.id }, data: { status: 'OVERDUE' } });
      }

      const monthName = monthNames[(invoice.month ?? 1) - 1];
      await notifyUser({
        userId: invoice.member.userId,
        title: '⚠️ SPP Terlambat!',
        message: `Tagihan SPP ${monthName} ${invoice.year} sebesar Rp${invoice.amount.toLocaleString('id-ID')} belum dibayar. Segera lakukan pembayaran!`,
        type: 'SPP',
        link: '/m/spp',
      });
      sentCount++;
    }

    return NextResponse.json({ success: true, notified: sentCount });
  } catch (error: any) {
    console.error('notify-spp cron error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
