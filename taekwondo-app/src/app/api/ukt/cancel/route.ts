import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json({ error: "memberId diperlukan." }, { status: 400 });
    }

    // Temukan member
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { id: memberId },
          { userId: memberId }
        ]
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Siswa tidak ditemukan." }, { status: 404 });
    }

    // Temukan pendaftaran UKT yang berstatus FAILED
    const registration = await prisma.uktParticipant.findFirst({
      where: {
        memberId: member.id,
        status: "FAILED"
      }
    });

    if (!registration) {
      return NextResponse.json({ error: "Pendaftaran ditolak tidak ditemukan." }, { status: 404 });
    }

    // Hapus pendaftaran ukt dan tagihan pending-nya secara transaksional
    await prisma.$transaction([
      // Hapus pendaftaran
      prisma.uktParticipant.delete({
        where: { id: registration.id }
      }),
      // Hapus tagihan SPP/pembayaran UKT yang statusnya masih PENDING untuk member ini
      prisma.payment.deleteMany({
        where: {
          memberId: member.id,
          status: "PENDING",
          purpose: { contains: "UKT" }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil dibatalkan. Silakan daftar kembali."
    });
  } catch (error: any) {
    console.error("Error cancelling UKT registration:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
