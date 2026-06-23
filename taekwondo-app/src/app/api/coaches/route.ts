import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const coaches = await prisma.coach.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    return NextResponse.json(coaches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, fullName, danRank, specialty, experience, photoUrl, certDocUrl } = body;

    const coach = await prisma.coach.update({
      where: { id },
      data: {
        fullName,
        danRank,
        specialty,
        experience,
        ...(photoUrl !== undefined && { photoUrl }),
        ...(certDocUrl !== undefined && { certDocUrl }),
      },
    });

    return NextResponse.json(coach);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

