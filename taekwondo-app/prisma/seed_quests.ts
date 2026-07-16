import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

// ============================================================
// BELT CONSTANTS (sesuai format currentBelt di database)
// ============================================================
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
  D1:  "Sabuk Hitam (Dan 1)",
  D2:  "Sabuk Hitam (Dan 2)",
  D3:  "Sabuk Hitam (Dan 3)",
};

const ALL_BELTS = Object.values(BELTS);
const BEGINNER_BELTS = [BELTS.G10, BELTS.G9, BELTS.G8, BELTS.G7];
const INTERMEDIATE_BELTS = [BELTS.G7, BELTS.G6, BELTS.G5, BELTS.G4];
const ADVANCED_BELTS = [BELTS.G3, BELTS.G2, BELTS.G1, BELTS.D1, BELTS.D2, BELTS.D3];

interface QuestSeed {
  title: string;
  description: string;
  category: "FITNESS" | "TECHNICAL" | "DISCIPLINE" | "THEORY";
  baseXp: number;
  requireVideo: boolean;
  quizQuestions?: object | null;
  frequency: "DAILY" | "WEEKLY" | "ONE_TIME";
  req: { minAge: number; maxAge: number; allowedBeltIds: string[] };
}

const questSeeds: QuestSeed[] = [
  // ============================================================
  // USIA 4–6 TAHUN – VIDEO (TECHNICAL)
  // ============================================================
  {
    title: "Video: Posisi Sikap Hormat 3x",
    description: "Rekam video kamu berdiri tegak, lalu membungkuk hormat (Kyongye) 3 kali berturut-turut. Tahan setiap bungkukan selama 3 detik.",
    category: "TECHNICAL", baseXp: 30, requireVideo: true, frequency: "DAILY",
    req: { minAge: 4, maxAge: 6, allowedBeltIds: [BELTS.G10, BELTS.G9] },
  },
  {
    title: "Video: Berdiri Satu Kaki 10 Detik",
    description: "Rekam video kamu berdiri di atas satu kaki selama 10 detik. Ulangi 2 kali per kaki. Latihan keseimbangan dasar!",
    category: "TECHNICAL", baseXp: 25, requireVideo: true, frequency: "DAILY",
    req: { minAge: 4, maxAge: 6, allowedBeltIds: [BELTS.G10, BELTS.G9] },
  },
  {
    title: "Video: Ap Jireugi Pelan 5x per Tangan",
    description: "Rekam video pukulan lurus ke depan (Ap Jireugi) secara pelan-pelan: 5 kali tangan kanan, 5 kali tangan kiri.",
    category: "TECHNICAL", baseXp: 35, requireVideo: true, frequency: "DAILY",
    req: { minAge: 4, maxAge: 6, allowedBeltIds: [BELTS.G10, BELTS.G9] },
  },
  {
    title: "Video: Jalan Jinjit di Garis Lurus",
    description: "Buat garis lurus di lantai. Rekam kamu berjalan jinjit di atas garis sejauh 5 meter tanpa jatuh. Ulangi 2 kali.",
    category: "TECHNICAL", baseXp: 25, requireVideo: true, frequency: "DAILY",
    req: { minAge: 4, maxAge: 6, allowedBeltIds: [BELTS.G10, BELTS.G9] },
  },
  {
    title: "Video: Angkat Lutut Depan (Ap Chagi Mini) 5x",
    description: "Berdiri di tempat, angkat lutut ke depan setinggi pinggang sebanyak 5 kali per kaki. Boleh pegang tembok!",
    category: "TECHNICAL", baseXp: 30, requireVideo: true, frequency: "DAILY",
    req: { minAge: 4, maxAge: 6, allowedBeltIds: [BELTS.G10, BELTS.G9] },
  },

  // USIA 4–6 TAHUN – KUIS (THEORY)
  {
    title: "Kuis: Apa yang Dilakukan Saat Masuk Dojang?",
    description: "Pertanyaan tentang etika masuk dojang.",
    category: "THEORY", baseXp: 20, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Ketika masuk ke dalam dojang, apa yang harus kamu lakukan kepada Sabeomnim?",
      options: ["Melompat dan berteriak", "Membungkuk hormat (Kyongye)", "Langsung duduk diam", "Berlari ke sudut"],
      answer: "Membungkuk hormat (Kyongye)",
      explanation: "Di dojang, kita selalu membungkuk hormat kepada pelatih saat masuk dan keluar sebagai tanda rasa hormat.",
    }],
    req: { minAge: 4, maxAge: 6, allowedBeltIds: [BELTS.G10, BELTS.G9] },
  },
  {
    title: "Kuis: Warna Sabuk Pertama",
    description: "Pertanyaan tentang sabuk pertama di Taekwondo.",
    category: "THEORY", baseXp: 20, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Apa warna sabuk pertama yang dipakai seorang murid baru?",
      options: ["Hitam", "Merah", "Kuning", "Putih"],
      answer: "Putih",
      explanation: "Sabuk putih adalah sabuk pertama yang melambangkan murid baru yang masih bersih dari ilmu, seperti kertas putih siap diisi pelajaran!",
    }],
    req: { minAge: 4, maxAge: 6, allowedBeltIds: [BELTS.G10] },
  },
  {
    title: "Kuis: Apa Arti 'Kihap'?",
    description: "Pertanyaan tentang teriakan khusus di Taekwondo.",
    category: "THEORY", baseXp: 20, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Teriakan semangat saat melakukan gerakan Taekwondo disebut?",
      options: ["Kihap", "Poomsae", "Dobok", "Dojang"],
      answer: "Kihap",
      explanation: "Kihap adalah teriakan semangat saat melakukan gerakan. Kihap membantu kita lebih kuat dan bersemangat!",
    }],
    req: { minAge: 4, maxAge: 6, allowedBeltIds: [BELTS.G10, BELTS.G9] },
  },
  {
    title: "Kuis: Nama Seragam Taekwondo",
    description: "Pertanyaan tentang nama seragam latihan.",
    category: "THEORY", baseXp: 20, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Baju latihan khusus yang dipakai saat berlatih Taekwondo disebut?",
      options: ["Jersey", "Dobok", "Kimono", "Kaos"],
      answer: "Dobok",
      explanation: "Dobok adalah seragam putih yang kita pakai saat berlatih. Kita harus menjaga Dobok agar tetap bersih dan rapi!",
    }],
    req: { minAge: 4, maxAge: 6, allowedBeltIds: [BELTS.G10, BELTS.G9] },
  },

  // USIA 4–6 TAHUN – TUGAS HARIAN (FITNESS/DISCIPLINE)
  {
    title: "Tugas: Pemanasan Pagi Ceria 5 Menit",
    description: "Lakukan pemanasan bersama orang tua: putar leher 5x kanan-kiri, ayun lengan 10x, jalan di tempat 1 menit, lompat kecil 10 kali.",
    category: "FITNESS", baseXp: 25, requireVideo: false, frequency: "DAILY",
    req: { minAge: 4, maxAge: 6, allowedBeltIds: ALL_BELTS },
  },
  {
    title: "Tugas: Pose Pohon (Keseimbangan) 3 Set",
    description: "Berdiri satu kaki, kaki lain menempel di betis, tangan ke atas. Tahan 5 detik per kaki. Lakukan 3 kali setiap kaki.",
    category: "FITNESS", baseXp: 20, requireVideo: false, frequency: "DAILY",
    req: { minAge: 4, maxAge: 6, allowedBeltIds: ALL_BELTS },
  },
  {
    title: "Tugas: Beri Salam Sopan Hari Ini",
    description: "Setiap kali bertemu orang dewasa hari ini, beri salam sopan. Sebelum tidur, ceritakan kepada orang tua sudah memberi salam kepada siapa.",
    category: "DISCIPLINE", baseXp: 20, requireVideo: false, frequency: "DAILY",
    req: { minAge: 4, maxAge: 6, allowedBeltIds: ALL_BELTS },
  },
  {
    title: "Tugas: Rapikan Barang Sendiri",
    description: "Setelah bermain atau makan, rapikan sendiri barang-barang tanpa disuruh. Taekwondo mengajarkan disiplin dan tanggung jawab!",
    category: "DISCIPLINE", baseXp: 20, requireVideo: false, frequency: "DAILY",
    req: { minAge: 4, maxAge: 6, allowedBeltIds: ALL_BELTS },
  },

  // ============================================================
  // USIA 7–9 TAHUN – VIDEO (TECHNICAL)
  // ============================================================
  {
    title: "Video: Ap Chagi 10x per Kaki",
    description: "Rekam Ap Chagi (tendangan depan) 10 kali kaki kanan dan 10 kali kaki kiri. Pastikan lutut diangkat dulu sebelum menendang.",
    category: "TECHNICAL", baseXp: 40, requireVideo: true, frequency: "DAILY",
    req: { minAge: 7, maxAge: 9, allowedBeltIds: [BELTS.G10, BELTS.G9, BELTS.G8] },
  },
  {
    title: "Video: Arae Makki (Tangkisan Bawah) 10x",
    description: "Rekam Arae Makki 10 kali tangan kanan dan 10 kali tangan kiri. Tangan bergerak dari bahu ke arah bawah-luar dengan kuat.",
    category: "TECHNICAL", baseXp: 40, requireVideo: true, frequency: "DAILY",
    req: { minAge: 7, maxAge: 9, allowedBeltIds: [BELTS.G10, BELTS.G9, BELTS.G8] },
  },
  {
    title: "Video: Dollyo Chagi Dasar 8x per Kaki",
    description: "Rekam Dollyo Chagi (tendangan melingkar) 8 kali per kaki. Fokus pada putaran pinggul yang benar.",
    category: "TECHNICAL", baseXp: 45, requireVideo: true, frequency: "DAILY",
    req: { minAge: 7, maxAge: 9, allowedBeltIds: [BELTS.G9, BELTS.G8, BELTS.G7, BELTS.G6] },
  },
  {
    title: "Video: Poomsae Taegeuk 1 (Il Jang) Penuh",
    description: "Rekam Poomsae Taegeuk 1 secara lengkap dengan tempo pelan dan presisi. Kihap di tempat yang benar!",
    category: "TECHNICAL", baseXp: 60, requireVideo: true, frequency: "WEEKLY",
    req: { minAge: 7, maxAge: 9, allowedBeltIds: [BELTS.G8, BELTS.G7, BELTS.G6] },
  },
  {
    title: "Video: Combo Ap Jireugi + Ap Chagi 5x",
    description: "Rekam kombinasi pukulan depan (Ap Jireugi) langsung disambung tendangan depan (Ap Chagi). Lakukan 5 kali kanan, 5 kali kiri.",
    category: "TECHNICAL", baseXp: 50, requireVideo: true, frequency: "DAILY",
    req: { minAge: 7, maxAge: 9, allowedBeltIds: [BELTS.G9, BELTS.G8, BELTS.G7] },
  },
  {
    title: "Video: Sikap Kuda-Kuda Ap Seogi & Moa Seogi",
    description: "Rekam kamu memperagakan Moa Seogi (kaki rapat) dan Ap Seogi (melangkah ke depan), tahan 3 detik masing-masing, 5 repetisi bergantian.",
    category: "TECHNICAL", baseXp: 35, requireVideo: true, frequency: "DAILY",
    req: { minAge: 7, maxAge: 9, allowedBeltIds: [BELTS.G10, BELTS.G9, BELTS.G8, BELTS.G7] },
  },

  // USIA 7–9 TAHUN – KUIS (THEORY)
  {
    title: "Kuis: Arti Kata 'Taekwondo'",
    description: "Pertanyaan tentang makna nama Taekwondo.",
    category: "THEORY", baseXp: 30, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Apa arti kata 'Tae' dalam Taekwondo?",
      options: ["Tangan / Cara", "Kaki / Melompat / Menendang", "Olahraga / Seni", "Kekuatan / Tenaga"],
      answer: "Kaki / Melompat / Menendang",
      explanation: "'Tae' = kaki/menendang, 'Kwon' = tangan/tinju, 'Do' = jalan/cara hidup. Jadi Taekwondo artinya 'Seni Bertarung Menggunakan Tangan dan Kaki'.",
    }],
    req: { minAge: 7, maxAge: 9, allowedBeltIds: ALL_BELTS.slice(0, 6) },
  },
  {
    title: "Kuis: Asal Negara Taekwondo",
    description: "Pertanyaan tentang asal Taekwondo.",
    category: "THEORY", baseXp: 25, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Dari negara manakah olahraga Taekwondo berasal?",
      options: ["Jepang", "China", "Korea", "Thailand"],
      answer: "Korea",
      explanation: "Taekwondo berasal dari Korea dan sudah menjadi olahraga resmi Olimpiade sejak tahun 2000.",
    }],
    req: { minAge: 7, maxAge: 9, allowedBeltIds: ALL_BELTS.slice(0, 6) },
  },
  {
    title: "Kuis: Nama Tempat Berlatih Taekwondo",
    description: "Pertanyaan tentang istilah dojang.",
    category: "THEORY", baseXp: 25, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Tempat resmi berlatih Taekwondo disebut?",
      options: ["Lapangan", "Arena", "Dojang", "Gymnasium"],
      answer: "Dojang",
      explanation: "Dojang (도장) adalah tempat berlatih bela diri Korea. Saat masuk dan keluar, kita wajib memberi hormat.",
    }],
    req: { minAge: 7, maxAge: 9, allowedBeltIds: ALL_BELTS.slice(0, 5) },
  },
  {
    title: "Kuis: Aturan Penggunaan Ilmu Taekwondo",
    description: "Pertanyaan tentang etika penggunaan Taekwondo.",
    category: "THEORY", baseXp: 30, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Mana yang BUKAN aturan baik dalam Taekwondo?",
      options: ["Datang tepat waktu", "Memakai Dobok bersih", "Menggunakan Taekwondo untuk mengganggu teman di sekolah", "Mendengarkan Sabeomnim"],
      answer: "Menggunakan Taekwondo untuk mengganggu teman di sekolah",
      explanation: "Taekwondo hanya boleh digunakan untuk pertahanan diri, bukan untuk menyakiti orang lain. Kita belajar untuk menjadi pribadi yang lebih baik!",
    }],
    req: { minAge: 7, maxAge: 9, allowedBeltIds: ALL_BELTS },
  },
  {
    title: "Kuis: 5 Prinsip Taekwondo",
    description: "Pertanyaan tentang prinsip dasar Taekwondo.",
    category: "THEORY", baseXp: 35, requireVideo: false, frequency: "WEEKLY",
    quizQuestions: [{
      question: "Prinsip 'semangat pantang menyerah' dalam Taekwondo (Indomitable Spirit) dalam bahasa Korea disebut?",
      options: ["Yom Chi", "Baekjul Boolgool", "Ye Ui", "Guk Gi"],
      answer: "Baekjul Boolgool",
      explanation: "'Baekjul Boolgool' = semangat pantang menyerah. Lima prinsip: Courtesy (Ye Ui), Integrity (Yom Chi), Perseverance (In Nae), Self-Control (Guk Gi), Indomitable Spirit (Baekjul Boolgool).",
    }],
    req: { minAge: 7, maxAge: 9, allowedBeltIds: [BELTS.G8, BELTS.G7, BELTS.G6, BELTS.G5] },
  },

  // USIA 7–9 TAHUN – TUGAS HARIAN
  {
    title: "Tugas: Peregangan Kaki 10 Menit",
    description: "Latihan kelenturan: duduk selunjur raih ujung kaki 20 detik (3x), buka kaki lebar condong depan 20 detik (3x), stretching kupu-kupu 20 detik (3x).",
    category: "FITNESS", baseXp: 35, requireVideo: false, frequency: "DAILY",
    req: { minAge: 7, maxAge: 9, allowedBeltIds: ALL_BELTS },
  },
  {
    title: "Tugas: Kuda-Kuda Ap Seogi 30 Detik (3 Set)",
    description: "Ap Seogi statis 30 detik, 3 set per kaki. Istirahat 15 detik antar set. Melatih otot kaki untuk tendangan lebih kuat.",
    category: "FITNESS", baseXp: 30, requireVideo: false, frequency: "DAILY",
    req: { minAge: 7, maxAge: 9, allowedBeltIds: ALL_BELTS },
  },
  {
    title: "Tugas: Bantu Pekerjaan Rumah Tanpa Diminta",
    description: "Nilai Courtesy: hari ini bantu orang tua atau keluarga satu pekerjaan rumah tanpa diminta. Ceritakan pengalaman ini ke Sabeomnim.",
    category: "DISCIPLINE", baseXp: 25, requireVideo: false, frequency: "DAILY",
    req: { minAge: 7, maxAge: 9, allowedBeltIds: ALL_BELTS },
  },
  {
    title: "Tugas: Latihan Kihap 20x",
    description: "Di ruang tidak mengganggu, lakukan Kihap 20 kali. Tarik napas dalam, keluarkan bersama teriakan pendek dan kuat dari perut, bukan tenggorokan!",
    category: "DISCIPLINE", baseXp: 20, requireVideo: false, frequency: "DAILY",
    req: { minAge: 7, maxAge: 9, allowedBeltIds: ALL_BELTS },
  },

  // ============================================================
  // USIA 10–12 TAHUN – VIDEO (TECHNICAL)
  // ============================================================
  {
    title: "Video: Yop Chagi 12x per Kaki",
    description: "Rekam Yop Chagi (side kick) 12 kali kanan, 12 kali kiri. Fokus: lutut lipat ke samping dulu, lalu dorong keluar dengan tumit. Kihap setiap 6 tendangan.",
    category: "TECHNICAL", baseXp: 55, requireVideo: true, frequency: "DAILY",
    req: { minAge: 10, maxAge: 12, allowedBeltIds: [BELTS.G8, BELTS.G7, BELTS.G6, BELTS.G5] },
  },
  {
    title: "Video: Combo Dollyo + Yop Chagi 5x per Kaki",
    description: "Rekam kombinasi Dollyo Chagi langsung disambung Yop Chagi tanpa menurunkan kaki ke lantai. 5 kali per kaki. Melatih transisi teknik dan keseimbangan.",
    category: "TECHNICAL", baseXp: 65, requireVideo: true, frequency: "DAILY",
    req: { minAge: 10, maxAge: 12, allowedBeltIds: [BELTS.G7, BELTS.G6, BELTS.G5, BELTS.G4] },
  },
  {
    title: "Video: Poomsae Taegeuk 3 (Sam Jang) Penuh",
    description: "Rekam Taegeuk 3 secara lengkap. Perhatikan arah gerakan, transisi kuda-kuda, dan Kihap di posisi yang tepat. Jaga tempo konsisten.",
    category: "TECHNICAL", baseXp: 75, requireVideo: true, frequency: "WEEKLY",
    req: { minAge: 10, maxAge: 12, allowedBeltIds: [BELTS.G7, BELTS.G6, BELTS.G5] },
  },
  {
    title: "Video: Naeryo Chagi 10x per Kaki",
    description: "Rekam Naeryo Chagi (axe kick) 10 kali kanan, 10 kali kiri. Fokus: ayun kaki lurus ke atas, turun tepat di garis tengah target.",
    category: "TECHNICAL", baseXp: 60, requireVideo: true, frequency: "DAILY",
    req: { minAge: 10, maxAge: 12, allowedBeltIds: [BELTS.G6, BELTS.G5, BELTS.G4] },
  },
  {
    title: "Video: Momtong Makki + Dollyo Chagi 6x",
    description: "Rekam kombinasi tangkisan tengah (Momtong Makki) langsung Dollyo Chagi dengan kaki belakang. 6 repetisi bergantian kanan-kiri.",
    category: "TECHNICAL", baseXp: 65, requireVideo: true, frequency: "DAILY",
    req: { minAge: 10, maxAge: 12, allowedBeltIds: [BELTS.G7, BELTS.G6, BELTS.G5, BELTS.G4] },
  },

  // USIA 10–12 TAHUN – KUIS (THEORY)
  {
    title: "Kuis: Makna Poomsae Taegeuk Il Jang",
    description: "Pertanyaan tentang filosofi Poomsae Taegeuk.",
    category: "THEORY", baseXp: 40, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Poomsae Taegeuk 1 (Il Jang) melambangkan simbol 'Geon' yang berarti?",
      options: ["Api dan gairah", "Langit dan cahaya", "Air yang mengalir", "Gunung yang kokoh"],
      answer: "Langit dan cahaya",
      explanation: "Taegeuk Il Jang melambangkan 'Geon' (건괘), simbol langit dan cahaya — mengajarkan gerakan dasar sambil bermakna menjadi 'terang' seperti langit.",
    }],
    req: { minAge: 10, maxAge: 12, allowedBeltIds: [BELTS.G8, BELTS.G7, BELTS.G6] },
  },
  {
    title: "Kuis: Poomsae vs Kyorugi",
    description: "Pertanyaan tentang dua kategori kompetisi Taekwondo.",
    category: "THEORY", baseXp: 35, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Pertandingan yang menilai keindahan dan ketepatan gerakan jurus adalah?",
      options: ["Kyorugi", "Poomsae", "Hosinsul", "Gyokpa"],
      answer: "Poomsae",
      explanation: "Poomsae = pertandingan jurus, dinilai dari ketepatan teknik dan estetika. Kyorugi = pertandingan tarung (sparring).",
    }],
    req: { minAge: 10, maxAge: 12, allowedBeltIds: ALL_BELTS.slice(0, 7) },
  },
  {
    title: "Kuis: Area Sah dalam Kyorugi",
    description: "Pertanyaan tentang aturan scoring Kyorugi.",
    category: "THEORY", baseXp: 40, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Dalam Kyorugi, area mana yang sah ditendang dan mendapat poin?",
      options: ["Wajah saja", "Badan dan kepala", "Kaki dan pergelangan kaki", "Semua bagian tubuh"],
      answer: "Badan dan kepala",
      explanation: "Poin diberikan untuk serangan ke badan (memakai pelindung Hogu) dan kepala. Kaki, lengan, atau belakang kepala tidak dihitung.",
    }],
    req: { minAge: 10, maxAge: 12, allowedBeltIds: ALL_BELTS.slice(2, 8) },
  },

  // USIA 10–12 TAHUN – TUGAS HARIAN
  {
    title: "Tugas: Push-Up 15x + Plank 30 Detik (2 Set)",
    description: "Sirkuit kekuatan tubuh atas: 15 push-up (boleh tekuk lutut), lalu plank 30 detik. Lakukan 2 set dengan istirahat 30 detik.",
    category: "FITNESS", baseXp: 45, requireVideo: false, frequency: "DAILY",
    req: { minAge: 10, maxAge: 12, allowedBeltIds: ALL_BELTS },
  },
  {
    title: "Tugas: Jogging 15 Menit",
    description: "Lari santai 15 menit. Kalau tidak ada ruang, lari di tempat dengan lutut tinggi. Stamina baik = bertahan lebih lama di latihan.",
    category: "FITNESS", baseXp: 40, requireVideo: false, frequency: "DAILY",
    req: { minAge: 10, maxAge: 12, allowedBeltIds: ALL_BELTS },
  },
  {
    title: "Tugas: Shadow Sparring 5 Menit",
    description: "Bergerak maju-mundur sambil melakukan kombinasi teknik di udara selama 5 menit. Jaga kaki tetap bergerak seperti sedang bertanding sungguhan.",
    category: "DISCIPLINE", baseXp: 45, requireVideo: false, frequency: "DAILY",
    req: { minAge: 10, maxAge: 12, allowedBeltIds: [BELTS.G7, BELTS.G6, BELTS.G5, BELTS.G4, BELTS.G3] },
  },

  // ============================================================
  // USIA 13–15 TAHUN – VIDEO (TECHNICAL)
  // ============================================================
  {
    title: "Video: Twio Dollyo Chagi (Loncat) 8x per Kaki",
    description: "Rekam jumping roundhouse kick 8 kali per kaki. Fokus: tolakan kuat, posisi lutut lipat di udara, mendarat seimbang. Kihap saat tendangan mendarat.",
    category: "TECHNICAL", baseXp: 75, requireVideo: true, frequency: "DAILY",
    req: { minAge: 13, maxAge: 15, allowedBeltIds: [BELTS.G5, BELTS.G4, BELTS.G3, BELTS.G2] },
  },
  {
    title: "Video: Poomsae Taegeuk 5 (O Jang) Penuh",
    description: "Rekam Taegeuk 5 (melambangkan angin) dari awal sampai akhir. Perhatikan kecepatan transisi teknik, keseimbangan saat tendangan tinggi, dan Kihap bertenaga.",
    category: "TECHNICAL", baseXp: 85, requireVideo: true, frequency: "WEEKLY",
    req: { minAge: 13, maxAge: 15, allowedBeltIds: [BELTS.G5, BELTS.G4, BELTS.G3] },
  },
  {
    title: "Video: Combo 3 Teknik Non-Stop 20 Detik",
    description: "Rekam kombinasi 3 teknik berbeda (bebas pilih) non-stop selama 20 detik. Fokus pada kecepatan, tenaga, dan tanpa henti.",
    category: "TECHNICAL", baseXp: 80, requireVideo: true, frequency: "DAILY",
    req: { minAge: 13, maxAge: 15, allowedBeltIds: [BELTS.G5, BELTS.G4, BELTS.G3, BELTS.G2, BELTS.G1] },
  },
  {
    title: "Video: Keokgi Chagi (Hook Kick) 10x per Kaki",
    description: "Rekam hook kick 10 kali per kaki. Fokus: ayunan ke luar kemudian melengkung ke dalam, dorong pinggul maksimal.",
    category: "TECHNICAL", baseXp: 70, requireVideo: true, frequency: "DAILY",
    req: { minAge: 13, maxAge: 15, allowedBeltIds: [BELTS.G4, BELTS.G3, BELTS.G2, BELTS.G1] },
  },

  // USIA 13–15 TAHUN – KUIS (THEORY)
  {
    title: "Kuis: Taekwondo di Olimpiade",
    description: "Pertanyaan tentang sejarah Taekwondo di Olimpiade.",
    category: "THEORY", baseXp: 45, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Taekwondo pertama kali diakui sebagai olahraga resmi Olimpiade pada Olimpiade?",
      options: ["Seoul 1988", "Barcelona 1992", "Atlanta 1996", "Sydney 2000"],
      answer: "Sydney 2000",
      explanation: "Taekwondo resmi di Olimpiade Sydney 2000, meski sudah menjadi olahraga demonstrasi di Seoul 1988 dan Barcelona 1992.",
    }],
    req: { minAge: 13, maxAge: 15, allowedBeltIds: ALL_BELTS.slice(3, 10) },
  },
  {
    title: "Kuis: Kukkiwon dan World Taekwondo",
    description: "Pertanyaan tentang organisasi Taekwondo internasional.",
    category: "THEORY", baseXp: 45, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Organisasi dunia yang mengurusi kompetisi Taekwondo resmi saat ini bernama?",
      options: ["WTF (World Taekwondo Federation)", "WT (World Taekwondo)", "ITF (International Taekwondo Federation)", "KTA (Korean Taekwondo Association)"],
      answer: "WT (World Taekwondo)",
      explanation: "World Taekwondo (WT, sebelumnya WTF) adalah badan kompetisi Taekwondo Olimpiade. Kukkiwon mengeluarkan sertifikasi Dan yang diakui secara internasional.",
    }],
    req: { minAge: 13, maxAge: 15, allowedBeltIds: ALL_BELTS.slice(3, 10) },
  },
  {
    title: "Kuis: Filosofi Sabuk Hitam",
    description: "Pertanyaan mendalam tentang makna sabuk hitam.",
    category: "THEORY", baseXp: 50, requireVideo: false, frequency: "WEEKLY",
    quizQuestions: [{
      question: "Mengapa sabuk hitam disebut 'awal yang baru', bukan 'akhir perjalanan'?",
      options: [
        "Karena setelah sabuk hitam tidak ada ujian lagi",
        "Karena sabuk hitam melambangkan kegelapan yang belum berakhir",
        "Karena sabuk hitam menandai murid sudah kuasai dasar dan siap belajar lebih dalam",
        "Karena warna hitam menyerap semua spektrum warna",
      ],
      answer: "Karena sabuk hitam menandai murid sudah kuasai dasar dan siap belajar lebih dalam",
      explanation: "Sabuk hitam bukan puncak — melainkan gerbang. Dan 1 berarti fondasi dikuasai, dan kini saatnya mengeksplorasi kedalaman ilmu yang sesungguhnya.",
    }],
    req: { minAge: 13, maxAge: 15, allowedBeltIds: [BELTS.G3, BELTS.G2, BELTS.G1, BELTS.D1] },
  },

  // USIA 13–15 TAHUN – TUGAS HARIAN
  {
    title: "Tugas: Sirkuit Kekuatan 3 Ronde",
    description: "3 ronde × (20 push-up, 20 squat, 15 sit-up, 30 detik plank). Istirahat 60 detik antar ronde.",
    category: "FITNESS", baseXp: 60, requireVideo: false, frequency: "DAILY",
    req: { minAge: 13, maxAge: 15, allowedBeltIds: ALL_BELTS },
  },
  {
    title: "Tugas: 100 Tendangan Hari Ini",
    description: "Total 100 tendangan hari ini (boleh dibagi sesi dan jenis: Ap Chagi, Dollyo Chagi, Yop Chagi). Catat dan selesaikan dalam maks 3 sesi. Muscle memory dibangun dari volume latihan tinggi.",
    category: "FITNESS", baseXp: 65, requireVideo: false, frequency: "DAILY",
    req: { minAge: 13, maxAge: 15, allowedBeltIds: [BELTS.G5, BELTS.G4, BELTS.G3, BELTS.G2, BELTS.G1] },
  },
  {
    title: "Tugas: Meditasi Napas 10 Menit",
    description: "Nilai In Nae (Perseverance). Duduk bersila, pejamkan mata. Tarik napas 4 hitungan, tahan 4, hembus 4. Ulangi 10 menit. Fokus pada tujuan latihan Taekwondo kamu.",
    category: "DISCIPLINE", baseXp: 40, requireVideo: false, frequency: "DAILY",
    req: { minAge: 13, maxAge: 15, allowedBeltIds: ALL_BELTS },
  },

  // ============================================================
  // USIA 16–18 TAHUN – VIDEO (TECHNICAL)
  // ============================================================
  {
    title: "Video: Poomsae Taegeuk 8 (Pal Jang) Presisi Penuh",
    description: "Rekam Taegeuk 8 (Poomsae terakhir sebelum sabuk hitam) secara penuh. Fokus: kecepatan maksimal, kekuatan setiap Kihap, presisi arah gerakan. Rekam dari sudut depan.",
    category: "TECHNICAL", baseXp: 100, requireVideo: true, frequency: "WEEKLY",
    req: { minAge: 16, maxAge: 18, allowedBeltIds: [BELTS.G2, BELTS.G1, BELTS.D1] },
  },
  {
    title: "Video: Twio Nopi Ap Chagi (Loncat Tinggi) 5x",
    description: "Rekam tendangan loncat setinggi mungkin 5 kali per kaki. Fokus: tolakan maksimal, lutut lipat sempurna di udara, mendarat siap menyerang.",
    category: "TECHNICAL", baseXp: 90, requireVideo: true, frequency: "DAILY",
    req: { minAge: 16, maxAge: 18, allowedBeltIds: [BELTS.G3, BELTS.G2, BELTS.G1, BELTS.D1, BELTS.D2] },
  },
  {
    title: "Video: Shadow Sparring Intensitas Tinggi 3 Menit",
    description: "Rekam shadow sparring non-stop 3 menit dengan kombinasi teknik variatif, pergerakan kaki, serangan, dan tangkisan. Jaga intensitas tinggi dari menit pertama.",
    category: "TECHNICAL", baseXp: 95, requireVideo: true, frequency: "DAILY",
    req: { minAge: 16, maxAge: 18, allowedBeltIds: [BELTS.G4, BELTS.G3, BELTS.G2, BELTS.G1, BELTS.D1, BELTS.D2, BELTS.D3] },
  },
  {
    title: "Video: Keokgi + Twio Dollyo Combo 10x",
    description: "Rekam Keokgi Chagi (hook kick) disambung Twio Dollyo Chagi (jumping roundhouse) kaki berlawanan. 10 repetisi per sisi. Kombinasi kompetitif tingkat tinggi.",
    category: "TECHNICAL", baseXp: 85, requireVideo: true, frequency: "DAILY",
    req: { minAge: 16, maxAge: 18, allowedBeltIds: [BELTS.G3, BELTS.G2, BELTS.G1, BELTS.D1, BELTS.D2, BELTS.D3] },
  },

  // USIA 16–18 TAHUN – KUIS (THEORY)
  {
    title: "Kuis: Sertifikasi Dan dan Kukkiwon",
    description: "Pertanyaan mendalam tentang sistem sertifikasi Dan.",
    category: "THEORY", baseXp: 55, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Sertifikat Dan resmi Taekwondo yang diakui secara internasional dikeluarkan oleh?",
      options: ["World Taekwondo (WT)", "Kukkiwon", "Korea Olympic Committee", "ITF"],
      answer: "Kukkiwon",
      explanation: "Kukkiwon di Seoul adalah satu-satunya institusi yang mengeluarkan sertifikat Dan resmi yang diakui dunia oleh World Taekwondo. Setiap pemegang sabuk hitam dari jalur WT wajib memiliki sertifikat ini.",
    }],
    req: { minAge: 16, maxAge: 18, allowedBeltIds: [BELTS.G2, BELTS.G1, BELTS.D1, BELTS.D2, BELTS.D3] },
  },
  {
    title: "Kuis: Nilai Poin Tendangan Putar Kepala",
    description: "Pertanyaan tentang sistem scoring Kyorugi tingkat tinggi.",
    category: "THEORY", baseXp: 50, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Tendangan putar ke kepala (spinning head kick) bernilai lebih tinggi dalam Kyorugi karena?",
      options: [
        "Lebih mudah dilakukan sehingga perlu reward lebih",
        "Memiliki risiko dan tingkat kesulitan teknis yang jauh lebih tinggi",
        "Sudah diatur demikian oleh wasit",
        "Tendangan itu lebih menyakitkan",
      ],
      answer: "Memiliki risiko dan tingkat kesulitan teknis yang jauh lebih tinggi",
      explanation: "Spinning head kick bernilai 5 poin vs 3 poin tendangan kepala biasa dan 2 poin badan, karena tingkat kesulitan dan keberanian yang dibutuhkan jauh lebih tinggi.",
    }],
    req: { minAge: 16, maxAge: 18, allowedBeltIds: ALL_BELTS.slice(4, 13) },
  },
  {
    title: "Kuis: Filosofi 'Do' dalam Taekwondo",
    description: "Pertanyaan mendalam tentang aspek filosofis Taekwondo.",
    category: "THEORY", baseXp: 60, requireVideo: false, frequency: "WEEKLY",
    quizQuestions: [{
      question: "Apa inti makna 'Do' (도) dalam konteks Taekwondo?",
      options: [
        "Teknik bertarung yang efektif",
        "Jalan atau cara hidup yang mengarah pada pembentukan karakter melalui latihan",
        "Peraturan dan kode etik formal dojang",
        "Totalitas gerakan fisik dalam Poomsae",
      ],
      answer: "Jalan atau cara hidup yang mengarah pada pembentukan karakter melalui latihan",
      explanation: "'Do' bukan sekadar cara bertarung, tapi jalan hidup. Melalui disiplin latihan, praktisi membentuk karakter: kerendahan hati, ketekunan, kejujuran, dan pengendalian diri.",
    }],
    req: { minAge: 16, maxAge: 18, allowedBeltIds: ALL_BELTS.slice(5, 13) },
  },

  // USIA 16–18 TAHUN – TUGAS HARIAN
  {
    title: "Tugas: HIIT Taekwondo 20 Menit",
    description: "4 ronde × (40 detik kerja / 20 detik istirahat): (1) Ap Chagi speed kiri-kanan, (2) Jump Squat, (3) Dollyo Chagi speed, (4) Burpee. Istirahat 1 menit antar ronde.",
    category: "FITNESS", baseXp: 80, requireVideo: false, frequency: "DAILY",
    req: { minAge: 16, maxAge: 18, allowedBeltIds: ALL_BELTS.slice(3, 13) },
  },
  {
    title: "Tugas: Fleksibilitas Total 20 Menit",
    description: "Sesi stretching: leg split kanan 45 detik (3x), kiri 45 detik (3x), middle split 45 detik (3x), hamstring 30 detik (2x per kaki), hip flexor lunge 30 detik (2x per kaki).",
    category: "FITNESS", baseXp: 70, requireVideo: false, frequency: "DAILY",
    req: { minAge: 16, maxAge: 18, allowedBeltIds: ALL_BELTS },
  },
  {
    title: "Tugas: Analisis Video Pertandingan Dunia",
    description: "Tonton video World Taekwondo Championship di YouTube minimal 10 menit. Catat: teknik paling sering digunakan, strategi scoring, dan satu hal ingin kamu tiru. Bagikan ke Sabeomnim.",
    category: "DISCIPLINE", baseXp: 55, requireVideo: false, frequency: "WEEKLY",
    req: { minAge: 16, maxAge: 18, allowedBeltIds: ALL_BELTS.slice(3, 13) },
  },
  {
    title: "Tugas: Ajarkan 1 Teknik ke Adik Kelas",
    description: "Nilai Courtesy: luangkan 5 menit mengajarkan satu teknik dasar kepada adik kelas yang sabuknya lebih rendah. Mengajarkan orang lain adalah cara terbaik memperdalam pemahaman sendiri.",
    category: "DISCIPLINE", baseXp: 60, requireVideo: false, frequency: "WEEKLY",
    req: { minAge: 16, maxAge: 18, allowedBeltIds: [BELTS.G3, BELTS.G2, BELTS.G1, BELTS.D1, BELTS.D2, BELTS.D3] },
  },

  // =========================================================================
  // BANK SOAL KUIS TAMBAHAN (THEORY) - BERBAGAI USIA & TINGKATAN SABUK
  // =========================================================================

  // --- KELOMPOK USIA ANAK (4-6 TAHUN) & REMAJA (7-15 TAHUN) - PEMULA ---
  {
    title: "Kuis: Arti Kata TAEKWONDO",
    description: "Uji pengetahuan tentang arti harfiah dari nama seni bela diri Taekwondo.",
    category: "THEORY", baseXp: 20, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Apakah arti dari kata 'TAE' dalam Taekwondo?",
      options: ["Tangan", "Kepala", "Menendang dengan Kaki", "Jalan / Seni"],
      answer: "Menendang dengan Kaki",
      explanation: "Tae berarti menendang atau menghancurkan dengan kaki, Kwon berarti memukul dengan tangan, dan Do berarti seni atau jalan hidup."
    }],
    req: { minAge: 4, maxAge: 15, allowedBeltIds: BEGINNER_BELTS }
  },
  {
    title: "Kuis: Negara Asal Taekwondo",
    description: "Sejarah dasar mengenai dari negara mana seni bela diri Taekwondo berasal.",
    category: "THEORY", baseXp: 20, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Dari negara manakah seni bela diri Taekwondo berasal?",
      options: ["Jepang", "Tiongkok", "Korea", "Thailand"],
      answer: "Korea",
      explanation: "Taekwondo adalah seni bela diri tradisional yang berasal dan berkembang dari semenanjung Korea."
    }],
    req: { minAge: 4, maxAge: 15, allowedBeltIds: BEGINNER_BELTS }
  },
  {
    title: "Kuis: Tempat Latihan Taekwondo",
    description: "Mengenal nama area tempat latihan Taekwondo secara resmi.",
    category: "THEORY", baseXp: 20, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Apa nama tempat atau aula resmi untuk berlatih Taekwondo?",
      options: ["Stadium", "Dojang", "Ring", "Tatami"],
      answer: "Dojang",
      explanation: "Tempat berlatih Taekwondo disebut Dojang, sedangkan pakaiannya disebut Dobok."
    }],
    req: { minAge: 4, maxAge: 15, allowedBeltIds: BEGINNER_BELTS }
  },

  // --- KELOMPOK USIA REMAJA (7-15 TAHUN) & DEWASA (16+) - MENENGAH (SABUK HIJAU - BIRU) ---
  {
    title: "Kuis: Nama Pakaian Taekwondo",
    description: "Materi pengetahuan dasar pakaian latihan resmi di Taekwondo.",
    category: "THEORY", baseXp: 30, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Pakaian seragam resmi Taekwondo disebut dengan istilah apa?",
      options: ["Kimono", "Dobok", "Gi", "Hanbok"],
      answer: "Dobok",
      explanation: "Dobok adalah sebutan seragam latihan Taekwondo, terdiri dari celana, baju, dan sabuk (Ti)."
    }],
    req: { minAge: 7, maxAge: 99, allowedBeltIds: INTERMEDIATE_BELTS }
  },
  {
    title: "Kuis: Poin Tendangan Kyorugi",
    description: "Aturan poin pertandingan tarung (Kyorugi) untuk tendangan ke arah badan.",
    category: "THEORY", baseXp: 30, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Berapa poin yang didapat jika berhasil menendang protector badan (hogu) lawan dengan tendangan biasa?",
      options: ["1 Poin", "2 Poin", "3 Poin", "4 Poin"],
      answer: "2 Poin",
      explanation: "Tendangan biasa ke pelindung badan (body protector) bernilai 2 poin. Jika dilakukan dengan memutar badan (turning kick), nilainya menjadi 4 poin."
    }],
    req: { minAge: 7, maxAge: 99, allowedBeltIds: INTERMEDIATE_BELTS }
  },
  {
    title: "Kuis: Tangkisan Area Atas",
    description: "Nama gerakan tangkisan ke arah kepala/atas dalam bahasa Korea.",
    category: "THEORY", baseXp: 30, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Apakah nama teknik tangkisan ke arah atas atau kepala?",
      options: ["Araemakki", "Eolgulmakki", "Momtongmakki", "Anmakki"],
      answer: "Eolgulmakki",
      explanation: "Eolgulmakki adalah tangkisan atas. Momtongmakki adalah tangkisan tengah, dan Araemakki adalah tangkisan bawah."
    }],
    req: { minAge: 7, maxAge: 99, allowedBeltIds: INTERMEDIATE_BELTS }
  },

  // --- KELOMPOK USIA DEWASA & MAHIR (SABUK MERAH - HITAM) ---
  {
    title: "Kuis: Poin Tendangan Memutar Kepala",
    description: "Aturan poin Kyorugi terbaru untuk serangan tingkat tinggi dengan putaran.",
    category: "THEORY", baseXp: 40, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Berapa poin yang didapat dari tendangan memutar yang mengenai pelindung kepala (head protector) lawan?",
      options: ["3 Poin", "4 Poin", "5 Poin", "2 Poin"],
      answer: "5 Poin",
      explanation: "Tendangan biasa ke kepala bernilai 3 poin. Sedangkan tendangan memutar ke kepala (seperti Dwi Chagi / Dolyo Chagi putar) bernilai 5 poin."
    }],
    req: { minAge: 12, maxAge: 99, allowedBeltIds: ADVANCED_BELTS }
  },
  {
    title: "Kuis: Induk Organisasi Dunia",
    description: "Pengetahuan federasi Taekwondo resmi internasional.",
    category: "THEORY", baseXp: 40, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Apakah nama induk organisasi Taekwondo tingkat dunia yang resmi diakui Olimpiade?",
      options: ["ITF (International Taekwon-Do Federation)", "WT (World Taekwondo)", "KTA (Korea Taekwondo Association)", "PBTI"],
      answer: "WT (World Taekwondo)",
      explanation: "World Taekwondo (WT) adalah badan pengatur resmi olahraga Taekwondo di dunia yang berafiliasi dengan Komite Olimpiade Internasional (IOC)."
    }],
    req: { minAge: 12, maxAge: 99, allowedBeltIds: ADVANCED_BELTS }
  },
  {
    title: "Kuis: Istilah Pelanggaran Kyorugi",
    description: "Aturan kartu hukuman pelanggaran dalam pertandingan taekwondo.",
    category: "THEORY", baseXp: 40, requireVideo: false, frequency: "DAILY",
    quizQuestions: [{
      question: "Apa istilah hukuman penalti pengurangan poin (satu poin untuk lawan) dalam sistem pertandingan Kyorugi?",
      options: ["Kyong-go", "Gam-jeom", "Jui", "Chil-sun"],
      answer: "Gam-jeom",
      explanation: "Dalam aturan pertandingan terbaru, semua pelanggaran langsung dihukum dengan Gam-jeom (pengurangan 1 poin / penalti poin untuk lawan)."
    }],
    req: { minAge: 12, maxAge: 99, allowedBeltIds: ADVANCED_BELTS }
  },
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
async function main() {
  console.log("🥋 Memulai seeding Daily Quest Library...\n");

  let totalCreated = 0;
  const summary: Record<string, Record<string, number>> = {};

  for (const q of questSeeds) {
    try {
      await prisma.questLibrary.create({
        data: {
          title: q.title,
          description: q.description,
          category: q.category,
          baseXp: q.baseXp,
          requireVideo: q.requireVideo,
          quizQuestions: q.quizQuestions ?? undefined,
          frequency: q.frequency,
          isActive: true,
          requirements: {
            create: {
              minAge: q.req.minAge,
              maxAge: q.req.maxAge,
              allowedBeltIds: q.req.allowedBeltIds,
            },
          },
        },
      });

      const ageKey = `Usia ${q.req.minAge}-${q.req.maxAge}`;
      if (!summary[ageKey]) summary[ageKey] = { TECHNICAL: 0, THEORY: 0, FITNESS: 0, DISCIPLINE: 0 };
      summary[ageKey][q.category]++;
      totalCreated++;

      console.log(`  ✅ [${ageKey}] [${q.category}] ${q.title}`);
    } catch (err) {
      console.error(`  ❌ GAGAL: ${q.title}`, err);
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`✅ TOTAL QUEST DIBUAT: ${totalCreated}`);
  console.log(`\n📊 Ringkasan per Kelompok Umur:`);
  for (const [age, cats] of Object.entries(summary)) {
    const total = Object.values(cats).reduce((a, b) => a + b, 0);
    const detail = Object.entries(cats).map(([c, n]) => `${c}: ${n}`).join(", ");
    console.log(`  ${age} → Total ${total} | ${detail}`);
  }
  console.log(`${"=".repeat(50)}\n`);
  console.log(`💡 Cek hasil di admin panel: /admin/daily-quests → tab "Library Misi"`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
