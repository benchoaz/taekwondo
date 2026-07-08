import { config } from 'dotenv';
config();
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Starting data migration...');
  
  // 1. Get all members that have physical data
  const members = await prisma.member.findMany({
    where: {
      OR: [
        { weight: { not: null } },
        { height: { not: null } },
        { waistCircum: { not: null } },
      ],
    },
  });

  console.log(`Found ${members.length} members with physical data.`);

  for (const member of members) {
    // 2. Check if a log already exists for this member to avoid duplicates
    const existingLog = await prisma.physicalMeasurementLog.findFirst({
      where: { memberId: member.id },
    });

    if (!existingLog) {
      // Create initial log from their static data
      await prisma.physicalMeasurementLog.create({
        data: {
          memberId: member.id,
          weight: member.weight,
          height: member.height,
          waistCircum: member.waistCircum,
          recordedAt: member.createdAt, // Assume it was recorded when they joined
          notes: 'Migrated from static member data',
        },
      });
      console.log(`Created physical log for Member ID: ${member.id}`);
    }
  }

  console.log('Data migration completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
