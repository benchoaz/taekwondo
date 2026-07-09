import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== "MEMBER") {
      return NextResponse.json(
        { error: "Forbidden: Hanya Member yang dapat mengakses profil atlet" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan dalam form data" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap upload JPEG, PNG, atau WEBP." },
        { status: 400 }
      );
    }

    // Storage path from environment variable, fallback to local path for dev
    const storagePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');
    
    // Ensure storage directory exists
    try {
      await fs.access(storagePath);
    } catch {
      await fs.mkdir(storagePath, { recursive: true });
    }

    // Create unique filename
    const extension = file.name.split('.').pop() || 'png';
    const filename = `profile_${userId}_${Date.now()}.${extension}`;
    const filePath = path.join(storagePath, filename);

    // Write file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Public URL to access the image
    const publicUrl = `/api/storage/${filename}`;

    // Update user image in DB
    await prisma.user.update({
      where: { id: userId },
      data: { image: publicUrl }
    });

    return NextResponse.json({
      success: true,
      message: "Foto profil berhasil diperbarui",
      data: {
        profilePictureUrl: publicUrl
      }
    });

  } catch (error: any) {
    console.error("[POST_PROFILE_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat mengunggah foto profil" },
      { status: 500 }
    );
  }
}
