"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Hash, Scale, Ruler, Trophy, Star, LogOut, Loader2, Sparkles, LineChart as ChartIcon, FileBadge, Calendar } from "lucide-react";
import BottomNav from "../_components/BottomNav";
import { getLevelInfo } from "@/lib/level";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Profile {
  name: string; email: string; memberNumber: string;
  currentBelt: string; progress: number; age: number;
  weight?: number; height?: number;
  achievements: { id: string; title: string; eventName: string; rank: string; date: string }[];
  physicalLogs: any[];
  beltHistory: any[];
  certificates: any[];
}
interface ShopActive {
  frameId?: string; titleId?: string; themeId?: string; emblemId?: string;
  items?: any[];
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
  const [shopActive, setShopActive] = useState<ShopActive>({});

  useEffect(() => {
    fetch("/api/profile")
      .then(r => { if (!r.ok && (r.status === 401 || r.status === 403)) { router.replace("/m/login"); } return r.json(); })
      .then(data => { if (data.success) setProfile(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
    // Fetch active shop items
    fetch("/api/shop")
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setShopActive({
            frameId: json.active?.frameId,
            titleId: json.active?.titleId,
            emblemId: json.active?.emblemId,
            themeId: json.active?.themeId,
            items: json.items,
          });
        }
      }).catch(() => {});
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
          {/* Avatar with active frame */}
          {(() => {
            const frame = shopActive.items?.find(i => i.id === shopActive.frameId);
            const frameCss = frame?.cssValue || null;
            return (
              <div
                className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center shadow-xl shrink-0"
                style={{
                  border: frameCss || `2px solid rgba(255,255,255,0.2)`,
                  boxShadow: frameCss?.includes('glow') ? undefined : `0 0 16px ${beltColor}40`,
                }}
              >
                <User className="w-8 h-8 text-white drop-shadow" />
              </div>
            );
          })()}
          <div>
            <span className="text-[9px] font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-1"><Sparkles className="w-3 h-3" /> STATS ATLET</span>
            <h1 className="font-black text-lg leading-tight">{profile?.name}</h1>
            {/* Active Title from shop */}
            {shopActive.titleId && shopActive.items && (() => {
              const title = shopActive.items.find(i => i.id === shopActive.titleId);
              return title ? (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ color: title.cssValue || '#FFD700', backgroundColor: (title.cssValue || '#FFD700') + '22' }}>
                  {title.name}
                </span>
              ) : null;
            })()}
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-2.5 h-2.5 rounded-full border border-slate-900 shadow" style={{ backgroundColor: beltColor }} />
              <span className="text-slate-300 text-xs font-semibold">Sabuk {profile?.currentBelt}</span>
            </div>
            <span className="text-slate-500 text-[10px] font-bold">#{profile?.memberNumber}</span>
             {profile && (() => {
               const levelInfo = getLevelInfo(profile.progress);
               return (
                 <div className="mt-2 flex flex-wrap items-center gap-1.5">
                   <span className="bg-[#FFD700] text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow-[0_0_8px_rgba(255,215,0,0.3)]">
                     LV.{levelInfo.level}
                   </span>
                   <span className="bg-slate-800 text-slate-300 font-extrabold text-[9px] px-2 py-0.5 rounded border border-slate-700 uppercase tracking-wider">
                     {levelInfo.title}
                   </span>
                 </div>
               );
             })()}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Progress & Leveling Card */}
        {profile && (() => {
          const levelInfo = getLevelInfo(profile.progress);
          return (
            <div className="game-card p-4 border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Progress Game & Leveling</p>
              <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-300">Level {levelInfo.level}</span>
                  <span className="text-[10px] font-black text-[#FFD700]">{levelInfo.currentXp} / {levelInfo.nextLevelXp} XP</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E10600] to-[#FFD700]"
                    style={{ width: `${levelInfo.percentage}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 font-bold mt-2 text-center uppercase tracking-wide">
                  Butuh {levelInfo.nextLevelXp - levelInfo.currentXp} XP lagi untuk naik level berikutnya!
                </p>
              </div>
            </div>
          );
        })()}

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

        {/* Physical Growth Chart */}
        {profile?.physicalLogs && profile.physicalLogs.length > 0 && (
          <div className="game-card p-4 border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <ChartIcon className="w-4 h-4 text-[#3b82f6]" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grafik Pertumbuhan Fisik</p>
            </div>
            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profile.physicalLogs.map((log: any) => ({
                  ...log,
                  dateStr: new Date(log.recordedAt).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="dateStr" stroke="#64748b" fontSize={10} tickMargin={8} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={10} domain={['auto', 'auto']} width={30} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} domain={['auto', 'auto']} width={30} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="weight" name="Berat (kg)" stroke="#E10600" strokeWidth={3} dot={{ r: 4, fill: '#E10600', strokeWidth: 2, stroke: '#020617' }} activeDot={{ r: 6, fill: '#E10600' }} />
                  <Line yAxisId="right" type="monotone" dataKey="height" name="Tinggi (cm)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#020617' }} activeDot={{ r: 6, fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Belt History Timeline */}
        {profile?.beltHistory && profile.beltHistory.length > 0 && (
          <div className="game-card p-4 border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-[#22c55e]" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline Riwayat Sabuk</p>
            </div>
            <div className="relative pl-3 border-l-2 border-slate-800 ml-2 space-y-5">
              {profile.beltHistory.map((bh: any, idx: number) => {
                const bColor = getBeltColor(bh.toBelt);
                return (
                  <div key={bh.id} className="relative">
                    <div className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full border-2 border-[#020617]" style={{ backgroundColor: bColor }} />
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                      <p className="text-[9px] text-slate-500 font-bold mb-1">
                        {new Date(bh.promotedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm font-black text-white">{bh.toBelt}</p>
                      {bh.fromBelt && bh.fromBelt !== bh.toBelt && (
                        <p className="text-[10px] text-slate-400 mt-1">Promosi dari: <span className="font-semibold">{bh.fromBelt}</span></p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Certificates Wallet */}
        {profile?.certificates && profile.certificates.length > 0 && (
          <div className="game-card p-4 border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <FileBadge className="w-4 h-4 text-[#FFD700]" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dompet Sertifikat Digital</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {profile.certificates.map((cert: any) => (
                <div key={cert.id} className="bg-black/30 p-3 rounded-2xl border border-white/10 flex flex-col items-center text-center relative overflow-hidden group">
                  <div className="absolute top-0 w-full h-1" style={{ backgroundColor: getBeltColor(cert.newBelt) }} />
                  <FileBadge className="w-8 h-8 text-slate-300 mt-2 mb-2 opacity-80" />
                  <p className="text-[10px] font-black text-white leading-tight mb-1">{cert.newBelt}</p>
                  <p className="text-[8px] text-slate-500 mb-2">{cert.certNumber}</p>
                  {cert.qrCodeUrl && (
                    <a href={cert.qrCodeUrl} target="_blank" rel="noreferrer" className="mt-auto bg-slate-800 hover:bg-slate-700 text-[9px] font-bold px-3 py-1.5 rounded-full text-slate-300 transition-colors w-full">
                      Lihat Sertifikat
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
