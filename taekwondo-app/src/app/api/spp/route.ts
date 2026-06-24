import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    const userId = searchParams.get("userId");

    let filter: any = {};
    if (memberId) {
      filter = { memberId };
    } else if (userId) {
      filter = { member: { userId } };
    }

    const invoices = await prisma.sppInvoice.findMany({
      where: filter,
      include: {
        member: true,
        payment: true
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching SPP Invoices:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
