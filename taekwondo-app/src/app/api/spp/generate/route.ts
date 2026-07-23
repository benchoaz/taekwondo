import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSppInvoiceNotification } from "@/lib/whatsapp";
import { sendPushNotification } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {

    const { month, year, memberId, amount } = await req.json();
    
    if (!month || !year) {
      return NextResponse.json({ error: "Month and year are required" }, { status: 400 });
    }

    // Ambil setting untuk tahu biaya SPP (default jika amount tidak dikirim)
    const setting = await prisma.setting.findUnique({
      where: { id: "default" }
    });
    
    const sppFee = amount && !isNaN(Number(amount)) && Number(amount) > 0 
      ? Number(amount) 
      : (setting?.sppFee || 100000); // default 100k

    // Filter member: perorangan (memberId) atau semua member aktif
    const activeMembers = (memberId && memberId !== "ALL")
      ? await prisma.member.findMany({
          where: {
            OR: [
              { id: memberId },
              { userId: memberId }
            ]
          },
          include: { user: true }
        })
      : await prisma.member.findMany({
          where: { 
            status: { in: ["ACTIVE", "AKTIF"] }
          },
          include: { user: true }
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
        const isPrepaid = ((member as any).prepaidMonthsRemaining || 0) > 0;

        // Create Payment record
        const newPayment = await prisma.payment.create({
          data: {
            memberId: member.id,
            amount: sppFee,
            purpose: `SPP Bulan ${monthName} ${year}`,
            status: isPrepaid ? "COMPLETED" : "PENDING",
            dueDate: dueDate,
            paidAt: isPrepaid ? new Date() : null,
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
            status: isPrepaid ? "PAID" : "UNPAID",
            paymentId: newPayment.id
          }
        });
        generatedCount++;

        if (isPrepaid) {
          // Decrement prepaidMonthsRemaining by 1
          await (prisma.member.update as any)({
            where: { id: member.id },
            data: { prepaidMonthsRemaining: { decrement: 1 } }
          });

          // Send WhatsApp Notification for automatic prepaid payment
          if (member.phone) {
            const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
            await sendWhatsAppMessage(
              member.phone,
              `🥋 *SPP LUNAS OTOMATIS* 🥋\n\n` +
              `Halo *${member.fullName}*,\n` +
              `Tagihan SPP bulan *${monthName} ${year}* sebesar *Rp ${sppFee.toLocaleString("id-ID")}* telah **LUNAS** otomatis menggunakan saldo bayar di muka Anda.\n\n` +
              `Sisa saldo prabayar Anda: *${((member as any).prepaidMonthsRemaining || 0) - 1} bulan*.\n\n` +
              `Terima kasih! 🙏`
            );
          }
        } else {
          // Kirim WhatsApp (Mock / Fonnte)
          const origin = req.headers.get("origin") || `https://${req.headers.get("host")}` || "https://whitetigertraksaan.com";
          const paymentLink = `${origin}/payment/${newPayment.id}`;
          if (member.phone) {
            await sendSppInvoiceNotification(member.phone, member.fullName, monthName, year, sppFee, paymentLink);
          }

          // Kirim Push Notification (FCM)
          try {
            if (member.user?.fcmToken) {
              const title = "Tagihan SPP Baru 📝";
              const body = `Halo ${member.fullName}, tagihan SPP bulan ${monthName} ${year} sebesar Rp${sppFee.toLocaleString("id-ID")} telah diterbitkan.`;
              await sendPushNotification(member.user.fcmToken, title, body, {
                type: "SPP_INVOICE",
                paymentId: newPayment.id
              });
            }
          } catch (fcmErr) {
            console.error("Gagal sendPushNotification:", fcmErr);
          }

          // Simpan ke database Notification agar muncul di list Notifikasi aplikasi HP
          await prisma.notification.create({
            data: {
              title: "Tagihan SPP Baru 📝",
              message: `Halo ${member.fullName}, tagihan SPP bulan ${monthName} ${year} sebesar Rp${sppFee.toLocaleString("id-ID")} telah diterbitkan.`,
              userId: member.userId,
              type: "SPP",
              link: "/spp"
            }
          });
        }
      }
    }

    const message = generatedCount > 0 
      ? `Berhasil generate ${generatedCount} tagihan SPP baru.`
      : `Tidak ada tagihan baru yang dibuat. Tagihan SPP bulan ${monthName} ${year} untuk member yang dipilih sudah pernah diterbitkan di sistem.`;

    return NextResponse.json({ 
      success: true, 
      message,
      generatedCount 
    });

  } catch (error) {
    console.error("Error generating SPP Invoices:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
