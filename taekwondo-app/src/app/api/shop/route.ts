import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get member — if not found, still show shop items (guest preview)
    const member = await prisma.member.findFirst({
      where: { userId },
      select: { id: true, dojangCoins: true, activeFrameId: true, activeTitleId: true, activeThemeId: true, activeEmblemId: true },
    });

    // Get all active shop items — always return even if member not yet set up
    const items = await prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }],
    });

    if (!member) {
      // Return items without ownership data
      return NextResponse.json({
        success: true,
        wallet: 0,
        active: { frameId: null, titleId: null, themeId: null, emblemId: null },
        items: items.map(item => ({ ...item, owned: false, equipped: false })),
      });
    }

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
