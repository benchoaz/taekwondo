import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, birthDate, selfie, kk, weight, height, waistCircum } = body;

    if (!name || !email || !phone || !birthDate || !selfie || !kk) {
      return NextResponse.json({ error: "Semua data pendaftaran wajib diisi (termasuk selfie & KK)" }, { status: 400 });
    }

    const formattedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar di sistem dojang" }, { status: 409 });
    }

    const settings = await prisma.setting.findUnique({ where: { id: "default" } });
    const dojangName = settings?.dojangName || "WHITE TIGER TAEKWONDO";

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("password123", 10); // default seed password hashed

    // 1. Create User
    const newUser = await prisma.user.create({
      data: {
        email: formattedEmail,
        password: hashedPassword, // Default password for new register, change later
        role: "MEMBER",
      },
    });

    // 2. Create Member linked to user with PENDING_VERIFICATION status
    const newMember = await prisma.member.create({
      data: {
        userId: newUser.id,
        fullName: name,
        memberNumber: `PENDING-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "PENDING_VERIFICATION",
        dateOfBirth: new Date(birthDate),
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        waistCircum: waistCircum ? parseFloat(waistCircum) : null,
        selfieUrl: selfie,
        kkUrl: kk,
      },
    });

    // 3. Generate Payment for Registration Fee
    const regFee = 150000;
    const payment = await prisma.payment.create({
      data: {
        memberId: newMember.id,
        amount: regFee,
        purpose: "Pendaftaran & Seragam Awal",
        status: "PENDING",
      },
    });

    let qrString = null;
    let externalId = null;

    // 4. Try generating Xendit QRIS
    try {
      const { createXenditQRIS } = await import("@/lib/xendit");
      externalId = `TKD-${payment.id}-${Date.now()}`;
      const xenditRes = await createXenditQRIS(externalId, regFee);
      qrString = xenditRes.qr_string;

      await prisma.payment.update({
        where: { id: payment.id },
        data: { externalId },
      });
    } catch (err: any) {
      console.log("Xendit QRIS skipped/failed:", err.message);
      // Fallback to manual if no key
    }

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil disimpan.",
      member: {
        id: newMember.id,
        name: newMember.fullName,
        email: formattedEmail,
        status: newMember.status,
      },
      payment: {
        id: payment.id,
        amount: regFee,
        qrString,
        externalId
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
