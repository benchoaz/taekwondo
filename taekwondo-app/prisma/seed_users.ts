import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";
import bcrypt from 'bcryptjs';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@taekwondo.com' },
    update: {},
    create: {
      email: 'admin@taekwondo.com',
      password: hashedPassword,
      name: 'Admin Taekwondo',
      role: 'ADMIN',
    },
  });

  const memberUser = await prisma.user.upsert({
    where: { email: 'member.beni@taekwondo.com' },
    update: {},
    create: {
      email: 'member.beni@taekwondo.com',
      password: hashedPassword,
      name: 'Beni',
      role: 'MEMBER',
    },
  });

  await prisma.member.upsert({
    where: { userId: memberUser.id },
    update: {},
    create: {
      userId: memberUser.id,
      fullName: 'Beni',
      memberNumber: 'MBR-001',
      dojangCoins: 5000,
    }
  });
  
  console.log("✅ Users seeded!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
