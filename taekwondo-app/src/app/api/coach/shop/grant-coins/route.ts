import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Coach/Admin: grant Dojang Coins manually to a member (e.g., tournament winner)
export async function POST(req: NextRequest) {
  try {
    const userRole = req.headers.get("x-user-role");
    if (userRole !== "COACH" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { memberId, amount, description } = await req.json();
    if (!memberId || !amount) {
      return NextResponse.json({ error: "memberId dan amount wajib diisi" }, { status: 400 });
    }
    const coins = parseInt(amount);
    if (coins <= 0) return NextResponse.json({ error: "Amount harus positif" }, { status: 400 });

    const [updated] = await prisma.$transaction([
      prisma.member.update({
        where: { id: memberId },
        data: { dojangCoins: { increment: coins } },
      }),
      prisma.dojangCoinLog.create({
        data: {
          memberId,
          amount: coins,
          source: "MANUAL",
          description: description || `Koin manual dari Pelatih (+${coins} DC)`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, newBalance: updated.dojangCoins });
  } catch (error) {
    console.error("[GRANT_COINS_ERROR]", error);
    return NextResponse.json({ error: "Gagal memberikan koin" }, { status: 500 });
  }
}
