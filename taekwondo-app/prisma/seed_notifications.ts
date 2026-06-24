import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding notifications...');
  
  const users = await prisma.user.findMany({ where: { role: 'MEMBER' }, take: 2 });
  
  if (users.length > 0) {
    const user = users[0];
    await prisma.notification.create({
      data: {
        title: 'Jadwal Latihan Tambahan',
        message: 'Latihan persiapan kejuaraan besok jam 15:00 di Dojang Utama.',
        userId: user.id,
      },
    });
    
    await prisma.notification.create({
      data: {
        title: 'Event & Pengumuman',
        message: 'Pendaftaran Kejurda DKI Jakarta sudah dibuka. Silakan daftar via admin.',
        userId: 'ALL',
      },
    });
    
    console.log('Notifications seeded successfully!');
  } else {
    console.log('No users found to seed notifications.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
