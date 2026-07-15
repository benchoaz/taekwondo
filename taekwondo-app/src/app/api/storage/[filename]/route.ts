import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    if (!filename) {
      return new NextResponse("Filename is required", { status: 400 });
    }

    // Path to storage directory
    const storagePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');
    const filePath = path.join(storagePath, filename);

    try {
      // Check if file exists
      await fs.access(filePath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    // Read the file
    const fileBuffer = await fs.readFile(filePath);

    // Determine content type based on extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';

    // Return the file as response
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error("[GET_STORAGE_FILE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
