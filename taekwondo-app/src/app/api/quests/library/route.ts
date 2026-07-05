import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QuestCategory } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    // Membaca identitas Pelatih/Admin dari Middleware
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    // Keamanan Ketat: Tendang jika bukan Pelatih atau Admin
    if (!userId || (userRole !== "COACH" && userRole !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden: Hanya Pelatih dan Admin yang berhak membuat misi." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, category, baseXp, minAge, maxAge, allowedBeltIds, requireVideo } = body;

    // Validasi data kosong
    if (!title || !category || !baseXp) {
      return NextResponse.json(
        { error: "Judul, kategori, dan XP wajib diisi." },
        { status: 400 }
      );
    }

    // Menyuntikkan Misi Baru ke dalam Database QuestLibrary
    const newQuest = await prisma.questLibrary.create({
      data: {
        title: title,
        description: description,
        category: category as QuestCategory,
        baseXp: parseInt(baseXp),
        requireVideo: requireVideo ?? false,
        requirements: {
          create: {
            minAge: minAge ? parseInt(minAge) : 0,
            maxAge: maxAge ? parseInt(maxAge) : 99,
            allowedBeltIds: allowedBeltIds || [],
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Misi berhasil ditambahkan ke dalam database!",
      data: newQuest
    });

  } catch (error: any) {
    console.error("[POST_QUEST_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem saat menyimpan misi." },
      { status: 500 }
    );
  }
}
