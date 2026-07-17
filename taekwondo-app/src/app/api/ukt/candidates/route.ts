import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const candidates = await prisma.uktParticipant.findMany({
      include: {
        member: true,
        uktExam: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(candidates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, 
      status, 
      poomsaeScore, 
      kyorugiScore, 
      basicTechScore, 
      physicalScore, 
      theoryScore, 
      finalScore 
    } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedCandidate = await prisma.uktParticipant.update({
      where: { id },
      data: { 
        status,
        poomsaeScore: poomsaeScore !== undefined ? parseFloat(poomsaeScore) : undefined,
        kyorugiScore: kyorugiScore !== undefined ? parseFloat(kyorugiScore) : undefined,
        basicTechScore: basicTechScore !== undefined ? parseFloat(basicTechScore) : undefined,
        physicalScore: physicalScore !== undefined ? parseFloat(physicalScore) : undefined,
        theoryScore: theoryScore !== undefined ? parseFloat(theoryScore) : undefined,
        finalScore: finalScore !== undefined ? parseFloat(finalScore) : undefined,
      },
      include: {
        member: true,
      }
    });

    // If candidate passed (APPROVED status), generate certificate and auto-promote belt
    if (status === "APPROVED") {
      const certNumber = `CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      await prisma.certificate.create({
        data: {
          memberId: updatedCandidate.memberId,
          certNumber,
          oldBelt: updatedCandidate.member.currentBelt,
          newBelt: updatedCandidate.targetBelt,
          qrCodeUrl: `/verify-certificate/${certNumber}`,
          isValid: true,
        }
      });

      // Automatically update member's current belt rank
      await prisma.member.update({
        where: { id: updatedCandidate.memberId },
        data: { currentBelt: updatedCandidate.targetBelt },
      });

      // Kirim Push Notification Kelulusan
      try {
        const { notifyUser } = await import("@/lib/notify");
        await notifyUser({
          title: "Selamat! Ujian UKT Lulus 🎉",
          message: `Selamat! Anda dinyatakan LULUS dalam Ujian Kenaikan Tingkat ke ${updatedCandidate.targetBelt}. Sertifikat digital Anda telah diterbitkan!`,
          type: "UKT",
          userId: updatedCandidate.member.userId,
          link: "/m/profile"
        });
      } catch (err) {
        console.error("FCM UKT success notify error:", err);
      }
    } else if (status === "FAILED") {
      // Kirim Push Notification Remedial/Gagal
      try {
        const { notifyUser } = await import("@/lib/notify");
        await notifyUser({
          title: "Hasil Ujian UKT ⚠️",
          message: `Anda dinyatakan perlu mengikuti remedial/belum lulus untuk kenaikan tingkat ke ${updatedCandidate.targetBelt}. Harap hubungi pelatih untuk jadwal ujian susulan.`,
          type: "UKT",
          userId: updatedCandidate.member.userId,
          link: "/m/ukt"
        });
      } catch (err) {
        console.error("FCM UKT fail notify error:", err);
      }
    }

    return NextResponse.json(updatedCandidate);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
