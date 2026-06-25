import React from 'react';
import { prisma } from "@/lib/prisma";
import EventCard from "@/components/events/EventCard";
import Link from 'next/link';

export const revalidate = 3600; // Cache halaman selama 1 jam

export default async function EventsPage() {
  const events = await prisma.tournamentEvent.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#F3F4F5] font-hankenGrotesk">
      {/* Navigation */}
      <nav className="bg-white border-b-2 border-[#191C1D] px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-spaceGrotesk font-black text-2xl tracking-tighter text-[#191C1D]">
          TAEKWONDO<span className="text-[#0052DC]">HUB</span>
        </Link>
        <div className="hidden md:flex gap-6 font-bold text-[#191C1D]">
          <Link href="/" className="hover:text-[#0052DC]">Beranda</Link>
          <Link href="/events" className="text-[#0052DC]">Kalender Event</Link>
        </div>
        <Link href="/login" className="px-5 py-2 bg-[#FFDEB4] text-[#191C1D] font-bold rounded-full border-2 border-[#191C1D] shadow-[2px_2px_0px_#191C1D] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
          Masuk
        </Link>
      </nav>

      {/* Header */}
      <header className="bg-[#0052DC] py-16 border-b-4 border-[#191C1D]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white font-spaceGrotesk mb-4">
            Kalender Kejuaraan 🏆
          </h1>
          <p className="text-xl text-blue-100 font-medium max-w-2xl mx-auto">
            Temukan berbagai kejuaraan Taekwondo di Jawa Timur dan persiapkan dirimu untuk menjadi juara!
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-[#191C1D]">Event Mendatang</h2>
          <button className="px-6 py-2 bg-[#FFDEB4] text-[#191C1D] font-bold rounded-lg border-2 border-[#191C1D] shadow-[2px_2px_0px_#191C1D] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            + Kirim Proposal Acara
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-[#191C1D] rounded-xl shadow-[4px_4px_0px_#191C1D]">
            <span className="material-symbols-outlined text-6xl text-gray-400 mb-4 block">event_busy</span>
            <h3 className="text-xl font-bold text-[#191C1D]">Belum ada kejuaraan yang terdeteksi</h3>
            <p className="text-gray-500 mt-2">Mesin kami sedang memindai berita terbaru.</p>
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
                source={evt.source}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
