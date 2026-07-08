import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { weight, height, waistCircum } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { member: true }
    });

    if (!user || !user.member) {
      return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });
    }

    // Update data biometrik (insert log)
    const newLog = await prisma.physicalMeasurementLog.create({
      data: {
        memberId: user.member.id,
        weight: weight != null && weight !== "" ? parseFloat(weight) : null,
        height: height != null && height !== "" ? parseFloat(height) : null,
        waistCircum: waistCircum != null && waistCircum !== "" ? parseFloat(waistCircum) : null,
        notes: "Updated via biometrics API"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Data fisik berhasil diperbarui",
      data: {
        weight: newLog.weight,
        height: newLog.height,
        waistCircum: newLog.waistCircum,
      }
    });

  } catch (error: any) {
    console.error("[PUT_BIOMETRICS_ERROR]", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data fisik" },
      { status: 500 }
    );
  }
}
