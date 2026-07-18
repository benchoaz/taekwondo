import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { signJWT } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email/ID and password are required" }, { status: 400 });
    }

    const formattedInput = email.trim().toLowerCase();
    const isEmail = formattedInput.includes("@");

    // Query database with email OR memberNumber
    let user;
    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: formattedInput },
        include: { member: true, coach: true }
      });
    } else {
      // Find by Username OR Member Number OR Phone Number
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: formattedInput },
            { member: { memberNumber: email.trim().toUpperCase() } },
            { member: { phone: formattedInput } }
          ]
        },
        include: { member: true, coach: true }
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Email/ID atau kata sandi yang Anda masukkan salah." }, { status: 401 });
    }

    // Blokir login jika peran adalah MEMBER dan statusnya belum ACTIVE (misal masih PENDING_VERIFICATION / PAYMENT_UPLOADED)
    if (user.role === "MEMBER" && user.member) {
      const status = user.member.status;
      if (status === "PENDING_VERIFICATION" || status === "PAYMENT_UPLOADED") {
        return NextResponse.json({ error: "Pendaftaran Anda sedang diverifikasi admin. Silakan konfirmasi pembayaran." }, { status: 403 });
      } else if (status === "REJECTED") {
        return NextResponse.json({ error: "Pendaftaran Anda ditolak oleh pengurus dojang." }, { status: 403 });
      } else if (status !== "ACTIVE") {
        return NextResponse.json({ error: "Akun Anda dinonaktifkan. Silakan hubungi admin." }, { status: 403 });
      }
    }

    const bcrypt = require("bcryptjs");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Email atau kata sandi yang Anda masukkan salah." }, { status: 401 });
    }

    // Generate JWT Token
    const token = await signJWT(
      { userId: user.id, email: user.email, role: user.role },
      { exp: "30d" } // Token expires in 30 days
    );

    const response = NextResponse.json({
      success: true,
      role: user.role.toLowerCase(),
      token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.role === "ADMIN" ? "Administrator" : (user.role === "COACH" ? user.coach?.fullName : user.member?.fullName),
        memberNumber: user.member?.memberNumber,
        currentBelt: user.member?.currentBelt,
        progress: user.member?.progress
      }
    });

    // Set HttpOnly Cookie
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
