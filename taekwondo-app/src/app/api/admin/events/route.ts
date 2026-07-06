import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const event = await prisma.tournamentEvent.create({
      data: {
        title: body.title,
        level: body.level || "Provinsi",
        location: body.location || "Belum Ditentukan",
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        posterUrl: body.posterUrl,
        proposalUrl: body.proposalUrl,
        link: body.link,
        source: "MANUAL",
        status: "PUBLISHED", // Admin events are automatically published
      }
    });
    return NextResponse.json({ success: true, data: event });
  } catch (error: any) {
    console.error("Admin Create Event Error:", error);
    return NextResponse.json({ error: error.message || "Gagal membuat kejuaraan" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    await prisma.tournamentEvent.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Delete Event Error:", error);
    return NextResponse.json({ error: error.message || "Gagal menghapus kejuaraan" }, { status: 500 });
  }
}
