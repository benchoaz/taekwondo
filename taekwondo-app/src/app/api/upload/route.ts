import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type = (data.get('type') as string) || 'general'; // e.g., 'profile', 'gallery', 'document', 'video', 'payment', 'identity'

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    console.log("UPLOAD API - Received file details:", {
      name: file.name,
      type: file.type,
      size: file.size,
      constructor: file.constructor ? file.constructor.name : 'Unknown'
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log("UPLOAD API - Buffer length:", buffer.length);

    // Get original extension and check validity
    const originalExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'mp4', 'mov', 'avi', 'mkv', 'webm', 'webp'];
    
    if (!originalExt || !allowedExtensions.includes(originalExt)) {
      return NextResponse.json({ error: 'Format file tidak diizinkan.' }, { status: 400 });
    }

    const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(originalExt);
    const isVideo = ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(originalExt);
    const isDocument = ['pdf'].includes(originalExt);

    // --- BATAS UKURAN FILE ---
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10MB untuk gambar
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB untuk video quest
    const MAX_DOC_SIZE   = 5 * 1024 * 1024;   // 5MB untuk dokumen

    if (isImage && buffer.length > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Ukuran gambar maksimal 10MB.' }, { status: 400 });
    }
    if (isVideo && buffer.length > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: 'Ukuran video maksimal 100MB.' }, { status: 400 });
    }
    if (isDocument && buffer.length > MAX_DOC_SIZE) {
      return NextResponse.json({ error: 'Ukuran dokumen maksimal 5MB.' }, { status: 400 });
    }

    let finalBuffer = buffer;
    let finalExt = originalExt;
    let mimeType = file.type;

    // Optional Image optimization for local storage: convert to WebP
    if (isImage && originalExt !== 'gif') {
      finalBuffer = await sharp(buffer)
        .webp({ quality: 80 })
        .toBuffer();
      finalExt = 'webp';
      mimeType = 'image/webp';
    }

    // ================================================================
    // HYBRID STORAGE LOGIC
    // - Foto profil & galeri     → Cloudinary CDN (akses cepat global)
    // - Video quest (insidentil) → Cloudinary CDN (hemat disk VPS)
    // - Dokumen sensitif (KTP, bukti bayar) → VPS Lokal (privat)
    // ================================================================

    const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME;

    // --- CLOUDINARY: Foto publik (profil, galeri) ---
    const isPublicImage = isImage && (type === 'profile' || type === 'gallery');

    if (isPublicImage && useCloudinary) {
      const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: `taekwondo_dojang/${type}`, tags: [type] },
          (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url || "");
          }
        );
        uploadStream.end(buffer);
      });

      const media = await prisma.media.create({
        data: {
          originalName: file.name,
          storedName: `cloudinary-${crypto.randomUUID()}`,
          mimeType: file.type,
          sizeBytes: buffer.length,
          path: cloudinaryUrl,
          url: cloudinaryUrl,
        }
      });

      return NextResponse.json({ success: true, url: cloudinaryUrl, mediaId: media.id });
    }

    // --- CLOUDINARY: Video Quest (Insidentil) ---
    // Video quest bersifat sementara → simpan di Cloudinary, hemat disk VPS
    // Pelatih bisa review di dashboard, setelah verifikasi tidak perlu disimpan lama
    const isQuestVideo = isVideo && (type === 'video' || type === 'quest');

    if (isQuestVideo && useCloudinary) {
      console.log("UPLOAD API - Uploading quest video to Cloudinary CDN...");
      const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'taekwondo_dojang/quests',
            resource_type: 'video',
            // Auto-compress video: hemat bandwidth saat pelatih review
            transformation: [{ quality: 'auto' }],
            tags: ['quest_submission'], // Tag untuk manajemen/cleanup nanti
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url || "");
          }
        );
        uploadStream.end(buffer);
      });

      const media = await prisma.media.create({
        data: {
          originalName: file.name,
          storedName: `cloudinary-quest-${crypto.randomUUID()}`,
          mimeType: file.type,
          sizeBytes: buffer.length,
          path: cloudinaryUrl,
          url: cloudinaryUrl,
        }
      });

      console.log("UPLOAD API - Quest video uploaded to Cloudinary:", cloudinaryUrl);
      return NextResponse.json({ success: true, url: cloudinaryUrl, mediaId: media.id });
    }

    // --- VPS LOKAL: File Sensitif (KTP, Bukti Bayar, Dokumen, dll) ---
    // File yang bersifat privat dan tidak perlu CDN tetap di VPS
    const secureFilename = `${crypto.randomUUID()}.${finalExt}`;
    
    // Determine path based on type
    let subDir = 'misc';
    if (isImage) {
      if (type === 'identity') subDir = 'documents/identity';
      else if (type === 'payment') subDir = 'images/payments';
      else if (type === 'profile') subDir = 'images/profiles';
      else subDir = 'images/general';
    } else if (isVideo) {
      if (type === 'exam') subDir = 'videos/exams';
      else subDir = 'videos/general';
    } else if (isDocument) {
      if (type === 'identity') subDir = 'documents/identity';
      else subDir = 'documents/general';
    }

    // Storage base path
    const storageBasePath = process.env.STORAGE_PATH || join(process.cwd(), "storage");
    const relativePath = join(subDir, secureFilename);
    const absolutePath = join(storageBasePath, relativePath);

    // Ensure directory exists
    await mkdir(dirname(absolutePath), { recursive: true });

    // Write file to physical storage
    await writeFile(absolutePath, finalBuffer);

    const publicUrl = `/api/files/${relativePath.replace(/\\/g, '/')}`;

    // Create database record
    const media = await prisma.media.create({
      data: {
        originalName: file.name,
        storedName: secureFilename,
        mimeType: mimeType,
        sizeBytes: finalBuffer.length,
        path: relativePath.replace(/\\/g, '/'),
        url: publicUrl,
      }
    });

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      mediaId: media.id
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: error.message || 'Error uploading file' }, { status: 500 });
  }
}
