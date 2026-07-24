import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/firebase-admin';
import { sendNotificationEmail } from '@/lib/email';

export type NotificationType = 'EVENT' | 'SPP' | 'UKT' | 'ANNOUNCEMENT' | 'QUEST';

interface NotifyOptions {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  userId: string;
}

/**
 * Send notification to a single user (saves to DB + sends FCM push + sends Email if active)
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
    const user = await prisma.user.findUnique({
      where: { id: opts.userId },
      select: { email: true, fcmToken: true },
    });

    if (user) {
      // 1. FCM Mobile Push
      if (user.fcmToken) {
        await sendPushNotification(user.fcmToken, opts.title, opts.message, {
          type: opts.type,
          link: opts.link || '',
        }).catch((err) => console.error('FCM error:', err));
      }

      // 2. Email Notification (if active email)
      if (user.email) {
        await sendNotificationEmail({
          to: user.email,
          subject: opts.title,
          title: opts.title,
          message: opts.message,
          link: opts.link,
        }).catch((err) => console.error('Email error:', err));
      }
    }
  }
}

/**
 * Broadcast notification to all active members (saves to DB as 'ALL' + sends FCM + Email to each)
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

  // Get all active members with their User relation (email & fcmToken)
  const members = await prisma.member.findMany({
    where: {
      status: { notIn: ['PENDING_VERIFICATION', 'INACTIVE', 'REJECTED'] },
    },
    include: { user: { select: { email: true, fcmToken: true } } },
  });

  const promises = members.map(async (m) => {
    // FCM Push
    if (m.user?.fcmToken) {
      await sendPushNotification(m.user.fcmToken, opts.title, opts.message, {
        type: opts.type,
        link: opts.link || '',
      }).catch((err) => console.error('FCM error:', err));
    }

    // Email
    if (m.user?.email) {
      await sendNotificationEmail({
        to: m.user.email,
        subject: opts.title,
        title: opts.title,
        message: opts.message,
        link: opts.link,
      }).catch((err) => console.error('Email error:', err));
    }
  });

  await Promise.allSettled(promises);
}
