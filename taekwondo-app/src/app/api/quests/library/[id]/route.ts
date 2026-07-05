import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || (userRole !== "COACH" && userRole !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden: Hanya Pelatih dan Admin yang berhak menghapus misi." },
        { status: 403 }
      );
    }

    const { id } = params;

    // Menghapus dependencies di requirements (karena cascade mungkin belum diset)
    await prisma.questLibraryRequirement.deleteMany({
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
