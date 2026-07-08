import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  console.log('Starting data migration...');
  let migrated = 0;
  
  try {
    const members = await prisma.member.findMany({
      where: {
        OR: [
          { weight: { not: null } },
          { height: { not: null } },
          { waistCircum: { not: null } },
        ],
      },
    });

    for (const member of members) {
      const existingLog = await prisma.physicalMeasurementLog.findFirst({
        where: { memberId: member.id },
      });

      if (!existingLog) {
        await prisma.physicalMeasurementLog.create({
          data: {
            memberId: member.id,
            weight: member.weight,
            height: member.height,
            waistCircum: member.waistCircum,
            recordedAt: member.createdAt,
            notes: 'Migrated from static member data',
          },
        });
        migrated++;
      }
    }
    return NextResponse.json({ success: true, migrated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
