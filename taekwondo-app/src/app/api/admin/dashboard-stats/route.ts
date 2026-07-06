import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Total Anggota (ACTIVE)
    const totalAnggota = await prisma.member.count({
      where: { status: "ACTIVE" }
    });

    // 2. Pelatih Aktif
    const totalPelatih = await prisma.coach.count();

    // 3. Tingkat Kelulusan UKT
    // Count total participants in all tournaments/exams vs approved/passed
    const allUktParticipants = await prisma.uktParticipant.count();
    const passedUktParticipants = await prisma.uktParticipant.count({
      where: { status: "APPROVED" } // Assuming APPROVED means passed UKT
    });
    
    let passRate = 0;
    if (allUktParticipants > 0) {
      passRate = (passedUktParticipants / allUktParticipants) * 100;
    }

    // 4. Biaya Registrasi
    const settings = await prisma.setting.findFirst();
    const registrationFee = settings?.registrationFee || 150000;

    // 5. Chart Data (Monthly)
    // For simplicity, we just aggregate members grouped by month created
    const members = await prisma.member.findMany({
      select: { createdAt: true }
    });

    const coaches = await prisma.coach.findMany({
      select: { user: { select: { createdAt: true } } }
    });

    const uktParticipants = await prisma.uktParticipant.findMany({
      select: { createdAt: true, status: true }
    });

    // Grouping by month (Jan-Jun for Semester I, or last 6 months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Get last 6 months
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      let mIndex = currentMonth - i;
      let yIndex = currentYear;
      if (mIndex < 0) {
        mIndex += 12;
        yIndex -= 1;
      }
      
      const monthName = months[mIndex];
      
      const newMembers = members.filter(m => m.createdAt.getMonth() === mIndex && m.createdAt.getFullYear() === yIndex).length;
      const newCoaches = coaches.filter(c => c.user?.createdAt.getMonth() === mIndex && c.user?.createdAt.getFullYear() === yIndex).length;
      const passedUkt = uktParticipants.filter(u => u.createdAt.getMonth() === mIndex && u.createdAt.getFullYear() === yIndex && u.status === "APPROVED").length;

      chartData.push({
        name: monthName,
        Anggota: newMembers,
        Pelatih: newCoaches,
        LulusUKT: passedUkt
      });
    }

    return NextResponse.json({
      totalAnggota,
      totalPelatih,
      passRate: passRate.toFixed(1), // e.g. "94.2"
      registrationFee,
      chartData
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
