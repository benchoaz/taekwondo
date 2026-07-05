import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId } = await req.json();
    if (!itemId) return NextResponse.json({ error: "itemId wajib diisi" }, { status: 400 });

    const member = await prisma.member.findFirst({ where: { userId }, select: { id: true, dojangCoins: true } });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
    if (!item || !item.isActive) return NextResponse.json({ error: "Item tidak ditemukan atau tidak tersedia" }, { status: 404 });

    // Check already owned
    const existing = await prisma.shopPurchase.findUnique({
      where: { memberId_itemId: { memberId: member.id, itemId } },
    });
    if (existing) return NextResponse.json({ error: "Kamu sudah memiliki item ini!" }, { status: 400 });

    // Check balance
    if (member.dojangCoins < item.price) {
      return NextResponse.json({
        error: `Dojang Coin tidak cukup! Kamu punya ${member.dojangCoins} DC, item ini butuh ${item.price} DC.`,
      }, { status: 400 });
    }

    // Transaction: deduct coins, create purchase, log
    const [purchase] = await prisma.$transaction([
      prisma.shopPurchase.create({
        data: { memberId: member.id, itemId, pricePaid: item.price },
      }),
      prisma.member.update({
        where: { id: member.id },
        data: { dojangCoins: { decrement: item.price } },
      }),
      prisma.dojangCoinLog.create({
        data: {
          memberId: member.id,
          amount: -item.price,
          source: "PURCHASE",
          referenceId: itemId,
          description: `Membeli "${item.name}" dari Toko Dojang`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Selamat! "${item.name}" berhasil dibeli! 🎉`,
      remaining: member.dojangCoins - item.price,
    });
  } catch (error) {
    console.error("[SHOP_BUY_ERROR]", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat membeli item" }, { status: 500 });
  }
}
