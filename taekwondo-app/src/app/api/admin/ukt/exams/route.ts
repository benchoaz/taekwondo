import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// GET /api/admin/ukt/exams — Ambil daftar histori semua ujian UKT
export async function GET() {
  try {
    const exams = await prisma.uktExam.findMany({
      orderBy: { date: "desc" },
      include: {
        participants: true
      }
    });
    return NextResponse.json({ success: true, data: exams });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/ukt/exams — Buat jadwal UKT baru + sinkronkan biaya dan syarat
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, 
      date, 
      location, 
      registrationStart, 
      registrationEnd,
      uktRequirements, // Array of strings (syarat dinamis)
      uktFee,          // Flat fee (number)
      uktFees          // Map of belt fees
    } = body;

    if (!title || !date || !location) {
      return NextResponse.json({ error: "Data jadwal UKT tidak lengkap." }, { status: 400 });
    }

    const exam = await prisma.uktExam.create({
      data: {
        title,
        date: new Date(date),
        location,
        registrationStart: registrationStart ? new Date(registrationStart) : new Date(),
        registrationEnd: registrationEnd ? new Date(registrationEnd) : new Date(date),
        status: "UPCOMING"
      }
    });

    const updateData: any = {};
    if (uktRequirements !== undefined) updateData.uktRequirements = uktRequirements;
    if (uktFee !== undefined) updateData.uktFee = parseFloat(uktFee);
    if (uktFees !== undefined) updateData.uktFees = uktFees;

    if (Object.keys(updateData).length > 0) {
      await prisma.setting.upsert({
        where: { id: "default" },
        update: updateData,
        create: { id: "default", ...updateData }
      });
    }

    return NextResponse.json({ success: true, data: exam });
  } catch (error: any) {
    console.error("Create UKT Exam Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/ukt/exams — Sunting jadwal UKT
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      id,
      title, 
      date, 
      location, 
      registrationStart, 
      registrationEnd,
      status
    } = body;

    if (!id || !title || !date || !location) {
      return NextResponse.json({ error: "Data kurang lengkap untuk penyuntingan." }, { status: 400 });
    }

    const exam = await prisma.uktExam.update({
      where: { id },
      data: {
        title,
        date: new Date(date),
        location,
        registrationStart: registrationStart ? new Date(registrationStart) : undefined,
        registrationEnd: registrationEnd ? new Date(registrationEnd) : undefined,
        status: status || undefined
      }
    });

    return NextResponse.json({ success: true, data: exam });
  } catch (error: any) {
    console.error("Update UKT Exam Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/ukt/exams — Hapus jadwal UKT
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID UKT diperlukan." }, { status: 400 });
    }

    await prisma.uktExam.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Jadwal UKT berhasil dihapus." });
  } catch (error: any) {
    console.error("Delete UKT Exam Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
