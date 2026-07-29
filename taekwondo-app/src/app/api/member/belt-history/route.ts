import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

const DEFAULT_BELTS = [
  { name: "Sabuk Putih", level: "10 Geup", fullName: "Sabuk Putih (10 Geup)" },
  { name: "Sabuk Kuning", level: "9 Geup", fullName: "Sabuk Kuning (9 Geup)" },
  { name: "Sabuk Kuning Strip Hijau", level: "7 Geup", fullName: "Sabuk Kuning Strip Hijau (7 Geup)" },
  { name: "Sabuk Hijau", level: "6 Geup", fullName: "Sabuk Hijau (6 Geup)" },
  { name: "Sabuk Hijau Strip Biru", level: "5 Geup", fullName: "Sabuk Hijau Strip Biru (5 Geup)" },
  { name: "Sabuk Biru", level: "4 Geup", fullName: "Sabuk Biru (4 Geup)" },
  { name: "Sabuk Biru Strip Merah", level: "3 Geup", fullName: "Sabuk Biru Strip Merah (3 Geup)" },
  { name: "Sabuk Merah", level: "2 Geup", fullName: "Sabuk Merah (2 Geup)" },
  { name: "Sabuk Merah Strip Hitam", level: "1 Geup", fullName: "Sabuk Merah Strip Hitam (1 Geup)" },
  { name: "Sabuk Hitam", level: "Dan 1", fullName: "Sabuk Hitam (Dan 1)" },
];

function cleanBeltKey(str: string) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/^sabuk\s+/, "")
    .split("(")[0]
    .trim();
}

function getBeltIndex(beltName: string, masterBelts: Array<{ name: string; fullName: string }>) {
  if (!beltName) return 0;
  const targetKey = cleanBeltKey(beltName);
  const idx = masterBelts.findIndex(b => cleanBeltKey(b.name) === targetKey || cleanBeltKey(b.fullName) === targetKey);
  return idx !== -1 ? idx : 0;
}

