/**
 * Xendit Payment Gateway Helper
 * ---------------------------------
 * Menggunakan fetch native — tidak memerlukan package NPM tambahan.
 * Semua fungsi ini hanya boleh dipanggil dari sisi server (route.ts).
 *
 * Cara mendapatkan key:
 * 1. Daftar di https://dashboard.xendit.co
 * 2. Settings → API Keys → Generate Secret Key
 * 3. Settings → Webhooks → Salin Verification Token
 */

const XENDIT_BASE_URL = "https://api.xendit.co";

/**
 * Membuat Basic Auth header dari Xendit Secret Key.
 * Format: "Basic base64(secretKey:)"
 */
function getXenditAuthHeader(): string {
  const secretKey = process.env.XENDIT_SECRET_KEY;
  if (!secretKey) {
    throw new Error("XENDIT_SECRET_KEY belum dikonfigurasi di environment variables.");
  }
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

/**
 * Membuat QRIS dinamis untuk satu transaksi pembayaran.
 *
 * @param externalId - ID unik dari sisi kita (gunakan Payment.id dari DB)
 * @param amount     - Nominal dalam Rupiah (integer)
 * @returns          - Response Xendit berisi qr_string, id, status, dll.
 *
 * Referensi API: https://developers.xendit.co/api-reference/#create-qr-code
 */
export async function createXenditQRIS(
  externalId: string,
  amount: number
): Promise<{
  id: string;
  external_id: string;
  amount: number;
  qr_string: string;
  status: string;
  created: string;
  currency: string;
}> {
  const response = await fetch(`${XENDIT_BASE_URL}/qr_codes`, {
    method: "POST",
    headers: {
      Authorization: getXenditAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: externalId,
      type: "DYNAMIC",          // DYNAMIC = nominal tetap per QR
      amount: Math.round(amount), // Xendit perlu integer
      currency: "IDR",
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(
      `Xendit API error ${response.status}: ${JSON.stringify(errBody)}`
    );
  }

  return response.json();
}

/**
 * Memverifikasi webhook token dari header Xendit.
 * WAJIB dipanggil sebelum memproses payload webhook.
 *
 * @param callbackToken - Nilai dari header "x-callback-token" request Xendit
 * @returns true jika valid, false jika palsu
 */
export function verifyXenditWebhookToken(callbackToken: string | null): boolean {
  const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;
  if (!expectedToken) {
    console.error("XENDIT_WEBHOOK_TOKEN belum dikonfigurasi.");
    return false;
  }
  return callbackToken === expectedToken;
}

/**
 * Mengambil status QR Code dari Xendit berdasarkan external_id.
 * Digunakan untuk polling status pembayaran dari frontend.
 *
 * @param externalId - external_id yang digunakan saat membuat QRIS
 */
export async function getXenditQRISStatus(externalId: string): Promise<{
  external_id: string;
  status: string;
  amount: number;
}> {
  const response = await fetch(
    `${XENDIT_BASE_URL}/qr_codes/${externalId}`,
    {
      method: "GET",
      headers: {
        Authorization: getXenditAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(
      `Xendit GET QR status error ${response.status}: ${JSON.stringify(errBody)}`
    );
  }

  return response.json();
}
