import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// POST /api/whatsapp/webhook - Menerima event dari WAHA
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, payload } = body;

    // Abaikan jika bukan event message atau jika pesan dikirim oleh bot itu sendiri
    if (!event || (event !== "message" && event !== "message.created") || !payload || payload.fromMe) {
      return NextResponse.json({ success: true, message: "Ignored" });
    }

    const from = payload.from; // e.g. "6281234567890@c.us"
    const messageBody = payload.body?.trim().toLowerCase();

    if (!from || !messageBody) {
      return NextResponse.json({ success: true, message: "No payload data" });
    }

    // Cek apakah pesan berisi kata kunci reset password
    const isResetRequest = messageBody === "reset password" || 
                          messageBody === "lupa password" || 
                          messageBody === "reset";

    if (isResetRequest) {
      // Ambil nomor HP bersih (tanpa domain @c.us)
      const cleanPhone = from.split("@")[0];
      
      // Buat beberapa opsi format pencarian nomor di DB
      let localPhone = cleanPhone;
      if (cleanPhone.startsWith("62")) {
        localPhone = "0" + cleanPhone.substring(2);
      }

      // Cari member berdasarkan nomor WhatsApp
      const member = await prisma.member.findFirst({
        where: {
          OR: [
            { phone: cleanPhone },
            { phone: localPhone },
            { phone: `+${cleanPhone}` },
            { phone: { contains: localPhone } }
          ]
        },
        include: { user: true }
      });

      if (!member || !member.user) {
        // Balas bahwa nomor tidak terdaftar
        await sendWhatsAppMessage(
          from,
          `Maaf, nomor WhatsApp Anda (*${cleanPhone}*) tidak terdaftar dalam sistem anggota dojang kami.\n\n` +
          `Silakan hubungi Pelatih/Admin untuk mendaftarkan nomor ini terlebih dahulu.`
        );
        return NextResponse.json({ success: true, message: "Phone not registered" });
      }

      // Generate password baru yang memenuhi syarat (1 huruf besar, 1 huruf kecil, 1 angka, min 8 karakter)
      const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digit
      const tempPassword = `Tkd${randomDigits}`; // e.g. Tkd483920

      // Hash password baru
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Update password user di DB
      await prisma.user.update({
        where: { id: member.userId },
        data: { password: hashedPassword }
      });

      // Kirim password baru melalui WhatsApp
      const responseMessage = 
        `🔓 *RESET PASSWORD BERHASIL* 🔓\n\n` +
        `Halo *${member.fullName}*,\n` +
        `Permintaan reset password Anda dari nomor WhatsApp terdaftar telah otomatis disetujui.\n\n` +
        `*Username Anda:* ${member.user.username || member.user.email}\n` +
        `*Password Baru:* ${tempPassword}\n\n` +
        `Silakan login kembali ke aplikasi dan segera ganti password Anda di menu Profil untuk keamanan.\n\n` +
        `Salam, White Tiger Taekwondo 🥋`;

      await sendWhatsAppMessage(from, responseMessage);

      // Log aktivitas admin otomatis
      await prisma.activityLog.create({
        data: {
          adminId: member.userId, // Anggap user me-reset dirinya sendiri
          action: "RESET_PASSWORD_AUTO",
          target: member.user.username || member.user.email,
          details: `Self-service password reset via WhatsApp: ${member.fullName}`,
          ipAddress: "WhatsApp-Gateway",
          browser: "WAHA-Webhook",
          status: "SUCCESS"
        }
      });

      return NextResponse.json({ success: true, message: "Password reset successfully" });
    }

    return NextResponse.json({ success: true, message: "No matching command" });

  } catch (error: any) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
