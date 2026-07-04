"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Calendar, Users, CheckCircle, Clock, Loader2, Sparkles } from "lucide-react";
import BottomNav from "../_components/BottomNav";

interface UktData {
  exam: {
    id: string; date: string; location: string; status: string;
    participants: { id: string; member: { fullName: string } }[];
  };
  registration: { id: string; targetBelt: string; status: string } | null;
}

export default function UktPage() {
  const router = useRouter();
  const [data, setData] = useState<UktData | null>(null);
  const [loading, setLoading] = useState(true);
  const [noExam, setNoExam] = useState(false);

  useEffect(() => {
    fetch("/api/ukt")
      .then(r => {
        if (!r.ok && (r.status === 401 || r.status === 403)) { router.replace("/m/login"); }
        if (r.status === 404) { setNoExam(true); setLoading(false); return null; }
        return r.json();
      })
      .then(d => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const examDate = data?.exam?.date ? new Date(data.exam.date) : null;

  return (
    <div className="flex-1 flex flex-col pb-28 bg-[#020617] text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 pt-12 pb-6 px-5 border-b-4 border-[#334155]">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-400 text-xs mb-4">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center animate-game-float">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="font-black text-lg uppercase tracking-wide">Ujian Kenaikan Sabuk (UKT)</h1>
            <p className="text-slate-400 text-xs">Tier advancement event</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-[#E10600] animate-spin" />
          </div>
        ) : noExam || !data ? (
          <div className="text-center py-16 text-slate-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-black">Belum Ada Event UKT Aktif</p>
            <p className="text-xs mt-1">Cek pengumuman di dojang secara berkala</p>
          </div>
        ) : (
          <>
            {/* UKT Event Detail (Clash style Tier card) */}
            <div className="game-card p-5 game-border-gold">
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                <Trophy className="w-36 h-36 text-[#FFD700]" />
              </div>
              
              <span className="text-[9px] font-black text-[#FFD700] uppercase tracking-widest flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> EVENT UKT AKTIF
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                {examDate ? examDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "-"}
              </h2>

              <div className="flex flex-col gap-2 mt-4 bg-black/25 p-3 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wide">Status Event</span>
                  <span className="font-black text-[#FFD700] uppercase">{data.exam.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wide">Lokasi Ujian</span>
                  <span className="font-bold text-white text-right">{data.exam.location}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wide">Pendaftar</span>
                  <span className="font-bold text-white">{data.exam.participants?.length ?? 0} Atlet</span>
                </div>
              </div>
            </div>

            {/* Registration Status */}
            {data.registration ? (
              <div className="game-card p-4 border-emerald-800 bg-slate-950/80">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">STATUS REGISTRASI</span>
                    <p className="font-black text-white text-sm">Sudah Terdaftar!</p>
                    <p className="text-xs text-slate-400 mt-0.5">Target Sabuk: <span className="font-black text-white">{data.registration.targetBelt}</span></p>
                    <div className="mt-1.5">
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${data.registration.status === "APPROVED" ? "bg-emerald-950/80 border-emerald-500 text-emerald-400" : "bg-amber-950/80 border-amber-500 text-[#FFD700]"}`}>
                        {data.registration.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="game-card p-4 border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">REGISTRASI</span>
                    <p className="font-black text-white text-sm">Belum Terdaftar</p>
                    <p className="text-xs text-slate-400 mt-0.5">Hubungi Coach / Pelatih di Dojang untuk mengajukan kelayakan UKT</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
