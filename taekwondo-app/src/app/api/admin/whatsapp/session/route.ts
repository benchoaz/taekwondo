import { NextResponse, NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { startWahaSession, stopWahaSession } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    let tokenStr = request.cookies.get('auth_token')?.value;
    if (!tokenStr) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        tokenStr = authHeader.substring(7);
      }
    }
    
    if (!tokenStr) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminPayload = await verifyJWT<{userId: string, role: string}>(tokenStr);
    if (adminPayload.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const success = await startWahaSession();
    if (success) {
        return NextResponse.json({ success: true, message: "Session started." });
    }
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    try {
      let tokenStr = request.cookies.get('auth_token')?.value;
      if (!tokenStr) {
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          tokenStr = authHeader.substring(7);
        }
      }
      
      if (!tokenStr) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
      const adminPayload = await verifyJWT<{userId: string, role: string}>(tokenStr);
      if (adminPayload.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  
      const success = await stopWahaSession();
      if (success) {
          return NextResponse.json({ success: true, message: "Session stopped." });
      }
      return NextResponse.json({ error: "Failed to stop session" }, { status: 500 });
    } catch (error: any) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
