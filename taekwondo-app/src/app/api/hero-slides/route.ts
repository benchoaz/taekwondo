import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - public: fetch all active slides ordered by `order`
export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(slides);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - admin: create a new slide
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, caption, subtext, order, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    const slide = await prisma.heroSlide.create({
      data: {
        imageUrl,
        caption: caption || null,
        subtext: subtext || null,
        order: order !== undefined ? Number(order) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(slide, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - admin: update a slide
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, imageUrl, caption, subtext, order, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        ...(imageUrl !== undefined && { imageUrl }),
        ...(caption !== undefined && { caption }),
        ...(subtext !== undefined && { subtext }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json(slide);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - admin: delete a slide by id query param
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id query param is required" }, { status: 400 });
    }

    await prisma.heroSlide.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
