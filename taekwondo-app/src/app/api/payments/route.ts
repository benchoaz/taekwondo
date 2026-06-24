import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendSppReceipt } from "@/lib/whatsapp";

// Store last check time globally to survive Hot Module Reloading in Next.js development mode
if (!(global as any).lastOverdueCheck) {
  (global as any).lastOverdueCheck = 0;
}

const TEN_MINUTES = 10 * 60 * 1000;

export async function GET() {
  try {
    const now = new Date();
    
    // Only run updateMany if at least 10 minutes have passed since the last check
    if (Date.now() - (global as any).lastOverdueCheck > TEN_MINUTES) {
      (global as any).lastOverdueCheck = Date.now();
      // Run update asynchronously without awaiting it to avoid blocking the GET request
      prisma.payment.updateMany({
        where: {
          status: "PENDING",
          dueDate: {
            lt: now,
          },
        },
        data: {
          status: "OVERDUE",
        },
      }).catch((err) => console.error("Error updating overdue payments in background:", err));
    }

    const payments = await prisma.payment.findMany({
      include: {
        member: {
          select: {
            fullName: true,
            memberNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(payments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, memberId, amount, purpose, status, action, memberIds, dueDate, paymentProofUrl } = body;

    // If updating status (Approve/Reject)
    if (action === "update-status" && id) {
      const updated = await prisma.payment.update({
        where: { id },
        data: { status },
        include: {
          member: true,
          sppInvoice: true
        }
      });

      // Sinkronisasi SppInvoice
      if (status === "COMPLETED" && updated.sppInvoice) {
        await prisma.sppInvoice.update({
          where: { id: updated.sppInvoice.id },
          data: { status: "PAID" }
        });

        // Kirim WhatsApp Receipt
        if (updated.member.phone) {
          const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
          const monthName = monthNames[updated.sppInvoice.month - 1];
          await sendSppReceipt(
            updated.member.phone,
            updated.member.fullName,
            monthName,
            updated.sppInvoice.year,
            updated.amount
          );
        }
      }

      return NextResponse.json(updated);
    }

    // If member uploading payment proof
    if (action === "upload-proof" && id && paymentProofUrl) {
      const updated = await prisma.payment.update({
        where: { id },
        data: { 
          status: "PENDING", 
          paymentProofUrl 
        },
      });
      return NextResponse.json(updated);
    }

    // If mass billing (e.g. for tournaments)
    if (action === "mass-billing" && Array.isArray(memberIds) && amount && purpose) {
      const createdPayments = [];
      for (const mId of memberIds) {
        const newPayment = await prisma.payment.create({
          data: {
            memberId: mId,
            amount: parseFloat(amount),
            purpose,
            status: "PENDING",
          },
        });
        createdPayments.push(newPayment);
      }
      return NextResponse.json({ success: true, count: createdPayments.length, data: createdPayments });
    }

    // If SPP or Session Billing
    if ((action === "spp-billing" || action === "session-billing") && Array.isArray(memberIds) && amount && purpose && dueDate) {
      const createdPayments = [];
      for (const mId of memberIds) {
        const newPayment = await prisma.payment.create({
          data: {
            memberId: mId,
            amount: parseFloat(amount),
            purpose,
            status: "PENDING",
            dueDate: new Date(dueDate),
          },
        });
        createdPayments.push(newPayment);
      }
      return NextResponse.json({ success: true, count: createdPayments.length, data: createdPayments });
    }

    if (!memberId || !amount || !purpose) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newPayment = await prisma.payment.create({
      data: {
        memberId,
        amount: parseFloat(amount),
        purpose,
        status: status || "PENDING",
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json(newPayment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
