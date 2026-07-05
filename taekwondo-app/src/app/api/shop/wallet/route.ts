import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await prisma.member.findFirst({
      where: { userId },
      select: {
        id: true,
        dojangCoins: true,
        coinLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { amount: true, source: true, description: true, createdAt: true },
        },
      },
    });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      balance: member.dojangCoins,
      history: member.coinLogs,
    });
  } catch (error) {
    console.error("[WALLET_GET_ERROR]", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
