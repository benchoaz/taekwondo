import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });
    }

    // 1. Fetch belt histories
    const beltHistories = await prisma.beltHistory.findMany({
      where: { memberId },
      orderBy: { promotedAt: 'asc' },
    });

    // 2. Fetch certificates
    const certificates = await prisma.certificate.findMany({
      where: { memberId },
    });

    // 3. Map certificates to belt history
    const timeline = beltHistories.map((history) => {
      // Find the matching certificate for the target belt
      const matchingCert = certificates.find(cert => cert.newBelt === history.toBelt);
      
      return {
        id: history.id,
        fromBelt: history.fromBelt,
        toBelt: history.toBelt,
        promotedAt: history.promotedAt,
        certUrl: matchingCert ? matchingCert.qrCodeUrl : history.certUrl, 
        certificateDetails: matchingCert || null,
      };
    });

    return NextResponse.json({ data: timeline });
  } catch (error) {
    console.error('Timeline GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
