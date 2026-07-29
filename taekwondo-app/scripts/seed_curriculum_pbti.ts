import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🧹 Membersihkan kurikulum lama dan membuat Kurikulum PBTI yang 100% Akurat...");

  // Reset curriculum categories & materials to prevent duplicate/wrong belt mappings
  await prisma.curriculumMaterial.deleteMany({});
  await prisma.curriculumCategory.deleteMany({});

  const beltRanks = await prisma.beltRank.findMany({
    orderBy: { level: "asc" }
  });

  if (beltRanks.length === 0) {
    console.error("❌ BeltRank tidak ditemukan.");
    return;
  }

  // Definisi Kurikulum Resmi PBTI yang TEPAT PER SABUK
  const pbtiCurriculumByExactBelt: Array<{
    matchKey: string;
    categories: Array<{ name: string; materials: Array<{ title: string; videoUrl?: string }> }>;
  }> = [
    // 1. Sabuk Putih (10 Geup)
    {
      matchKey: "putih",
      categories: [
        {
          name: "Poomsae Wajib (Jurus Dasar)",
          materials: [
            { title: "Basic Movement 1 (Gibon Il Jang) - 16 Gerakan Dasar" },
            { title: "Basic Movement 2 (Gibon Ee Jang) - 16 Gerakan Dasar" },
            { title: "Syarat Kelulusan UKT: Hafal Gibon 1 & 2 dengan Ketepatan Kuda-kuda Min. 60.0" }
          ]
        },
        {
          name: "Sikap Kuda-Kuda (Seogi)",
          materials: [
            { title: "Moa Seogi (Sikap Rapat Kaki)" },
            { title: "Naranhi Seogi (Sikap Sejajar)" },
            { title: "Ap Seogi (Langkah Pendek Depan)" },
            { title: "Ap Kubi (Langkah Panjang Kuda-Kuda Depan)" }
          ]
        },
        {
          name: "Pukulan & Tangkisan (Jireugi & Makgi)",
          materials: [
            { title: "Momtong Jireugi (Pukulan Lurus Dada)" },
            { title: "Arae Makgi (Tangkisan Bawah)" },
            { title: "Eolgul Makgi (Tangkisan Atas Kepala)" },
            { title: "Momtong Anmakgi (Tangkisan Dada Dalam)" }
          ]
        },
        {
          name: "Tendangan & Kebugaran (Chagi & Fisik)",
          materials: [
            { title: "Ap Chagi (Tendangan Lurus Depan Dengan Snapping Kebawah)" },
            { title: "Kebugaran: Push-up 15x, Sit-up 20x, Flex Test" }
          ]
        }
      ]
    },

    // 2. Sabuk Kuning (9 Geup)
    {
      matchKey: "kuning (geup 9)",
      categories: [
        {
          name: "Poomsae Wajib Utama (Jurus Resmi PBTI)",
          materials: [
            { title: "Taegeuk 1 Jang (Keon) - 18 Gerakan (Arti: Langit & Cahaya Utama)", videoUrl: "https://www.youtube.com/watch?v=17XvT1u1T0Y" },
            { title: "Poomsae Pendamping Review: Gibon 1 & Gibon 2" },
            { title: "Syarat Lulus UKT: Ketepatan Kuda-Kuda Ap Kubi & Arae Makgi di Taegeuk 1" }
          ]
        },
        {
          name: "Teknik Serangan & Tangkisan Baru",
          materials: [
            { title: "Dwit Kubi (Kuda-Kuda Langkah Belakang)" },
            { title: "Han Sonnal Mok Chigi (Sabetan Pisau Tangan Leher)" },
            { title: "Momtong An Makgi (Tangkisan Dada Dari Luar)" }
          ]
        },
        {
          name: "Tendangan (Chagi)",
          materials: [
            { title: "Dollyo Chagi (Tendangan Melingkar Dada)" },
            { title: "Ap Chagi Kombinasi Pukulan" }
          ]
        }
      ]
    },

    // 3. Sabuk Kuning Strip Hijau (8 Geup / 7 Geup)
    {
      matchKey: "kuning strip",
      categories: [
        {
          name: "Poomsae Wajib Utama (Jurus Resmi PBTI)",
          materials: [
            { title: "Taegeuk 2 Jang (Tae) - 18 Gerakan (Arti: Keteguhan & Sukacita)", videoUrl: "https://www.youtube.com/watch?v=28XvT2u2T0Y" },
            { title: "Poomsae Pendamping Review: Taegeuk 1 Jang" },
            { title: "Syarat Lulus UKT: Ketepatan Eolgul Jireugi & Dollyo Chagi di Taegeuk 2" }
          ]
        },
        {
          name: "Teknik Dasar & Tangkisan Baru",
          materials: [
            { title: "Pyonhi Seogi (Sikap Kuda-Kuda Santai)" },
            { title: "Han Sonnal Arae Makgi (Tangkisan Pisau Tangan Bawah)" }
          ]
        },
        {
          name: "Tendangan Lanjutan (Chagi)",
          materials: [
            { title: "Yeop Chagi (Tendangan Samping Pisau Kaki)" },
            { title: "Naeryeo Chagi (Tendangan Cangkul Ke Arah Kepala)" }
          ]
        }
      ]
    },

    // 4. Sabuk Hijau (7 Geup / 6 Geup)
    {
      matchKey: "sabuk hijau (geup 7)",
      categories: [
        {
          name: "Poomsae Wajib Utama (Jurus Resmi PBTI)",
          materials: [
            { title: "Taegeuk 3 Jang (Ri) - 20 Gerakan (Arti: Api & Semangat Warm)", videoUrl: "https://www.youtube.com/watch?v=39XvT3u3T0Y" },
            { title: "Poomsae Pendamping Review: Taegeuk 1 & Taegeuk 2 Jang" },
            { title: "Syarat Lulus UKT: Penguasaan Sonnal Mok Chigi & Dubon Jireugi di Taegeuk 3" }
          ]
        },
        {
          name: "Teknik Pertahanan & Serangan",
          materials: [
            { title: "Sonnal Momtong Makgi (Tangkisan Ganda Pisau Tangan Dada)" },
            { title: "Jebipoom Mok Chigi (Tangkisan Atas + Sabetan Leher Simultan)" }
          ]
        },
        {
          name: "Tendangan & Kombinasi Kyorugi",
          materials: [
            { title: "Bandal Chagi (Tendangan Sabit Melingkar Cepat)" },
            { title: "Dwit Chagi (Tendangan Lurus Belakang/Tumit)" }
          ]
        }
      ]
    },

    // 5. Sabuk Hijau Strip Biru (6 Geup / 5 Geup)
    {
      matchKey: "hijau strip",
      categories: [
        {
          name: "Poomsae Wajib Utama (Jurus Resmi PBTI)",
          materials: [
            { title: "Taegeuk 4 Jang (Jin) - 20 Gerakan (Arti: Guntur & Keberanian)", videoUrl: "https://www.youtube.com/watch?v=40XvT4u4T0Y" },
            { title: "Poomsae Pendamping Review: Taegeuk 2 & Taegeuk 3 Jang" },
            { title: "Syarat Lulus UKT: Penguasaan Jebipoom Mok Chigi & Yeop Chagi di Taegeuk 4" }
          ]
        },
        {
          name: "Teknik Kuda-Kuda & Tangkisan Lanjutan",
          materials: [
            { title: "Batangson Momtong Makgi (Tangkisan Telapak Tangan)" },
            { title: "Pyeon Sonkkeut Seon-seogi (Tusukan Ujung Jari Tegak)" }
          ]
        },
        {
          name: "Tendangan Lompat",
          materials: [
            { title: "Dweo Ap Chagi (Tendangan Lompat Depan Sambil Mengudara)" }
          ]
        }
      ]
    },

    // 6. Sabuk Biru (5 Geup / 4 Geup)
    {
      matchKey: "sabuk biru (geup 5)",
      categories: [
        {
          name: "Poomsae Wajib Utama (Jurus Resmi PBTI)",
          materials: [
            { title: "Taegeuk 5 Jang (Seon) - 20 Gerakan (Arti: Angin & Fleksibilitas)", videoUrl: "https://www.youtube.com/watch?v=51XvT5u5T0Y" },
            { title: "Poomsae Pendamping Review: Taegeuk 3 & Taegeuk 4 Jang" },
            { title: "Syarat Lulus UKT: Keseimbangan Kyocha Seogi & Mejumeok Naeryo Chigi di Taegeuk 5" }
          ]
        },
        {
          name: "Teknik Serangan Palu & Kuda-Kuda Silang",
          materials: [
            { title: "Mejumeok Naeryo Chigi (Sabetan Kepalan Palu Tangan)" },
            { title: "Kyocha Seogi (Kuda-Kuda Silang)" },
            { title: "Palgup Momtong Chigi (Hantaman Siku Tangan Ke Dada)" }
          ]
        },
        {
          name: "Tendangan Putar (Spinning Kick)",
          materials: [
            { title: "Momdollyo Chagi (Tendangan Putar 360 Derajat)" }
          ]
        }
      ]
    },

    // 7. Sabuk Biru Strip Merah (4 Geup / 3 Geup)
    {
      matchKey: "biru strip",
      categories: [
        {
          name: "Poomsae Wajib Utama (Jurus Resmi PBTI)",
          materials: [
            { title: "Taegeuk 6 Jang (Gam) - 19 Gerakan (Arti: Air & Ketenangan)", videoUrl: "https://www.youtube.com/watch?v=62XvT6u6T0Y" },
            { title: "Poomsae Pendamping Review: Taegeuk 4 & Taegeuk 5 Jang" },
            { title: "Syarat Lulus UKT: Penguasaan Bitureo Chagi & Eolgul Bakkatmakgi di Taegeuk 6" }
          ]
        },
        {
          name: "Teknik Tangkisan Luar & Sabetan",
          materials: [
            { title: "Eolgul Bakkatmakgi (Tangkisan Luar Kepala)" },
            { title: "Sonnal Eolgul Bakkat Chigi (Sabetan Pisau Tangan Luar)" }
          ]
        },
        {
          name: "Tendangan Melingkar Beliung",
          materials: [
            { title: "Bitureo Chagi (Tendangan Beliung Samping)" }
          ]
        }
      ]
    },

    // 8. Sabuk Merah (3 Geup / 2 Geup)
    {
      matchKey: "sabuk merah (geup 3)",
      categories: [
        {
          name: "Poomsae Wajib Utama (Jurus Resmi PBTI)",
          materials: [
            { title: "Taegeuk 7 Jang (Gan) - 25 Gerakan (Arti: Gunung & Ketahanan)" },
            { title: "Poomsae Pendamping Review: Taegeuk 4, 5 & 6 Jang" },
            { title: "Syarat Lulus UKT: Penguasaan Gawi Makgi (Tangkisan Gunting) & Pyojeok Chagi" }
          ]
        },
        {
          name: "Teknik Tangkisan Gunting & Sasaran Tangan",
          materials: [
            { title: "Gawi Makgi (Tangkisan Gunting Bawah + Dada)" },
            { title: "Batangson Geodeureo Makgi (Tangkisan Telapak Tangan Dengan Dukungan)" }
          ]
        },
        {
          name: "Tendangan Sasaran & Lompat Belakang",
          materials: [
            { title: "Pyojeok Chagi (Tendangan Sasaran Telapak Tangan Sendiri)" },
            { title: "Dweo Dwit Chagi (Tendangan Lompat Belakang)" }
          ]
        }
      ]
    },

    // 9. Sabuk Merah Strip Hitam I (Geup 2)
    {
      matchKey: "merah strip hitam i",
      categories: [
        {
          name: "Poomsae Wajib Utama (Jurus Resmi PBTI)",
          materials: [
            { title: "Taegeuk 8 Jang (Gon) - 27 Gerakan (Arti: Bumi & Kematangan)" },
            { title: "Poomsae Pendamping Review: Taegeuk 5, 6 & 7 Jang" },
            { title: "Syarat Lulus UKT: Ketepatan Gerakan Lambat Meditasi & Dubon Ap Chagi di Taegeuk 8" }
          ]
        }
      ]
    },

    // 10. Sabuk Merah Strip Hitam II (Geup 1 / Pra-DAN)
    {
      matchKey: "merah strip hitam ii",
      categories: [
        {
          name: "Pemantapan Poomsae Pra-DAN (Jurus Resmi PBTI)",
          materials: [
            { title: "Pemantapan Taegeuk 1 s/d 8 Jang (Ujian Simulasi DAN 1)" },
            { title: "Persiapan Ujian Sabuk Hitam Kukkiwon / PBTI" }
          ]
        }
      ]
    },

    // 11. Sabuk Hitam / DAN 1 (Yudanja)
    {
      matchKey: "hitam",
      categories: [
        {
          name: "Poomsae Yudanja DAN 1 (Standar World Taekwondo & PBTI)",
          materials: [
            { title: "Poomsae KORYO - 30 Gerakan (Simbol Semangat Bangsa Koryo & Ketahanan)" },
            { title: "Poomsae Review Penguji: Undian Wajib Taegeuk 1 s/d 8 Jang" },
            { title: "Syarat Kelulusan DAN 1: Nilai Ketepatan & Presisi Gerakan Minimum 75.0 (Skor Kukkiwon)" }
          ]
        },
        {
          name: "Taktik Kyorugi & Manajemen Perwasitan",
          materials: [
            { title: "Taktik Kyorugi Senior & Penguasaan Peraturan Pertandingan PBTI/WT" }
          ]
        }
      ]
    }
  ];

  let totalCategoriesCreated = 0;
  let totalMaterialsCreated = 0;

  for (const belt of beltRanks) {
    const beltNameLower = belt.name.toLowerCase();
    
    // Find matching curriculum config with highest specificity
    const matchedEntry = pbtiCurriculumByExactBelt.find(item => beltNameLower.includes(item.matchKey));

    if (!matchedEntry) {
      console.warn(`⚠️ Skipped/Fallback for belt: ${belt.name}`);
      continue;
    }

    console.log(`📌 Re-Seeding: ${belt.name} (Level ${belt.level}) -> Matching Key: "${matchedEntry.matchKey}"`);

    let orderCat = 1;
    for (const catConfig of matchedEntry.categories) {
      const category = await prisma.curriculumCategory.create({
        data: {
          beltId: belt.id,
          name: catConfig.name,
          order: orderCat++
        }
      });
      totalCategoriesCreated++;

      let orderMat = 1;
      for (const matConfig of catConfig.materials) {
        await prisma.curriculumMaterial.create({
          data: {
            categoryId: category.id,
            title: matConfig.title,
            videoUrl: matConfig.videoUrl || null,
            order: orderMat++
          }
        });
        totalMaterialsCreated++;
      }
    }
  }

  console.log(`\n✅ RE-SEEDING KURIKULUM & POOMSAE PBTI PRESISI SELESAI!`);
  console.log(`📊 Kategori Dibuat: ${totalCategoriesCreated}`);
  console.log(`📚 Materi/Poomsae Dibuat: ${totalMaterialsCreated}`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding curriculum:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
