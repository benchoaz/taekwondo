import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, role, currentBelt, selfieUrl, certDocUrl, password, weight, height, waistCircum, prepaidMonthsRemaining, phone, status } = body;

    // Fetch user details first to see if role changed
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { coach: true, member: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const bcrypt = require("bcryptjs");

    // Update user
    let updateData: any = {
      email: email !== undefined ? email : existingUser.email,
      role: role !== undefined ? role : existingUser.role,
    };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
        const isBeltChanging = currentBelt !== undefined && currentBelt !== existingUser.member.currentBelt;


        const memberId = existingUser.member.id;

        await prisma.member.update({
          where: { id: memberId },
          data: { 
            fullName: name,
            currentBelt: currentBelt !== undefined ? currentBelt : existingUser.member.currentBelt,
            ...(selfieUrl !== undefined && { selfieUrl }),
            ...(prepaidMonthsRemaining !== undefined && { prepaidMonthsRemaining: parseInt(prepaidMonthsRemaining) }),
            ...(phone !== undefined && { phone }),
            ...(status !== undefined && { status }),
          },
        });

        // 1. Handle Belt History and Certificate creation on belt change
        if (isBeltChanging) {
          await prisma.beltHistory.create({
            data: {
              memberId,
              fromBelt: existingUser.member.currentBelt,
              toBelt: currentBelt,
              promotedAt: new Date()
            }
          });
          
          if (certDocUrl) {
             await prisma.certificate.create({
               data: {
                 memberId,
                 certNumber: `CERT-${Date.now()}`,
                 oldBelt: existingUser.member.currentBelt,
                 newBelt: currentBelt,
                 qrCodeUrl: certDocUrl,
                 issueDate: new Date()
               }
             });
          }
        }

        // 2. Handle specific updates to other items in the belt history list (if passed)
        const { beltHistory: reqBeltHistory } = body;
        if (reqBeltHistory && Array.isArray(reqBeltHistory)) {
          for (const bh of reqBeltHistory) {
            if (bh.id) {
              await prisma.beltHistory.update({
                where: { id: bh.id },
                data: {
                  ...(bh.promotedAt && { promotedAt: new Date(bh.promotedAt) }),
                }
              });
            }
          }
        }
      } else {
        const memberId = `M-${Math.floor(1000 + Math.random() * 9000)}`;
        await prisma.member.create({
          data: { 
            id: memberId,
            userId: id, 
            fullName: name, 
            memberNumber: `WTK-2026-00${Math.floor(10 + Math.random() * 90)}`,
            currentBelt: currentBelt !== undefined ? currentBelt : "Sabuk Putih (10 Geup)",
            ...(selfieUrl !== undefined && { selfieUrl }),
            ...(phone !== undefined && { phone }),
          },
        });

        // Create initial history for newly created member
        await prisma.beltHistory.create({
          data: {
            memberId,
            fromBelt: "Sabuk Putih (10 Geup)",
            toBelt: currentBelt !== undefined ? currentBelt : "Sabuk Putih (10 Geup)",
            promotedAt: new Date()
          }
        });
        
        if (certDocUrl) {
           await prisma.certificate.create({
             data: {
               memberId,
               certNumber: `CERT-${Date.now()}`,
               oldBelt: "Sabuk Putih (10 Geup)",
               newBelt: currentBelt !== undefined ? currentBelt : "Sabuk Putih (10 Geup)",
               qrCodeUrl: certDocUrl,
               issueDate: new Date()
             }
           });
        }
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
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash("password123", 10);
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword }, // Reset to default password hashed
      });
      return NextResponse.json({ success: true, message: "Password reset to default (password123)" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
