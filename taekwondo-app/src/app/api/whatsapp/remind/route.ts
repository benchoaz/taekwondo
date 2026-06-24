import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSppReminder } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {

    // Ambil semua invoice yang OVERDUE atau UNPAID yang melewati dueDate
    const overdueInvoices = await prisma.sppInvoice.findMany({
      where: {
        status: { in: ["UNPAID", "OVERDUE"] },
        dueDate: { lt: new Date() } // Tanggal sekarang lebih dari dueDate
      },
      include: {
        member: true
      }
    });

    let sentCount = 0;
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    for (const invoice of overdueInvoices) {
      // Update status menjadi OVERDUE jika sebelumnya UNPAID
      if (invoice.status === "UNPAID") {
        await prisma.sppInvoice.update({
          where: { id: invoice.id },
          data: { status: "OVERDUE" }
        });
      }

      if (invoice.member.phone) {
        const monthName = monthNames[invoice.month - 1];
        // Asumsi paymentLink menggunakan paymentId
        const paymentLink = invoice.paymentId 
          ? `https://taekwondo.com/payment/${invoice.paymentId}`
          : `https://taekwondo.com/spp/pay/${invoice.member.id}/${invoice.month}/${invoice.year}`;
        
        await sendSppReminder(
          invoice.member.phone, 
          invoice.member.fullName, 
          monthName, 
          invoice.year, 
          invoice.amount, 
          paymentLink
        );
        sentCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil mengirim ${sentCount} reminder WhatsApp.`,
      sentCount 
    });

  } catch (error) {
    console.error("Error sending WhatsApp reminders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
