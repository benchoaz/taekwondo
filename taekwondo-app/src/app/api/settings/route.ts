import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let setting = await prisma.setting.findUnique({
      where: { id: "default" },
    });

    if (!setting) {
      // Create default settings if they do not exist
      setting = await prisma.setting.create({
        data: {
          id: "default",
          dojangName: "TAEKWONDO ACADEMY",
          motto: "Disiplin • Integritas • Prestasi",
          heroTitle: "TAEKWONDO ACADEMY - Bangun Mental Juara, Disiplin dan Prestasi Bersama Kami",
          description: "Membangun karakter pemenang melalui dedikasi fisik, moral tinggi, dan prestasi yang terstruktur.",
          address: "Jl. Pahlawan Olahraga No. 88, Senayan, Jakarta Selatan, DKI Jakarta",
          email: "info@taekwondo.com",
          phone: "+62 812-3456-7890",
          registrationFee: 150000,
          sppFee: 100000,
          sessionFee: 15000,
          uktFee: 150000,
          uktRequirements: ["Surat Izin Orang Tua", "Foto Selfie 3x4"],
          uktFees: {},
          showIntro: true,
        },
      });
    }

    return NextResponse.json(setting);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      logoUrl,
      heroBgUrl,
      dojangName,
      motto,
      heroTitle,
      description,
      address,
      email,
      phone,
      registrationFee,
      sppFee,
      sessionFee,
      uktFee,
      uktRequirements,
      uktFees,
      showIntro,
      dojangLat,
      dojangLng,
      dojangRadius,
    } = body;

    const setting = await prisma.setting.upsert({
      where: { id: "default" },
      update: {
        logoUrl,
        heroBgUrl,
        dojangName,
        motto,
        heroTitle,
        description,
        address,
        email,
        phone,
        registrationFee: registrationFee ? parseFloat(registrationFee) : undefined,
        sppFee: sppFee ? parseFloat(sppFee) : undefined,
        sessionFee: sessionFee ? parseFloat(sessionFee) : undefined,
        uktFee: uktFee ? parseFloat(uktFee) : undefined,
        uktRequirements: uktRequirements !== undefined ? uktRequirements : undefined,
        uktFees: uktFees !== undefined ? uktFees : undefined,
        showIntro: showIntro !== undefined ? showIntro : undefined,
        dojangLat: dojangLat !== undefined ? parseFloat(dojangLat) : undefined,
        dojangLng: dojangLng !== undefined ? parseFloat(dojangLng) : undefined,
        dojangRadius: dojangRadius !== undefined ? parseInt(dojangRadius) : undefined,
      },
      create: {
        id: "default",
        logoUrl,
        heroBgUrl,
        dojangName: dojangName || "TAEKWONDO ACADEMY",
        motto: motto || "Disiplin • Integritas • Prestasi",
        heroTitle: heroTitle || "TAEKWONDO ACADEMY - Bangun Mental Juara, Disiplin dan Prestasi Bersama Kami",
        description: description || "Membangun karakter pemenang melalui dedikasi fisik, moral tinggi, dan prestasi yang terstruktur.",
        address: address || "Jl. Pahlawan Olahraga No. 88, Senayan, Jakarta Selatan, DKI Jakarta",
        email: email || "info@taekwondo.com",
        phone: phone || "+62 812-3456-7890",
        registrationFee: registrationFee ? parseFloat(registrationFee) : 150000,
        sppFee: sppFee ? parseFloat(sppFee) : 100000,
        sessionFee: sessionFee ? parseFloat(sessionFee) : 15000,
        uktFee: uktFee ? parseFloat(uktFee) : 150000,
        uktRequirements: uktRequirements || ["Surat Izin Orang Tua", "Foto Selfie 3x4"],
        uktFees: uktFees || {},
        showIntro: showIntro !== undefined ? showIntro : true,
        dojangLat: dojangLat !== undefined ? parseFloat(dojangLat) : undefined,
        dojangLng: dojangLng !== undefined ? parseFloat(dojangLng) : undefined,
        dojangRadius: dojangRadius !== undefined ? parseInt(dojangRadius) : 50,
      },
    });

    return NextResponse.json(setting);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
