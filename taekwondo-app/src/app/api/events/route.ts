import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "PUBLISHED";
    const events = await prisma.tournamentEvent.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("Fetch Events Error:", error);
    return NextResponse.json({ error: "Gagal memuat daftar kejuaraan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = await prisma.tournamentEvent.create({
      data: {
        title: body.title,
        level: body.level || "Provinsi",
        location: body.location,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        posterUrl: body.posterUrl,
        proposalUrl: body.proposalUrl,
        source: "USER_SUBMITTED",
        status: "PENDING", // Menunggu persetujuan Admin
      }
    });
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("Submit Event Error:", error);
    return NextResponse.json({ error: "Gagal mengirimkan proposal kejuaraan" }, { status: 500 });
  }
}
