import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
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
