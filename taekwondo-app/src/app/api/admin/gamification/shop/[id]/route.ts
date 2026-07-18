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
    
    // Check if it's currently purchased by anyone (optional logic, but safe to just delete and let cascade handle it if DB allows)
    await prisma.shopItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_SHOP_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Gagal menghapus item" }, { status: 500 });
  }
}
