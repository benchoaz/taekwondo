import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// List 15 Sabuk Resmi Taekwondo (PBTI / Kukkiwon)
export const OFFICIAL_TAEKWONDO_BELTS = [
  "Sabuk Putih (10 Geup)",
  "Sabuk Kuning Polos (9 Geup)",
  "Sabuk Kuning Strip Hijau (8 Geup)",
  "Sabuk Hijau Polos (7 Geup)",
  "Sabuk Hijau Strip Biru (6 Geup)",
  "Sabuk Biru Polos (5 Geup)",
  "Sabuk Biru Strip Merah (4 Geup)",
  "Sabuk Merah Polos (3 Geup)",
  "Sabuk Merah Strip Hitam I (2 Geup)",
  "Sabuk Merah Strip Hitam II (1 Geup)",
  "Sabuk Hitam Dan 1 (Poom 1)",
  "Sabuk Hitam Dan 2",
  "Sabuk Hitam Dan 3",
  "Sabuk Hitam Dan 4",
  "Sabuk Hitam Dan 5+ (Master)"
];

// GET /api/member/belt-claim — Ambil klaim sabuk teranyar milik member
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) {
      return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
    }

    const latestClaim = await (prisma as any).beltClaim.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      data: latestClaim
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/member/belt-claim — Member mengajukan klaim sabuk baru + upload sertifikat UKT
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || userRole !== "MEMBER") {
      return NextResponse.json({ error: "Forbidden: Hanya Member yang dapat mengajukan klaim sabuk" }, { status: 403 });
    }

    const member = await prisma.member.findUnique({ where: { userId } });
    if (!member) {
      return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const { claimedBelt, certProofUrl } = body;

    if (!claimedBelt) {
      return NextResponse.json({ error: "Tingkatan sabuk yang diklaim wajib dipilih" }, { status: 400 });
    }

    // Validasi apakah sabuk termasuk dalam 15 Sabuk Resmi PBTI
    const isValidBelt = OFFICIAL_TAEKWONDO_BELTS.some(
      b => b.toLowerCase() === claimedBelt.toLowerCase() || claimedBelt.toLowerCase().includes(b.split(" (")[0].toLowerCase())
    );

    if (!isValidBelt) {
      return NextResponse.json({ error: "Tingkatan sabuk tidak valid menurut standar resmi PBTI/Kukkiwon" }, { status: 400 });
    }

    // Jika klaim sabuk baru (berbeda dari sabuk saat ini), wajib ada bukti sertifikat UKT
    const isNewBelt = member.currentBelt.toLowerCase().trim() !== claimedBelt.toLowerCase().trim();

    if (isNewBelt && (!certProofUrl || certProofUrl.trim().length === 0)) {
      return NextResponse.json({
        error: "Wajib mengunggah Foto/Dokumen Bukti Sertifikat UKT untuk melakukan klaim kenaikan sabuk"
      }, { status: 400 });
    }

    // Jika sabuk sama dan tidak ada foto sertifikat baru, tidak perlu klaim
    if (!isNewBelt) {
      return NextResponse.json({
        success: true,
        message: "Sabuk saat ini sudah sesuai.",
        data: null
      });
    }

    // Cek apakah ada klaim PENDING sebelumnya
    const existingPending = await (prisma as any).beltClaim.findFirst({
      where: { memberId: member.id, status: "PENDING" }
    });

    let claimRecord;
    if (existingPending) {
      // Update pengajuan pending yang ada
      claimRecord = await (prisma as any).beltClaim.update({
        where: { id: existingPending.id },
        data: {
          claimedBelt,
          certProofUrl: certProofUrl || existingPending.certProofUrl,
          currentBelt: member.currentBelt,
          updatedAt: new Date()
        }
      });
    } else {
      // Buat pengajuan klaim baru
      claimRecord = await (prisma as any).beltClaim.create({
        data: {
          memberId: member.id,
          claimedBelt,
          currentBelt: member.currentBelt,
          certProofUrl: certProofUrl || "",
          status: "PENDING"
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Pengajuan klaim sabuk berhasil dikirim. Menunggu verifikasi dari Pelatih/Admin.",
      data: claimRecord
    });
  } catch (error: any) {
    console.error("[BELT_CLAIM_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Gagal memproses klaim sabuk" }, { status: 500 });
  }
}
