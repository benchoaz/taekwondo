import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberId, amount, description } = body;

    if (!memberId || amount === undefined || amount === 0) {
      return NextResponse.json({ error: "Member ID dan jumlah Koin (tidak boleh 0) wajib diisi" }, { status: 400 });
    }

    // Cari member berdasarkan ID database (UUID), memberNumber (WTK-xxxx), atau email/username
    let member = await prisma.member.findFirst({
      where: {
        OR: [
          { id: memberId },
          { memberNumber: memberId },
          { user: { email: memberId } },
          { user: { name: memberId } }
        ]
      },
      include: { user: true }
    });

    if (!member) {
      return NextResponse.json({ error: "Member tidak ditemukan. Masukkan nomor member (WTK-xxxx), email, atau username dengan benar." }, { status: 404 });
    }

    const resolvedMemberId = member.id;

    // Ensure it doesn't go below zero
    const newBalance = Math.max(0, member.dojangCoins + parseInt(amount));

    // Transaction to update balance and log it
    await prisma.$transaction([
      prisma.member.update({
        where: { id: resolvedMemberId },
        data: { dojangCoins: newBalance },
      }),
      prisma.dojangCoinLog.create({
        data: {
          memberId: resolvedMemberId,
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
