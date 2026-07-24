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
        const paymentLink = invoice.paymentId 
          ? `https://whitetigerkraksaan.com/m/spp`
          : `https://whitetigerkraksaan.com/m/spp`;
        
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

      // Send Push & Email Notification via notifyUser
      try {
        const { notifyUser } = await import("@/lib/notify");
        const monthName = monthNames[invoice.month - 1];
        await notifyUser({
          userId: invoice.member.userId,
          title: "⚠️ Pengingat Tagihan SPP",
          message: `Halo ${invoice.member.fullName}, tagihan SPP bulan ${monthName} ${invoice.year} sebesar Rp ${invoice.amount.toLocaleString("id-ID")} belum dilunasi. Silakan lakukan pembayaran melalui aplikasi Web/Mobile.`,
          type: "SPP",
          link: "/",
        });
      } catch (notifyErr) {
        console.error("Gagal mengirim notifyUser SPP:", notifyErr);
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
