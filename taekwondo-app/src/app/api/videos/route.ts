import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Ambil daftar video (publik atau admin/coach)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const whereCondition: any = {};
    if (!all) {
      whereCondition.isActive = true;
    }

    const videos = await (prisma as any).video.findMany({
      where: whereCondition,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(videos, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ error: "Gagal mengambil daftar video" }, { status: 500 });
  }
}

// POST: Tambah video baru (Admin atau Pelatih)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, youtubeUrl, category, description, authorName, order } = body;

    if (!title || !youtubeUrl) {
      return NextResponse.json({ error: "Judul dan URL YouTube wajib diisi" }, { status: 400 });
    }

    // Bersihkan URL YouTube
    const cleanUrl = youtubeUrl.trim();

    const video = await (prisma as any).video.create({
      data: {
        title: title.trim(),
        youtubeUrl: cleanUrl,
        category: category || "DOKUMENTASI",
        description: description ? description.trim() : null,
        authorName: authorName ? authorName.trim() : "Admin/Pelatih",
        order: order !== undefined ? Number(order) : 0,
        isActive: true,
      }
    });

    return NextResponse.json({ success: true, data: video });
  } catch (error: any) {
    console.error("Error creating video:", error);
    return NextResponse.json({ error: "Gagal menyimpan video: " + (error?.message || "Internal error") }, { status: 500 });
  }
}

// PUT: Update video
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, youtubeUrl, category, description, isActive, order } = body;

    if (!id) {
      return NextResponse.json({ error: "ID video diperlukan" }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl.trim();
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (order !== undefined) updateData.order = Number(order);

    const video = await (prisma as any).video.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: video });
  } catch (error: any) {
    console.error("Error updating video:", error);
    return NextResponse.json({ error: "Gagal memperbarui video" }, { status: 500 });
  }
}

// DELETE: Hapus video
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: "ID video diperlukan" }, { status: 400 });
    }

    await (prisma as any).video.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Video berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting video:", error);
    return NextResponse.json({ error: "Gagal menghapus video" }, { status: 500 });
  }
}
