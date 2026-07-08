import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.shopItem.findMany({
      orderBy: [
        { type: "asc" },
        { sortOrder: "asc" }
      ],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[ADMIN_SHOP_GET_ERROR]", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, type, rarity, price, imageUrl, previewUrl, cssValue, sortOrder } = body;

    if (!name || !type || price === undefined) {
      return NextResponse.json({ error: "Nama, Tipe, dan Harga wajib diisi" }, { status: 400 });
    }

    const newItem = await prisma.shopItem.create({
      data: {
        name,
        description,
        type,
        rarity: rarity || "COMMON",
        price: parseInt(price),
        imageUrl,
        previewUrl,
        cssValue,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      }
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    console.error("[ADMIN_SHOP_POST_ERROR]", error);
    return NextResponse.json({ error: "Gagal membuat item baru" }, { status: 500 });
  }
}
