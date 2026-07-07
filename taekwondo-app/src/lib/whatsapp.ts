/**
 * WhatsApp Gateway Integration
 * ---------------------------------
 * Menggunakan WAHA (WhatsApp HTTP API)
 * Memerlukan WAHA_BASE_URL dan WAHA_SESSION di .env
 */

function formatPhoneNumber(phone: string): string {
  // Hapus karakter selain angka
  let cleaned = phone.replace(/\D/g, "");
  
  // Ubah awalan 0 menjadi 62
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }
  
  // WAHA butuh akhiran @c.us untuk nomor personal
  if (!cleaned.endsWith("@c.us")) {
    cleaned += "@c.us";
  }
  
  return cleaned;
}

/**
 * Fungsi utilitas untuk mengirim pesan WhatsApp via WAHA
 * @param target Nomor tujuan (bisa dipisah koma untuk bulk, atau array, tapi kita asumsikan 1 nomor per panggilan untuk WAHA sederhana)
 * @param message Isi pesan
 */
export async function sendWhatsAppMessage(target: string, message: string) {
  const baseUrl = process.env.WAHA_BASE_URL || "http://localhost:3000";
  const session = process.env.WAHA_SESSION || "default";
  
  // Jika ini simulasi atau belum disetting
  if (baseUrl === "http://localhost:3000" && !process.env.WAHA_BASE_URL) {
    console.warn("[WhatsApp Mock] WAHA_BASE_URL tidak diset. Pesan tidak benar-benar dikirim.");
    console.log(`[To: ${target}] Message:\n${message}`);
    return { status: true, detail: "Mock send success (No Base URL)" };
  }

  const formattedTarget = formatPhoneNumber(target);

  try {
    const response = await fetch(`${baseUrl}/api/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        chatId: formattedTarget,
        text: message,
        session: session,
      }),
    });

    const result = await response.json();
    return { status: response.ok, data: result };
  } catch (error) {
    console.error("Error sending WhatsApp message via WAHA:", error);
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

/**
 * Mengirim pesan selamat datang dan kredensial login (Untuk Import Anggota Lama)
 */
export async function sendWelcomeCredentials(
  phone: string,
  memberName: string,
  username: string,
  password: string,
  memberId: string
) {
  const message = `Selamat datang di Sistem Digital Taekwondo, ${memberName}!\n\n` +
    `Data keanggotaan Anda telah berhasil dimasukkan ke dalam sistem baru. Berikut adalah akun untuk login ke Dashboard Member Anda:\n\n` +
    `*ID Anggota:* ${memberId}\n` +
    `*Username:* ${username}\n` +
    `*Password:* ${password}\n\n` +
    `Silakan login dan segera perbarui **Password**, **Tanggal Lahir**, serta data fisik (Tinggi/Berat Badan) Anda di menu Edit Profil.\n\n` +
    `Terima kasih! 🥋`;

  return sendWhatsAppMessage(phone, message);
}
