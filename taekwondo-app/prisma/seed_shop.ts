import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🛒 Seeding Gamification Shop items...");

  const items = [
    // ========================================
    // PROFILE FRAMES (BINGKAI)
    // ========================================
    {
      name: "Bingkai Sabuk Putih",
      description: "Bingkai dasar untuk para atlet yang baru memulai perjalanan Taekwondo mereka.",
      type: "PROFILE_FRAME" as const,
      rarity: "COMMON" as const,
      price: 50,
      cssValue: "2px solid #F8FAFC",
      sortOrder: 1,
    },
    {
      name: "Bingkai Sabuk Kuning",
      description: "Bingkai emas kuning cerah, simbol semangat yang mulai tumbuh.",
      type: "PROFILE_FRAME" as const,
      rarity: "COMMON" as const,
      price: 100,
      cssValue: "3px solid #FFD700",
      sortOrder: 2,
    },
    {
      name: "Bingkai Api Merah",
      description: "Bingkai gradien merah membara. Tunjukkan semangatmu yang tak pernah padam!",
      type: "PROFILE_FRAME" as const,
      rarity: "RARE" as const,
      price: 350,
      cssValue: "3px solid transparent; background: linear-gradient(#1e293b, #1e293b) padding-box, linear-gradient(135deg, #E10600, #FF6B35) border-box",
      sortOrder: 3,
    },
    {
      name: "Bingkai Neon Biru",
      description: "Bingkai dengan efek neon biru elektrik. Tampil beda di antara yang lain.",
      type: "PROFILE_FRAME" as const,
      rarity: "RARE" as const,
      price: 450,
      cssValue: "3px solid #3b82f6; box-shadow: 0 0 12px #3b82f6",
      sortOrder: 4,
    },
    {
      name: "Bingkai Ungu Champion",
      description: "Bingkai ungu kebesaran juara. Untuk mereka yang sudah melampaui batas.",
      type: "PROFILE_FRAME" as const,
      rarity: "EPIC" as const,
      price: 900,
      cssValue: "3px solid transparent; background: linear-gradient(#1e293b, #1e293b) padding-box, linear-gradient(135deg, #a855f7, #ec4899) border-box",
      sortOrder: 5,
    },
    {
      name: "Bingkai Emas Legenda",
      description: "Bingkai berkilauan emas murni. Hanya layak bagi para legenda Dojang sejati.",
      type: "PROFILE_FRAME" as const,
      rarity: "LEGENDARY" as const,
      price: 3000,
      cssValue: "3px solid transparent; background: linear-gradient(#1e293b, #1e293b) padding-box, linear-gradient(135deg, #FFD700, #FFA500, #FFD700) border-box",
      sortOrder: 6,
    },

    // ========================================
    // TITLES (GELAR)
    // ========================================
    {
      name: "Pendekar Muda",
      description: "Gelar kehormatan bagi atlet muda yang penuh potensi.",
      type: "TITLE" as const,
      rarity: "COMMON" as const,
      price: 80,
      cssValue: "#94a3b8",
      sortOrder: 10,
    },
    {
      name: "Pejuang Dojang",
      description: "Kamu bukan sekadar atlet — kamu adalah pejuang sejati Dojang ini.",
      type: "TITLE" as const,
      rarity: "RARE" as const,
      price: 300,
      cssValue: "#3b82f6",
      sortOrder: 11,
    },
    {
      name: "Guardian Dojang",
      description: "Penjaga kehormatan dan tradisi Dojang yang tak tertandingi.",
      type: "TITLE" as const,
      rarity: "EPIC" as const,
      price: 800,
      cssValue: "#a855f7",
      sortOrder: 12,
    },
    {
      name: "Pendekar Kilat ⚡",
      description: "Kecepatan adalah segalanya. Kamu bergerak seperti petir.",
      type: "TITLE" as const,
      rarity: "EPIC" as const,
      price: 1200,
      cssValue: "#eab308",
      sortOrder: 13,
    },
    {
      name: "Sang Penakluk 👑",
      description: "Tak ada rintangan yang tidak bisa kamu atasi. Legenda hidup.",
      type: "TITLE" as const,
      rarity: "LEGENDARY" as const,
      price: 2500,
      cssValue: "#FFD700",
      sortOrder: 14,
    },

    // ========================================
    // THEMES (TEMA)
    // ========================================
    {
      name: "Tema Merah Api",
      description: "Ubah warna kartu profilmu menjadi gradien merah membara khas Taekwondo.",
      type: "THEME" as const,
      rarity: "COMMON" as const,
      price: 150,
      cssValue: "linear-gradient(135deg, #7f1d1d, #991b1b)",
      sortOrder: 20,
    },
    {
      name: "Tema Samudra Biru",
      description: "Ketenangan biru samudra — tenang di luar, kuat di dalam.",
      type: "THEME" as const,
      rarity: "RARE" as const,
      price: 400,
      cssValue: "linear-gradient(135deg, #1e3a5f, #1e40af)",
      sortOrder: 21,
    },
    {
      name: "Tema Galaxy",
      description: "Tampilan luar angkasa dengan nuansa ungu dan biru kosmik.",
      type: "THEME" as const,
      rarity: "EPIC" as const,
      price: 1000,
      cssValue: "linear-gradient(135deg, #1a1040, #312e81, #4c1d95)",
      sortOrder: 22,
    },

    // ========================================
    // EMBLEMS
    // ========================================
    {
      name: "Emblem Harimau 🐯",
      description: "Lambang harimau — simbol kekuatan dan keberanian para Hwarang.",
      type: "EMBLEM" as const,
      rarity: "RARE" as const,
      price: 500,
      cssValue: "🐯",
      sortOrder: 30,
    },
    {
      name: "Emblem Naga Emas 🐉",
      description: "Naga emas — lambang kebijaksanaan dan kekuatan tertinggi dalam seni beladiri.",
      type: "EMBLEM" as const,
      rarity: "LEGENDARY" as const,
      price: 3500,
      cssValue: "🐉",
      sortOrder: 31,
    },
  ];

  for (const item of items) {
    await prisma.shopItem.upsert({
      where: { id: item.name }, // dummy, will use create path
      update: {},
      create: item,
    }).catch(async () => {
      // Fallback: just create
      const existing = await prisma.shopItem.findFirst({ where: { name: item.name } });
      if (!existing) {
        await prisma.shopItem.create({ data: item });
      }
    });
  }

  console.log(`✅ Shop seeded with ${items.length} items!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
