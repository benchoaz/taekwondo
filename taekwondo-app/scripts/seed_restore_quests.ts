import { prisma } from '../src/lib/prisma';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('--- RESTORING USER QUESTS TO DATABASE ---');

  const questsToRestore = [
    {
      title: 'Nonton: Pentingnya Pemanasan Sendi',
      description: 'Tonton video edukasi pentingnya melakukan pemanasan sendi secara benar sebelum memulai latihan taekwondo.',
      category: 'FITNESS' as const,
      baseXp: 20,
      videoUrl: 'https://www.youtube.com/watch?v=68Tj9gWekN4',
      requireVideo: false,
    },
    {
      title: 'Video: Teknik Poomsae Taegeuk 1 (Remaja/Dewasa)',
      description: 'Pelajari gerakan dasar Poomsae Taegeuk 1 untuk tingkatan sabuk kuning.',
      category: 'TECHNICAL' as const,
      baseXp: 60,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      requireVideo: false,
    },
    {
      title: 'Konsistensi Dojang (Check-in Harian)',
      description: 'Lakukan check-in kehadiran latihan harian di dojang untuk menjaga konsistensi disiplin taekwondo.',
      category: 'DISCIPLINE' as const,
      baseXp: 15,
      videoUrl: '',
      requireVideo: false,
    },
    {
      title: 'Nonton: Tata Cara Hormat di Dojang',
      description: 'Tonton video edukasi etika penghormatan (Kyongye) yang benar saat memasuki dan meninggalkan tempat latihan.',
      category: 'THEORY' as const,
      baseXp: 20,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      requireVideo: false,
    }
  ];

  for (const q of questsToRestore) {
    // Cari apakah quest sudah ada, jika belum buat baru
    const existing = await prisma.questLibrary.findFirst({
      where: { title: q.title }
    });

    if (!existing) {
      const created = await prisma.questLibrary.create({
        data: q
      });
      console.log(`Created quest: ${created.title}`);
    } else {
      const updated = await prisma.questLibrary.update({
        where: { id: existing.id },
        data: q
      });
      console.log(`Updated quest: ${updated.title}`);
    }
  }

  console.log('--- RESTORE SUCCESSFUL ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
