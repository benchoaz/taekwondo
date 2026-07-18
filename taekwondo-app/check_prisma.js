const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: 'londokacang' },
        { email: 'londokacang@taekwondo.local' }
      ]
    },
    include: { member: true }
  });
  console.log("INVESTIGASI USER:", JSON.stringify(user, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
