import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Clean up body to only include updatable fields
    const { name, description, type, rarity, price, imageUrl, previewUrl, cssValue, isActive, isLimited, sortOrder } = body;

    const updatedItem = await prisma.shopItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(rarity !== undefined && { rarity }),
        ...(price !== undefined && { price: parseInt(price) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(previewUrl !== undefined && { previewUrl }),
        ...(cssValue !== undefined && { cssValue }),
        ...(isActive !== undefined && { isActive }),
        ...(isLimited !== undefined && { isLimited }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
      },
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error("[ADMIN_SHOP_PUT_ERROR]", error);
    return NextResponse.json({ error: "Gagal memperbarui item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Delete related ShopPurchase and Member equipped state references in transaction to prevent foreign key errors
    await prisma.$transaction(async (tx) => {
      // 1. Un-equip item from any members using it
      const titleItem = await tx.shopItem.findUnique({
        where: { id },
        select: { type: true }
      });

      if (titleItem) {
        if (titleItem.type === "PROFILE_FRAME") {
          await tx.member.updateMany({
            where: { activeFrameId: id },
            data: { activeFrameId: null }
          });
        } else if (titleItem.type === "TITLE") {
          await tx.member.updateMany({
            where: { activeTitleId: id },
            data: { activeTitleId: null }
          });
        } else if (titleItem.type === "THEME") {
          await tx.member.updateMany({
            where: { activeThemeId: id },
            data: { activeThemeId: null }
          });
        } else if (titleItem.type === "EMBLEM") {
          await tx.member.updateMany({
            where: { activeEmblemId: id },
            data: { activeEmblemId: null }
          });
        }
      }

      // 2. Delete all purchase records for this item
      await tx.shopPurchase.deleteMany({
        where: { itemId: id }
      });

      // 3. Delete the shop item itself
      await tx.shopItem.delete({
        where: { id }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_SHOP_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Gagal menghapus item" }, { status: 500 });
  }
}
