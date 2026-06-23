import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    // Fetch the latest upcoming exam
    const exam = await prisma.uktExam.findFirst({
      where: { status: "UPCOMING" },
      orderBy: { date: "asc" },
      include: {
        participants: {
          include: {
            member: true
          }
        }
      }
    });

    if (!exam) {
      return NextResponse.json({ error: "Belum ada jadwal UKT terdekat." }, { status: 404 });
    }

    // Check if member is registered
    let registration = null;
    if (memberId) {
      registration = await prisma.uktParticipant.findFirst({
        where: {
          uktExamId: exam.id,
          memberId: memberId
        }
      });
    }

    return NextResponse.json({
      exam,
      registration
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, uktExamId, targetBelt, uploadedDocs } = body;

    if (!memberId || !uktExamId || !targetBelt) {
      return NextResponse.json({ error: "Data registrasi tidak lengkap." }, { status: 400 });
    }

    // Create participant entry
    const registration = await prisma.uktParticipant.create({
      data: {
        memberId,
        uktExamId,
        targetBelt,
        status: "PENDING",
        uploadedDocs: uploadedDocs || {}
      }
    });

    // Fetch dynamic uktFee from Settings
    const settingObj = await prisma.setting.findUnique({
      where: { id: "default" }
    });
    const uktFeesMap = (settingObj?.uktFees as Record<string, any> | null) || {};
    const feeToCharge = uktFeesMap[targetBelt] !== undefined && uktFeesMap[targetBelt] !== null
      ? parseFloat(uktFeesMap[targetBelt])
      : (settingObj?.uktFee || 150000);

    // Automatically create a corresponding Payment record
    const payment = await prisma.payment.create({
      data: {
        memberId,
        amount: feeToCharge,
        purpose: `Pendaftaran UKT (${targetBelt.split(" (")[0]})`,
        status: "PENDING"
      }
    });

    return NextResponse.json({
      success: true,
      registration,
      payment
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
