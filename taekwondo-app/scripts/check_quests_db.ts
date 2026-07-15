import { prisma } from '../src/lib/prisma';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('--- DAFTAR QUEST DI DATABASE ---');
  const quests = await prisma.questLibrary.findMany();
  for (const q of quests) {
    console.log(`ID: ${q.id}`);
    console.log(`Judul: ${q.title}`);
    console.log(`Kategori: ${q.category}`);
    console.log(`Video URL: ${q.videoUrl}`);
    console.log(`Require Video File: ${q.requireVideo}`);
    console.log('---------------------------------');
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
