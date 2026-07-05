import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🥋 Memulai proses seeding Kurikulum Taekwondo oleh Sabeum Nim (Dan 9)...');

  // Struktur Kurikulum Lengkap Taekwondo
  const curriculumData = [
    {
      beltName: 'Sabuk Putih (10 Geup)',
      categories: [
        {
          name: 'Kuda-kuda Dasar (Seogi)',
          materials: [
            { title: 'Charyot Seogi (Sikap Siap)', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
            { title: 'Moa Seogi (Kuda-kuda Tertutup)', videoUrl: '' },
            { title: 'Juchum Seogi (Kuda-kuda Menunggang Kuda)', videoUrl: '' },
          ]
        },
        {
          name: 'Pukulan & Tangkisan (Jireugi & Makki)',
          materials: [
            { title: 'Momtong Jireugi (Pukulan Tengah)', videoUrl: '' },
            { title: 'Arae Makki (Tangkisan Bawah)', videoUrl: '' },
            { title: 'Momtong An Makki (Tangkisan Tengah)', videoUrl: '' },
          ]
        },
        {
          name: 'Tendangan Dasar (Chagi)',
          materials: [
            { title: 'Ap Chagi (Tendangan Depan)', videoUrl: '' },
            { title: 'Dollyo Chagi (Tendangan Melingkar)', videoUrl: '' },
          ]
        }
      ]
    },
    {
      beltName: 'Sabuk Kuning (Geup 9)',
      categories: [
        {
          name: 'Poomsae (Jurus)',
          materials: [
            { title: 'Taegeuk Il Jang (Jurus 1)', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
          ]
        },
        {
          name: 'Tendangan Lanjutan (Chagi)',
          materials: [
            { title: 'Yeop Chagi (Tendangan Samping)', videoUrl: '' },
            { title: 'Naeryo Chagi (Tendangan Kapak)', videoUrl: '' },
          ]
        },
        {
          name: 'Fisik Dasar',
          materials: [
            { title: 'Push Up Pengepalan', videoUrl: '' },
            { title: 'Ketahanan Kuda-kuda (Plank Kuda-kuda)', videoUrl: '' },
          ]
        }
      ]
    },
    {
      beltName: 'Sabuk Hijau (7 Geup)',
      categories: [
        {
          name: 'Poomsae (Jurus)',
          materials: [
            { title: 'Taegeuk Sam Jang (Jurus 3)', videoUrl: '' },
          ]
        },
        {
          name: 'Teknik Tarung (Kyorugi)',
          materials: [
            { title: 'Step Maju Mundur (Stepping)', videoUrl: '' },
            { title: 'Counter Dollyo Chagi', videoUrl: '' },
          ]
        }
      ]
    },
    {
      beltName: 'Sabuk Biru (5 Geup)',
      categories: [
        {
          name: 'Poomsae (Jurus)',
          materials: [
            { title: 'Taegeuk Oh Jang (Jurus 5)', videoUrl: '' },
          ]
        },
        {
          name: 'Tendangan Berputar (Turn Chagi)',
          materials: [
            { title: 'Dwi Chagi (Tendangan Belakang)', videoUrl: '' },
            { title: 'Momo Dollyo Chagi (Tendangan Tornado)', videoUrl: '' },
          ]
        }
      ]
    },
    {
      beltName: 'Sabuk Merah (3 Geup)',
      categories: [
        {
          name: 'Poomsae (Jurus)',
          materials: [
            { title: 'Taegeuk Chil Jang (Jurus 7)', videoUrl: '' },
          ]
        },
        {
          name: 'Teknik Pecah Papan (Kyokpa)',
          materials: [
            { title: 'Pecah Papan dengan Dwi Hurigi', videoUrl: '' },
          ]
        }
      ]
    },
    {
      beltName: 'Sabuk Hitam (1 Dan)',
      categories: [
        {
          name: 'Poomsae Tingkat Tinggi',
          materials: [
            { title: 'Koryo Poomsae', videoUrl: '' },
          ]
        },
        {
          name: 'Kepemimpinan & Filosofi',
          materials: [
            { title: 'Sikap Seorang Sabuk Hitam', videoUrl: '' },
            { title: 'Cara Melatih Sabuk Putih', videoUrl: '' },
          ]
        }
      ]
    }
  ];

  for (const beltData of curriculumData) {
    // 1. Cari Sabuk di Database
    const belt = await prisma.beltRank.findUnique({
      where: { name: beltData.beltName }
    });

    if (!belt) {
      console.log(`⚠️ Sabuk ${beltData.beltName} tidak ditemukan di database. Melewati...`);
      continue;
    }

    console.log(`\nMenyusun kurikulum untuk ${beltData.beltName}...`);

    let categoryOrder = 0;
    for (const cat of beltData.categories) {
      // 2. Buat Kategori
      const category = await prisma.curriculumCategory.create({
        data: {
          beltId: belt.id,
          name: cat.name,
          order: categoryOrder++
        }
      });
      console.log(`  └─ Kategori ditambahkan: ${cat.name}`);

      let materialOrder = 0;
      for (const mat of cat.materials) {
        // 3. Buat Materi
        await prisma.curriculumMaterial.create({
          data: {
            categoryId: category.id,
            title: mat.title,
            videoUrl: mat.videoUrl,
            order: materialOrder++
          }
        });
        console.log(`      └─ Materi: ${mat.title}`);
      }
    }
  }

  console.log('\n✅ Proses seeding Kurikulum Taekwondo Selesai! Murid-murid siap berlatih!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
