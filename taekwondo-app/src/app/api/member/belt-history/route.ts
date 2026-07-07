import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the member profile
    const member = await prisma.member.findUnique({
      where: { userId: session.user.id }
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const mId = searchParams.get('memberId');
    
    // If Admin wants to fetch a specific member
    const targetMemberId = mId && session.user.role !== "MEMBER" ? mId : member.id;

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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
    if (historyItem.member.userId !== session.user.id && session.user.role === "MEMBER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the record
    const updatedHistory = await prisma.beltHistory.update({
      where: { id: historyId },
      data: { certUrl }
    });

    // We can also opportunistically set the Member's certDocUrl to this newest one
    await prisma.member.update({
      where: { id: historyItem.memberId },
      data: { certDocUrl: certUrl }
    });

    return NextResponse.json(updatedHistory);
  } catch (error: any) {
    console.error("POST /api/member/belt-history error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
