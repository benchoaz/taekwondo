"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Hash, Scale, Ruler, Trophy, Star, LogOut, Loader2, Sparkles } from "lucide-react";
import BottomNav from "../_components/BottomNav";

interface Profile {
  name: string; email: string; memberNumber: string;
  currentBelt: string; progress: number; age: number;
  weight?: number; height?: number;
  achievements: { id: string; title: string; eventName: string; rank: string; date: string }[];
}

const BELT_COLORS: Record<string, string> = {
  putih: "#e2e8f0", kuning: "#FFD700", hijau: "#22c55e",
  biru: "#3b82f6", merah: "#E10600", hitam: "#0F172A",
};
function getBeltColor(belt: string) {
  const b = (belt || "").toLowerCase();
  for (const key in BELT_COLORS) { if (b.includes(key)) return BELT_COLORS[key]; }
  return "#64748b";
}
const RANK_COLORS: Record<string, string> = { Emas: "#FFD700", Perak: "#94a3b8", Perunggu: "#cd7f32" };

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => { if (!r.ok && (r.status === 401 || r.status === 403)) { router.replace("/m/login"); } return r.json(); })
      .then(data => { if (data.success) setProfile(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/m/login");
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-[#020617]">
      <Loader2 className="w-8 h-8 text-[#E10600] animate-spin" />
    </div>
  );

  const beltColor = getBeltColor(profile?.currentBelt || "");

  return (
    <div className="flex-1 flex flex-col pb-28 bg-[#020617] text-white">
      {/* Header Profile */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 pt-12 pb-10 px-5 border-b-4 border-[#334155]">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#E10600]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
        <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-400 text-xs mb-6 relative z-10">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="flex items-center gap-4 relative z-10">
          {/* Hexagonal-like Frame for Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-white/20 flex items-center justify-center shadow-xl shrink-0" style={{ boxShadow: `0 0 16px ${beltColor}40` }}>
            <User className="w-8 h-8 text-white drop-shadow" />
          </div>
          <div>
            <span className="text-[9px] font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-1"><Sparkles className="w-3 h-3" /> STATS ATLET</span>
            <h1 className="font-black text-lg leading-tight">{profile?.name}</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-2.5 h-2.5 rounded-full border border-slate-900 shadow" style={{ backgroundColor: beltColor }} />
              <span className="text-slate-300 text-xs font-semibold">Sabuk {profile?.currentBelt}</span>
            </div>
            <span className="text-slate-500 text-[10px] font-bold">#{profile?.memberNumber}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Info Card (Status Panel) */}
        <div className="game-card p-4 border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Spesifikasi Fisik & Identitas</p>
          <div className="flex flex-col gap-3">
            {[
              { icon: Mail, label: "Email", value: profile?.email },
              { icon: Hash, label: "No. Member", value: `#${profile?.memberNumber}` },
              { icon: User, label: "Usia", value: profile?.age ? `${profile.age} tahun` : "-" },
              { icon: Scale, label: "Berat Badan", value: profile?.weight ? `${profile.weight} kg` : "-" },
              { icon: Ruler, label: "Tinggi Badan", value: profile?.height ? `${profile.height} cm` : "-" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/5">
                <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
                  <p className="text-xs font-black text-white">{value || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements / Medals */}
        <div className="game-card p-4 border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lemari Medali & Prestasi</p>
          </div>
          {(profile?.achievements?.length ?? 0) === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4 font-bold">Belum ada medali yang diklaim</p>
          ) : (
            <div className="flex flex-col gap-2">
              {profile?.achievements.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 bg-black/20 border border-white/5 rounded-2xl">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
                    style={{ backgroundColor: `${RANK_COLORS[a.rank] || "#94a3b8"}15` }}>
                    <Star className="w-5 h-5 fill-current" style={{ color: RANK_COLORS[a.rank] || "#94a3b8" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-white leading-snug truncate">{a.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{a.eventName}</p>
                    <div className="mt-1">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full border border-white/5 uppercase"
                        style={{ backgroundColor: `${RANK_COLORS[a.rank] || "#94a3b8"}15`, color: RANK_COLORS[a.rank] || "#94a3b8" }}>
                        {a.rank}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full bg-slate-950 border-2 border-red-950 text-[#E10600] font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md uppercase tracking-wider text-xs">
          <LogOut className="w-4 h-4" /> Keluar Dari Game (Logout)
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
