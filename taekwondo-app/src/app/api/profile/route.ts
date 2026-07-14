import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== "MEMBER") {
      return NextResponse.json(
        { error: "Forbidden: Hanya Member yang dapat mengakses profil atlet" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        member: {
          include: {
            achievements: {
              orderBy: { date: 'desc' }
            },
            physicalLogs: {
              orderBy: { recordedAt: 'asc' }
            },
            beltHistory: {
              orderBy: { promotedAt: 'desc' }
            },
            certificates: {
              orderBy: { issueDate: 'desc' }
            }
          }
        }
      }
    });

    if (!user || !user.member) {
      return NextResponse.json({ error: "Profil Member tidak ditemukan" }, { status: 404 });
    }

    // Kalkulasi Umur
    let age = 0;
    if (user.member.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(user.member.dateOfBirth);
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    const achievements = user.member.achievements;

    const latestPhysicalLog = user.member.physicalLogs?.length > 0 
      ? user.member.physicalLogs[user.member.physicalLogs.length - 1] 
      : null;

    const profileData = {
      name: user.member.fullName || user.name,
      email: user.email,
      memberNumber: user.member.memberNumber,
      currentBelt: user.member.currentBelt,
      progress: user.member.progress,
      dateOfBirth: user.member.dateOfBirth,
      weight: latestPhysicalLog?.weight || null,
      height: latestPhysicalLog?.height || null,
      waistCircum: latestPhysicalLog?.waistCircum || null,
      age: age > 0 ? age : 18, // Fallback otomatis 18 tahun jika belum diisi
      profilePicture: user.image || null,
      achievements: achievements,
      physicalLogs: user.member.physicalLogs || [],
      beltHistory: user.member.beltHistory || [],
      certificates: user.member.certificates || []
    };

    return NextResponse.json({
      success: true,
      data: profileData
    });

  } catch (error: any) {
    console.error("[GET_PROFILE_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat mengambil profil" },
      { status: 500 }
    );
  }
}
