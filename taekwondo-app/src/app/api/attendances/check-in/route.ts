import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, latitude, longitude } = body;

    let targetMemberId = memberId;

    if (!memberId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // if memberId is actually userId, find the member
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { id: memberId },
          { userId: memberId }
        ]
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
    }
    
    targetMemberId = member.id;

    // Set target date to start of today in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Check if attendance already exists for today
    const existing = await prisma.attendance.findFirst({
      where: {
        memberId: targetMemberId,
        date: today
      }
    });

    if (existing) {
      // Update existing attendance
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          present: true,
          latitude: latitude || existing.latitude,
          longitude: longitude || existing.longitude,
        }
      });
      return NextResponse.json({ success: true, message: "Absensi diperbarui", data: updated });
    } else {
      // Create new attendance
      const newAttendance = await prisma.attendance.create({
        data: {
          memberId: targetMemberId,
          date: today,
          present: true,
          latitude,
          longitude
        }
      });
      return NextResponse.json({ success: true, message: "Absensi berhasil dicatat", data: newAttendance }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating check-in:", error);
    return NextResponse.json({ error: "Gagal mencatat absensi" }, { status: 500 });
  }
}
