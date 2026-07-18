import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  let messages = [];
  try {
    // 1. Tambah kolom registration_start jika belum ada
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "UktExam" 
      ADD COLUMN IF NOT EXISTS "registration_start" TIMESTAMP NOT NULL DEFAULT NOW()
    `);
    messages.push("Added registration_start column if not exists.");

    // 2. Tambah kolom registration_end jika belum ada
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "UktExam" 
      ADD COLUMN IF NOT EXISTS "registration_end" TIMESTAMP NOT NULL DEFAULT NOW()
    `);
    messages.push("Added registration_end column if not exists.");

    // 3. Tambah Item Toko Bingkai Baru (Bulat Neon) jika belum ada
    const existingNeonRed = await prisma.shopItem.findFirst({
      where: { name: "Bingkai Neon Merah (Bulat)" }
    });

    if (!existingNeonRed) {
      await prisma.shopItem.create({
        data: {
          name: "Bingkai Neon Merah (Bulat)",
          description: "Bingkai melingkar bersinar pendaran merah neon premium.",
          price: 150,
          type: "PROFILE_FRAME",
          imageUrl: "https://api.dicebear.com/7.x/identicon/png?seed=RedFrame", // Placeholder frame image
          cssValue: "border: 3px solid #ef4444; border-radius: 50%; box-shadow: 0 0 12px #ef4444;",
          isActive: true
        }
      });
      messages.push("Created shop item: Bingkai Neon Merah (Bulat).");
    }

    const existingNeonBlue = await prisma.shopItem.findFirst({
      where: { name: "Bingkai Neon Biru (Bulat)" }
    });

    if (!existingNeonBlue) {
      await prisma.shopItem.create({
        data: {
          name: "Bingkai Neon Biru (Bulat)",
          description: "Bingkai melingkar bersinar pendaran biru neon elektrik.",
          price: 150,
          type: "PROFILE_FRAME",
          imageUrl: "https://api.dicebear.com/7.x/identicon/png?seed=BlueFrame",
          cssValue: "border: 3px solid #3b82f6; border-radius: 50%; box-shadow: 0 0 12px #3b82f6;",
          isActive: true
        }
      });
      messages.push("Created shop item: Bingkai Neon Biru (Bulat).");
    }

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
