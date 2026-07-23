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
        receiver: {
          select: {
            name: true,
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
    const { id, memberId, amount, purpose, status, action, memberIds, dueDate, paymentProofUrl, month, year } = body;
    
    // Ambil identitas User (Coach/Admin) dari Header Middleware
    const userId = request.headers.get("x-user-id");

    // If updating status (Approve/Reject)
    if (action === "update-status" && id) {
      const updated = await prisma.payment.update({
        where: { id },
        data: { 
          status,
          ...(status === "COMPLETED" && {
            receivedById: userId,
            paidAt: new Date(),
          })
        },
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

        // Kirim Push Notification ke HP Siswa
        try {
          const { notifyUser } = await import("@/lib/notify");
          const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
          const monthName = monthNames[updated.sppInvoice.month - 1];
          await notifyUser({
            title: "Pembayaran SPP Lunas! ✅",
            message: `Pembayaran SPP untuk bulan ${monthName} ${updated.sppInvoice.year} sebesar Rp ${updated.amount.toLocaleString("id-ID")} telah dikonfirmasi oleh pelatih. Terima kasih!`,
            type: "SPP",
            userId: updated.member.userId,
            link: "/m/spp"
          });
        } catch (err) {
          console.error("FCM SPP notify error:", err);
        }
      } else if (status === "COMPLETED") {
        // Kirim Push Notification untuk Pembayaran Non-SPP (UKT / dll)
        try {
          const { notifyUser } = await import("@/lib/notify");
          await notifyUser({
            title: "Pembayaran Dikonfirmasi! ✅",
            message: `Pembayaran untuk "${updated.purpose || 'Tagihan UKT/Iuran'}" sebesar Rp ${updated.amount.toLocaleString("id-ID")} telah divalidasi oleh pelatih.`,
            type: "UKT",
            userId: updated.member.userId,
            link: "/m/ukt"
          });
        } catch (err) {
          console.error("FCM Payment notify error:", err);
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
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

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

        if (action === "spp-billing") {
          const parsedDueDate = new Date(dueDate);
          const invMonth = month ? parseInt(month) : parsedDueDate.getMonth() + 1;
          const invYear = year ? parseInt(year) : parsedDueDate.getFullYear();

          await prisma.sppInvoice.upsert({
            where: {
              memberId_month_year: {
                memberId: mId,
                month: invMonth,
                year: invYear,
              }
            },
            update: {
              amount: parseFloat(amount),
              dueDate: parsedDueDate,
              status: "UNPAID",
              paymentId: newPayment.id,
            },
            create: {
              memberId: mId,
              month: invMonth,
              year: invYear,
              amount: parseFloat(amount),
              dueDate: parsedDueDate,
              status: "UNPAID",
              paymentId: newPayment.id,
            }
          });

          // Send Push & DB Notification to Member
          try {
            const memberData = await prisma.member.findUnique({
              where: { id: mId },
              include: { user: true }
            });
            if (memberData && memberData.userId) {
              const { notifyUser } = await import("@/lib/notify");
              const monthName = monthNames[invMonth - 1] || "";
              await notifyUser({
                title: "Tagihan SPP Baru 📝",
                message: `Tagihan SPP Anda untuk bulan ${monthName} ${invYear} sebesar Rp ${parseFloat(amount).toLocaleString('id-ID')} telah diterbitkan.`,
                type: "SPP",
                userId: memberData.userId,
                link: "/m/spp",
              });
            }
          } catch (notifyErr) {
            console.error("Gagal notifyUser spp-billing:", notifyErr);
          }
        }
      }
      return NextResponse.json({ success: true, count: createdPayments.length, data: createdPayments });
    }

    // If individual billing by coach for 1 member
    if (action === "individual-billing" && memberId && amount && purpose) {
      const newPayment = await prisma.payment.create({
        data: {
          memberId,
          amount: parseFloat(amount),
          purpose,
          status: "PENDING",
          dueDate: dueDate ? new Date(dueDate) : null,
        },
        include: {
          member: {
            include: { user: true }
          }
        }
      });

      try {
        if (newPayment.member && newPayment.member.userId) {
          const { notifyUser } = await import("@/lib/notify");
          await notifyUser({
            title: "Tagihan Baru Diterbitkan 📝",
            message: `Tagihan baru "${purpose}" sebesar Rp ${parseFloat(amount).toLocaleString('id-ID')} telah diterbitkan oleh pelatih.`,
            type: "SPP",
            userId: newPayment.member.userId,
            link: "/m/spp",
          });
        }
      } catch (notifyErr) {
        console.error("Gagal notifyUser individual-billing:", notifyErr);
      }

      return NextResponse.json({ success: true, data: newPayment });
    }

    if (!memberId || !amount || !purpose) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Catat Pembayaran Manual (dari kasir / panel admin)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat catatan Pembayaran
      const paymentRecord = await tx.payment.create({
        data: {
          memberId,
          amount: parseFloat(amount),
          purpose,
          status: status || "PENDING",
          dueDate: dueDate ? new Date(dueDate) : null,
          paidAt: status === "COMPLETED" ? new Date() : null,
          receivedById: status === "COMPLETED" ? userId : null,
          paymentMethod: "TUNAI_CASH", // Default pencatatan manual di kasir
        },
      });

      // 2. Hubungkan ke SppInvoice jika tujuannya adalah SPP Bulanan
      if (purpose === "SPP Bulanan" && month && year) {
        const m = parseInt(month);
        const y = parseInt(year);

        // Cari invoice yang ada
        const existingInvoice = await tx.sppInvoice.findUnique({
          where: {
            memberId_month_year: {
              memberId,
              month: m,
              year: y,
            }
          }
        });

        if (existingInvoice) {
          await tx.sppInvoice.update({
            where: { id: existingInvoice.id },
            data: {
              paymentId: paymentRecord.id,
              status: status === "COMPLETED" ? "PAID" : "UNPAID",
            }
          });
        } else {
          // Buat invoice baru jika belum terbit
          await tx.sppInvoice.create({
            data: {
              memberId,
              month: m,
              year: y,
              amount: parseFloat(amount),
              dueDate: dueDate ? new Date(dueDate) : new Date(),
              status: status === "COMPLETED" ? "PAID" : "UNPAID",
              paymentId: paymentRecord.id,
            }
          });
        }
      }

      return paymentRecord;
    });

    // 3. Kirim WhatsApp receipt jika lunas seketika
    if (status === "COMPLETED" && purpose === "SPP Bulanan" && month && year) {
      const member = await prisma.member.findUnique({ where: { id: memberId } });
      if (member?.phone) {
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const monthName = monthNames[parseInt(month) - 1];
        await sendSppReceipt(
          member.phone,
          member.fullName,
          monthName,
          parseInt(year),
          parseFloat(amount)
        ).catch(e => console.error("Error sending WA receipt for manual payment:", e));
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    // Ambil identitas user dari Header Middleware
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Hanya Administrator yang berwenang menghapus transaksi keuangan." },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
    }

    // Dissociate any linked SPP invoice before deleting the payment
    const sppInvoice = await prisma.sppInvoice.findFirst({
      where: { paymentId: id }
    });
    if (sppInvoice) {
      await prisma.sppInvoice.update({
        where: { id: sppInvoice.id },
        data: {
          status: "PENDING",
          paymentId: null
        }
      });
    }

    await prisma.payment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Payment transaction deleted successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

