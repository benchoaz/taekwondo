import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, docName, docUrl } = body;

    if (!memberId || !docName || !docUrl) {
      return NextResponse.json({ error: "Missing required fields: memberId, docName, docUrl" }, { status: 400 });
    }

    // Resolusi otomatis jika memberId yang dikirim adalah userId
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { id: memberId },
          { userId: memberId }
        ]
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Siswa tidak ditemukan." }, { status: 404 });
    }

    // Temukan pendaftaran UKT aktif
    const candidate = await prisma.uktParticipant.findFirst({
      where: {
        memberId: member.id,
        status: { in: ["PENDING", "FAILED"] } // Hanya bisa update jika belum disetujui / dinilai
      }
    });

    if (!candidate) {
      return NextResponse.json({ error: "Pendaftaran UKT aktif tidak ditemukan." }, { status: 404 });
    }

    // Perbarui Map uploadedDocs di JSONB
    const currentDocs = (candidate.uploadedDocs as Record<string, string>) || {};
    const updatedDocs = {
      ...currentDocs,
      [docName]: docUrl
    };

    // Jika statusnya FAILED (karena berkas ditolak), kembalikan menjadi PENDING agar diverifikasi ulang
    const newStatus = candidate.status === "FAILED" ? "PENDING" : candidate.status;

    const updatedCandidate = await prisma.uktParticipant.update({
      where: { id: candidate.id },
      data: {
        uploadedDocs: updatedDocs,
        status: newStatus
      }
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil mengunggah dokumen: ${docName}`,
      candidate: updatedCandidate
    });
  } catch (error: any) {
    console.error("Error updating UKT doc:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
