import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  // Verifikasi Kunci Rahasia Cron dari Vercel
  // Ini mencegah orang dari luar mengeksekusi script SPP sesuka hati
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1 - 12
    const currentYear = today.getFullYear();
    // Jatuh tempo setiap tanggal 10 di bulan berjalan
    const dueDate = new Date(currentYear, currentMonth - 1, 10); 

    // Ambil nominal default SPP dari database pengaturan
    const setting = await prisma.setting.findUnique({ where: { id: "default" } });
    const sppAmount = setting?.sppFee || 100000;

    // Ambil seluruh member yang sudah terverifikasi (aktif)
    const activeMembers = await prisma.member.findMany({
      where: {
        status: {
          notIn: ["PENDING_VERIFICATION", "INACTIVE", "REJECTED"]
        }
      }
    });

    let createdCount = 0;

    // Looping setiap member untuk dibuatkan tagihannya
    for (const member of activeMembers) {
      // Cek apakah tagihan bulan ini sudah pernah di-generate sebelumnya
      const existingInvoice = await prisma.sppInvoice.findUnique({
        where: {
          memberId_month_year: {
            memberId: member.id,
            month: currentMonth,
            year: currentYear
          }
        }
      });

      // Jika belum ada tagihan untuk bulan ini, buat baru
      if (!existingInvoice) {
        await prisma.sppInvoice.create({
          data: {
            memberId: member.id,
            month: currentMonth,
            year: currentYear,
            amount: sppAmount,
            dueDate: dueDate,
            status: "UNPAID"
          }
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil men-generate ${createdCount} tagihan SPP baru untuk bulan ${currentMonth}/${currentYear}`
    });

  } catch (error) {
    console.error("Cron Generate SPP Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat men-generate SPP" }, { status: 500 });
  }
}
