import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberId, year, months, amount } = body;

    if (!memberId || !year || !Array.isArray(months) || months.length === 0 || !amount) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return NextResponse.json({ error: "Anggota tidak ditemukan" }, { status: 404 });
    }

    const { sendSppReceipt } = await import("@/lib/whatsapp");
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const createdInvoices = [];

    for (const month of months) {
      const existing = await prisma.sppInvoice.findUnique({
        where: {
          memberId_month_year: {
            memberId,
            month,
            year
          }
        }
      });

      if (existing) continue;

      const monthName = monthNames[month - 1];
      const dueDate = new Date(year, month - 1, 10);

      const payment = await prisma.payment.create({
        data: {
          memberId,
          amount: parseFloat(amount),
          purpose: `SPP SPP Bulan ${monthName} ${year}`,
          status: "COMPLETED",
          dueDate,
          paidAt: new Date(),
        }
      });

      const invoice = await prisma.sppInvoice.create({
        data: {
          memberId,
          month,
          year,
          amount: parseFloat(amount),
          dueDate,
          status: "PAID",
          paymentId: payment.id
        }
      });

      createdInvoices.push(invoice);

      if (member.phone) {
        try {
          await sendSppReceipt(member.phone, member.fullName, monthName, year, parseFloat(amount));
        } catch (waError) {
          console.error("Gagal mengirim WhatsApp receipt:", waError);
        }
      }
    }

    return NextResponse.json({ success: true, count: createdInvoices.length });
  } catch (error: any) {
    console.error("Error creating prepaid SPP:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
