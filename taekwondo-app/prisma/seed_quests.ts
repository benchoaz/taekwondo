import { QuestCategory } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Seeding Daily Quests...');

  // 1. Fitness Quests
  await prisma.questLibrary.create({
    data: {
      title: 'Frog Jumps 15x',
      description: 'Lakukan lompat katak sebanyak 15 kali tanpa istirahat.',
      category: QuestCategory.FITNESS,
      baseXp: 50,
      requirements: {
        create: {
          minAge: 7,
          maxAge: 9,
        }
      }
    }
  });

  await prisma.questLibrary.create({
    data: {
      title: 'Squat Jumps 30x',
      description: 'Lakukan squat jumps secara beruntun. Tarik napas saat turun, hembuskan saat melompat.',
      category: QuestCategory.FITNESS,
      baseXp: 100,
      requirements: {
        create: {
          minAge: 16,
          maxAge: 18,
        }
      }
    }
  });

  // 2. Technical Quests
  await prisma.questLibrary.create({
    data: {
      title: 'Pukulan Momtong Jireugi 20x',
      description: 'Dari posisi Kuda-kuda Juchum Seogi, lakukan pukulan ke arah dada 20 kali.',
      category: QuestCategory.TECHNICAL,
      baseXp: 60,
      requirements: {
        create: {
          minAge: 7,
          maxAge: 9,
        }
      }
    }
  });

  await prisma.questLibrary.create({
    data: {
      title: 'Shadow Kicking: Dollyo Chagi 50x',
      description: 'Bayangkan lawan di depanmu, lakukan tendangan Dollyo Chagi 25x kaki kiri dan 25x kaki kanan.',
      category: QuestCategory.TECHNICAL,
      baseXp: 120,
      requirements: {
        create: {
          minAge: 16,
          maxAge: 18,
        }
      }
    }
  });

  // 3. Discipline Quests
  await prisma.questLibrary.create({
    data: {
      title: 'Melipat Baju Dobok',
      description: 'Lipat baju latihan Taekwondomu sendiri dengan rapi setelah selesai berlatih.',
      category: QuestCategory.DISCIPLINE,
      baseXp: 30,
      requirements: {
        create: {
          minAge: 7,
          maxAge: 9,
        }
      }
    }
  });

  await prisma.questLibrary.create({
    data: {
      title: 'Meditasi 3 Menit',
      description: 'Duduk bersila, tutup matamu, dan atur napas selama 3 menit tanpa gangguan.',
      category: QuestCategory.DISCIPLINE,
      baseXp: 50,
      requirements: {
        create: {
          minAge: 13,
          maxAge: 18,
        }
      }
    }
  });

  // 4. General Quests (All Ages)
  await prisma.questLibrary.create({
    data: {
      title: 'Jumping Jacks 30x',
      description: 'Lakukan gerakan Jumping Jacks 30x untuk melatih kardio.',
      category: QuestCategory.FITNESS,
      baseXp: 40,
      requirements: {
        create: {
          minAge: 7,
          maxAge: 99,
        }
      }
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
