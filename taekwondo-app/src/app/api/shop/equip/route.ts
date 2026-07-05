import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId } = await req.json();
    if (!itemId) return NextResponse.json({ error: "itemId wajib diisi" }, { status: 400 });

    const member = await prisma.member.findFirst({ where: { userId }, select: { id: true } });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    // Verify ownership
    const purchase = await prisma.shopPurchase.findUnique({
      where: { memberId_itemId: { memberId: member.id, itemId } },
      include: { item: true },
    });
    if (!purchase) return NextResponse.json({ error: "Kamu belum memiliki item ini!" }, { status: 403 });

    // Map item type to the correct active field on Member
    const typeToField: Record<string, string> = {
      PROFILE_FRAME: "activeFrameId",
      TITLE: "activeTitleId",
      THEME: "activeThemeId",
      EMBLEM: "activeEmblemId",
    };
    const field = typeToField[purchase.item.type];
    if (!field) return NextResponse.json({ error: "Tipe item tidak dikenal" }, { status: 400 });

    // Update active item on member
    await prisma.member.update({
      where: { id: member.id },
      data: { [field]: itemId },
    });

    // Mark as equipped in purchase record
    await prisma.shopPurchase.update({
      where: { memberId_itemId: { memberId: member.id, itemId } },
      data: { isEquipped: true },
    });

    return NextResponse.json({
      success: true,
      message: `"${purchase.item.name}" berhasil dipasang! ✨`,
      field,
      itemId,
    });
  } catch (error) {
    console.error("[SHOP_EQUIP_ERROR]", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat memasang item" }, { status: 500 });
  }
}
