import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/firebase-admin';

// POST /api/announcements — Create/broadcast new announcement
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, type = 'ANNOUNCEMENT', link, sendWhatsApp = false, startAt, expiresAt } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 });
    }

    // Save announcement to DB (userId = 'ALL' means it targets everyone)
    await prisma.notification.create({
      data: {
        title,
        message,
        userId: 'ALL',
        type: type as any,
        link: link || null,
        startAt: startAt ? new Date(startAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
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

    // 2. Send WhatsApp Broadcast via WAHA (only if enabled)
    let waNotified = 0;
    if (sendWhatsApp) {
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
    }

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

// GET /api/announcements — Get all announcements (admin), or only active ones for public (?active=true)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const now = new Date();

    const where: any = {
      userId: 'ALL',
      type: 'ANNOUNCEMENT',
    };

    if (activeOnly) {
      // Filter: startAt <= now and (expiresAt is null OR expiresAt >= now)
      where.AND = [
        { OR: [{ startAt: null }, { startAt: { lte: now } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
      ];
    }

    const announcements = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: announcements,
      announcement: announcements[0] || null, // backward compat
    });
  } catch (error: any) {
    console.error('Fetch announcements error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/announcements — Edit an existing announcement
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, message, type, link, startAt, expiresAt } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }
    if (!title || !message) {
      return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        title,
        message,
        type: type as any,
        link: link || null,
        startAt: startAt ? new Date(startAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Update announcement error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/announcements — Delete an announcement
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    await prisma.notification.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete announcement error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
