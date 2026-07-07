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
        "X-Api-Key": process.env.WHATSAPP_API_KEY || "",
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

}

/**
 * Mengirim broadcast pengumuman dojang ke nomor WhatsApp anggota
 */
export async function sendAnnouncementNotification(
  phone: string,
  memberName: string,
  title: string,
  content: string,
  link?: string
) {
  const message = `📢 *PENGUMUMAN* 📢\n\n` +
    `Halo ${memberName},\n\n` +
    `Ada pengumuman penting terbaru:\n\n` +
    `*${title}*\n` +
    `${content}\n\n` +
    (link ? `Untuk informasi lengkap, silakan kunjungi tautan berikut:\n${link}\n\n` : "") +
    `Terima kasih! 🥋`;

  return sendWhatsAppMessage(phone, message);
}

// -----------------------------------------------------------------
// WAHA Management Functions (Admin Only)
// -----------------------------------------------------------------

const getWahaHeaders = () => ({
  "Content-Type": "application/json",
  "Accept": "application/json",
  "X-Api-Key": process.env.WHATSAPP_API_KEY || "",
});

const getWahaUrl = () => process.env.WAHA_BASE_URL || "http://waha:3000";
const getWahaSession = () => process.env.WAHA_SESSION || "default";

export async function getWahaStatus() {
  try {
    const res = await fetch(`${getWahaUrl()}/api/sessions/${getWahaSession()}`, {
      headers: getWahaHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) {
      if (res.status === 404) return { status: "STOPPED" };
      return { status: "ERROR" };
    }
    const data = await res.json();
    return { status: data.status, name: data.name }; // "STARTING", "SCAN_QR_CODE", "WORKING", "FAILED"
  } catch (error) {
    return { status: "OFFLINE" };
  }
}

export async function startWahaSession() {
  try {
    const res = await fetch(`${getWahaUrl()}/api/sessions/start`, {
      method: "POST",
      headers: getWahaHeaders(),
      body: JSON.stringify({ name: getWahaSession() })
    });
    return res.ok;
  } catch (error) {
    return false;
  }
}

export async function stopWahaSession() {
  try {
    const res = await fetch(`${getWahaUrl()}/api/sessions/stop`, {
      method: "POST",
      headers: getWahaHeaders(),
      body: JSON.stringify({ name: getWahaSession() })
    });
    return res.ok;
  } catch (error) {
    return false;
  }
}

export async function getWahaAuthQr() {
  try {
    const res = await fetch(`${getWahaUrl()}/api/${getWahaSession()}/auth/qr`, {
      headers: getWahaHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) return null;
    
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("image/png")) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return {
        mimetype: "image/png",
        data: buffer.toString("base64")
      };
    }

    const data = await res.json();
    return data; // { "mimetype": "image/png", "data": "iVBORw0KGgo...", "url": "..." }
  } catch (error) {
    console.error("Error fetching WAHA QR:", error);
    return null;
  }
}
