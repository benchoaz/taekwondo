import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const BELTS = {
  G10: "Sabuk Putih (10 Geup)",
  G9:  "Sabuk Kuning (9 Geup)",
  G8:  "Sabuk Kuning Strip Hijau (8 Geup)",
  G7:  "Sabuk Hijau (7 Geup)",
  G6:  "Sabuk Hijau Strip Biru (6 Geup)",
  G5:  "Sabuk Biru (5 Geup)",
  G4:  "Sabuk Biru Strip Merah (4 Geup)",
  G3:  "Sabuk Merah (3 Geup)",
  G2:  "Sabuk Merah Strip Hitam (2 Geup)",
  G1:  "Sabuk Merah Strip Hitam (1 Geup)",
  D1:  "Sabuk Hitam (Dan 1)"
};

const ALL_BELTS = Object.values(BELTS);
const BEGINNER_BELTS = [BELTS.G10, BELTS.G9, BELTS.G8];
const INTERMEDIATE_BELTS = [BELTS.G7, BELTS.G6, BELTS.G5, BELTS.G4];
const ADVANCED_BELTS = [BELTS.G3, BELTS.G2, BELTS.G1, BELTS.D1];

async function main() {
  console.log("🎯 Memulai proses perluasan Daily Quest komprehensif...");

  // 1. Bersihkan Quest lama
  await prisma.questRequirement.deleteMany({});
  await prisma.questLibrary.deleteMany({});
  console.log("🧹 Data quest lama berhasil dibersihkan.");

  // 2. Data Seed Quest
  const quests = [
    // =========================================================================
    // TIPE 1: JAWAB PERTANYAAN (QUIZ) - BANK SOAL BERAGAM PER TINGKATAN SABUK
    // =========================================================================
    
    // SABUK PEMULA (WHITE & YELLOW) - ANAK-ANAK
    {
      title: "Kuis: Istilah Kuda-kuda Dasar (Anak-anak)",
      description: "Jawab kuis nama kuda-kuda dasar dalam bahasa Korea dengan benar.",
      category: "THEORY", baseXp: 25, requireVideo: false, frequency: "DAILY",
      quizQuestions: [
        {
          question: "Kuda-kuda yang sejajar menyerupai posisi menunggang kuda disebut...",
          options: ["Juchum Seogi", "Ap Seogi", "Ap Koobi", "Dwit Koobi"],
          correctAnswer: "Juchum Seogi",
          explanation: "Juchum Seogi adalah sikap kuda-kuda bersiap di mana kedua kaki dibuka lebar sejajar bahu dan lutut ditekuk seperti menunggang kuda."
        }
      ],
      req: { minAge: 6, maxAge: 11, allowedBeltIds: BEGINNER_BELTS }
    },
    {
      title: "Kuis: Arti Warna Sabuk Putih",
      description: "Uji pengetahuanmu tentang filosofi dasar sabuk pertamamu di Taekwondo.",
      category: "THEORY", baseXp: 30, requireVideo: false, frequency: "DAILY",
      quizQuestions: [
        {
          question: "Apakah arti filosofis dari warna sabuk putih di Taekwondo?",
          options: [
            "Kesucian, awal baru, dan kertas kosong tanpa noda",
            "Keberanian seorang ksatria sejati",
            "Kemakmuran dan pertumbuhan tunas muda",
            "Kedewasaan dan kekuatan fisik yang matang"
          ],
          correctAnswer: "Kesucian, awal baru, dan kertas kosong tanpa noda",
          explanation: "Sabuk putih melambangkan kesucian dan awal perjalanan di mana seorang murid masih bersih dari ilmu dan siap diisi pelajaran."
        }
      ],
      req: { minAge: 6, maxAge: 99, allowedBeltIds: [BELTS.G10] }
    },

    // SABUK PEMULA (WHITE & YELLOW) - REMAJA/DEWASA
    {
      title: "Kuis: Jumlah Gerakan Taegeuk 1 (Remaja/Dewasa)",
      description: "Uji pemahaman teorimu tentang jurus pertama Taegeuk Il Jang.",
      category: "THEORY", baseXp: 35, requireVideo: false, frequency: "DAILY",
      quizQuestions: [
        {
          question: "Berapakah jumlah total langkah/gerakan dalam Poomsae Taegeuk Il Jang?",
          options: ["18 gerakan", "20 gerakan", "16 gerakan", "22 gerakan"],
          correctAnswer: "18 gerakan",
          explanation: "Taegeuk Il Jang memiliki total 18 gerakan/langkah terstruktur yang melambangkan Keon (langit)."
        }
      ],
      req: { minAge: 12, maxAge: 99, allowedBeltIds: BEGINNER_BELTS }
    },

    // SABUK MENENGAH (GREEN & BLUE)
    {
      title: "Kuis: Filosofi Sabuk Hijau",
      description: "Uji pengetahuanmu tentang arti filosofi warna sabuk hijau.",
      category: "THEORY", baseXp: 35, requireVideo: false, frequency: "DAILY",
      quizQuestions: [
        {
          question: "Warna hijau pada sabuk hijau melambangkan...",
          options: [
            "Kemakmuran dan pohon yang mulai tumbuh subur berkembang",
            "Kematangan buah yang siap panen",
            "Kekuatan tanah/bumi pondasi kokoh",
            "Bahaya kegelapan malam hari"
          ],
          correctAnswer: "Kemakmuran dan pohon yang mulai tumbuh subur berkembang",
          explanation: "Hijau melambangkan pohon/tunas yang mulai tumbuh subur ke atas, melambangkan ilmu murid yang mulai berkembang pesat."
        }
      ],
      req: { minAge: 6, maxAge: 99, allowedBeltIds: INTERMEDIATE_BELTS }
    },
    {
      title: "Kuis: Istilah Sasaran Pukulan (Umum)",
      description: "Tebak istilah Korea untuk target area pukulan tengah.",
      category: "THEORY", baseXp: 30, requireVideo: false, frequency: "DAILY",
      quizQuestions: [
        {
          question: "Sasaran pukulan atau tangkisan yang diarahkan ke bagian ulu hati/tengah badan disebut...",
          options: ["Momtong", "Eolgul", "Arae", "Chigi"],
          correctAnswer: "Momtong",
          explanation: "Momtong berarti area tubuh bagian tengah (ulu hati hingga bawah leher)."
        }
      ],
      req: { minAge: 6, maxAge: 99, allowedBeltIds: INTERMEDIATE_BELTS }
    },

    // SABUK TINGGI (RED & BLACK)
    {
      title: "Kuis: Penguasaan Poomsae Koryo (Sabuk Hitam)",
      description: "Materi kuis khusus asisten pelatih dan murid tingkat Dan.",
      category: "THEORY", baseXp: 40, requireVideo: false, frequency: "DAILY",
      quizQuestions: [
        {
          question: "Koryo Poomsae melambangkan masa keemasan dinasti Koryo yang artinya...",
          options: [
            "Semangat keteguhan, keluhuran budi, dan pantang menyerah",
            "Pertumbuhan dedaunan hijau di atas bukit",
            "Ketenangan air yang mengalir tenang",
            "Pondasi kokoh dari dalam bumi"
          ],
          correctAnswer: "Semangat keteguhan, keluhuran budi, dan pantang menyerah",
          explanation: "Koryo melambangkan ksatria (Seonbae) dinasti Koryo yang memiliki semangat juang tinggi dan kemuliaan karakter."
        }
      ],
      req: { minAge: 12, maxAge: 99, allowedBeltIds: ADVANCED_BELTS }
    },

    // =========================================================================
    // TIPE 2: HANYA KLAIM (DAILY CHECK-IN)
    // =========================================================================
    {
      title: "Konsistensi Dojang (Check-in Harian)",
      description: "Klik tombol klaim hari ini sebagai bukti kamu tetap menjaga komitmen latihan Taekwondo.",
      category: "DISCIPLINE", baseXp: 15, requireVideo: false, frequency: "DAILY",
      req: { minAge: 0, maxAge: 99, allowedBeltIds: ALL_BELTS }
    },
    {
      title: "Pemanasan Semangat Pagi!",
      description: "Lakukan peregangan mandiri di rumah selama 5 menit untuk menjaga fleksibilitas sendi kaki.",
      category: "FITNESS", baseXp: 15, requireVideo: false, frequency: "DAILY",
      req: { minAge: 0, maxAge: 99, allowedBeltIds: ALL_BELTS }
    },

    // =========================================================================
    // TIPE 3: UPLOAD VIDEO (BUTUH VERIFIKASI PELATIH)
    // =========================================================================
    
    // ANAK-ANAK (WHITE & YELLOW)
    {
      title: "Video: Setor Misi Ap Chagi (Anak-Anak)",
      description: "Setor rekaman tendangan depan (Ap Chagi) sebanyak 5 kali menggunakan kaki kanan dan kiri secara bergantian.",
      category: "TECHNICAL", baseXp: 50, requireVideo: true, frequency: "WEEKLY",
      req: { minAge: 6, maxAge: 11, allowedBeltIds: BEGINNER_BELTS }
    },
    // REMAJA/DEWASA (WHITE & YELLOW)
    {
      title: "Video: Teknik Poomsae Taegeuk 1 (Remaja/Dewasa)",
      description: "Rekam dan upload gerakan Poomsae Taegeuk Il Jang penuh dengan transisi kuda-kuda yang presisi.",
      category: "TECHNICAL", baseXp: 60, requireVideo: true, frequency: "WEEKLY",
      req: { minAge: 12, maxAge: 99, allowedBeltIds: BEGINNER_BELTS }
    },

    // ANAK-ANAK (GREEN & BLUE)
    {
      title: "Video: Tendangan Dollyo Chagi (Anak-anak)",
      description: "Rekam video tendangan melingkar (Dollyo Chagi) sebanyak 5 kali tepat mengenai target (petting/pad).",
      category: "TECHNICAL", baseXp: 50, requireVideo: true, frequency: "WEEKLY",
      req: { minAge: 6, maxAge: 11, allowedBeltIds: INTERMEDIATE_BELTS }
    },
    // REMAJA/DEWASA (GREEN & BLUE)
    {
      title: "Video: Poomsae Taegeuk 5 (Remaja/Dewasa)",
      description: "Setor video jurus Taegeuk Oh Jang dengan kombinasi pukulan punggung tangan (Me Jireugi) yang tegas.",
      category: "TECHNICAL", baseXp: 65, requireVideo: true, frequency: "WEEKLY",
      req: { minAge: 12, maxAge: 99, allowedBeltIds: INTERMEDIATE_BELTS }
    },

    // ADVANCED (RED & BLACK)
    {
      title: "Video: Kyokpa / Pemecahan Papan Uji",
      description: "Rekam gerakan tendangan Dwi Chagi / Dwi Hurigi untuk memecahkan papan kayu (Kyokpa) latihan.",
      category: "TECHNICAL", baseXp: 75, requireVideo: true, frequency: "WEEKLY",
      req: { minAge: 12, maxAge: 99, allowedBeltIds: ADVANCED_BELTS }
    },

    // =========================================================================
    // TIPE 4: NONTON VIDEO LALU KLAIM
    // =========================================================================
    {
      title: "Nonton: Tata Cara Hormat di Dojang",
      description: "Tonton video edukasi etika penghormatan (Kyongye) yang benar saat memasuki dan meninggalkan tempat latihan.",
      category: "THEORY", baseXp: 20, requireVideo: false,
      videoUrl: "/api/files/videos/tutorials/dojang_etiquette.mp4",
      frequency: "DAILY",
      req: { minAge: 6, maxAge: 99, allowedBeltIds: ALL_BELTS }
    },
    {
      title: "Nonton: Pentingnya Pemanasan Sendi",
      description: "Pelajari cara pemanasan otot pergelangan kaki dan lutut untuk meminimalkan risiko cedera saat latihan.",
      category: "FITNESS", baseXp: 20, requireVideo: false,
      videoUrl: "/api/files/videos/tutorials/warmup_safety.mp4",
      frequency: "DAILY",
      req: { minAge: 6, maxAge: 99, allowedBeltIds: ALL_BELTS }
    }
  ];

  for (const q of quests) {
    // 1. Buat Quest Library
    const quest = await prisma.questLibrary.create({
      data: {
        title: q.title,
        description: q.description,
        category: q.category as any,
        baseXp: q.baseXp,
        requireVideo: q.requireVideo,
        videoUrl: q.videoUrl || null,
        quizQuestions: q.quizQuestions ? (q.quizQuestions as any) : null,
        frequency: q.frequency as any
      }
    });

    console.log(`+ Quest ditambahkan: ${q.title}`);

    // 2. Cari allowedBeltIds sesungguhnya (untuk dicocokkan ke database BeltRank)
    const dbBelts = await prisma.beltRank.findMany({
      where: { name: { in: q.req.allowedBeltIds } }
    });

    const allowedBeltIds = dbBelts.map(b => b.id);

    // 3. Buat Quest Requirement
    await prisma.questRequirement.create({
      data: {
        questId: quest.id,
        minAge: q.req.minAge,
        maxAge: q.req.maxAge,
        allowedBeltIds: allowedBeltIds
      }
    });
  }

  console.log("\n✅ Seeding Daily Quest komprehensif selesai dengan aman!");
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
