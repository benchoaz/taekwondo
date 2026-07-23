import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Filter payments received in cash by this coach (or all cash if ADMIN)
    const whereCondition: any = {
      paymentMethod: "TUNAI_CASH",
      status: "COMPLETED",
    };

    if (userRole !== "ADMIN") {
      whereCondition.receivedById = userId;
    }

    const cashPayments = await prisma.payment.findMany({
      where: whereCondition,
      include: {
        member: {
          select: {
            fullName: true,
            memberNumber: true,
            selfieUrl: true,
          },
        },
      },
      orderBy: { paidAt: "desc" },
    });

    const totalCashCollected = cashPayments.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      success: true,
      totalCashCollected,
      totalCount: cashPayments.length,
      data: cashPayments.map((p) => ({
        id: p.id,
        amount: p.amount,
        purpose: p.purpose,
        paidAt: p.paidAt || p.createdAt,
        memberName: p.member.fullName,
        memberNumber: p.member.memberNumber,
        memberSelfie: p.member.selfieUrl,
      })),
    });
  } catch (error: any) {
    console.error("GET coach cash error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
