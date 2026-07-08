import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let memberId = searchParams.get('memberId');

    // Authentication check
    // (Assuming session has user id or we just take memberId directly for now)
    
    if (!memberId) {
      return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });
    }

    const logs = await prisma.physicalMeasurementLog.findMany({
      where: { memberId },
      orderBy: { recordedAt: 'asc' },
    });

    return NextResponse.json({ data: logs });
  } catch (error) {
    console.error('Physical logs error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, weight, height, waistCircum, notes } = body;

    if (!memberId) {
      return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });
    }

    // 1. Create the log
    const newLog = await prisma.physicalMeasurementLog.create({
      data: {
        memberId,
        weight,
        height,
        waistCircum,
        notes,
      },
    });

    // 2. (Removed cache update on Member since fields were deleted)

    return NextResponse.json({ success: true, data: newLog });
  } catch (error) {
    console.error('Physical logs POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
