import React from 'react';
import { prisma } from "@/lib/prisma";
import EventCard from "@/components/events/EventCard";
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // Prevent database connections at build time

export default async function EventsPage() {
  const allEvents = await prisma.tournamentEvent.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startDate: "asc" } // Sorted chronologically
  });

  // Sort: Jawa Timur events first, then others
  const events = [...allEvents].sort((a, b) => {
    const aIsJatim = (a.location || "").toLowerCase().includes("jawa timur") || (a.location || "").toLowerCase().includes("jatim");
    const bIsJatim = (b.location || "").toLowerCase().includes("jawa timur") || (b.location || "").toLowerCase().includes("jatim");
    
    if (aIsJatim && !bIsJatim) return -1;
    if (!aIsJatim && bIsJatim) return 1;
    return 0; // Keep chronological order if both are same region status
  });

  return (
    <div className="min-h-screen bg-[#090D16] text-white font-hankenGrotesk">
      {/* Navigation */}
      <nav className="bg-[#0B0F19] border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-spaceGrotesk font-black text-2xl tracking-tighter text-white">
          TAEKWONDO<span className="text-[#E10600]">WTK</span>
        </Link>
        <div className="hidden md:flex gap-6 font-bold text-slate-300">
          <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
          <Link href="/events" className="text-[#E10600]">Kalender Event</Link>
        </div>
        <Link href="/login" className="px-5 py-2 bg-[#E10600] hover:bg-red-700 text-white font-bold rounded-full transition-all">
          Masuk
        </Link>
      </nav>

      {/* Header */}
      <header className="relative py-16 bg-gradient-to-b from-[#0B0F19] to-[#090D16] border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-red-600/5 blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white font-spaceGrotesk mb-4">
            Kalender Kejuaraan 🏆
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
            Temukan berbagai kejuaraan Taekwondo terverifikasi resmi PBTI dan persiapkan dirimu!
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-white/5 pb-4">
          <h2 className="text-2xl font-bold text-white">Event Mendatang</h2>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <span className="material-symbols-outlined text-6xl text-slate-600 mb-4 block">event_busy</span>
            <h3 className="text-xl font-bold text-white">Belum ada kejuaraan terverifikasi</h3>
            <p className="text-slate-400 mt-2">Mesin kami sedang memindai turnamen terbaru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <EventCard 
                key={evt.id}
                title={evt.title}
                level={evt.level}
                location={evt.location}
                startDate={evt.startDate.toISOString()}
                endDate={evt.endDate.toISOString()}
                link={evt.link}
                proposalUrl={evt.proposalUrl}
                source={evt.source}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
