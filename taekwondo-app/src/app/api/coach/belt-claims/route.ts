import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET /api/coach/belt-claims — Ambil daftar klaim sabuk (untuk Coach / Admin)
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || !["COACH", "ADMIN"].includes(userRole || "")) {
      return NextResponse.json({ error: "Forbidden: Akses khusus Pelatih & Admin" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";

    const claims = await (prisma as any).beltClaim.findMany({
      where: status === "ALL" ? {} : { status },
      include: {
        member: {
          include: {
            user: {
              select: { name: true, email: true, image: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      data: claims
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/coach/belt-claims — Verifikasi Klaim Sabuk (APPROVE / REJECT)
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || !["COACH", "ADMIN"].includes(userRole || "")) {
      return NextResponse.json({ error: "Forbidden: Akses khusus Pelatih & Admin" }, { status: 403 });
    }

    const body = await req.json();
    const { claimId, action, coachNotes } = body; // action: "APPROVE" | "REJECT"

    if (!claimId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Data claimId atau action tidak valid" }, { status: 400 });
    }

    const claim = await (prisma as any).beltClaim.findUnique({
      where: { id: claimId },
      include: { member: true }
    });

    if (!claim) {
      return NextResponse.json({ error: "Data klaim sabuk tidak ditemukan" }, { status: 404 });
    }

    if (claim.status !== "PENDING") {
      return NextResponse.json({ error: "Klaim sabuk ini sudah diverifikasi sebelumnya" }, { status: 400 });
    }

    const { notifyUser } = await import("@/lib/notify");

    if (action === "APPROVE") {
      const oldBelt = claim.member.currentBelt;
      const newBelt = claim.claimedBelt;

      // Exec Transaction: Update Member.currentBelt, create BeltHistory, update BeltClaim status
      const [updatedClaim] = await prisma.$transaction([
        (prisma as any).beltClaim.update({
          where: { id: claimId },
          data: {
            status: "APPROVED",
            coachNotes: coachNotes || "Disetujui oleh Pelatih/Admin",
            reviewedById: userId,
            updatedAt: new Date()
          }
        }),
        prisma.member.update({
          where: { id: claim.memberId },
          data: { currentBelt: newBelt }
        }),
        prisma.beltHistory.create({
          data: {
            memberId: claim.memberId,
            fromBelt: oldBelt,
            toBelt: newBelt,
            promotedAt: new Date()
          }
        })
      ]);

      // Kirim Notifikasi Sukses Ke Murid
      try {
        await notifyUser({
          title: "Klaim Sabuk Disetujui! 🎉",
          message: `Selamat! Klaim ${newBelt} Anda telah disetujui oleh Pelatih/Admin. Profil & Sertifikat Anda diperbarui.`,
          type: "UKT",
          userId: claim.member.userId,
          link: "/m/dashboard"
        });
      } catch (err) {
        console.error("FCM Notify Error:", err);
      }

      return NextResponse.json({
        success: true,
        message: `Klaim sabuk berhasil disetujui. Sabuk anggota diperbarui menjadi ${newBelt}.`,
        data: updatedClaim
      });
    } else {
      // REJECT
      const updatedClaim = await (prisma as any).beltClaim.update({
        where: { id: claimId },
        data: {
          status: "REJECTED",
          coachNotes: coachNotes || "Klaim sabuk ditolak. Mohon unggah bukti sertifikat UKT yang valid.",
          reviewedById: userId,
          updatedAt: new Date()
        }
      });

      // Kirim Notifikasi Penolakan Ke Murid
      try {
        await notifyUser({
          title: "Klaim Sabuk Perlu Perbaikan ⚠️",
          message: `Klaim ${claim.claimedBelt} ditolak pelatih: "${coachNotes || 'Bukti sertifikat kurang jelas'}". Mohon unggah ulang bukti yang valid.`,
          type: "UKT",
          userId: claim.member.userId,
          link: "/m/dashboard"
        });
      } catch (err) {
        console.error("FCM Notify Error:", err);
      }

      return NextResponse.json({
        success: true,
        message: "Klaim sabuk ditolak.",
        data: updatedClaim
      });
    }
  } catch (error: any) {
    console.error("[BELT_CLAIM_VERIFY_ERROR]", error);
    return NextResponse.json({ error: error.message || "Gagal memproses verifikasi klaim sabuk" }, { status: 500 });
  }
}
