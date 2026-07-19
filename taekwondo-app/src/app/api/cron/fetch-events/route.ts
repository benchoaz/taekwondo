import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Parser from 'rss-parser';

type CustomItem = { title: string; link: string; pubDate: string; contentSnippet: string };
const parser = new Parser<any, CustomItem>();

export async function GET(request: Request) {
  // Amankan endpoint ini agar hanya bisa dipanggil oleh Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let googleNewsAdded = 0;
  let simpbtiAdded = 0;

  try {
    // =====================================================================
    // 1. SCRAPE DARI OFFICIAL API SIM PBTI (https://simpbti.id/championships)
    // =====================================================================
    try {
      const pbtiRes = await fetch("https://api.simpbti.id/api/kejuaraan", {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        next: { revalidate: 0 } // Bypass Next.js fetch cache
      });

      if (pbtiRes.ok) {
        const pbtiData = await pbtiRes.json();
        const eventsList = pbtiData?.kejuaraansWithAttachments || [];

        for (const ev of eventsList) {
          if (!ev.kejuaraanTitle) continue;

          // Cek apakah kejuaraan ini sudah terdaftar
          const exists = await prisma.tournamentEvent.findFirst({
            where: {
              OR: [
                { title: ev.kejuaraanTitle },
                { title: ev.kejuaraanTitle.toUpperCase() }
              ]
            }
          });

          if (!exists) {
            const endDate = ev.tanggalBerakhirKejuaraan ? new Date(ev.tanggalBerakhirKejuaraan) : new Date();
            
            // ABAIKAN EVENT LAMA: Jika kejuaraan berakhir lebih dari 7 hari yang lalu
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            if (endDate < oneWeekAgo) {
              continue; // Lewati kejuaraan lama yang sudah lewat lebih dari seminggu
            }

            // Tentukan level dari gradeKejuaraan
            let level = "Nasional";
            const grade = (ev.gradeKejuaraan || "").toUpperCase();
            if (grade.includes("GRADE C") || grade.includes("PROVINSI") || grade.includes("WILAYAH")) {
              level = "Provinsi";
            } else if (grade.includes("GRADE B") || grade.includes("GRADE A") || grade.includes("NASIONAL") || grade.includes("INTERNATIONAL")) {
              level = "Nasional";
            }

            const location = ev.tempatKejuaraan && ev.kotaKejuaraan
              ? `${ev.tempatKejuaraan}, ${ev.kotaKejuaraan}`
              : ev.kotaKejuaraan || ev.tempatKejuaraan || "Indonesia";

            await prisma.tournamentEvent.create({
              data: {
                title: ev.kejuaraanTitle.toUpperCase(),
                level: level,
                location: location,
                startDate: ev.tanggalKejuaraan ? new Date(ev.tanggalKejuaraan) : new Date(),
                endDate: endDate,
                source: "SIMPBTI",
                status: "PUBLISHED",
                link: "https://simpbti.id/championships"
              }
            });
            simpbtiAdded++;
          }
        }
      }
    } catch (err) {
      console.error("Error scraping SIMPBTI API:", err);
    }

    // Google News RSS scraping has been removed to focus exclusively on SIM PBTI Championships

    return NextResponse.json({
      success: true,
      message: `Berhasil memindai kejuaraan. Ditambahkan: ${simpbtiAdded} dari SIM PBTI.`
    });

  } catch (error: any) {
    console.error("Cron Fetch Events General Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem saat memindai kejuaraan" }, { status: 500 });
  }
}
