import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, paymentProof } = body;

    if (!email || !paymentProof) {
      return NextResponse.json({ error: "Email dan gambar Bukti Pembayaran wajib diisi" }, { status: 400 });
    }

    const formattedEmail = email.trim().toLowerCase();

    // Find User by email
    const user = await prisma.user.findUnique({
      where: { email: formattedEmail },
      include: { member: true },
    });

    if (!user || !user.member) {
      return NextResponse.json({ error: "Akun pendaftaran dengan email tersebut tidak ditemukan." }, { status: 404 });
    }

    // Update member details
    const updatedMember = await prisma.member.update({
      where: { id: user.member.id },
      data: {
        paymentProofUrl: paymentProof,
        status: "PAYMENT_UPLOADED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.",
      status: updatedMember.status,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
