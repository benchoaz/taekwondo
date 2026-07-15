import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🥋 Memulai proses perluasan Kurikulum Taekwondo Tahap 2...");

  // 1. Bersihkan materi & kategori kurikulum yang lama agar bersih (tidak duplikat)
  await prisma.curriculumMaterial.deleteMany({});
  await prisma.curriculumCategory.deleteMany({});
  console.log("🧹 Data kurikulum lama berhasil dibersihkan.");

  // 2. Data Kurikulum Lengkap per Sabuk x Kelompok Umur
  const curriculumData = [
    // ----------------------------------------------------
    // SABUK PUTIH (10 GEUP)
    // ----------------------------------------------------
    {
      beltName: "Sabuk Putih (10 Geup)",
      categories: [
        {
          name: "Kuda-kuda Dasar (Anak-anak 6-11)",
          materials: [
            { title: "Charyot Seogi (Sikap Siap Hormat)", videoUrl: "/api/files/videos/white_kids_stance.mp4" },
            { title: "Ap Seogi (Kuda-kuda Berjalan)", videoUrl: "/api/files/videos/white_kids_walk.mp4" },
            { title: "Juchum Seogi (Kuda-kuda Menunggang Kuda)", videoUrl: "" }
          ]
        },
        {
          name: "Dasar Kuda-kuda & Poomsae (Remaja/Dewasa 12+)",
          materials: [
            { title: "Ap Koobi (Kuda-kuda Panjang)", videoUrl: "/api/files/videos/white_adult_taegeuk1.mp4" },
            { title: "Langkah Awal Poomsae Taegeuk Il Jang", videoUrl: "/api/files/videos/white_adult_taegeuk1.mp4" }
          ]
        },
        {
          name: "Pukulan & Tangkisan (Umum)",
          materials: [
            { title: "Momtong Jireugi (Pukulan Tengah)", videoUrl: "" },
            { title: "Arae Makki (Tangkisan Bawah)", videoUrl: "" }
          ]
        }
      ]
    },
    // ----------------------------------------------------
    // SABUK KUNING (9 GEUP)
    // ----------------------------------------------------
    {
      beltName: "Sabuk Kuning (9 Geup)",
      categories: [
        {
          name: "Tendangan Ap Chagi (Anak-anak 6-11)",
          materials: [
            { title: "Ap Chagi Keseimbangan Dasar", videoUrl: "/api/files/videos/yellow_kids_apchagi.mp4" },
            { title: "Ap Chagi dengan Target Petting", videoUrl: "" }
          ]
        },
        {
          name: "Tendangan Ap Chagi & Kyorugi Step (Remaja/Dewasa 12+)",
          materials: [
            { title: "Ap Chagi Melecut & Menarik Kaki", videoUrl: "/api/files/videos/yellow_adult_apchagi.mp4" },
            { title: "Stepping Bayangan Satu-Dua", videoUrl: "" }
          ]
        },
        {
          name: "Poomsae (Umum)",
          materials: [
            { title: "Poomsae Taegeuk Il Jang (Full Mulus)", videoUrl: "/api/files/videos/yellow_taegeuk1.mp4" }
          ]
        }
      ]
    },
    // ----------------------------------------------------
    // SABUK KUNING STRIP HIJAU (8 GEUP)
    // ----------------------------------------------------
    {
      beltName: "Sabuk Kuning Strip Hijau (8 Geup)",
      categories: [
        {
          name: "Poomsae Taegeuk 2 (Anak-anak 6-11)",
          materials: [
            { title: "Pengenalan Jurus Taegeuk Ee Jang", videoUrl: "" },
            { title: "Kombinasi Tangkisan Atas & Pukulan", videoUrl: "" }
          ]
        },
        {
          name: "Poomsae Taegeuk 2 (Remaja/Dewasa 12+)",
          materials: [
            { title: "Poomsae Taegeuk Ee Jang (Presisi Tinggi)", videoUrl: "" }
          ]
        },
        {
          name: "Materi Tendangan Lanjutan",
          materials: [
            { title: "Dollyo Chagi (Tendangan Melingkar)", videoUrl: "" },
            { title: "Yeop Chagi Dasar (Samping)", videoUrl: "" }
          ]
        }
      ]
    },
    // ----------------------------------------------------
    // SABUK HIJAU (7 GEUP)
    // ----------------------------------------------------
    {
      beltName: "Sabuk Hijau (7 Geup)",
      categories: [
        {
          name: "Poomsae Taegeuk 3 (Anak-anak 6-11)",
          materials: [
            { title: "Taegeuk Sam Jang Langkah demi Langkah", videoUrl: "" },
            { title: "Tangkisan Double Arae Makki", videoUrl: "" }
          ]
        },
        {
          name: "Poomsae Taegeuk 3 (Remaja/Dewasa 12+)",
          materials: [
            { title: "Poomsae Taegeuk Sam Jang (Jurus 3)", videoUrl: "/api/files/videos/green_taegeuk3.mp4" }
          ]
        },
        {
          name: "Kyorugi Step & Fight (Remaja/Dewasa 12+)",
          materials: [
            { title: "Maju Mundur dengan Target Cepat", videoUrl: "" },
            { title: "Counter Dollyo Chagi Praktis", videoUrl: "" }
          ]
        }
      ]
    },
    // ----------------------------------------------------
    // SABUK HIJAU STRIP BIRU (6 GEUP)
    // ----------------------------------------------------
    {
      beltName: "Sabuk Hijau Strip Biru (6 Geup)",
      categories: [
        {
          name: "Poomsae Taegeuk 4 (Anak-anak 6-11)",
          materials: [
            { title: "Taegeuk Sa Jang Dasar", videoUrl: "" },
            { title: "Gerakan Bakat Makki (Tangkisan Luar)", videoUrl: "" }
          ]
        },
        {
          name: "Poomsae Taegeuk 4 (Remaja/Dewasa 12+)",
          materials: [
            { title: "Poomsae Taegeuk Sa Jang (Jurus 4)", videoUrl: "" }
          ]
        }
      ]
    },
    // ----------------------------------------------------
    // SABUK BIRU (5 GEUP)
    // ----------------------------------------------------
    {
      beltName: "Sabuk Biru (5 Geup)",
      categories: [
        {
          name: "Poomsae Taegeuk 5 (Anak-anak 6-11)",
          materials: [
            { title: "Taegeuk Oh Jang Dasar", videoUrl: "" }
          ]
        },
        {
          name: "Poomsae Taegeuk 5 (Remaja/Dewasa 12+)",
          materials: [
            { title: "Poomsae Taegeuk Oh Jang (Jurus 5)", videoUrl: "" }
          ]
        },
        {
          name: "Tendangan Berputar (Remaja/Dewasa 12+)",
          materials: [
            { title: "Dwi Chagi (Tendangan Belakang)", videoUrl: "" },
            { title: "Momo Dollyo Chagi (Tornado Chagi)", videoUrl: "" }
          ]
        }
      ]
    },
    // ----------------------------------------------------
    // SABUK BIRU STRIP MERAH (4 GEUP)
    // ----------------------------------------------------
    {
      beltName: "Sabuk Biru Strip Merah (4 Geup)",
      categories: [
        {
          name: "Poomsae Taegeuk 6 (Anak-anak 6-11)",
          materials: [
            { title: "Taegeuk Yuk Jang Pengenalan", videoUrl: "" }
          ]
        },
        {
          name: "Poomsae Taegeuk 6 (Remaja/Dewasa 12+)",
          materials: [
            { title: "Poomsae Taegeuk Yuk Jang (Jurus 6)", videoUrl: "" }
          ]
        }
      ]
    },
    // ----------------------------------------------------
    // SABUK MERAH (3 GEUP)
    // ----------------------------------------------------
    {
      beltName: "Sabuk Merah (3 Geup)",
      categories: [
        {
          name: "Poomsae Taegeuk 7 (Anak-anak 6-11)",
          materials: [
            { title: "Taegeuk Chil Jang Dasar", videoUrl: "" }
          ]
        },
        {
          name: "Poomsae Taegeuk 7 (Remaja/Dewasa 12+)",
          materials: [
            { title: "Poomsae Taegeuk Chil Jang (Jurus 7)", videoUrl: "" }
          ]
        },
        {
          name: "Kyokpa / Pecah Papan (Remaja/Dewasa 12+)",
          materials: [
            { title: "Pecah Papan Menggunakan Dwi Hurigi", videoUrl: "" }
          ]
        }
      ]
    },
    // ----------------------------------------------------
    // SABUK MERAH STRIP HITAM (2 GEUP)
    // ----------------------------------------------------
    {
      beltName: "Sabuk Merah Strip Hitam (2 Geup)",
      categories: [
        {
          name: "Poomsae Taegeuk 8 (Anak-anak 6-11)",
          materials: [
            { title: "Taegeuk Pal Jang Dasar", videoUrl: "" }
          ]
        },
        {
          name: "Poomsae Taegeuk 8 (Remaja/Dewasa 12+)",
          materials: [
            { title: "Poomsae Taegeuk Pal Jang (Jurus 8)", videoUrl: "" }
          ]
        }
      ]
    },
    // ----------------------------------------------------
    // SABUK MERAH STRIP HITAM (1 GEUP)
    // ----------------------------------------------------
    {
      beltName: "Sabuk Merah Strip Hitam (1 Geup)",
      categories: [
        {
          name: "Materi Pemantapan Poomsae (Umum)",
          materials: [
            { title: "Transisi Taegeuk 1 Sampai 8", videoUrl: "" }
          ]
        }
      ]
    },
    // ----------------------------------------------------
    // SABUK HITAM (DAN 1)
    // ----------------------------------------------------
    {
      beltName: "Sabuk Hitam (Dan 1)",
      categories: [
        {
          name: "Poomsae Sabuk Hitam (Remaja/Dewasa 12+)",
          materials: [
            { title: "Koryo Poomsae (Full)", videoUrl: "" }
          ]
        },
        {
          name: "Filosofi & Kepemimpinan (Remaja/Dewasa 12+)",
          materials: [
            { title: "Cara Membantu Sabeum Melatih Sabuk Putih", videoUrl: "" },
            { title: "Etika & Tanggung Jawab Asisten Pelatih", videoUrl: "" }
          ]
        }
      ]
    }
  ];

  for (const beltData of curriculumData) {
    const belt = await prisma.beltRank.findUnique({
      where: { name: beltData.beltName }
    });

    if (!belt) {
      console.log(`⚠️ Sabuk "${beltData.beltName}" tidak ditemukan di database. Lewati...`);
      continue;
    }

    console.log(`\nMenambahkan kurikulum untuk: ${belt.name}`);

    let categoryOrder = 0;
    for (const cat of beltData.categories) {
      const category = await prisma.curriculumCategory.create({
        data: {
          beltId: belt.id,
          name: cat.name,
          order: categoryOrder++
        }
      });
      console.log(`  └─ Kategori: ${cat.name}`);

      let materialOrder = 0;
      for (const mat of cat.materials) {
        await prisma.curriculumMaterial.create({
          data: {
            categoryId: category.id,
            title: mat.title,
            videoUrl: mat.videoUrl || null,
            order: materialOrder++
          }
        });
        console.log(`      └─ Materi: ${mat.title}`);
      }
    }
  }

  console.log("\n✅ Proses perluasan Kurikulum selesai dengan aman!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
