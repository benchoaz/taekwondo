import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyXenditWebhookToken } from "@/lib/xendit";

/**
 * POST /api/payments/webhook
 *
 * Endpoint yang dipanggil oleh Xendit secara otomatis saat terjadi pembayaran.
 * Konfigurasi URL ini di: Xendit Dashboard → Settings → Webhooks
 *
 * Event yang ditangani:
 * - qr.payment : pembayaran QRIS berhasil
 *
 * Keamanan:
 * - Setiap request diverifikasi menggunakan header "x-callback-token"
 * - Jika token tidak cocok, request ditolak (401)
 */
export async function POST(request: Request) {
  try {
    // ─── 1. Verifikasi Token Xendit ───────────────────────────────────────────
    const callbackToken = request.headers.get("x-callback-token");

    if (!verifyXenditWebhookToken(callbackToken)) {
      console.warn("[webhook] Token tidak valid. Request ditolak.");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ─── 2. Parse Payload ─────────────────────────────────────────────────────
    const body = await request.json();

    // Xendit QRIS webhook memiliki struktur: { event: "qr.payment", data: { ... } }
    const event: string = body.event;
    const data = body.data ?? body; // fallback jika struktur berbeda

    console.log(`[webhook] Event diterima: ${event}`);

    // ─── 3. Tangani Event QRIS Dibayar ───────────────────────────────────────
    if (event === "qr.payment" && data.status === "PAID") {
      const externalId: string = data.external_id;
      const paidAmount: number = data.amount;

      if (!externalId) {
        return NextResponse.json(
          { error: "external_id tidak ditemukan di payload." },
          { status: 400 }
        );
      }

      // Cari Payment di DB berdasarkan externalId
      const payment = await prisma.payment.findFirst({
        where: { externalId },
      });

      if (!payment) {
        // Bisa terjadi jika externalId tidak cocok atau sudah diproses
        console.warn(`[webhook] Payment dengan externalId "${externalId}" tidak ditemukan.`);
        // Tetap kembalikan 200 agar Xendit tidak retry terus-menerus
        return NextResponse.json({ received: true });
      }

      // Idempoten: jangan update jika sudah COMPLETED
      if (payment.status === "COMPLETED") {
        console.log(`[webhook] Payment "${payment.id}" sudah COMPLETED. Skip.`);
        return NextResponse.json({ received: true });
      }

      // ─── 4. Update Status Payment ──────────────────────────────────────────
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
          // Simpan nominal yang benar-benar dibayar sebagai referensi
          amount: paidAmount ?? payment.amount,
        },
      });

      console.log(
        `[webhook] ✅ Payment "${payment.id}" berhasil diverifikasi. ` +
        `Nominal: Rp ${paidAmount?.toLocaleString("id-ID") ?? "-"}`
      );

      return NextResponse.json({ received: true });
    }

    // ─── 5. Event Lain — Log Saja ─────────────────────────────────────────────
    // Xendit dapat mengirim event lain (misal: qr.payment dengan status EXPIRED)
    // Tangani jika diperlukan di masa mendatang.
    console.log(`[webhook] Event "${event}" tidak diproses (diabaikan).`);
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("[webhook] Error tidak terduga:", error.message);
    // Kembalikan 200 meskipun error internal agar Xendit tidak retry
    // dan log untuk debugging
    return NextResponse.json(
      { received: false, error: error.message },
      { status: 500 }
    );
  }
}
