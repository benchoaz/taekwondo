import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as any);

  try {
    const user = await prisma.user.findUnique({ where: { email: 'meera@taekwondo.com' } });
    if (!user) {
      console.log('User not found!');
      return;
    }

    const member = await prisma.member.findUnique({ where: { userId: user.id } });
    if (!member) {
      console.log('Member profile not found for user!');
      return;
    }

    const updated = await prisma.member.update({
      where: { id: member.id },
      data: { dojangCoins: 100000 }
    });

    console.log('SUCCESS: Updated meera@taekwondo.com Dojang Coins to ' + updated.dojangCoins);
  } catch (error) {
    console.error('Error updating points:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
