import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://taekwondo_user:taekwondo_password@postgres:5432/taekwondo_academy?schema=public' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🔐 Mendaftarkan Super Admin Resmi...");

  const email = 'admin@taekwondo.com';
  const hashedPassword = await bcrypt.hash('wtkraksaan321', 10);

  const user = await prisma.user.upsert({
    where: { email: email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Super Admin WTK',
    },
    create: {
      email: email,
      password: hashedPassword,
      name: 'Super Admin WTK',
      role: 'ADMIN',
    }
  });

  await prisma.member.upsert({
    where: { userId: user.id },
    update: {
      fullName: 'Super Admin WTK',
      memberNumber: 'WTK-ADMIN',
    },
    create: {
      userId: user.id,
      fullName: 'Super Admin WTK',
      memberNumber: 'WTK-ADMIN',
      dojangCoins: 10000,
      currentBelt: 'Sabuk Hitam (Dan 1+)',
    }
  });

  console.log(`✅ Super Admin Berhasil Didaftarkan: ${email} / wtkraksaan321`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
