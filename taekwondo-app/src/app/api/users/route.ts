import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        member: {
          select: {
            id: true,
            fullName: true,
            memberNumber: true,
            currentBelt: true,
            progress: true,
          }
        },
        coach: {
          select: {
            id: true,
            fullName: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    
    // Map to custom payload for compatibility
    const formattedUsers = users.map((u) => ({
      id: u.id,
      memberId: u.member?.id || null,
      coachId: u.coach?.id || null,
      name: u.role === "ADMIN" 
        ? "Administrator" 
        : u.role === "COACH" 
          ? (u.coach?.fullName || "Master Ahmad S.B.") 
          : (u.member?.fullName || "Beni Setiawan"),
      email: u.email,
      role: u.role,
      status: "AKTIF",
      memberNumber: u.member?.memberNumber || null,
      currentBelt: u.member?.currentBelt || null,
      progress: u.member?.progress || 0,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role } = body;

    if (!email || !role) {
      return NextResponse.json({ error: "Email and Role are required" }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password: "password123", // Default seed password
        role,
      },
    });

    // If coach/member, optionally create details
    if (role === "COACH") {
      await prisma.coach.create({
        data: {
          userId: newUser.id,
          fullName: name || "New Coach",
          danRank: "Dan 1 Black Belt",
        },
      });
    } else if (role === "MEMBER") {
      await prisma.member.create({
        data: {
          userId: newUser.id,
          fullName: name || "New Member",
          memberNumber: `TKD-2026-00${Math.floor(10 + Math.random() * 90)}`,
        },
      });
    }

    return NextResponse.json({
      id: newUser.id,
      name: name || (role === "ADMIN" ? "Administrator" : role === "COACH" ? "New Coach" : "New Member"),
      email: newUser.email,
      role: newUser.role,
      status: "AKTIF",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
