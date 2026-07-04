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

    // Pasang Medali Bayangan jika kosong (sesuai kesepakatan)
    let achievements = user.member.achievements;
    if (achievements.length === 0) {
      achievements = [
        {
          id: "mock-1",
          memberId: user.member.id,
          title: "Juara 1 Kyorugi Putra U-45",
          eventName: "Kejurda DKI Jakarta 2024",
          date: new Date("2024-05-12"),
          rank: "Emas",
          photoUrl: null,
          certificateUrl: null,
          status: "APPROVED",
          createdAt: new Date(),
        },
        {
          id: "mock-2",
          memberId: user.member.id,
          title: "Poomsae Beregu Putra",
          eventName: "Sirkuit Nasional Taekwondo 2023",
          date: new Date("2023-11-20"),
          rank: "Perak",
          photoUrl: null,
          certificateUrl: null,
          status: "APPROVED",
          createdAt: new Date(),
        }
      ] as any[];
    }

    const profileData = {
      name: user.name,
      email: user.email,
      memberNumber: user.member.memberNumber,
      currentBelt: user.member.currentBelt,
      progress: user.member.progress,
      dateOfBirth: user.member.dateOfBirth,
      weight: user.member.weight,
      height: user.member.height,
      waistCircum: user.member.waistCircum,
      age: age > 0 ? age : 18, // Fallback otomatis 18 tahun jika belum diisi
      achievements: achievements
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
