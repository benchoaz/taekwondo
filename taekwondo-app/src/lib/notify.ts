import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/firebase-admin';

export type NotificationType = 'EVENT' | 'SPP' | 'UKT' | 'ANNOUNCEMENT' | 'QUEST';

interface NotifyOptions {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  userId: string;
}

/**
 * Send notification to a single user (saves to DB + sends FCM push via User.fcmToken)
 */
export async function notifyUser(opts: NotifyOptions) {
  await prisma.notification.create({
    data: {
      title: opts.title,
      message: opts.message,
      userId: opts.userId,
      type: opts.type as any,
      link: opts.link,
    },
  });

  if (opts.userId !== 'ALL') {
    // fcmToken is on User, not Member — find via Member.userId
    const member = await prisma.member.findFirst({
      where: { userId: opts.userId },
      include: { user: { select: { fcmToken: true } } },
    });
    if (member?.user?.fcmToken) {
      await sendPushNotification(member.user.fcmToken, opts.title, opts.message, {
        type: opts.type,
        link: opts.link || '',
      });
    }
  }
}

/**
 * Broadcast notification to all active members (saves to DB as 'ALL' + sends FCM to each)
 */
export async function notifyAllMembers(opts: Omit<NotifyOptions, 'userId'>) {
  await prisma.notification.create({
    data: {
      title: opts.title,
      message: opts.message,
      userId: 'ALL',
      type: opts.type as any,
      link: opts.link,
    },
  });

  // Get all active members with FCM tokens via their User relation
  const members = await prisma.member.findMany({
    where: {
      status: { notIn: ['PENDING_VERIFICATION', 'INACTIVE', 'REJECTED'] },
      user: { fcmToken: { not: null } },
    },
    include: { user: { select: { fcmToken: true } } },
  });

  const pushPromises = members
    .filter((m) => m.user?.fcmToken)
    .map((m) =>
      sendPushNotification(m.user!.fcmToken!, opts.title, opts.message, {
        type: opts.type,
        link: opts.link || '',
      }).catch((err) => console.error('FCM error:', err))
    );
  await Promise.allSettled(pushPromises);
}
