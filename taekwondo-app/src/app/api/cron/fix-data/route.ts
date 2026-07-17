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

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
