import { QuestCategory } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🧹 Clearing old Quest data...');
  await prisma.questLibrary.deleteMany();
  console.log('✅ Quest database tables cleared.');

  console.log('🥋 Seeding Expert-Designed Daily Quests...');

  // Get all belts in database to map dynamic IDs
  const dbBelts = await prisma.beltRank.findMany();
  const getBeltId = (keyword: string) => {
    const match = dbBelts.find(b => b.name.toLowerCase().includes(keyword.toLowerCase()));
    return match ? match.id : null;
  };

  const putihId = getBeltId('putih');
  const kuningId = getBeltId('kuning');
  const hijauId = getBeltId('hijau');
  const biruId = getBeltId('biru');
  const merahId = getBeltId('merah');
  const hitamId = getBeltId('hitam');

  const allBeltIds = dbBelts.map(b => b.id);

  // Helper for fast quest insertion
  const createQuest = async (payload: {
    title: string;
    description: string;
    category: QuestCategory;
    baseXp: number;
    requireVideo?: boolean;
    videoUrl?: string;
    minAge: number;
    maxAge: number;
    allowedBeltIds: string[];
  }) => {
    await prisma.questLibrary.create({
      data: {
        title: payload.title,
        description: payload.description,
        category: payload.category,
        baseXp: payload.baseXp,
        requireVideo: payload.requireVideo ?? false,
        videoUrl: payload.videoUrl || null,
        requirements: {
          create: {
            minAge: payload.minAge,
            maxAge: payload.maxAge,
            allowedBeltIds: payload.allowedBeltIds,
          }
        }
      }
    });
  };

  // ==========================================
  // 1. FITNESS CATEGORY (Fisik & Stamina)
  // ==========================================

  // Lompat Katak Ceria (Ages 4-6, White & Yellow)
  // Pediatrician Approved: Dynamic bone & growth plate stimulation through light jumps.
  await createQuest({
    title: 'Lompat Katak Ceria 10x',
    description: 'Lakukan lompat katak sebanyak 10 kali secara ceria. Jaga lutut agar tetap nyaman dan lentur!',
    category: QuestCategory.FITNESS,
    baseXp: 40,
    minAge: 4,
    maxAge: 6,
    allowedBeltIds: [putihId, kuningId].filter(Boolean) as string[],
  });

  // Jumping Jacks Stamina (Ages 7-12, All Belts)
  // Fitness Trainer Approved: Cardio conditioning and motor coordination.
  await createQuest({
    title: 'Jumping Jacks Stamina 30x',
    description: 'Lakukan gerakan Jumping Jacks sebanyak 30 kali secara konsisten tanpa berhenti untuk melatih ketahanan napas.',
    category: QuestCategory.FITNESS,
    baseXp: 50,
    minAge: 7,
    maxAge: 12,
    allowedBeltIds: allBeltIds,
  });

  // Plank Core Stability (Ages 13-18, All Belts)
  // Taekwondo Master Approved: Core strength essential for balance during high-level kicks.
  await createQuest({
    title: 'Plank Core Strength (45 Detik)',
    description: 'Tahan posisi Plank dengan perut dikencangkan dan punggung rata selama 45 detik. Rekam pose Anda dari samping.',
    category: QuestCategory.FITNESS,
    baseXp: 65,
    requireVideo: true,
    videoUrl: 'https://www.youtube.com/watch?v=pvIjsGMCwZY',
    minAge: 13,
    maxAge: 18,
    allowedBeltIds: allBeltIds,
  });

  // ==========================================
  // 2. TECHNICAL CATEGORY (Teknik Taekwondo)
  // ==========================================

  // Kuda-Kuda Kokoh / Juchum Seogi (Ages 4-9, White to Green)
  // Psychologist Approved: Focus and patience training.
  await createQuest({
    title: 'Kuda-Kuda Kokoh Juchum Seogi (20s)',
    description: 'Buka kaki selebar dua bahu, tekuk lutut seperti menunggang kuda. Tahan posisi ini selama 20 detik secara tegak.',
    category: QuestCategory.TECHNICAL,
    baseXp: 45,
    requireVideo: true,
    videoUrl: 'https://www.youtube.com/watch?v=FqI_wD4_L1c',
    minAge: 4,
    maxAge: 9,
    allowedBeltIds: [putihId, kuningId, hijauId].filter(Boolean) as string[],
  });

  // Momtong Jireugi Punch (Ages 7-12, White & Yellow)
  // Punch alignment and Kihap (shout) execution.
  await createQuest({
    title: 'Momtong Jireugi Speed Test 30x',
    description: 'Lakukan pukulan tengah ke arah dada sebanyak 30 kali cepat dengan suara Kihap (teriakan) yang keras setiap pukulan.',
    category: QuestCategory.TECHNICAL,
    baseXp: 55,
    minAge: 7,
    maxAge: 12,
    allowedBeltIds: [putihId, kuningId].filter(Boolean) as string[],
  });

  // Dollyo Chagi Kick Challenge (Ages 10-18, Green to Red)
  // Turning kick rotation and hand guard control.
  await createQuest({
    title: 'Tendangan Dollyo Chagi (15x Kiri & Kanan)',
    description: 'Lakukan tendangan Dollyo Chagi (tendangan melingkar) sebanyak 15 kali dengan kaki kiri dan 15 kali kaki kanan. Pastikan pinggang memutar.',
    category: QuestCategory.TECHNICAL,
    baseXp: 80,
    requireVideo: true,
    videoUrl: 'https://www.youtube.com/watch?v=kYJ40-Q-m5Y',
    minAge: 10,
    maxAge: 18,
    allowedBeltIds: [hijauId, biruId, merahId].filter(Boolean) as string[],
  });

  // Double Kicking combo (Ages 13-18, Blue to Black)
  // High-intensity combination.
  await createQuest({
    title: 'Kombinasi Double Kick (Dollyo + Yeop)',
    description: 'Lakukan tendangan Dollyo Chagi dilanjutkan langsung Yeop Chagi tanpa menurunkan kaki ke lantai terlebih dahulu. Lakukan 10 set.',
    category: QuestCategory.TECHNICAL,
    baseXp: 100,
    requireVideo: true,
    videoUrl: 'https://www.youtube.com/watch?v=YeopChagiTutorial',
    minAge: 13,
    maxAge: 18,
    allowedBeltIds: [biruId, merahId, hitamId].filter(Boolean) as string[],
  });

  // ==========================================
  // 3. DISCIPLINE CATEGORY (Disiplin, Teori, Etika)
  // ==========================================

  // Lipat Baju Latihan / Dobok (Ages 4-8, White & Yellow)
  // Child Psychologist Approved: Build self-reliance and neatness from early childhood.
  await createQuest({
    title: 'Merapikan Dobok & Sabuk Mandiri',
    description: 'Lipat baju latihan Taekwondo (Dobok) dan ikat sabukmu sendiri secara rapi sehabis latihan selesai tanpa bantuan orang tua.',
    category: QuestCategory.DISCIPLINE,
    baseXp: 30,
    minAge: 4,
    maxAge: 8,
    allowedBeltIds: [putihId, kuningId].filter(Boolean) as string[],
  });

  // Meditasi Jwasun (Ages 9-18, All Belts)
  // Mental focus and emotion regulation.
  await createQuest({
    title: 'Mental Focus: Meditasi Jwasun (3 Menit)',
    description: 'Duduk bersila dengan punggung tegak, pejamkan mata, dan atur napas masuk-keluar secara tenang selama 3 menit penuh.',
    category: QuestCategory.DISCIPLINE,
    baseXp: 45,
    minAge: 9,
    maxAge: 18,
    allowedBeltIds: allBeltIds,
  });

  // Kuis Korea (Ages 7-18, White to Green)
  // Korean terminology theory.
  await createQuest({
    title: 'Kuis Istilah Pukulan & Tangkisan',
    description: 'Apa bahasa Korea untuk "Pukulan Tengah" dan "Tangkisan Bawah"? Tuliskan jawabannya di kolom catatan pengerjaan.',
    category: QuestCategory.THEORY,
    baseXp: 40,
    minAge: 7,
    maxAge: 18,
    allowedBeltIds: [putihId, kuningId, hijauId].filter(Boolean) as string[],
  });

  // Analisis Poomsae (Ages 12-18, Green to Black)
  // Analytical poomsae view.
  await createQuest({
    title: 'Analisis Poomsae Taegeuk 1 Jang',
    description: 'Tonton video Poomsae Taegeuk 1 Jang. Perhatikan dan jelaskan arah pandangan mata saat melakukan putaran balik pertama.',
    category: QuestCategory.THEORY,
    baseXp: 50,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    minAge: 12,
    maxAge: 18,
    allowedBeltIds: [hijauId, biruId, merahId, hitamId].filter(Boolean) as string[],
  });

  // Etika & Kepemimpinan (Ages 13-18, Black Belt Only)
  // Leadership & Character.
  await createQuest({
    title: 'Refleksi Etika Sabuk Hitam',
    description: 'Tuliskan 3 sikap utama yang harus Anda tunjukkan ketika ditugaskan melatih atau membantu adik-adik sabuk putih di dojang.',
    category: QuestCategory.DISCIPLINE,
    baseXp: 75,
    minAge: 13,
    maxAge: 18,
    allowedBeltIds: [hitamId].filter(Boolean) as string[],
  });

  // Misi Membaca: Janji Taekwondo Indonesia (Ages 6-18, All Belts)
  // Child Psychologist & Senior Master Approved: Character building & national pledge.
  await createQuest({
    title: 'Membaca Janji Taekwondo Indonesia',
    description: 'Bacalah dan pahami 5 butir Janji Taekwondo Indonesia. Tuliskan butir ke-2 ("Menghormati orang tua, pelatih, senior, dan sesama taekwondoin") pada kolom catatan pengerjaan sebagai bukti Anda telah membaca dan memahaminya.',
    category: QuestCategory.THEORY,
    baseXp: 45,
    minAge: 6,
    maxAge: 18,
    allowedBeltIds: allBeltIds,
  });

  console.log('✅ Expert-Designed Daily Quests Seeding Completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
