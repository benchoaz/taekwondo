import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, fcmToken } = body;

    if (!userId || !fcmToken) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { fcmToken }
    });

    return NextResponse.json({ success: true, message: "FCM Token berhasil disimpan", data: { id: updatedUser.id } });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return NextResponse.json({ error: "Gagal menyimpan FCM token" }, { status: 500 });
  }
}
