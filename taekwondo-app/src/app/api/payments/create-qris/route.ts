import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createXenditQRIS } from "@/lib/xendit";

/**
 * POST /api/payments/create-qris
 *
 * Membuat QRIS Xendit dinamis untuk tagihan yang sudah ada di DB.
 *
 * Body: { paymentId: string }
 *  - paymentId: ID record Payment di database (harus berstatus PENDING)
 *
 * Response: { qrString: string, externalId: string, amount: number }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId wajib diisi." },
        { status: 400 }
      );
    }

    // Ambil data payment dari DB
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        member: { select: { fullName: true, memberNumber: true } },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment tidak ditemukan." },
        { status: 404 }
      );
    }

    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { error: `Payment sudah berstatus ${payment.status}, tidak bisa generate QRIS.` },
        { status: 400 }
      );
    }

    // Jika sudah ada externalId sebelumnya, tidak perlu buat ulang
    // (idempoten: anggota refresh halaman tidak buat QR baru)
    if (payment.externalId) {
      // Kembalikan externalId yang lama — frontend bisa render ulang
      // Catatan: qr_string tidak disimpan di DB untuk menghemat ruang,
      // kita buat ulang dari Xendit jika dibutuhkan.
    }

    // Buat external_id yang unik & mudah dibaca
    // Format: TKD-{paymentId}-{timestamp}
    const externalId = `TKD-${paymentId}-${Date.now()}`;

    // Panggil Xendit API untuk generate QRIS
    const xenditResponse = await createXenditQRIS(externalId, payment.amount);

    // Simpan externalId ke database agar webhook bisa menemukan record ini
    await prisma.payment.update({
      where: { id: paymentId },
      data: { externalId },
    });

    return NextResponse.json({
      qrString: xenditResponse.qr_string,
      externalId,
      amount: payment.amount,
      purpose: payment.purpose,
      memberName: payment.member.fullName,
    });
  } catch (error: any) {
    console.error("[create-qris] Error:", error.message);

    // Tangani error khusus saat XENDIT_SECRET_KEY belum dikonfigurasi
    if (error.message?.includes("XENDIT_SECRET_KEY")) {
      return NextResponse.json(
        {
          error:
            "Konfigurasi payment gateway belum selesai. Silakan hubungi administrator.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan internal." },
      { status: 500 }
    );
  }
}
