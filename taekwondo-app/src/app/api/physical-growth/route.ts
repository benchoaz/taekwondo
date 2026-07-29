import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role') || 'MEMBER';

    let targetMemberId = memberId;

    if (!targetMemberId && userRole === 'MEMBER' && userId) {
      const currentMember = await prisma.member.findUnique({ where: { userId } });
      targetMemberId = currentMember?.id || null;
    }

    if (targetMemberId) {
      const logs = await prisma.physicalMeasurementLog.findMany({
        where: { memberId: targetMemberId },
        orderBy: { recordedAt: 'desc' },
        include: {
          member: {
            select: {
              id: true,
              fullName: true,
              memberNumber: true,
              currentBelt: true,
              dateOfBirth: true,
            }
          }
        }
      });
      return NextResponse.json({ success: true, data: logs });
    }

    // Admin / Coach: ambil semua member
    const allMembers = await prisma.member.findMany({
      include: {
        physicalLogs: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
        user: {
          select: {
            email: true,
            image: true,
          }
        }
      },
      orderBy: { fullName: 'asc' }
    });

    const report = allMembers.map(m => {
      const latestLog = m.physicalLogs[0] || null;
      const weight = latestLog?.weight || null;
      const height = latestLog?.height || null;

      let bmi = null;
      let category = 'Belum Diukur';
      let tournamentClass = 'Belum Ada Data';

      if (weight && height) {
        const heightM = height / 100;
        bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));

        if (bmi < 18.5) category = 'Underweight';
        else if (bmi <= 22.9) category = 'Ideal';
        else if (bmi <= 24.9) category = 'Overweight';
        else category = 'Obesity';

        if (weight <= 33) tournamentClass = 'Under 33 kg';
        else if (weight <= 37) tournamentClass = 'Under 37 kg';
        else if (weight <= 41) tournamentClass = 'Under 41 kg';
        else if (weight <= 45) tournamentClass = 'Under 45 kg';
        else if (weight <= 48) tournamentClass = 'Under 48 kg';
        else if (weight <= 51) tournamentClass = 'Under 51 kg';
        else if (weight <= 55) tournamentClass = 'Under 55 kg';
        else if (weight <= 59) tournamentClass = 'Under 59 kg';
        else if (weight <= 63) tournamentClass = 'Under 63 kg';
        else if (weight <= 68) tournamentClass = 'Under 68 kg';
        else if (weight <= 73) tournamentClass = 'Under 73 kg';
        else tournamentClass = `Over ${Math.floor(weight)} kg`;
      }

      return {
        memberId: m.id,
        fullName: m.fullName,
        memberNumber: m.memberNumber,
        currentBelt: m.currentBelt,
        dateOfBirth: m.dateOfBirth,
        latestWeight: weight,
        latestHeight: height,
        bmi,
        category,
        tournamentClass,
        lastRecordedAt: latestLog?.recordedAt || null,
        historyCount: m.physicalLogs.length,
      };
    });

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error("GET Physical Growth Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const { memberId, height, weight, waistCircum, notes } = body;

    let targetMemberId = memberId;

    if (!targetMemberId && userId) {
      const currentMember = await prisma.member.findUnique({ where: { userId } });
      targetMemberId = currentMember?.id;
    }

    if (!targetMemberId) {
      return NextResponse.json({ success: false, error: 'Member ID tidak ditemukan' }, { status: 400 });
    }

    const newLog = await prisma.physicalMeasurementLog.create({
      data: {
        memberId: targetMemberId,
        height: height ? parseFloat(String(height)) : null,
        weight: weight ? parseFloat(String(weight)) : null,
        waistCircum: waistCircum ? parseFloat(String(waistCircum)) : null,
        notes: notes || null,
        recordedBy: userId || 'SYSTEM',
      }
    });

    return NextResponse.json({ success: true, message: 'Data tumbuh kembang berhasil dicatat', data: newLog });
  } catch (error: any) {
    console.error("POST Physical Growth Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, height, weight, waistCircum, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID log diperlukan' }, { status: 400 });
    }

    if (userRole === 'MEMBER') {
      const currentMember = await prisma.member.findUnique({ where: { userId } });
      const existingLog = await prisma.physicalMeasurementLog.findUnique({ where: { id } });
      if (!existingLog || existingLog.memberId !== currentMember?.id) {
        return NextResponse.json({ success: false, error: 'Tidak diizinkan mengedit data ini' }, { status: 403 });
      }
    }

    const updated = await prisma.physicalMeasurementLog.update({
      where: { id },
      data: {
        height: height ? parseFloat(String(height)) : undefined,
        weight: weight ? parseFloat(String(weight)) : undefined,
        waistCircum: waistCircum ? parseFloat(String(waistCircum)) : undefined,
        notes: notes !== undefined ? notes : undefined,
      }
    });

    return NextResponse.json({ success: true, message: 'Data berhasil diperbarui', data: updated });
  } catch (error: any) {
    console.error("PUT Physical Growth Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID log diperlukan' }, { status: 400 });
    }

    if (userRole === 'MEMBER') {
      const currentMember = await prisma.member.findUnique({ where: { userId } });
      const existingLog = await prisma.physicalMeasurementLog.findUnique({ where: { id } });
      if (!existingLog || existingLog.memberId !== currentMember?.id) {
        return NextResponse.json({ success: false, error: 'Tidak diizinkan menghapus data ini' }, { status: 403 });
      }
    }

    await prisma.physicalMeasurementLog.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (error: any) {
    console.error("DELETE Physical Growth Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
