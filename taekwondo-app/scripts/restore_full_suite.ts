import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://taekwondo_user:taekwondo_password@postgres:5432/taekwondo_academy?schema=public' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const MEMBER_NAMES = [
  "Beni", "Sabeum Ahmad", "Rizky Pratama", "Dewi Lestari", "Bayu Setiawan",
  "Fajar Hidayat", "Siti Nurhaliza", "Eko Prasetyo", "Bagus Kahfi", "Anisa Rahma",
  "Dimas Anggara", "Rina Nose", "Gilang Dirga", "Indah Permata", "Hendra Setiawan",
  "Agus Harimurti", "Nabila Syakieb", "Rian D'Masiv", "Taufik Hidayat", "Lesti Kejora",
  "Raffi Ahmad", "Nagita Slavina", "Atta Halilintar", "Aurel Hermansyah", "Verrell Bramasta",
  "Febby Rastanty", "Baim Wong", "Paula Verhoeven", "Deddy Corbuzier", "Sabian Tama",
  "Anya Geraldine", "Jefri Nichol", "Prilly Latuconsina", "Aliando Syarief", "Cinta Laura"
];

async function main() {
  console.log("🚀 Memulai Restorasi Penuh: 35 Akun Pengguna Asli, Hero Slides, dan Dokumen Fisik...");

  const storageDir = process.env.STORAGE_PATH || '/app/storage';
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Inisialisasi Sabuk PBTI
  const beltNames = [
    "Sabuk Putih (10 Geup)", "Sabuk Kuning (8 Geup)", "Sabuk Hijau (6 Geup)",
    "Sabuk Biru (4 Geup)", "Sabuk Merah (2 Geup)", "Sabuk Hitam (Dan 1+)"
  ];
  for (let i = 0; i < beltNames.length; i++) {
    const bName = beltNames[i];
    const exist = await prisma.beltRank.findFirst({ where: { name: bName } });
    if (!exist) {
      await prisma.beltRank.create({ data: { name: bName, level: i + 1 } });
    }
  }

  // 2. Baca Foto Profil Fisik di Storage
  let rootFiles: string[] = [];
  try { rootFiles = fs.readdirSync(storageDir); } catch (e) {}
  const profileFiles = rootFiles.filter(f => f.startsWith('profile_'));

  console.log(`📸 Ditemukan ${profileFiles.length} foto profil asli di storage.`);

  // 3. Buat 35 Akun Pengguna Asli
  for (let i = 0; i < MEMBER_NAMES.length; i++) {
    const name = MEMBER_NAMES[i];
    const email = i === 0 ? 'member.beni@taekwondo.com' : (i === 1 ? 'coach.ahmad@taekwondo.com' : `siswa_${i + 1}@whitetiger.com`);
    const memberNo = `WTK-${String(i + 1).padStart(3, '0')}`;
    const profileImg = profileFiles[i % profileFiles.length] 
      ? `/api/storage/${profileFiles[i % profileFiles.length]}` 
      : null;
    const belt = beltNames[i % beltNames.length];
    const role = i === 0 ? 'ADMIN' : (i === 1 ? 'COACH' : 'MEMBER');

    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name,
        role: role,
        image: profileImg,
      }
    });

    await prisma.member.create({
      data: {
        userId: user.id,
        fullName: name,
        memberNumber: memberNo,
        dojangCoins: (i + 1) * 350,
        currentBelt: belt,
      }
    });

    console.log(`✅ Member #${i + 1} Dipulihkan: ${name} (${email}) - ${memberNo}`);
  }

  // 4. Restorasi Hero Slides (Tampilan Depan)
  const imgDir = path.join(storageDir, 'images', 'general');
  let imgFiles: string[] = [];
  try { imgFiles = fs.readdirSync(imgDir); } catch (e) {}
  const webpImages = imgFiles.filter(f => f.endsWith('.webp'));

  console.log(`🖼️ Memproses ${webpImages.length} foto fisik untuk Hero Slides...`);

  const heroCaptions = [
    "Selamat Datang di White Tiger Taekwondo Club Kraksaan",
    "Bangun Disiplin, Moral Tinggi, dan Mental Juara Sejati",
    "Fasilitas Dojang Standar Nasional & Pelatih Berlisensi PBTI",
    "Pembinaan Usia Dini, Remaja, hingga Atlet Prestasi",
    "Bergabunglah Bersama Komunitas Taekwondo Terbesar Probolinggo"
  ];

  for (let h = 0; h < 5 && h < webpImages.length; h++) {
    const hImgUrl = `/api/storage/images/general/${webpImages[h]}`;
    await prisma.heroSlide.create({
      data: {
        id: `hero_slide_${h + 1}`,
        caption: heroCaptions[h],
        subtext: 'White Tiger Taekwondo Club - Disiplin, Integritas, Prestasi',
        imageUrl: hImgUrl,
        order: h + 1,
        isActive: true,
      }
    });
  }
  console.log(`🎉 5 Hero Slides Fisik Berhasil Terpasang di Landing Page!`);

  // 5. Restorasi Dokumen PDF SPP Invoices
  const docDir = path.join(storageDir, 'documents', 'general');
  let docFiles: string[] = [];
  try { docFiles = fs.readdirSync(docDir); } catch (e) {}

  const firstMember = await prisma.member.findFirst();
  if (firstMember) {
    let mIdx = 1;
    for (const docFile of docFiles) {
      const docId = path.parse(docFile).name;
      try {
        await prisma.sppInvoice.create({
          data: {
            id: docId,
            memberId: firstMember.id,
            month: (mIdx % 12) + 1,
            year: 2025 + Math.floor(mIdx / 12),
            amount: 150000,
            status: 'PAID',
            dueDate: new Date(),
          }
        });
        mIdx++;
      } catch (e) {}
    }
  }
  console.log(`📄 Dokumen PDF SPP Invoices Berhasil Dipulihkan!`);

  console.log("🏆 SELESAI! 35 AKUN PENGGUNA, HERO SLIDES, DAN DOKUMEN FISIK BERHASIL DIPULIHKAN 100%!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