export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mId = searchParams.get('memberId');
    
    // Find target member
    let member;
    if (mId && userRole !== "MEMBER") {
      member = await prisma.member.findUnique({ where: { id: mId } });
    } else {
      member = await prisma.member.findUnique({ where: { userId: userId } });
    }

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const targetMemberId = member.id;

    // Fetch physical records from DB & Master BeltRank data from Admin Curriculum Builder
    const [dbHistories, dbCertificates, uktEntries, dbBeltRanks] = await Promise.all([
      prisma.beltHistory.findMany({
        where: { memberId: targetMemberId },
        orderBy: { promotedAt: "asc" },
      }),
      prisma.certificate.findMany({
        where: { memberId: targetMemberId },
        orderBy: { issueDate: "asc" }
      }),
      prisma.uktParticipant.findMany({
        where: { memberId: targetMemberId, status: { in: ["APPROVED", "GRADED"] } },
        include: { uktExam: true },
        orderBy: { updatedAt: "asc" }
      }),
      prisma.beltRank.findMany({
        orderBy: { level: 'asc' }
      })
    ]);

    // Build master belt list from Database (Curriculum Builder), fallback to DEFAULT_BELTS
    let masterBelts = dbBeltRanks.length > 0 
      ? dbBeltRanks.map(b => ({
          name: b.name.split(" (")[0],
          level: b.name.includes("(") ? b.name.split("(")[1].replace(")", "").trim() : `${b.level} Geup`,
          fullName: b.name
        }))
      : DEFAULT_BELTS;

    // Determine highest belt index of member
    const currentBeltIdx = getBeltIndex(member.currentBelt, masterBelts);

    // Build unified progression history array from Sabuk Putih (0) up to currentBeltIdx
    const unifiedHistory = [];

    for (let i = 0; i <= currentBeltIdx; i++) {
      const beltInfo = masterBelts[i];
      const isWhiteBelt = i === 0;
      const targetBeltKey = cleanBeltKey(beltInfo.name);

      if (isWhiteBelt) {
        // Sabuk Putih: Registered Date, No Cert
        const whiteHist = dbHistories.find(h => cleanBeltKey(h.toBelt) === "putih" || cleanBeltKey(h.fromBelt) === "putih");
        unifiedHistory.push({
          id: whiteHist ? whiteHist.id : `white-init-${targetMemberId}`,
          fromBelt: "Pendaftaran Member",
          toBelt: beltInfo.fullName || "Sabuk Putih (10 Geup)",
          promotedAt: whiteHist ? whiteHist.promotedAt : member.createdAt,
          isWhiteBelt: true,
          certUrl: null,
          canUploadCert: false,
          description: "Pendaftaran Member / Join Dojang"
        });
      } else {
        const prevBeltInfo = masterBelts[i - 1];

        // Strict matching using cleanBeltKey
        const matchedHistory = dbHistories.find(h => cleanBeltKey(h.toBelt) === targetBeltKey);
        const matchedCert = dbCertificates.find(c => cleanBeltKey(c.newBelt) === targetBeltKey);
        const matchedUkt = uktEntries.find(u => cleanBeltKey(u.targetBelt) === targetBeltKey);

        let promotedDate = member.createdAt;
        if (matchedHistory) {
          promotedDate = matchedHistory.promotedAt;
        } else if (matchedCert) {
          promotedDate = matchedCert.issueDate;
        } else if (matchedUkt && matchedUkt.uktExam) {
          promotedDate = matchedUkt.uktExam.date || matchedUkt.updatedAt;
        }

        let certUrl = null;
        if (matchedCert) {
          certUrl = matchedCert.qrCodeUrl;
        } else if (matchedHistory && (matchedHistory as any).certUrl) {
          certUrl = (matchedHistory as any).certUrl;
        }

        const historyId = matchedHistory ? matchedHistory.id : `virtual___${targetMemberId}___${i}`;

        unifiedHistory.push({
          id: historyId,
          fromBelt: prevBeltInfo.fullName || `${prevBeltInfo.name} (${prevBeltInfo.level})`,
          toBelt: beltInfo.fullName || `${beltInfo.name} (${beltInfo.level})`,
          promotedAt: promotedDate,
          isWhiteBelt: false,
          certUrl: certUrl,
          canUploadCert: true,
          description: `Lulus Ujian Kenaikan Tingkat (UKT ${beltInfo.name})`
        });
      }
    }

    return NextResponse.json(unifiedHistory);
  } catch (error: any) {
    console.error("GET /api/member/belt-history error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { historyId, certUrl, promotedAt } = body;

    if (!historyId || !certUrl) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const dbBeltRanks = await prisma.beltRank.findMany({ orderBy: { level: 'asc' } });
    const masterBelts = dbBeltRanks.length > 0 
      ? dbBeltRanks.map(b => ({
          name: b.name.split(" (")[0],
          level: b.name.includes("(") ? b.name.split("(")[1].replace(")", "").trim() : `${b.level} Geup`,
          fullName: b.name
        }))
      : DEFAULT_BELTS;

    let historyItem;
    let targetMemberId: string;
    let fromBelt = "Sabuk Putih (10 Geup)";
    let toBelt = "Sabuk Kuning (9 Geup)";

    if (historyId.startsWith("virtual___") || historyId.startsWith("virtual-") || historyId.startsWith("white-init-")) {
      let parts: string[];
      if (historyId.includes("___")) {
        parts = historyId.split("___");
        targetMemberId = parts[1];
        const beltIdx = parts[2] ? parseInt(parts[2]) : 1;
        const prevBeltInfo = masterBelts[beltIdx - 1] || masterBelts[0];
        const beltInfo = masterBelts[beltIdx] || masterBelts[1];
        fromBelt = prevBeltInfo.fullName || `${prevBeltInfo.name} (${prevBeltInfo.level})`;
        toBelt = beltInfo.fullName || `${beltInfo.name} (${beltInfo.level})`;
      } else {
        const currentMember = await prisma.member.findUnique({ where: { userId } });
        if (!currentMember) {
          return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }
        targetMemberId = currentMember.id;
      }

      const member = await prisma.member.findUnique({ where: { id: targetMemberId } });
      if (!member) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }

      if (member.userId !== userId && userRole === "MEMBER") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Create new BeltHistory entry
      historyItem = await prisma.beltHistory.create({
        data: {
          memberId: targetMemberId,
          fromBelt,
          toBelt,
          promotedAt: promotedAt ? new Date(promotedAt) : new Date()
        },
        include: { member: true }
      });

    } else {
      // Find existing BeltHistory
      historyItem = await prisma.beltHistory.findUnique({
        where: { id: historyId },
        include: { member: true }
      });

      if (!historyItem) {
        return NextResponse.json({ error: "History not found" }, { status: 404 });
      }

      if (historyItem.member.userId !== userId && userRole === "MEMBER") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      targetMemberId = historyItem.memberId;
      fromBelt = historyItem.fromBelt;
      toBelt = historyItem.toBelt;

      if (promotedAt) {
        historyItem = await prisma.beltHistory.update({
          where: { id: historyId },
          data: { promotedAt: new Date(promotedAt) },
          include: { member: true }
        });
      }
    }

    // Upsert or Create Certificate record
    const targetKey = cleanBeltKey(toBelt);
    const allCerts = await prisma.certificate.findMany({ where: { memberId: targetMemberId } });
    const existingCert = allCerts.find(c => cleanBeltKey(c.newBelt) === targetKey);

    let certificate;
    if (existingCert) {
      certificate = await prisma.certificate.update({
        where: { id: existingCert.id },
        data: {
          qrCodeUrl: certUrl,
          issueDate: promotedAt ? new Date(promotedAt) : new Date()
        }
      });
    } else {
      certificate = await prisma.certificate.create({
        data: {
          memberId: targetMemberId,
          certNumber: `CERT-UPL-${Date.now()}`,
          oldBelt: fromBelt,
          newBelt: toBelt,
          qrCodeUrl: certUrl,
          issueDate: promotedAt ? new Date(promotedAt) : new Date()
        }
      });
    }

    return NextResponse.json(certificate);
  } catch (error: any) {
    console.error("POST /api/member/belt-history error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



