import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://taekwondo_user:taekwondo_password@postgres:5432/taekwondo_academy?schema=public' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🧹 Menghapus seluruh akun dengan role MEMBER & User sampel buatan...");

  const superAdminEmail = 'admin@taekwondo.com';

  // Hapus semua User selain Super Admin
  const usersToDelete = await prisma.user.findMany({
    where: {
      email: { not: superAdminEmail }
    }
  });

  const userIds = usersToDelete.map(u => u.id);

  // 1. Hapus Member records
  const deletedMembers = await prisma.member.deleteMany({
    where: {
      userId: { in: userIds }
    }
  });

  // 2. Hapus User records
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      id: { in: userIds }
    }
  });

  console.log(`✅ Berhasil menghapus ${deletedMembers.count} data Member.`);
  console.log(`✅ Berhasil menghapus ${deletedUsers.count} data User.`);
  console.log(`🔒 HANYA Super Admin resmi (admin@taekwondo.com) yang tersisa!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
