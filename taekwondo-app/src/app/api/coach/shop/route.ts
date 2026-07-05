import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Coach/Admin: full CRUD for shop items
export async function GET(req: NextRequest) {
  try {
    const userRole = req.headers.get("x-user-role");
    if (userRole !== "COACH" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const items = await prisma.shopItem.findMany({
      orderBy: [{ sortOrder: "asc" }],
      include: { _count: { select: { purchases: true } } },
    });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("[COACH_SHOP_GET_ERROR]", error);
    return NextResponse.json({ error: "Gagal mengambil item toko" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userRole = req.headers.get("x-user-role");
    if (userRole !== "COACH" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { name, description, type, rarity, price, cssValue, imageUrl, isLimited, sortOrder } = body;
    if (!name || !type || !rarity || !price) {
      return NextResponse.json({ error: "Nama, tipe, rarity, dan harga wajib diisi" }, { status: 400 });
    }
    const item = await prisma.shopItem.create({
      data: { name, description, type, rarity, price: parseInt(price), cssValue, imageUrl, isLimited: isLimited ?? false, sortOrder: sortOrder ?? 0 },
    });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("[COACH_SHOP_POST_ERROR]", error);
    return NextResponse.json({ error: "Gagal membuat item" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userRole = req.headers.get("x-user-role");
    if (userRole !== "COACH" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    if (data.price) data.price = parseInt(data.price);
    const item = await prisma.shopItem.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("[COACH_SHOP_PUT_ERROR]", error);
    return NextResponse.json({ error: "Gagal mengupdate item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userRole = req.headers.get("x-user-role");
    if (userRole !== "COACH" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    await prisma.shopItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COACH_SHOP_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Gagal menghapus item" }, { status: 500 });
  }
}

// POST /api/coach/shop/grant-coins — berikan koin manual ke murid
export { grantCoins as POST2 };
async function grantCoins() { return NextResponse.json({ error: "Use /api/coach/shop/grant-coins" }); }
