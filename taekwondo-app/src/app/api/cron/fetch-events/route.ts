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

  try {
    // Membaca feed dari Google News untuk kata kunci Kejuaraan Taekwondo Jawa Timur
    const feed = await parser.parseURL('https://news.google.com/rss/search?q=Kejuaraan+Taekwondo+Jawa+Timur&hl=id&gl=ID&ceid=ID:id');
    
    let addedCount = 0;

    for (const item of feed.items) {
      // Cek apakah kejuaraan ini sudah ada di database berdasarkan judulnya
      const exists = await prisma.tournamentEvent.findFirst({
        where: { title: item.title }
      });

      if (!exists) {
        // Asumsi: Karena berita tidak memiliki struktur tanggal acara yang spesifik, 
        // kita menggunakan tanggal berita dipublikasikan sebagai patokan awal 
        // (Admin bisa mengedit tanggalnya nanti di Dashboard).
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
        
        await prisma.tournamentEvent.create({
          data: {
            title: item.title,
            level: "Provinsi", // Asumsi default
            location: "Jawa Timur", // Lokasi general
            startDate: pubDate,
            endDate: new Date(pubDate.getTime() + (2 * 24 * 60 * 60 * 1000)), // Estimasi acara 2 hari
            source: "AUTOMATIC_RSS",
            status: "PUBLISHED",
            link: item.link
          }
        });
        addedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menangkap dan menyimpan ${addedCount} kejuaraan baru dari Google News.`
    });

  } catch (error) {
    console.error("Cron Fetch Events Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat memindai berita kejuaraan" }, { status: 500 });
  }
}
