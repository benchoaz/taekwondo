import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberId, amount, description } = body;

    if (!memberId || amount === undefined || amount === 0) {
      return NextResponse.json({ error: "Member ID dan jumlah Koin (tidak boleh 0) wajib diisi" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) {
      return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
    }

    // Ensure it doesn't go below zero
    const newBalance = Math.max(0, member.dojangCoins + parseInt(amount));

    // Transaction to update balance and log it
    await prisma.$transaction([
      prisma.member.update({
        where: { id: memberId },
        data: { dojangCoins: newBalance },
      }),
      prisma.dojangCoinLog.create({
        data: {
          memberId,
          amount: parseInt(amount),
          source: "MANUAL",
          description: description || (parseInt(amount) > 0 ? "Top-up manual Admin" : "Pengurangan manual Admin"),
        },
      }),
    ]);

    return NextResponse.json({ success: true, newBalance });
  } catch (error) {
    console.error("[ADMIN_COINS_POST_ERROR]", error);
    return NextResponse.json({ error: "Gagal memproses koin" }, { status: 500 });
  }
}
