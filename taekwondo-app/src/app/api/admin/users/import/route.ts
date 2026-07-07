import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { sendWelcomeCredentials } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication & Authorization
    let tokenStr = request.cookies.get('auth_token')?.value;
    if (!tokenStr) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        tokenStr = authHeader.substring(7);
      }
    }
    
    if (!tokenStr) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let adminPayload;
    try {
      adminPayload = await verifyJWT<{userId: string, role: string}>(tokenStr);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (adminPayload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only admins can perform this action" }, { status: 403 });
    }

    // 2. Parse Body (Expects an array of members)
    const body = await request.json();
    const { members } = body;

    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ error: "Data anggota kosong atau tidak valid." }, { status: 400 });
    }

    const bcrypt = require("bcryptjs");
    let successCount = 0;
    let errors = [];

    // 3. Process each member
    for (let i = 0; i < members.length; i++) {
      const row = members[i];
      const name = row.name?.toString().trim();
      let phone = row.phone?.toString().trim();

      if (!name || !phone) {
        errors.push(`Baris ${i + 1}: Nama atau Nomor WA kosong.`);
        continue;
      }

      // Generate a username from the name
      // e.g., "Budi Santoso" -> "budisantoso"
      let baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (baseUsername.length < 4) {
        baseUsername = baseUsername + Math.floor(1000 + Math.random() * 9000); // Ensure at least 4 chars
      }

      // Ensure username uniqueness
      let username = baseUsername;
      let counter = 1;
      while (true) {
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (!existingUser) break;
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Generate a default password (e.g. Taekwondo123)
      const defaultPassword = "Taekwondo123";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      const dummyEmail = `${username}@taekwondo.local`;

      try {
        const result = await prisma.$transaction(async (tx) => {
          // Create User
          const newUser = await tx.user.create({
            data: {
              email: dummyEmail,
              username: username,
              password: hashedPassword,
              role: "MEMBER",
              name: name,
            },
          });

          // Create Member Profile (minimal data)
          const newMember = await tx.member.create({
            data: {
              userId: newUser.id,
              fullName: name,
              memberNumber: `WT-${Math.floor(10000 + Math.random() * 90000)}`, // WT-XXXXX
              phone: phone,
              dateOfBirth: new Date("2000-01-01"), // Default filler date, they can update later
              currentBelt: "Sabuk Putih (10 Geup)", // Default
            },
          });

          // Log Activity
          await tx.activityLog.create({
            data: {
              adminId: adminPayload.userId,
              action: "IMPORT_MEMBER",
              target: username,
              details: `Imported old member: ${name} (${username})`,
              ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown",
              browser: request.headers.get("user-agent") || "Unknown",
              status: "SUCCESS"
            }
          });

          return { newUser, newMember };
        });

        // Send WhatsApp Welcome Message
        await sendWelcomeCredentials(phone, name, username, defaultPassword, result.newMember.memberNumber);
        
        successCount++;
      } catch (err: any) {
        console.error(`Error importing row ${i + 1} (${name}):`, err);
        errors.push(`Baris ${i + 1} (${name}): Gagal menyimpan ke database.`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${successCount} anggota dari total ${members.length} data.`,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error("Import users error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
