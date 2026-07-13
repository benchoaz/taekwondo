import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

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

    if (adminPayload.role !== "ADMIN" && adminPayload.role !== "COACH") {
      return NextResponse.json({ error: "Forbidden: Only admins or coaches can perform this action" }, { status: 403 });
    }

    // 2. Parse Body & Input Sanitization
    const body = await request.json();
    let { name, username, password, role, birthDate } = body;

    if (!name || !username || !password || !birthDate) {
      return NextResponse.json({ error: "Semua field bertanda bintang wajib diisi." }, { status: 400 });
    }

    name = name.trim();
    username = username.trim().toLowerCase();

    // 3. Server Validation
    if (name.length < 3 || name.length > 100) {
      return NextResponse.json({ error: "Nama lengkap minimal 3 dan maksimal 100 karakter." }, { status: 400 });
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return NextResponse.json({ error: "Nama lengkap hanya boleh mengandung huruf dan spasi." }, { status: 400 });
    }
    
    if (username.length < 4 || username.length > 30) {
      return NextResponse.json({ error: "Username minimal 4 dan maksimal 30 karakter." }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_.@-]*$/.test(username)) {
      return NextResponse.json({ error: "Username hanya boleh mengandung huruf, angka, underscore, titik, strip, dan @ tanpa spasi." }, { status: 400 });
    }

    if (password.length < 8 || password.length > 50) {
      return NextResponse.json({ error: "Password minimal 8 dan maksimal 50 karakter." }, { status: 400 });
    }


    const today = new Date();
    const dob = new Date(birthDate);
    if (dob > today) {
      return NextResponse.json({ error: "Tanggal lahir tidak boleh di masa depan." }, { status: 400 });
    }

    // 4. Check for duplicate Username
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      return NextResponse.json({ error: "Username sudah digunakan." }, { status: 400 });
    }



    // 5. Password Hashing (bcrypt)
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Database Transaction (Create User + Member + ActivityLog)
    // Create a dummy email if required by the schema (since email is @unique and not null)
    const dummyEmail = `${username}@taekwondo.local`;

    const result = await prisma.$transaction(async (tx) => {
      // Create User
      const newUser = await tx.user.create({
        data: {
          email: dummyEmail,
          username: username,
          password: hashedPassword,
          role: role || "MEMBER",
          name: name,
        },
      });

      let newMember = null;
      let newCoach = null;

      if (newUser.role === "MEMBER") {
        // Create Member Profile
        newMember = await tx.member.create({
          data: {
            userId: newUser.id,
            fullName: name,
            memberNumber: `WT-${Math.floor(1000 + Math.random() * 9000)}`,
            dateOfBirth: dob,
            status: "ACTIVE",
          },
        });
      } else if (newUser.role === "COACH") {
        // Create Coach Profile
        newCoach = await tx.coach.create({
          data: {
            userId: newUser.id,
            fullName: name,
            danRank: "Dan 1 Black Belt",
          },
        });
      }

      // Log Activity
      await tx.activityLog.create({
        data: {
          adminId: adminPayload.userId,
          action: newUser.role === "COACH" ? "CREATE_COACH" : newUser.role === "ADMIN" ? "CREATE_ADMIN" : "CREATE_MEMBER",
          target: username,
          details: `Created new ${newUser.role.toLowerCase()}: ${name} (${username})`,
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown",
          browser: request.headers.get("user-agent") || "Unknown",
          status: "SUCCESS"
        }
      });

      return { newUser, newMember, newCoach };
    });

    // 7. Return friendly response (no password leaked)
    return NextResponse.json({
      success: true,
      message: "User berhasil didaftarkan.",
      user: {
        id: result.newUser.id,
        memberId: result.newMember?.id || null,
        name: result.newMember?.fullName || result.newCoach?.fullName || result.newUser.name,
        username: result.newUser.username,
        email: result.newUser.email,
        role: result.newUser.role,
        status: "AKTIF",
        memberNumber: result.newMember?.memberNumber || "-",
        currentBelt: result.newMember?.currentBelt || "-",
        progress: result.newMember?.progress || 0,
        createdAt: result.newUser.createdAt,
      }
    });

  } catch (error: any) {
    console.error("Add user error:", error);
    // Log failure activity if possible, but standard catch is fine for now
    return NextResponse.json({ error: "Terjadi kesalahan internal server. Gagal menyimpan data." }, { status: 500 });
  }
}
