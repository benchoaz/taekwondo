"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Award, Calendar, ExternalLink, X, Trophy, ShieldAlert, Sparkles, Medal } from "lucide-react";

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

interface MemberGroup {
  memberId: string;
  fullName: string;
  selfieUrl: string | null;
  currentBelt: string | null;
  achievements: Achievement[];
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
}

// Helper to extract initials for fallback avatar
function getInitials(name?: string | null): string {
  if (!name) return "WT";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function HallOfFamePage() {
  const [memberGroups, setMemberGroups] = useState<MemberGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMemberGroup, setSelectedMemberGroup] = useState<MemberGroup | null>(null);

  useEffect(() => {
    fetch("/api/achievements?status=APPROVED")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Group achievements strictly by member.id
          const groupMap = new Map<string, MemberGroup>();

          data.forEach((ach: Achievement) => {
            const memberId = ach.member?.id || `unknown-${ach.id}`;
            const memberName = ach.member?.fullName || "Atlet White Tiger";
            const selfieUrl = ach.member?.selfieUrl || ach.photoUrl || null;
            const currentBelt = ach.member?.currentBelt || "Atlet Resmi";

            if (!groupMap.has(memberId)) {
              groupMap.set(memberId, {
                memberId,
                fullName: memberName,
                selfieUrl,
                currentBelt,
                achievements: [],
                goldCount: 0,
                silverCount: 0,
                bronzeCount: 0,
              });
            }

            const group = groupMap.get(memberId)!;
            group.achievements.push(ach);

            // Update photo if group selfieUrl was null
            if (!group.selfieUrl && (ach.member?.selfieUrl || ach.photoUrl)) {
              group.selfieUrl = ach.member?.selfieUrl || ach.photoUrl || null;
            }

            // Tally medals
            const rankLower = (ach.rank || "").toLowerCase();
            if (rankLower.includes("emas") || rankLower.includes("juara 1") || rankLower === "1") {
              group.goldCount++;
            } else if (rankLower.includes("perak") || rankLower.includes("juara 2") || rankLower === "2") {
              group.silverCount++;
            } else {
              group.bronzeCount++;
            }
          });

          // Sort members by gold > silver > bronze > total achievements
          const sortedGroups = Array.from(groupMap.values()).sort((a, b) => {
            if (b.goldCount !== a.goldCount) return b.goldCount - a.goldCount;
            if (b.silverCount !== a.silverCount) return b.silverCount - a.silverCount;
            if (b.bronzeCount !== a.bronzeCount) return b.bronzeCount - a.bronzeCount;
            return b.achievements.length - a.achievements.length;
          });

          setMemberGroups(sortedGroups);
        }
      })
      .catch((err) => console.error("Error fetching achievements:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Handle ESC key to close modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setSelectedMemberGroup(null);
    }
  }, []);

  useEffect(() => {
    if (selectedMemberGroup) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMemberGroup, handleKeyDown]);

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

      {/* Grid Content (1 Card Per Athlete) */}
      <section className="max-w-7xl mx-auto px-6 relative z-10">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-4">
            <div className="w-10 h-10 border-2 border-[#c6a15b]/20 border-t-[#e6c883] rounded-full animate-spin" />
            <span className="font-jost text-xs font-bold tracking-[0.25em] text-[#8d8676] uppercase">
              Memuat Hall of Fame Atlet...
            </span>
          </div>
        ) : memberGroups.length === 0 ? (
          <div className="bg-[#131110] border border-[#c6a15b]/30 p-16 text-center max-w-lg mx-auto shadow-2xl">
            <Trophy className="w-12 h-12 text-[#c6a15b] mx-auto mb-4 opacity-70" />
            <h3 className="font-cinzel text-xl font-bold text-[#ece4d3] mb-2">Belum Ada Rekam Jejak</h3>
            <p className="text-[#8d8676] text-xs">Ukiran prestasi resmi atlet akan dipublikasikan di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {memberGroups.map((group) => {
              const totalMedals = group.achievements.length;

              return (
                <div
                  key={group.memberId}
                  onClick={() => setSelectedMemberGroup(group)}
                  className="group relative bg-gradient-to-b from-[#131110] to-[#1b1815] border border-[#c6a15b]/20 hover:border-[#e6c883] p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_15px_35px_-10px_rgba(198,161,91,0.25)] cursor-pointer flex flex-col justify-between"
                >
                  {/* Corner Brackets (Sudut Siku Emas) */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#c6a15b]/50 group-hover:border-[#e6c883] transition-colors" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#c6a15b]/50 group-hover:border-[#e6c883] transition-colors" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#c6a15b]/50 group-hover:border-[#e6c883] transition-colors" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#c6a15b]/50 group-hover:border-[#e6c883] transition-colors" />

                  {/* Top: Compact Athlete Portrait Frame */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-5">
                      {/* Cincin Gradasi Emas-Merah */}
                      <div className="p-[3px] rounded-full bg-gradient-to-tr from-[#7c1f26] via-[#c6a15b] to-[#e6c883] shadow-lg group-hover:shadow-[0_0_15px_rgba(230,200,131,0.4)] transition-shadow">
                        <div className="p-[2px] bg-[#131110] rounded-full">
                          {group.selfieUrl ? (
                            <img
                              src={group.selfieUrl}
                              alt={group.fullName}
                              loading="lazy"
                              className="w-24 h-24 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-[#1b1815] flex items-center justify-center border border-[#c6a15b]/20">
                              <span className="font-cinzel font-bold text-lg text-[#e6c883]">
                                {getInitials(group.fullName)}
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
                      {group.fullName}
                    </h3>

                    {/* Belt Subtitle */}
                    <p className="font-jost text-[10px] tracking-[0.15em] text-[#8d8676] uppercase line-clamp-1 mb-3">
                      {group.currentBelt || "Atlet Resmi"}
                    </p>

                    {/* Medal Counter Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-center bg-[#0a0908]/80 border border-[#c6a15b]/20 px-3 py-1.5 rounded-full">
                      {group.goldCount > 0 && (
                        <span className="text-[10px] font-bold text-[#e6c883] flex items-center gap-0.5">
                          🥇 {group.goldCount} <span className="hidden sm:inline">Emas</span>
                        </span>
                      )}
                      {group.silverCount > 0 && (
                        <span className="text-[10px] font-bold text-slate-300 flex items-center gap-0.5">
                          🥈 {group.silverCount} <span className="hidden sm:inline">Perak</span>
                        </span>
                      )}
                      {group.bronzeCount > 0 && (
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                          🥉 {group.bronzeCount} <span className="hidden sm:inline">Perunggu</span>
                        </span>
                      )}
                      {totalMedals === 0 && (
                        <span className="text-[10px] text-[#8d8676]">1 Prestasi</span>
                      )}
                    </div>

                    {/* Divider Line */}
                    <div className="w-7 h-[1.5px] bg-[#c6a15b]/40 my-3 group-hover:w-12 group-hover:bg-[#e6c883] transition-all" />
                  </div>

                  {/* Hover Button Text */}
                  <div className="mt-2 text-center overflow-hidden">
                    <span className="font-jost text-[10px] font-bold tracking-[0.25em] text-[#e6c883] uppercase opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center gap-1">
                      Lihat Prestasi ({totalMedals}) →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Detail Prestasi Lengkap Atlet */}
      {selectedMemberGroup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300 overflow-y-auto"
          onClick={() => setSelectedMemberGroup(null)}
        >
          <div
            className="bg-gradient-to-b from-[#131110] to-[#1b1815] border border-[#c6a15b]/40 text-[#ece4d3] shadow-2xl relative w-full max-w-4xl overflow-hidden font-jost my-8 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner Brackets on Modal */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#e6c883] z-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#e6c883] z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#e6c883] z-20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#e6c883] z-20 pointer-events-none" />

            {/* Close Button (✕) */}
            <button
              onClick={() => setSelectedMemberGroup(null)}
              className="absolute top-4 right-4 z-30 w-8 h-8 border border-[#c6a15b]/40 hover:border-[#e6c883] bg-[#0a0908]/80 text-[#c6a15b] hover:text-[#e6c883] flex items-center justify-center transition-transform duration-300 hover:rotate-90"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 2-Column Content Layout */}
            <div className="flex flex-col lg:flex-row items-stretch overflow-y-auto flex-1">
              {/* MOBILE ONLY: Photo Banner */}
              <div className="lg:hidden w-full bg-[#0a0908] p-6 border-b border-[#c6a15b]/20 flex flex-col items-center">
                <div className="bg-gradient-to-b from-[#c6a15b] via-[#e6c883] to-[#c6a15b] p-2 relative shadow-xl max-w-[200px] w-full">
                  <div className="absolute top-0 left-0 w-3 h-3 bg-[#0a0908]" />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#0a0908]" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#0a0908]" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#0a0908]" />
                  {selectedMemberGroup.selfieUrl ? (
                    <img
                      src={selectedMemberGroup.selfieUrl}
                      alt={selectedMemberGroup.fullName}
                      className="w-full h-44 object-cover border border-[#0a0908]"
                    />
                  ) : (
                    <div className="w-full h-44 bg-[#1b1815] flex flex-col items-center justify-center border border-[#0a0908]">
                      <span className="font-cinzel text-3xl font-bold text-[#e6c883]">
                        {getInitials(selectedMemberGroup.fullName)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-cinzel text-lg font-bold text-[#ece4d3] text-center mt-3">
                  {selectedMemberGroup.fullName}
                </h3>
                <p className="font-jost text-xs text-[#8d8676] uppercase tracking-[0.15em]">
                  {selectedMemberGroup.currentBelt}
                </p>
              </div>

              {/* LEFT COLUMN (Info & Achievement List 60%) */}
              <div className="lg:w-[60%] p-6 md:p-8 flex flex-col border-r border-[#c6a15b]/20 overflow-y-auto">
                <div className="mb-6">
                  <span className="font-jost text-[10px] md:text-xs font-extrabold uppercase tracking-[0.25em] text-[#e6c883] block mb-1">
                    PROFIL &amp; REKAM JEJAK PRESTASI ATLET
                  </span>
                  <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-[#ece4d3] leading-tight mb-1">
                    {selectedMemberGroup.fullName}
                  </h2>
                  <p className="font-jost text-xs text-[#8d8676] uppercase tracking-[0.15em] mb-4">
                    {selectedMemberGroup.currentBelt || "Atlet Resmi Dojang"}
                  </p>

                  {/* Medal Summary Pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedMemberGroup.goldCount > 0 && (
                      <span className="bg-[#7c1f26]/40 border border-[#c6a15b]/40 text-[#e6c883] px-3 py-1 text-xs font-bold rounded-md inline-flex items-center gap-1">
                        🥇 {selectedMemberGroup.goldCount} Medali Emas
                      </span>
                    )}
                    {selectedMemberGroup.silverCount > 0 && (
                      <span className="bg-slate-800/80 border border-slate-600 text-slate-200 px-3 py-1 text-xs font-bold rounded-md inline-flex items-center gap-1">
                        🥈 {selectedMemberGroup.silverCount} Medali Perak
                      </span>
                    )}
                    {selectedMemberGroup.bronzeCount > 0 && (
                      <span className="bg-amber-950/50 border border-amber-800/60 text-amber-500 px-3 py-1 text-xs font-bold rounded-md inline-flex items-center gap-1">
                        🥉 {selectedMemberGroup.bronzeCount} Medali Perunggu
                      </span>
                    )}
                  </div>
                </div>

                {/* Achievements Collection List */}
                <div className="flex-1 flex flex-col gap-3">
                  <h4 className="font-jost text-xs font-black uppercase tracking-[0.2em] text-[#c6a15b] border-b border-[#c6a15b]/20 pb-2">
                    Daftar Piagam &amp; Kejuaraan ({selectedMemberGroup.achievements.length})
                  </h4>

                  <div className="flex flex-col gap-3">
                    {selectedMemberGroup.achievements.map((ach) => {
                      const proofUrl = ach.certificateUrl || ach.photoUrl;

                      return (
                        <div
                          key={ach.id}
                          className="bg-[#0a0908]/80 border border-[#c6a15b]/20 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors hover:border-[#c6a15b]/50"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                                  (ach.rank || "").toLowerCase().includes("emas") || (ach.rank || "").includes("1")
                                    ? "bg-[#c6a15b]/20 border-[#c6a15b] text-[#e6c883]"
                                    : (ach.rank || "").toLowerCase().includes("perak") || (ach.rank || "").includes("2")
                                    ? "bg-slate-800 border-slate-400 text-slate-200"
                                    : "bg-amber-950/50 border-amber-700 text-amber-500"
                                }`}
                              >
                                {ach.rank || "Juara"}
                              </span>
                              <span className="text-[10px] font-semibold text-[#8d8676] flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#c6a15b]" />
                                {new Date(ach.date).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>

                            <h5 className="font-cinzel text-sm font-bold text-[#ece4d3] leading-snug">
                              {ach.title}
                            </h5>
                            <p className="font-jost text-xs text-[#8d8676]">{ach.eventName}</p>
                          </div>

                          {/* Certificate Link Button */}
                          {proofUrl ? (
                            <a
                              href={proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="border border-[#c6a15b]/50 hover:border-[#e6c883] text-[#e6c883] hover:bg-[#c6a15b]/20 text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded transition-all inline-flex items-center gap-1.5 shrink-0"
                            >
                              <span>Lihat Piagam</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-[#8d8676] italic shrink-0 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-[#c6a15b]" /> Verified
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* DESKTOP ONLY: RIGHT COLUMN (Photo Framed 40%) */}
              <div className="hidden lg:flex lg:w-[40%] bg-[#0a0908] p-8 items-center justify-center flex-col border-l border-[#c6a15b]/20">
                {/* Certificate Frame */}
                <div className="bg-gradient-to-b from-[#c6a15b] via-[#e6c883] to-[#c6a15b] p-3 relative shadow-2xl w-full max-w-xs">
                  {/* Corner overlays (fcorner effect) */}
                  <div className="absolute top-0 left-0 w-4 h-4 bg-[#0a0908]" />
                  <div className="absolute top-0 right-0 w-4 h-4 bg-[#0a0908]" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#0a0908]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#0a0908]" />

                  {/* Inner Photo or Fallback */}
                  {selectedMemberGroup.selfieUrl ? (
                    <img
                      src={selectedMemberGroup.selfieUrl}
                      alt={selectedMemberGroup.fullName}
                      className="w-full h-64 object-cover border border-[#0a0908]"
                    />
                  ) : (
                    <div className="w-full h-64 bg-[#1b1815] flex flex-col items-center justify-center border border-[#0a0908]">
                      <span className="font-cinzel text-4xl font-bold text-[#e6c883]">
                        {getInitials(selectedMemberGroup.fullName)}
                      </span>
                      <span className="font-jost text-[10px] text-[#8d8676] uppercase tracking-[0.2em] mt-2">
                        WHITE TIGER ATLET
                      </span>
                    </div>
                  )}
                </div>

                {/* Caption below photo */}
                <p className="font-cinzel text-sm font-bold text-[#e6c883] tracking-[0.2em] uppercase text-center mt-4">
                  {selectedMemberGroup.fullName}
                </p>
                <p className="font-jost text-[10px] text-[#8d8676] uppercase tracking-[0.15em] text-center mt-1">
                  {selectedMemberGroup.currentBelt || "ATLET RESMI DOJAN"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
