import { prisma } from './prisma';

export async function seedDatabase() {
  // Clear existing
  await prisma.payment.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.uktParticipant.deleteMany({});
  await prisma.uktExam.deleteMany({});
  await prisma.beltHistory.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.coach.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.gallery.deleteMany({});
  await prisma.article.deleteMany({});

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('password123', 10);

  // Seed Users
  const userAdmin = await prisma.user.create({
    data: {
      email: 'admin@taekwondo.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const userCoach = await prisma.user.create({
    data: {
      email: 'coach.ahmad@taekwondo.com',
      password: userPassword,
      role: 'COACH',
    },
  });

  const userMember = await prisma.user.create({
    data: {
      email: 'member.beni@taekwondo.com',
      password: userPassword,
      role: 'MEMBER',
    },
  });

  // Seed Coach Details
  const coach = await prisma.coach.create({
    data: {
      userId: userCoach.id,
      fullName: 'Master Ahmad S.B.',
      danRank: 'Dan 5 Black Belt',
      specialty: 'Poomsae & Kyorugi Specialist',
      experience: '15 Tahun Pengalaman',
    },
  });

  // Seed Member Details
  const member = await prisma.member.create({
    data: {
      userId: userMember.id,
      fullName: 'Beni Setiawan',
      memberNumber: 'TKD-2026-0089',
      currentBelt: 'Biru Strip Merah (4 Geup)',
      progress: 75,
    },
  });

  // Seed Belt History
  await prisma.beltHistory.createMany({
    data: [
      {
        memberId: member.id,
        fromBelt: 'Sabuk Putih (10 Geup)',
        toBelt: 'Sabuk Kuning (8 Geup)',
        promotedAt: new Date('2024-03-15'),
      },
      {
        memberId: member.id,
        fromBelt: 'Sabuk Kuning (8 Geup)',
        toBelt: 'Sabuk Hijau (6 Geup)',
        promotedAt: new Date('2024-10-20'),
      },
      {
        memberId: member.id,
        fromBelt: 'Sabuk Hijau (6 Geup)',
        toBelt: 'Biru Strip Merah (4 Geup)',
        promotedAt: new Date('2025-05-10'),
      },
    ],
  });

  // Seed UKT Exam
  const exam = await prisma.uktExam.create({
    data: {
      title: 'Ujian Kenaikan Tingkat (UKT) Semester I 2026',
      date: new Date('2026-07-15T09:00:00.000Z'),
      location: 'Dojang Pusat Taekwondo Academy, Jakarta',
      examinerId: coach.id,
      status: 'UPCOMING',
    },
  });

  // Seed UktParticipant
  await prisma.uktParticipant.create({
    data: {
      uktExamId: exam.id,
      memberId: member.id,
      targetBelt: 'Sabuk Merah (2 Geup)',
      status: 'PENDING',
      poomsaeScore: 0,
      kyorugiScore: 0,
      basicTechScore: 0,
      physicalScore: 0,
      theoryScore: 0,
    },
  });

  // Seed some active verified certificates
  await prisma.certificate.create({
    data: {
      memberId: member.id,
      certNumber: 'CERT-2025-0482',
      oldBelt: 'Sabuk Hijau (6 Geup)',
      newBelt: 'Biru Strip Merah (4 Geup)',
      issueDate: new Date('2025-05-10'),
      qrCodeUrl: '/verify-certificate/CERT-2025-0482',
      isValid: true,
    },
  });

  // Seed Articles
  await prisma.article.createMany({
    data: [
      {
        title: 'Pentingnya Fleksibilitas dalam Taekwondo',
        content: 'Fleksibilitas tubuh sangat penting untuk menunjang performa tendangan tinggi...',
        author: 'Master Ahmad S.B.',
      },
      {
        title: 'Filosofi Sabuk Taekwondo dari Putih ke Hitam',
        content: 'Setiap warna sabuk memiliki arti dan tingkatan pemahaman tersendiri...',
        author: 'Master Ahmad S.B.',
      },
    ],
  });

  // Seed Gallery Items
  await prisma.gallery.createMany({
    data: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=800&q=80',
        category: 'LATIHAN',
        title: 'Latihan Rutin Kelas Dewasa',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
        category: 'KEJUARAAN',
        title: 'Kejuaraan Daerah Banten 2025',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=800&q=80',
        category: 'UKT',
        title: 'Pelaksanaan UKT Periode Akhir 2025',
      },
    ],
  });

  console.log('Database successfully seeded!');
}
