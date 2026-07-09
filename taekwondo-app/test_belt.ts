import { prisma } from './src/lib/prisma';
async function main() {
  const count = await prisma.beltRank.count();
  console.log('BeltRank count:', count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
