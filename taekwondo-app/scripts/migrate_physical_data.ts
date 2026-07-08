import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data migration for PhysicalMeasurementLog...');
  
  // Find all members that have weight, height, or waistCircum
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

  let migratedCount = 0;
  for (const member of members) {
    // Check if a log already exists for this member to prevent duplicates if script runs twice
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
          recordedAt: member.updatedAt, // Use the last time profile was updated
          notes: 'Initial data migration from Member profile',
        },
      });
      migratedCount++;
    }
  }

  console.log(`Successfully migrated ${migratedCount} members' physical data.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
