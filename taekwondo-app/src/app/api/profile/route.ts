import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

    // Find matching belt rank to get image URL
    const beltRank = await prisma.beltRank.findFirst({
      where: {
        OR: [
          { name: user.member.currentBelt },
          { name: { contains: user.member.currentBelt.split(" (")[0], mode: 'insensitive' } }
        ]
      }
    });

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
      beltImageUrl: (beltRank as any)?.imageUrl || null, // Dynamic belt image from database
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

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== "MEMBER") {
      return NextResponse.json(
        { error: "Forbidden: Hanya Member yang dapat mengubah profil" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { phone, password } = body;

    const updateData: any = {};
    const memberUpdateData: any = {};

    if (phone !== undefined) {
      memberUpdateData.phone = phone;
    }

    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password minimal harus 8 karakter" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Perform transaction
    await prisma.$transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: updateData,
        });
      }

      if (Object.keys(memberUpdateData).length > 0) {
        await tx.member.update({
          where: { userId },
          data: memberUpdateData,
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
    });

  } catch (error: any) {
    console.error("[PUT_PROFILE_ERROR]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat memperbarui profil" },
      { status: 500 }
    );
  }
}
