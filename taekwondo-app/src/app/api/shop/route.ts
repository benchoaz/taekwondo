import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await prisma.member.findFirst({
      where: { userId },
      select: { id: true, dojangCoins: true, activeFrameId: true, activeTitleId: true, activeThemeId: true, activeEmblemId: true },
    });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    // Get all active shop items
    const items = await prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { rarity: "asc" }],
    });

    // Get items this member already owns
    const purchases = await prisma.shopPurchase.findMany({
      where: { memberId: member.id },
      select: { itemId: true, isEquipped: true },
    });
    const ownedMap = new Map(purchases.map(p => [p.itemId, p.isEquipped]));

    const enriched = items.map(item => ({
      ...item,
      owned: ownedMap.has(item.id),
      equipped: ownedMap.get(item.id) ?? false,
    }));

    return NextResponse.json({
      success: true,
      wallet: member.dojangCoins,
      active: {
        frameId: member.activeFrameId,
        titleId: member.activeTitleId,
        themeId: member.activeThemeId,
        emblemId: member.activeEmblemId,
      },
      items: enriched,
    });
  } catch (error) {
    console.error("[SHOP_GET_ERROR]", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
