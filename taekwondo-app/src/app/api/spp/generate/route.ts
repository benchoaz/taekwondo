import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSppInvoiceNotification } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {

    const { month, year } = await req.json();
    
    if (!month || !year) {
      return NextResponse.json({ error: "Month and year are required" }, { status: 400 });
    }

    // Ambil setting untuk tahu biaya SPP
    const setting = await prisma.setting.findUnique({
      where: { id: "default" }
    });
    
    const sppFee = setting?.sppFee || 100000; // default 100k

    // Ambil semua member aktif
    const activeMembers = await prisma.member.findMany({
      where: { status: "ACTIVE" } // Sesuaikan dengan status member aktif di sistem Anda
    });

    const dueDate = new Date(year, month - 1, 10); // Jatuh tempo tanggal 10 bulan berjalan

    let generatedCount = 0;
    
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const monthName = monthNames[month - 1];

    for (const member of activeMembers) {
      // Cek apakah tagihan sudah ada
      const existing = await prisma.sppInvoice.findUnique({
        where: {
          memberId_month_year: {
            memberId: member.id,
            month: month,
            year: year
          }
        }
      });

      if (!existing) {
        // Create Payment record first
        const newPayment = await prisma.payment.create({
          data: {
            memberId: member.id,
            amount: sppFee,
            purpose: `SPP Bulan ${monthName} ${year}`,
            status: "PENDING",
            dueDate: dueDate,
          }
        });

        // Create SppInvoice linked to Payment
        await prisma.sppInvoice.create({
          data: {
            memberId: member.id,
            month: month,
            year: year,
            amount: sppFee,
            dueDate: dueDate,
            status: "UNPAID",
            paymentId: newPayment.id
          }
        });
        generatedCount++;

        // Kirim WhatsApp (Mock / Fonnte)
        if (member.phone) {
          // Asumsi ada halaman untuk bayar: /spp/pay?memberId=xxx
          const paymentLink = `https://taekwondo.com/payment/${newPayment.id}`;
          await sendSppInvoiceNotification(member.phone, member.fullName, monthName, year, sppFee, paymentLink);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil generate ${generatedCount} tagihan SPP baru.`,
      generatedCount 
    });

  } catch (error) {
    console.error("Error generating SPP Invoices:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
