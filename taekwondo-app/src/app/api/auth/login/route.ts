import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { signJWT } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const formattedEmail = email.trim().toLowerCase();

    // In a real app, query database with credentials
    const user = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "Akun dengan email tersebut tidak ditemukan." }, { status: 404 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: "Kata sandi yang Anda masukkan salah." }, { status: 401 });
    }

    // Generate JWT Token
    const token = await signJWT(
      { userId: user.id, email: user.email, role: user.role },
      { exp: "30d" } // Token expires in 30 days
    );

    const response = NextResponse.json({
      success: true,
      role: user.role.toLowerCase(),
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
