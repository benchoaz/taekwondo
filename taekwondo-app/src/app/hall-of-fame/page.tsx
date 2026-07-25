"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Award, Calendar, ExternalLink, X, Trophy, ShieldAlert, Sparkles } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  eventName: string;
  date: string;
  rank?: string | null;
  photoUrl?: string | null;
  certificateUrl?: string | null;
  member?: {
    id: string;
    fullName: string;
    selfieUrl?: string | null;
    currentBelt?: string | null;
  } | null;
}

// Helper to extract initials for fallback avatar
function getInitials(name?: string | null): string {
  if (!name) return "WT";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Helper to categorize Kyorugi vs Poomsae or General
function getCategory(title: string): string {
  const t = title.toUpperCase();
  if (t.includes("POOMSAE")) return "Poomsae";
  if (t.includes("KYORUGI") || t.includes("FIGHT")) return "Kyorugi";
  return "Taekwondo";
}

// Helper to estimate scope / level from event name
function getScopeLevel(eventName: string): string {
  const e = eventName.toUpperCase();
  if (e.includes("NASIONAL") || e.includes("NATIONAL") || e.includes("KEJURNAS") || e.includes("GRADE B") || e.includes("GRADE A")) return "Nasional";
  if (e.includes("PROVINSI") || e.includes("JATIM") || e.includes("KEJURDA") || e.includes("PROV")) return "Provinsi";
  if (e.includes("KABUPATEN") || e.includes("KAB") || e.includes("KOTA") || e.includes("PROBOLINGGO")) return "Kabupaten";
  return "Kejuaraan Resmi";
}

export default function HallOfFamePage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    fetch("/api/achievements?status=APPROVED")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAchievements(data);
      })
      .catch((err) => console.error("Error fetching achievements:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Handle ESC key to close modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setSelectedAchievement(null);
    }
  }, []);

  useEffect(() => {
    if (selectedAchievement) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedAchievement, handleKeyDown]);

  return (
    <div className="min-h-screen bg-[#0a0908] text-[#ece4d3] font-jost selection:bg-[#c6a15b]/30 selection:text-[#e6c883] pb-24 relative overflow-x-hidden">
      {/* Background Plaque Pattern & Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-radial from-[#1b1815]/60 via-[#0a0908] to-[#0a0908]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-[#c6a15b]/5 blur-[160px] rounded-full" />
      </div>

      {/* Navbar/Header */}
      <nav className="fixed w-full z-40 bg-[#0a0908]/90 backdrop-blur-md border-b border-[#c6a15b]/20 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#8d8676] hover:text-[#e6c883] transition-colors group text-xs font-semibold tracking-[0.2em] uppercase"
          >
            <div className="w-8 h-8 rounded-sm border border-[#c6a15b]/30 bg-[#131110] flex items-center justify-center group-hover:border-[#e6c883] transition-colors">
              <ChevronLeft className="w-4 h-4 text-[#c6a15b] group-hover:text-[#e6c883]" />
            </div>
            <span>Beranda</span>
          </Link>
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-auto brightness-0 invert"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="font-cinzel font-bold text-[#ece4d3] tracking-[0.25em] text-base md:text-lg">
              WHITE TIGER
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-14 relative z-10 text-center px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Eyebrow */}
          <span className="font-jost text-[11px] md:text-xs font-black tracking-[0.3em] uppercase text-[#c6a15b] mb-3 inline-block border-b border-[#c6a15b]/30 pb-1">
            WHITE TIGER KRAKSAAN
          </span>

          {/* Title */}
          <h1 className="font-cinzel text-4xl md:text-6xl font-bold tracking-wider text-[#ece4d3] mb-4">
            HALL OF <span className="text-[#e6c883]">FAME</span>
          </h1>

          {/* Description */}
          <p className="font-jost text-[#8d8676] text-sm md:text-base max-w-xl leading-relaxed mb-8">
            Dinding penghormatan resmi untuk mengabadikan dedikasi, perjuangan, dan perolehan medali kebanggaan para atlet White Tiger Kraksaan.
          </p>

          {/* Decorative Divider with Central Diamond */}
          <div className="flex items-center gap-4 w-full max-w-md my-2">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#c6a15b]/40 to-[#c6a15b]/40" />
            <div className="w-2.5 h-2.5 rotate-45 border border-[#e6c883] bg-[#7c1f26] shrink-0 shadow-[0_0_8px_rgba(230,200,131,0.5)]" />
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#c6a15b]/40 to-[#c6a15b]/40" />
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <section className="max-w-7xl mx-auto px-6 relative z-10">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-4">
            <div className="w-10 h-10 border-2 border-[#c6a15b]/20 border-t-[#e6c883] rounded-full animate-spin" />
            <span className="font-jost text-xs font-bold tracking-[0.25em] text-[#8d8676] uppercase">
              Memuat Piagam Kehormatan...
            </span>
          </div>
        ) : achievements.length === 0 ? (
          <div className="bg-[#131110] border border-[#c6a15b]/30 p-16 text-center max-w-lg mx-auto shadow-2xl">
            <Trophy className="w-12 h-12 text-[#c6a15b] mx-auto mb-4 opacity-70" />
            <h3 className="font-cinzel text-xl font-bold text-[#ece4d3] mb-2">Belum Ada Rekam Jejak</h3>
            <p className="text-[#8d8676] text-xs">Ukiran prestasi resmi atlet akan dipublikasikan di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((ach) => {
              const category = getCategory(ach.title);
              const rankText = ach.rank || "Juara";

              return (
                <div
                  key={ach.id}
                  onClick={() => setSelectedAchievement(ach)}
                  className="group relative bg-gradient-to-b from-[#131110] to-[#1b1815] border border-[#c6a15b]/20 hover:border-[#e6c883] p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_15px_35px_-10px_rgba(198,161,91,0.25)] cursor-pointer flex flex-col justify-between"
                >
                  {/* Corner Brackets (Sudut Siku Emas) */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#c6a15b]/50 group-hover:border-[#e6c883] transition-colors" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#c6a15b]/50 group-hover:border-[#e6c883] transition-colors" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#c6a15b]/50 group-hover:border-[#e6c883] transition-colors" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#c6a15b]/50 group-hover:border-[#e6c883] transition-colors" />

                  {/* Top: Medal Circular Photo Frame */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-5">
                      {/* Ring Gradasi Emas-Merah */}
                      <div className="p-[3px] rounded-full bg-gradient-to-tr from-[#7c1f26] via-[#c6a15b] to-[#e6c883] shadow-lg group-hover:shadow-[0_0_15px_rgba(230,200,131,0.4)] transition-shadow">
                        <div className="p-[2px] bg-[#131110] rounded-full">
                          {ach.member?.selfieUrl ? (
                            <img
                              src={ach.member.selfieUrl}
                              alt={ach.member.fullName}
                              loading="lazy"
                              className="w-24 h-24 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-[#1b1815] flex items-center justify-center border border-[#c6a15b]/20">
                              <span className="font-cinzel font-bold text-lg text-[#e6c883]">
                                {getInitials(ach.member?.fullName)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Small Circular Club Seal Badge */}
                      <div
                        className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#7c1f26] border-2 border-[#c6a15b] flex items-center justify-center text-[9px] font-black text-[#e6c883] font-cinzel shadow-md"
                        title="White Tiger Club Seal"
                      >
                        WTK
                      </div>
                    </div>

                    {/* Member Name */}
                    <h3 className="font-cinzel text-base font-bold text-[#ece4d3] group-hover:text-[#e6c883] transition-colors leading-tight mb-1">
                      {ach.member?.fullName || "Atlet White Tiger"}
                    </h3>

                    {/* Category & Event Subtitle */}
                    <p className="font-jost text-[11px] tracking-[0.15em] text-[#8d8676] uppercase line-clamp-1 mb-1">
                      {category} · {rankText}
                    </p>
                    <p className="font-jost text-[10px] text-[#8d8676]/80 line-clamp-1 italic">
                      {ach.eventName}
                    </p>

                    {/* Divider Line */}
                    <div className="w-7 h-[1.5px] bg-[#c6a15b]/40 my-3 group-hover:w-12 group-hover:bg-[#e6c883] transition-all" />
                  </div>

                  {/* Hover Button Text */}
                  <div className="mt-2 text-center overflow-hidden">
                    <span className="font-jost text-[10px] font-bold tracking-[0.25em] text-[#e6c883] uppercase opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center gap-1">
                      Lihat Detail →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Detail Prestasi */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300 overflow-y-auto"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="bg-gradient-to-b from-[#131110] to-[#1b1815] border border-[#c6a15b]/40 text-[#ece4d3] shadow-2xl relative w-full max-w-4xl overflow-hidden font-jost my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner Brackets on Modal */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#e6c883] z-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#e6c883] z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#e6c883] z-20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#e6c883] z-20 pointer-events-none" />

            {/* Close Button (✕) */}
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-4 right-4 z-30 w-8 h-8 border border-[#c6a15b]/40 hover:border-[#e6c883] bg-[#0a0908]/80 text-[#c6a15b] hover:text-[#e6c883] flex items-center justify-center transition-transform duration-300 hover:rotate-90"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 2-Column Content Layout (Mobile: 1 column photo top, info bottom) */}
            <div className="flex flex-col lg:flex-row items-stretch">
              {/* MOBILE ONLY: Photo Banner */}
              <div className="lg:hidden w-full bg-[#0a0908] p-6 border-b border-[#c6a15b]/20 flex flex-col items-center">
                <div className="bg-gradient-to-b from-[#c6a15b] via-[#e6c883] to-[#c6a15b] p-2 relative shadow-xl max-w-[240px] w-full">
                  {/* Corner overlays */}
                  <div className="absolute top-0 left-0 w-3 h-3 bg-[#0a0908]" />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#0a0908]" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#0a0908]" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#0a0908]" />
                  {selectedAchievement.member?.selfieUrl || selectedAchievement.photoUrl ? (
                    <img
                      src={selectedAchievement.photoUrl || selectedAchievement.member?.selfieUrl || ""}
                      alt={selectedAchievement.member?.fullName || "Foto Member"}
                      className="w-full h-48 object-cover border border-[#0a0908]"
                    />
                  ) : (
                    <div className="w-full h-48 bg-[#1b1815] flex flex-col items-center justify-center border border-[#0a0908]">
                      <span className="font-cinzel text-3xl font-bold text-[#e6c883]">
                        {getInitials(selectedAchievement.member?.fullName)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="font-cinzel text-xs font-bold text-[#e6c883] tracking-[0.2em] uppercase text-center mt-3">
                  {selectedAchievement.member?.fullName}
                </p>
              </div>

              {/* LEFT COLUMN (Info 60%) */}
              <div className="lg:w-[60%] p-6 md:p-8 flex flex-col justify-between border-r border-[#c6a15b]/20">
                <div>
                  {/* Eyebrow */}
                  <span className="font-jost text-[10px] md:text-xs font-extrabold uppercase tracking-[0.25em] text-[#e6c883] block mb-2">
                    {getCategory(selectedAchievement.title)} · {selectedAchievement.rank || "Juara"}
                  </span>

                  {/* Name */}
                  <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-[#ece4d3] leading-tight mb-2">
                    {selectedAchievement.member?.fullName || "Atlet White Tiger"}
                  </h2>

                  {/* Subtitle Event */}
                  <p className="font-jost text-sm text-[#8d8676] mb-6">
                    {selectedAchievement.eventName}
                  </p>

                  {/* 2x2 Statistics Grid */}
                  <div className="border-y border-[#c6a15b]/30 py-4 my-6 grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-jost text-[9px] font-bold uppercase tracking-[0.2em] text-[#c6a15b] block mb-1">
                        TINGKAT
                      </span>
                      <span className="font-jost text-xs font-bold text-[#ece4d3]">
                        {getScopeLevel(selectedAchievement.eventName)}
                      </span>
                    </div>
                    <div>
                      <span className="font-jost text-[9px] font-bold uppercase tracking-[0.2em] text-[#c6a15b] block mb-1">
                        TAHUN
                      </span>
                      <span className="font-jost text-xs font-bold text-[#ece4d3]">
                        {new Date(selectedAchievement.date).getFullYear()}
                      </span>
                    </div>
                    <div>
                      <span className="font-jost text-[9px] font-bold uppercase tracking-[0.2em] text-[#c6a15b] block mb-1">
                        CABANG
                      </span>
                      <span className="font-jost text-xs font-bold text-[#ece4d3]">
                        {getCategory(selectedAchievement.title)}
                      </span>
                    </div>
                    <div>
                      <span className="font-jost text-[9px] font-bold uppercase tracking-[0.2em] text-[#c6a15b] block mb-1">
                        PERINGKAT
                      </span>
                      <span className="font-jost text-xs font-bold text-[#e6c883]">
                        {selectedAchievement.rank || "Juara"}
                      </span>
                    </div>
                  </div>

                  {/* Narrative Description */}
                  <div className="mb-6">
                    <p className="font-jost text-xs md:text-sm text-[#8d8676] leading-relaxed">
                      Pencapaian kehormatan atas nama <strong className="text-[#ece4d3] font-semibold">{selectedAchievement.member?.fullName}</strong> dalam kategori <strong className="text-[#ece4d3] font-semibold">{selectedAchievement.title}</strong> pada ajang {selectedAchievement.eventName}. Merupakan kebanggaan resmi dojang White Tiger Kraksaan.
                    </p>
                  </div>
                </div>

                {/* Certificate Action Button */}
                <div className="pt-4 border-t border-[#c6a15b]/20">
                  {selectedAchievement.certificateUrl || selectedAchievement.photoUrl ? (
                    <a
                      href={selectedAchievement.certificateUrl || selectedAchievement.photoUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-2 border-[#c6a15b] text-[#e6c883] hover:bg-[#c6a15b] hover:text-[#0a0908] font-bold text-xs uppercase tracking-[0.2em] px-6 py-3 transition-all inline-flex items-center gap-2 group cursor-pointer"
                    >
                      <span>Lihat Sertifikat / Bukti</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  ) : (
                    <div className="inline-flex items-center gap-2 text-xs text-[#8d8676] italic">
                      <ShieldAlert className="w-4 h-4 text-[#c6a15b]" />
                      <span>Sertifikat fisik telah diverifikasi oleh pengurus Dojang.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* DESKTOP ONLY: RIGHT COLUMN (Photo Framed 40%) */}
              <div className="hidden lg:flex lg:w-[40%] bg-[#0a0908] p-8 items-center justify-center flex-col">
                {/* Certificate Frame */}
                <div className="bg-gradient-to-b from-[#c6a15b] via-[#e6c883] to-[#c6a15b] p-3 relative shadow-2xl w-full max-w-xs">
                  {/* Corner overlays (fcorner effect) */}
                  <div className="absolute top-0 left-0 w-4 h-4 bg-[#0a0908]" />
                  <div className="absolute top-0 right-0 w-4 h-4 bg-[#0a0908]" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#0a0908]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#0a0908]" />

                  {/* Inner Photo or Fallback */}
                  {selectedAchievement.member?.selfieUrl || selectedAchievement.photoUrl ? (
                    <img
                      src={selectedAchievement.photoUrl || selectedAchievement.member?.selfieUrl || ""}
                      alt={selectedAchievement.member?.fullName || "Foto Member"}
                      className="w-full h-64 object-cover border border-[#0a0908]"
                    />
                  ) : (
                    <div className="w-full h-64 bg-[#1b1815] flex flex-col items-center justify-center border border-[#0a0908]">
                      <span className="font-cinzel text-4xl font-bold text-[#e6c883]">
                        {getInitials(selectedAchievement.member?.fullName)}
                      </span>
                      <span className="font-jost text-[10px] text-[#8d8676] uppercase tracking-[0.2em] mt-2">
                        WHITE TIGER ATLET
                      </span>
                    </div>
                  )}
                </div>

                {/* Caption below photo */}
                <p className="font-cinzel text-xs font-bold text-[#e6c883] tracking-[0.2em] uppercase text-center mt-4">
                  {selectedAchievement.member?.fullName}
                </p>
                <p className="font-jost text-[10px] text-[#8d8676] uppercase tracking-[0.15em] text-center mt-1">
                  {selectedAchievement.member?.currentBelt || "ATLET RESMI"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
