import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/firebase-admin';

// POST /api/announcements — Broadcast announcement to all active members
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, type = 'ANNOUNCEMENT', link } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 });
    }

    // Save broadcast to DB (userId = 'ALL' means it targets everyone)
    await prisma.notification.create({
      data: {
        title,
        message,
        userId: 'ALL',
        type: type as any,
        link: link || null,
      },
    });

    // Get all active members
    const members = await prisma.member.findMany({
      where: {
        status: { notIn: ['PENDING_VERIFICATION', 'INACTIVE', 'REJECTED'] },
      },
      include: { user: { select: { fcmToken: true } } },
    });

    // 1. Send FCM Push Notifications
    let notified = 0;
    const pushPromises = members
      .filter((m) => m.user?.fcmToken)
      .map((m) =>
        sendPushNotification(m.user!.fcmToken!, title, message, {
          type,
          link: link || '',
        })
          .then(() => { notified++; })
          .catch((err) => console.error('FCM push error:', err))
      );
    await Promise.allSettled(pushPromises);

    // 2. Send WhatsApp Broadcast via WAHA
    let waNotified = 0;
    const { sendAnnouncementNotification } = await import("@/lib/whatsapp");
    const origin = request.headers.get("origin") || `https://${request.headers.get("host")}` || "https://whitetigertraksaan.com";
    const fullLink = link ? (link.startsWith("http") ? link : `${origin}${link}`) : undefined;

    const waPromises = members
      .filter((m) => m.phone)
      .map((m) =>
        sendAnnouncementNotification(m.phone!, m.fullName, title, message, fullLink)
          .then((res) => { if (res && res.status) waNotified++; })
          .catch((err) => console.error('WhatsApp broadcast error:', err))
      );
    await Promise.allSettled(waPromises);

    return NextResponse.json({ 
      success: true, 
      notified, 
      waNotified,
      totalMembers: members.length 
    });
  } catch (error: any) {
    console.error('Announcement error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
