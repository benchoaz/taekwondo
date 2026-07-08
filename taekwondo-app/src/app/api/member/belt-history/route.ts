import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the member profile
    const member = await prisma.member.findUnique({
      where: { userId: userId }
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const mId = searchParams.get('memberId');
    
    // If Admin wants to fetch a specific member, we allow it. But for now, we only fetch for logged in member
    const targetMemberId = mId && userRole !== "MEMBER" ? mId : member.id;

    const history = await prisma.beltHistory.findMany({
      where: { memberId: targetMemberId },
      orderBy: { promotedAt: "desc" },
    });

    return NextResponse.json(history);
  } catch (error: any) {
    console.error("GET /api/member/belt-history error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { historyId, certUrl } = body;

    if (!historyId || !certUrl) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Get the history item to verify ownership
    const historyItem = await prisma.beltHistory.findUnique({
      where: { id: historyId },
      include: { member: true }
    });

    if (!historyItem) {
      return NextResponse.json({ error: "History not found" }, { status: 404 });
    }

    // Security check: Only the owner or an admin can upload
    if (historyItem.member.userId !== userId && userRole === "MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create Certificate record
    const newCertificate = await prisma.certificate.create({
      data: {
        memberId: historyItem.memberId,
        certNumber: `CERT-UPL-${Date.now()}`,
        oldBelt: historyItem.fromBelt,
        newBelt: historyItem.toBelt,
        qrCodeUrl: certUrl,
        issueDate: new Date()
      }
    });



    return NextResponse.json(newCertificate);
  } catch (error: any) {
    console.error("POST /api/member/belt-history error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
