import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://taekwondo_user:taekwondo_password@postgres:5432/taekwondo_academy?schema=public' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🧹 Menghapus seluruh user & member buatan sample...");

  const superAdminEmail = 'admin@taekwondo.com';

  // Hapus semua User selain Super Admin resmi
  const otherUsers = await prisma.user.findMany({
    where: {
      email: { not: superAdminEmail }
    }
  });

  const otherUserIds = otherUsers.map(u => u.id);

  // Hapus member terkait
  await prisma.member.deleteMany({
    where: {
      userId: { in: otherUserIds }
    }
  });

  // Hapus user
  await prisma.user.deleteMany({
    where: {
      id: { in: otherUserIds }
    }
  });

  console.log(`✨ Berhasil menghapus ${otherUsers.length} user buatan sample!`);
  console.log(`🔒 HANYA Super Admin resmi (${superAdminEmail}) yang tersisa di database.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
