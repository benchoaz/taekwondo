import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userHeaderId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    let filter: any = {};
    if (userRole === "MEMBER" && userHeaderId) {
      filter = { member: { userId: userHeaderId } };
    } else {
      const memberId = searchParams.get("memberId");
      const userId = searchParams.get("userId");
      if (memberId) {
        filter = { memberId };
      } else if (userId) {
        filter = { member: { userId } };
      }
    }

    const invoices = await prisma.sppInvoice.findMany({
      where: filter,
      include: {
        member: true,
        payment: {
          include: {
            receiver: {
              select: {
                name: true
              }
            }
          }
        }
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
