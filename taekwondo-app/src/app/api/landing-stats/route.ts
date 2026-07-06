import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalMembers = await prisma.member.count();
    const totalCoaches = await prisma.coach.count();
    const totalAchievements = await prisma.achievement.count({
      where: {
        status: "APPROVED"
      }
    });

    return NextResponse.json({
      members: totalMembers,
      coaches: totalCoaches,
      achievements: totalAchievements
    });
  } catch (error) {
    console.error("Failed to fetch landing stats:", error);
    return NextResponse.json({ members: 0, coaches: 0, achievements: 0 }, { status: 500 });
  }
}
