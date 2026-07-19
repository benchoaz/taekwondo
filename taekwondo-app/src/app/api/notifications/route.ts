import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId parameter' }, { status: 400 });
    }

    const now = new Date();
    const notifications = await prisma.notification.findMany({
      where: {
        AND: [
          {
            OR: [
              { userId: userId },
              { userId: 'ALL' }
            ]
          },
          {
            OR: [
              { startAt: null },
              { startAt: { lte: now } }
            ]
          },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } }
            ]
          }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ success: true, data: notifications, unreadCount });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Mark notifications as read
// Body: { userId: string, notificationIds?: string[] } — if no ids, mark ALL as read for user
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, notificationIds } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Missing userId' }, { status: 400 });
    }

    if (notificationIds && notificationIds.length > 0) {
      await prisma.notification.updateMany({
        where: { id: { in: notificationIds }, userId: userId },
        data: { isRead: true },
      });
    } else {
      // Mark all notifications (user-specific and ALL) as read
      await prisma.notification.updateMany({
        where: { userId: userId },
        data: { isRead: true },
      });
      // Mark global (ALL) notifications as read — we create a per-user read by userId
      // For simplicity, mark ALL notifications addressed to 'ALL' as read (system-wide)
      await prisma.notification.updateMany({
        where: { userId: 'ALL', isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
