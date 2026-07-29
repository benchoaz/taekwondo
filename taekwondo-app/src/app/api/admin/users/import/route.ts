import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    // Permissive check for logged in admin/coach
    if (userRole === "MEMBER") {
      return NextResponse.json({ error: "Forbidden: Hanya Admin/Coach yang dapat mengimpor data" }, { status: 403 });
    }

    const body = await request.json();
    const { members } = body;

    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ error: "Data anggota kosong atau tidak valid." }, { status: 400 });
    }

    const bcrypt = require("bcryptjs");
    let successCount = 0;
    let errors: string[] = [];

    for (let i = 0; i < members.length; i++) {
      const row = members[i];
      
      // Flexibly extract fields from Excel headers
      const name = (row.NAMA || row.nama || row.name || "").toString().trim();
      let phone = (row["NOMOR TLP"] || row.NOMOR_TLP || row.phone || row.hp || "").toString().trim();
      let customUsername = (row.USER || row.user || row.username || "").toString().trim();
      let customPassword = (row.PASWORD || row.pasword || row.PASSWORD || row.password || "").toString().trim();

      if (!name) {
        errors.push(`Baris ${i + 1}: Nama kosong.`);
        continue;
      }

      // Generate or normalize username
      let username = customUsername;
      if (!username) {
        let baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (baseUsername.length < 4) {
          baseUsername = baseUsername + Math.floor(1000 + Math.random() * 9000);
        }
        username = baseUsername;
      }

      // Ensure username uniqueness by suffixing if duplicate
      let finalUsername = username;
      let counter = 1;
      while (true) {
        const existingUser = await prisma.user.findUnique({ where: { username: finalUsername } });
        if (!existingUser) break;
        finalUsername = `${username}${counter}`;
        counter++;
      }

      // Use custom password if present, otherwise default to user1234
      const plainPassword = customPassword || "user1234";
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const dummyEmail = `${finalUsername}@taekwondo.local`;

      try {
        await prisma.$transaction(async (tx) => {
          // Create User
          const newUser = await tx.user.create({
            data: {
              email: dummyEmail,
              username: finalUsername,
              password: hashedPassword,
              role: "MEMBER",
              name: name,
            },
          });

          // Create Member Profile
          await tx.member.create({
            data: {
              userId: newUser.id,
              fullName: name,
              memberNumber: `WTK-${Math.floor(10000 + Math.random() * 90000)}`,
              phone: phone || null,
              dateOfBirth: new Date("2000-01-01"),
              currentBelt: "Sabuk Putih (10 Geup)",
              status: "ACTIVE",
            },
          });

        });

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

