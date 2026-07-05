import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, role, currentBelt, selfieUrl, certDocUrl, password } = body;

    // Fetch user details first to see if role changed
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { coach: true, member: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: email !== undefined ? email : existingUser.email,
        role: role !== undefined ? role : existingUser.role,
        ...(password && { password }), // Update password if provided
      },
    });

    // Update associated coach/member name
    if (updatedUser.role === "COACH") {
      if (existingUser.coach) {
        await prisma.coach.update({
          where: { id: existingUser.coach.id },
          data: { fullName: name },
        });
      } else {
        await prisma.coach.create({
          data: { userId: id, fullName: name, danRank: "Dan 1 Black Belt" },
        });
      }
    } else if (updatedUser.role === "MEMBER") {
      if (existingUser.member) {
        await prisma.member.update({
          where: { id: existingUser.member.id },
          data: { 
            fullName: name,
            currentBelt: currentBelt !== undefined ? currentBelt : existingUser.member.currentBelt,
            ...(selfieUrl !== undefined && { selfieUrl }),
            ...(certDocUrl !== undefined && { certDocUrl }),
          },
        });
      } else {
        await prisma.member.create({
          data: { 
            userId: id, 
            fullName: name, 
            memberNumber: `TKD-2026-00${Math.floor(10 + Math.random() * 90)}`,
            currentBelt: currentBelt !== undefined ? currentBelt : "Sabuk Putih (10 Geup)",
            ...(selfieUrl !== undefined && { selfieUrl }),
            ...(certDocUrl !== undefined && { certDocUrl }),
          },
        });
      }
    }

    return NextResponse.json({
      id: updatedUser.id,
      name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: "AKTIF",
      currentBelt: updatedUser.role === "MEMBER" ? currentBelt : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "RESET_PASSWORD") {
      await prisma.user.update({
        where: { id },
        data: { password: "password123" }, // Reset to default password
      });
      return NextResponse.json({ success: true, message: "Password reset to default (password123)" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
