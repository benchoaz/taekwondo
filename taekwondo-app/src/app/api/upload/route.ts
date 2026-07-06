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

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type = (data.get('type') as string) || 'general'; // e.g., 'profile', 'gallery', 'document', 'video', 'payment', 'identity'

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get original extension and check validity
    const originalExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'mp4', 'mov', 'avi', 'mkv', 'webm', 'webp'];
    
    if (!originalExt || !allowedExtensions.includes(originalExt)) {
      return NextResponse.json({ error: 'Format file tidak diizinkan.' }, { status: 400 });
    }

    const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(originalExt);
    const isVideo = ['mp4', 'mov', 'webm'].includes(originalExt);
    const isDocument = ['pdf'].includes(originalExt);

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

    // --- HYBRID LOGIC ---
    // Public images go to Cloudinary (if configured)
    const isPublicImage = isImage && (type === 'profile' || type === 'gallery');
    
    if (isPublicImage && process.env.CLOUDINARY_CLOUD_NAME) {
      const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: `taekwondo_dojang/${type}` },
          (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url || "");
          }
        );
        uploadStream.end(buffer); // Send original buffer to Cloudinary, they optimize it
      });

      const media = await prisma.media.create({
        data: {
          originalName: file.name,
          storedName: `cloudinary-${crypto.randomUUID()}`,
          mimeType: file.type,
          sizeBytes: buffer.length,
          path: cloudinaryUrl, // Just store the URL in path
          url: cloudinaryUrl,
        }
      });

      return NextResponse.json({ success: true, url: cloudinaryUrl, mediaId: media.id });
    }

    // --- LOCAL VPS STORAGE (Sensitive files, Videos, or Cloudinary Fallback) ---
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
