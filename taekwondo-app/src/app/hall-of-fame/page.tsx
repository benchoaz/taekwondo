"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Award, Calendar, User, Sparkles } from "lucide-react";

export default function HallOfFamePage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/achievements?status=APPROVED")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAchievements(data);
      })
      .catch(err => console.error("Error fetching achievements:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans selection:bg-[#E10600]/30 selection:text-white pb-24">
      {/* Navbar/Header Simple */}
      <nav className="fixed w-full z-50 transition-all duration-500 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm tracking-wide">Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto brightness-0 invert" onError={(e) => { e.currentTarget.style.display='none'; }} />
            <span className="font-black text-white tracking-widest text-lg font-display">WHITE TIGER</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-16 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-bold tracking-widest text-xs uppercase">Dinding Kehormatan</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 font-display tracking-tight drop-shadow-xl">
            Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500">Fame</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Menghargai keringat, darah, dan air mata para atlet kami yang telah berjuang membawa pulang medali kebanggaan.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-6 relative z-10">
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
          </div>
        ) : achievements.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-16 text-center backdrop-blur-sm">
            <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Belum Ada Rekam Jejak</h3>
            <p className="text-slate-400">Prestasi sang juara akan segera diukir di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {achievements.map((ach) => (
              <div key={ach.id} className="group relative bg-gradient-to-b from-slate-800/80 to-[#0F172A] border border-slate-700 hover:border-yellow-500/50 rounded-[2rem] overflow-hidden backdrop-blur-xl transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(234,179,8,0.3)] flex flex-col">
                {/* Glowing core behind card on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 via-yellow-500/0 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"></div>
                
                {/* Media / Certificate Section */}
                <div className="h-64 overflow-hidden relative flex-shrink-0 bg-slate-900">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent z-10"></div>
                  {(ach.photoUrl || ach.certificateUrl) ? (
                    <img 
                      src={ach.photoUrl || ach.certificateUrl} 
                      alt="Prestasi" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                      <Award className="w-32 h-32 text-yellow-500 blur-sm" />
                      <Award className="w-32 h-32 text-yellow-400 absolute" />
                    </div>
                  )}
                  
                  {/* Medal Overlay Top Right */}
                  <div className="absolute top-5 right-5 z-20">
                    <div className={`p-4 rounded-full shadow-2xl backdrop-blur-md border border-white/10 ${
                      ach.rank === "Emas" ? "bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-yellow-500/50" :
                      ach.rank === "Perak" ? "bg-gradient-to-br from-slate-200 to-slate-500 shadow-slate-400/50" :
                      "bg-gradient-to-br from-amber-500 to-orange-700 shadow-orange-500/50"
                    }`}>
                      <Award className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 relative z-20 flex-grow flex flex-col -mt-16">
                  {/* Athlete Info */}
                  <div className="flex items-end gap-4 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-yellow-500 blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                      {ach.member?.selfieUrl ? (
                        <img src={ach.member.selfieUrl} alt="Member" className="w-24 h-24 rounded-full object-cover border-4 border-[#0F172A] shadow-xl relative z-10" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-[#0F172A] flex items-center justify-center shadow-xl relative z-10">
                          <User className="w-12 h-12 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                        </div>
                      )}
                    </div>
                    <div className="pb-3">
                      <h3 className="font-black text-2xl text-white tracking-tight drop-shadow-md">{ach.member?.fullName}</h3>
                      <span className="text-sm font-bold text-yellow-400 tracking-wider uppercase">{ach.member?.currentBelt}</span>
                    </div>
                  </div>

                  {/* Achievement Details */}
                  <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 group-hover:border-slate-600 transition-colors flex-grow flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-yellow-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
                    <div>
                      <h4 className="font-extrabold text-white text-xl leading-snug mb-2 group-hover:text-yellow-300 transition-colors">{ach.title}</h4>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed mb-4">{ach.eventName}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-yellow-500" />
                        {new Date(ach.date).toLocaleDateString("id-ID", { day: 'numeric', month: "long", year: "numeric" })}
                      </div>
                      <span className={`text-xs font-black uppercase tracking-widest ${
                        ach.rank === "Emas" ? "text-yellow-400" :
                        ach.rank === "Perak" ? "text-slate-300" :
                        "text-amber-500"
                      }`}>{ach.rank}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
