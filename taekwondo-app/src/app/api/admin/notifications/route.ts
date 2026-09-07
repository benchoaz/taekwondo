import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verifyJWT } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Admin access via NextAuth or JWT Cookie/Header
    let isAdmin = false;
    const session = await getServerSession(authOptions);
    if (session?.user && (session.user as any).role === "ADMIN") {
      isAdmin = true;
    } else {
      const headerRole = req.headers.get("x-user-role");
      if (headerRole === "ADMIN") {
        isAdmin = true;
      } else {
        const token = req.cookies.get("auth_token")?.value;
        if (token) {
          try {
            const payload = await verifyJWT(token) as { role: string };
            if (payload.role === "ADMIN") isAdmin = true;
          } catch {}
        }
      }
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized: Akses khusus Admin" }, { status: 401 });
    }

    // 2. Fetch pending tasks concurrently
    const [beltClaims, pendingMembers, pendingPayments, systemNotifications] = await Promise.all([
      (prisma as any).beltClaim.findMany({
        where: { status: "PENDING" },
        include: {
          member: {
            select: { fullName: true, memberNumber: true }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      }).catch(() => []),

      prisma.member.findMany({
        where: { status: "PENDING_VERIFICATION" },
        select: {
          id: true,
          fullName: true,
          memberNumber: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: 10
      }).catch(() => []),

      prisma.payment.findMany({
        where: { status: "PENDING" },
        include: {
          member: {
            select: { fullName: true, memberNumber: true }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      }).catch(() => []),

      prisma.notification.findMany({
        where: {
          OR: [{ userId: "ADMIN" }, { userId: "ALL" }],
          isRead: false
        },
        orderBy: { createdAt: "desc" },
        take: 10
      }).catch(() => [])
    ]);

    // 3. Format unified notification items
    const items: any[] = [];

    // Belt Claims
    beltClaims.forEach((c: any) => {
      items.push({
        id: `belt_${c.id}`,
        type: "BELT_CLAIM",
        title: "Klaim Sabuk Baru",
        message: `${c.member?.fullName || "Murid"} mengajukan perubahan ke ${c.claimedBelt}`,
        time: c.createdAt,
        targetTab: "users",
        badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
        icon: "🥋",
        data: { claimId: c.id, claimedBelt: c.claimedBelt }
      });
    });

    // Pending Member Registrations
    pendingMembers.forEach((m: any) => {
      items.push({
        id: `reg_${m.id}`,
        type: "MEMBER_REGISTRATION",
        title: "Pendaftar Baru",
        message: `${m.fullName || "Calon Siswa"} menunggu verifikasi registrasi`,
        time: m.createdAt,
        targetTab: "users",
        badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
        icon: "👤",
        data: { memberId: m.id }
      });
    });

    // Pending Payments
    pendingPayments.forEach((p: any) => {
      items.push({
        id: `pay_${p.id}`,
        type: "PAYMENT",
        title: "Pembayaran Menunggu Validasi",
        message: `Pembayaran Rp ${(p.amount || 0).toLocaleString("id-ID")} dari ${p.member?.fullName || "Murid"}`,
        time: p.createdAt,
        targetTab: "payments",
        badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
        icon: "💳",
        data: { paymentId: p.id }
      });
    });

    // System Notifications
    systemNotifications.forEach((n: any) => {
      items.push({
        id: `sys_${n.id}`,
        type: "SYSTEM",
        title: n.title || "Pemberitahuan Sistem",
        message: n.message,
        time: n.createdAt,
        targetTab: "dashboard",
        badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
        icon: "📢",
        data: {}
      });
    });

    // Sort all by time descending
    items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    const totalCount = items.length;

    return NextResponse.json({
      success: true,
      totalCount,
      counts: {
        beltClaims: beltClaims.length,
        pendingMembers: pendingMembers.length,
        pendingPayments: pendingPayments.length,
        system: systemNotifications.length
      },
      items
    });

  } catch (error: any) {
    console.error("Error fetching admin notifications:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
