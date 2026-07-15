import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || (userRole !== "COACH" && userRole !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden: Hanya Pelatih dan Admin yang berhak menghapus misi." },
        { status: 403 }
      );
    }

    // Menghapus dependencies di requirements (karena cascade mungkin belum diset)
    await prisma.questRequirement.deleteMany({
      where: { questId: id }
    });

    // Menghapus misi itu sendiri
    await prisma.questLibrary.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: "Misi berhasil dihapus dari sistem."
    });

  } catch (error: any) {
    console.error("[DELETE_QUEST_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem saat menghapus misi." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || (userRole !== "COACH" && userRole !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden: Hanya Pelatih dan Admin yang berhak mengedit misi." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, category, baseXp, minAge, maxAge, allowedBeltIds, requireVideo, videoUrl, readingContent, quizQuestions, frequency, isActive } = body;

    // Update quest
    const updatedQuest = await prisma.questLibrary.update({
      where: { id: id },
      data: {
        title,
        description,
        category,
        baseXp: parseInt(baseXp),
        requireVideo: requireVideo ?? false,
        videoUrl: videoUrl || null,
        readingContent: readingContent || null,
        quizQuestions: quizQuestions || null,
        frequency: frequency || "ONE_TIME",
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    // Update requirements (delete old, create new)
    await prisma.questRequirement.deleteMany({
      where: { questId: id }
    });
    
    await prisma.questRequirement.create({
      data: {
        questId: id,
        minAge: minAge ? parseInt(minAge) : 0,
        maxAge: maxAge ? parseInt(maxAge) : 99,
        allowedBeltIds: allowedBeltIds || [],
      }
    });

    return NextResponse.json({
      success: true,
      message: "Misi berhasil diperbarui!",
      data: updatedQuest
    });

  } catch (error: any) {
    console.error("[PUT_QUEST_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem saat mengedit misi." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const quest = await prisma.questLibrary.findUnique({
      where: { id: id },
      include: { requirements: true }
    });

    if (!quest) {
      return NextResponse.json({ error: "Misi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: quest
    });
  } catch (error: any) {
    console.error("[GET_QUEST_BY_ID_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem saat mengambil data misi." },
      { status: 500 }
    );
  }
}
