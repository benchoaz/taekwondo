import { NextResponse, NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { getWahaStatus, getWahaAuthQr } from "@/lib/whatsapp";

export async function GET(request: NextRequest) {
  try {
    // 1. Authorization
    let tokenStr = request.cookies.get('auth_token')?.value;
    if (!tokenStr) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        tokenStr = authHeader.substring(7);
      }
    }
    
    if (!tokenStr) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let adminPayload;
    try {
      adminPayload = await verifyJWT<{userId: string, role: string}>(tokenStr);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (adminPayload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Fetch Status
    const statusData = await getWahaStatus();
    
    // 3. If waiting for QR, fetch QR
    let qrData = null;
    if (statusData.status === "SCAN_QR_CODE") {
       qrData = await getWahaAuthQr();
    }

    return NextResponse.json({ 
      success: true, 
      status: statusData.status,
      qrCode: qrData?.data ? `data:${qrData.mimetype || 'image/png'};base64,${qrData.data}` : null
    });

  } catch (error: any) {
    console.error("WAHA Status Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
