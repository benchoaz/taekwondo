import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (it automatically uses CLOUDINARY_URL from env if available)
// Or we can manually configure it if CLOUDINARY_CLOUD_NAME is present
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

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. CLOUDINARY UPLOAD (If configured)
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      return new Promise<NextResponse>((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "taekwondo_dojang" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary error:", error);
              resolve(NextResponse.json({ error: 'Cloud upload failed' }, { status: 500 }));
            } else {
              resolve(NextResponse.json({ success: true, url: result?.secure_url }));
            }
          }
        );
        // End stream with buffer
        uploadStream.end(buffer);
      });
    }

    // 2. LOCAL STORAGE FALLBACK (If Cloudinary is NOT configured)
    const crypto = require('crypto');
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    // Strict extension allowlist
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'pdf'];
    if (!ext || !allowedExtensions.includes(ext)) {
      return NextResponse.json({ error: 'Format file tidak diizinkan.' }, { status: 400 });
    }

    // Generate secure random UUID filename to prevent traversal attacks
    const secureFilename = `${crypto.randomUUID()}.${ext}`;
    const path = join(process.cwd(), 'public', 'uploads', secureFilename);

    await writeFile(path, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${secureFilename}`,
      note: "Stored locally (Cloudinary not configured)"
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: error.message || 'Error uploading file' }, { status: 500 });
  }
}
