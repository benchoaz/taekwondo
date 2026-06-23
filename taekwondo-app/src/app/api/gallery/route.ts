import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const galleryItems = await prisma.gallery.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(galleryItems);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, imageUrl, category, title } = body;

    // If ID exists, update, otherwise create
    if (id) {
      const item = await prisma.gallery.update({
        where: { id },
        data: { imageUrl, category, title },
      });
      return NextResponse.json(item);
    } else {
      const item = await prisma.gallery.create({
        data: { imageUrl, category, title },
      });
      return NextResponse.json(item);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.gallery.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
