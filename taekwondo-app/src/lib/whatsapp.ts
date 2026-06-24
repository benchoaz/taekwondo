/**
 * WhatsApp Gateway Integration
 * ---------------------------------
 * Menggunakan Fonnte API (atau provider sejenis)
 * Memerlukan FONNTE_API_KEY di .env
 */

const FONNTE_API_URL = "https://api.fonnte.com/send";

/**
 * Fungsi utilitas untuk mengirim pesan WhatsApp
 * @param target Nomor tujuan (bisa dipisah koma untuk bulk)
 * @param message Isi pesan
 */
export async function sendWhatsAppMessage(target: string, message: string) {
  const apiKey = process.env.FONNTE_API_KEY;
  
  if (!apiKey) {
    console.warn("[WhatsApp Mock] FONNTE_API_KEY tidak ditemukan. Pesan tidak benar-benar dikirim.");
    console.log(`[To: ${target}] Message:\n${message}`);
    return { status: true, detail: "Mock send success (No API Key)" };
  }

  try {
    const response = await fetch(FONNTE_API_URL, {
      method: "POST",
      headers: {
        Authorization: apiKey,
      },
      body: new URLSearchParams({
        target: target,
        message: message,
        countryCode: "62", // Default to Indonesia
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return { status: false, reason: String(error) };
  }
}

/**
 * Mengirim notifikasi tagihan SPP bulanan
 */
export async function sendSppInvoiceNotification(
  phone: string,
  memberName: string,
  monthName: string,
  year: number,
  amount: number,
  paymentLink: string
) {
  const message = `Halo ${memberName},\n\n` +
    `Ini adalah pengingat otomatis untuk pembayaran SPP Taekwondo bulan *${monthName} ${year}*.\n\n` +
    `Total Tagihan: *Rp ${amount.toLocaleString("id-ID")}*\n\n` +
    `Silakan klik link berikut untuk melihat detail dan melakukan pembayaran melalui QRIS/Transfer:\n` +
    `${paymentLink}\n\n` +
    `Terima kasih atas kedisiplinan Anda.`;

  return sendWhatsAppMessage(phone, message);
}

/**
 * Mengirim notifikasi tanda terima setelah SPP lunas
 */
export async function sendSppReceipt(
  phone: string,
  memberName: string,
  monthName: string,
  year: number,
  amount: number
) {
  const message = `Terima kasih ${memberName}!\n\n` +
    `Pembayaran SPP Taekwondo untuk bulan *${monthName} ${year}* sebesar *Rp ${amount.toLocaleString("id-ID")}* telah BERHASIL kami terima.\n\n` +
    `Tetap semangat latihannya! 🥋`;

  return sendWhatsAppMessage(phone, message);
}

/**
 * Mengirim reminder tunggakan (Overdue)
 */
export async function sendSppReminder(
  phone: string,
  memberName: string,
  monthName: string,
  year: number,
  amount: number,
  paymentLink: string
) {
  const message = `Peringatan: Tunggakan SPP\n\n` +
    `Halo ${memberName},\n` +
    `Kami perhatikan tagihan SPP bulan *${monthName} ${year}* (Rp ${amount.toLocaleString("id-ID")}) Anda telah melewati batas waktu (Jatuh Tempo).\n\n` +
    `Mohon segera selesaikan pembayaran melalui link berikut:\n` +
    `${paymentLink}\n\n` +
    `Abaikan pesan ini jika Anda merasa sudah melakukan pembayaran ke pelatih secara tunai. Terima kasih.`;

  return sendWhatsAppMessage(phone, message);
}
