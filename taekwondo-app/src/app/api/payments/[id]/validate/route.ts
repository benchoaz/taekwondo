import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const paymentId = resolvedParams.id;
    
    // Ambil identitas User (Coach/Admin) dari Header Middleware
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || (userRole !== "COACH" && userRole !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden: Hanya Pelatih atau Admin yang dapat memvalidasi pembayaran." },
        { status: 403 }
      );
    }

    // 1. Cek apakah pembayaran ada
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { sppInvoice: true }
    });

    if (!payment) {
      return NextResponse.json({ error: "Data pembayaran tidak ditemukan." }, { status: 404 });
    }

    if (payment.status === "COMPLETED") {
      return NextResponse.json({ error: "Pembayaran ini sudah pernah divalidasi sebelumnya." }, { status: 400 });
    }

    // 2. Jalankan transaksi database (Ubah status Payment + SppInvoice)
    const result = await prisma.$transaction(async (tx) => {
      // Update Payment
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
          receivedById: userId, // Catat SIAPA pelatih yang menerima uangnya
        },
      });

      // Update SppInvoice jika tujuan bayarnya adalah SPP
      if (payment.sppInvoice) {
        await tx.sppInvoice.update({
          where: { id: payment.sppInvoice.id },
          data: { status: "PAID" }
        });
      }

      return updatedPayment;
    });

    return NextResponse.json({
      success: true,
      message: "Pembayaran berhasil divalidasi dan dicatat.",
      data: result
    });

  } catch (error: any) {
    console.error("[VALIDATE_PAYMENT_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server saat memvalidasi pembayaran." },
      { status: 500 }
    );
  }
}
