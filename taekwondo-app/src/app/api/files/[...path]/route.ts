import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyJWT } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: filePathArray } = await params;
  const relativePath = filePathArray.join("/");
  
  // Storage base path - fallback to local project storage if not defined
  const storageBasePath = process.env.STORAGE_PATH || path.join(process.cwd(), "storage");
  const absolutePath = path.join(storageBasePath, relativePath);

  // Security: Anti Directory Traversal
  if (!absolutePath.startsWith(storageBasePath)) {
    return new NextResponse("Access Denied", { status: 403 });
  }

  // Security: Check if file exists
  if (!fs.existsSync(absolutePath)) {
    return new NextResponse("File Not Found", { status: 404 });
  }

  // Access Control for sensitive directories
  const sensitiveDirs = ["documents/identity", "images/payments", "videos/exams"];
  const isSensitive = sensitiveDirs.some(dir => relativePath.startsWith(dir));
  
  if (isSensitive) {
    let tokenStr = request.cookies.get('auth_token')?.value;
    if (!tokenStr) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        tokenStr = authHeader.substring(7);
      }
    }
    
    if (!tokenStr) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
      await verifyJWT(tokenStr);
    } catch (e) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  const stat = fs.statSync(absolutePath);
  const ext = path.extname(absolutePath).toLowerCase();
  
  let contentType = "application/octet-stream";
  if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
  else if (ext === ".png") contentType = "image/png";
  else if (ext === ".webp") contentType = "image/webp";
  else if (ext === ".pdf") contentType = "application/pdf";
  else if (ext === ".mp4") contentType = "video/mp4";
  else if (ext === ".webm") contentType = "video/webm";
  else if (ext === ".mov") contentType = "video/quicktime";

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  // Handle Video Range Requests
  const range = request.headers.get("range");
  if (range && (contentType.startsWith("video/") || contentType.startsWith("audio/"))) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    
    if (start >= stat.size || end >= stat.size) {
      headers.set("Content-Range", `bytes */${stat.size}`);
      return new NextResponse(null, { status: 416, headers });
    }

    const chunksize = (end - start) + 1;
    const fileStream = fs.createReadStream(absolutePath, { start, end });
    
    headers.set("Content-Range", `bytes ${start}-${end}/${stat.size}`);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Length", chunksize.toString());

    // @ts-ignore
    return new NextResponse(fileStream, { status: 206, headers });
  }

  // Standard File Stream
  headers.set("Content-Length", stat.size.toString());
  const fileStream = fs.createReadStream(absolutePath);
  
  // @ts-ignore
  return new NextResponse(fileStream, { status: 200, headers });
}
