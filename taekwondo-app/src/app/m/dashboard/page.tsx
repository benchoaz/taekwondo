"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, ChevronRight, Zap, CreditCard, Trophy, Calendar,
  CheckCircle, Clock, TrendingUp, Star, LogOut, Loader2, Award,
  Newspaper, MapPin, Map, Flame
} from "lucide-react";
import BottomNav from "../_components/BottomNav";
import NotificationBell from "../_components/NotificationBell";

interface UserProfile {
  name: string; email: string; memberNumber: string;
  currentBelt: string; progress: number;
}
interface SppInvoice {
  id: string; month: number; year: number;
  amount: number; status: string;
}
interface QuestLog {
  id: string; completed: boolean;
  quest: { title: string; baseXp: number; category: string };
}
interface Article {
  id: string; title: string; content: string; imageUrl?: string; author: string; createdAt: string;
}
interface TournamentEvent {
  id: string; title: string; level: string; location: string; startDate: string; endDate: string;
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const BELT_COLORS: Record<string, string> = {
  "putih": "#F8FAFC",
  "kuning": "#FFD700",
  "hijau": "#22c55e",
  "biru": "#3b82f6",
  "merah": "#E10600",
  "hitam": "#0F172A",
};
function getBeltColor(belt: string) {
  const b = (belt || "").toLowerCase();
  for (const key in BELT_COLORS) {
    if (b.includes(key)) return BELT_COLORS[key];
  }
  return "#64748b";
}

export default function MobileDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [spp, setSpp] = useState<SppInvoice | null>(null);
  const [quests, setQuests] = useState<QuestLog[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [events, setEvents] = useState<TournamentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const profileRes = await fetch("/api/profile");
      if (profileRes.status === 401 || profileRes.status === 403) {
        router.replace("/m/login");
        return;
      }
      const profileData = await profileRes.json();
      if (!profileData.success) { router.replace("/m/login"); return; }
      const p = profileData.data;
      setProfile(p);
      setUserId(p.id || "");
      // Persist for notification bell
      try { localStorage.setItem("user", JSON.stringify({ id: p.id })); } catch {}

      const [sppRes, questsRes, articlesRes, eventsRes] = await Promise.all([
        fetch("/api/spp"),
        fetch("/api/quests"),
        fetch("/api/articles"),
        fetch("/api/events")
      ]);
      const sppData = await sppRes.json();
      if (Array.isArray(sppData) && sppData.length > 0) {
        const unpaid = sppData.find((s: SppInvoice) => s.status === "PENDING" || s.status === "UNPAID");
        setSpp(unpaid || sppData[0]);
      }
      const questsData = await questsRes.json();
      if (questsData.success) setQuests(questsData.data || []);

      const artData = await articlesRes.json();
      if (Array.isArray(artData)) setArticles(artData.slice(0, 5));

      const evData = await eventsRes.json();
      if (evData.success && Array.isArray(evData.data)) setEvents(evData.data.slice(0, 5));
    } catch {
      router.replace("/m/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleCheckIn = async () => {
    if (!profile) return;
    setCheckInLoading(true);
    setCheckInStatus(null);

    if (!navigator.geolocation) {
      setCheckInStatus({ type: "error", message: "GPS tidak didukung oleh browser Anda." });
      setCheckInLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/attendances/check-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              memberId: profile.email, // using email as identifier matches API logic fallback
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          });
          const data = await res.json();
          if (res.ok) {
            setCheckInStatus({ type: "success", message: "Absen Berhasil Dicatat! 🥋" });
          } else {
            setCheckInStatus({ type: "error", message: data.error || "Gagal melakukan absensi." });
          }
        } catch {
          setCheckInStatus({ type: "error", message: "Koneksi ke server terputus." });
        } finally {
          setCheckInLoading(false);
        }
      },
      () => {
        setCheckInStatus({ type: "error", message: "Gagal mendeteksi lokasi GPS. Aktifkan izin lokasi." });
        setCheckInLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleLogout = async () => {
    await fetch("/api/auth/login", { method: "DELETE" }).catch(() => {});
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/m/login");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#020617]">
        <Loader2 className="w-8 h-8 text-[#E10600] animate-spin" />
      </div>
    );
  }

  const completedQuests = quests.filter(q => q.completed).length;
  const beltColor = getBeltColor(profile?.currentBelt || "");

  return (
    <div className="flex-1 flex flex-col pb-28 bg-[#0f172a] text-white overflow-y-auto max-h-screen bg-game-taekwondo-theme">
      {/* Game Lobby Header */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 pt-12 pb-20 px-5 border-b-4 border-[#334155] shadow-[0_4px_20px_rgba(0,0,0,0.5)] shrink-0">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E10600]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {/* Avatar Frame */}
            <div className="relative w-14 h-14 rounded-2xl bg-slate-800 border-2 border-white/20 flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.1)]">
              <span className="text-xl font-black text-white">{profile?.name ? profile.name.charAt(0) : "M"}</span>
              {/* Belt badge indicator */}
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-md"
                style={{ backgroundColor: beltColor }}
                title={profile?.currentBelt}
              />
            </div>
            <div>
              <span className="text-[9px] font-black tracking-widest text-[#E10600] uppercase">ATLET MUDA</span>
              <h1 className="text-base font-black tracking-tight leading-tight">{profile?.name || "Member"}</h1>
              <p className="text-slate-400 text-[10px] font-semibold mt-0.5">#{profile?.memberNumber || "-"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell userId={userId} />
            <button onClick={handleLogout} className="w-10 h-10 bg-slate-800/80 border-2 border-slate-700 rounded-xl flex items-center justify-center hover:bg-red-950 transition-colors">
              <LogOut className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        {/* Level & XP Progress */}
        <div className="mt-5 bg-slate-950/80 border-2 border-slate-800 rounded-2xl p-3 shadow-inner">
          <div className="flex justify-between items-center text-[10px] font-bold mb-1.5 text-slate-400">
            <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-[#FFD700]" /> Sabuk {profile?.currentBelt}</span>
            <span className="text-white font-black">{profile?.progress ?? 0} / 100 XP</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#E10600] to-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.5)] transition-all duration-500"
              style={{ width: `${Math.min(profile?.progress ?? 0, 100)}%` }}
            />
          </div>
        </div>

        {/* --- SELF CHECK-IN BUTTON --- */}
        <div className="mt-4 relative z-10">
          <button
            onClick={handleCheckIn}
            disabled={checkInLoading}
            className="w-full btn-battle py-3.5 flex items-center justify-center gap-2"
          >
            {checkInLoading ? (
              <>
                <Loader2 className="w-4 h-4 text-white animate-spin" />
                <span>Mendeteksi Lokasi GPS...</span>
              </>
            ) : (
              <>
                <span>🥋 ABSEN MASUK SEKARANG</span>
              </>
            )}
          </button>
          
          {checkInStatus && (
            <div className={`mt-3 p-3 rounded-2xl border text-xs font-bold text-center ${
              checkInStatus.type === "success" 
                ? "bg-emerald-950/80 border-emerald-500 text-emerald-400" 
                : "bg-red-950/80 border-red-500 text-red-400"
            }`}>
              {checkInStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Main Lobby Widget List */}
      <div className="px-4 -mt-8 relative z-10 flex flex-col gap-4">

        {/* Quest Widget - Game styled banner */}
        <Link href="/m/quests" className="block">
          <div className="game-card p-4 game-border-red">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Zap className="w-32 h-32 text-white" />
            </div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                  <img
                    src="/daily_quest_tiger_transparent.png"
                    alt="Quest Tiger"
                    className="object-contain w-full h-full"
                  />
                </div>
                <span className="font-black text-sm tracking-wide uppercase">Misi Harian (Daily Quests)</span>
              </div>
              <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-full">{completedQuests}/{quests.length} SELESAI</span>
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              {quests.length === 0 ? (
                <p className="text-slate-400 text-xs font-semibold">Tidak ada misi aktif untuk hari ini.</p>
              ) : (
                quests.slice(0, 3).map(q => (
                  <div key={q.id} className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/5">
                    {q.completed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className={`text-xs font-semibold flex-1 truncate ${q.completed ? "text-slate-500 line-through" : "text-slate-200"}`}>
                      {q.quest.title}
                    </span>
                    <span className="text-[10px] text-[#FFD700] font-black shrink-0">+{q.quest.baseXp} XP</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Link>

        {/* SPP Token / Shop Card */}
        <Link href="/m/spp" className="block">
          <div className={`game-card p-4 ${spp?.status === "PENDING" || spp?.status === "UNPAID" ? "border-[#E10600] shadow-[0_8px_0_0_#990000]" : "border-slate-800"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${spp?.status === "PENDING" || spp?.status === "UNPAID" ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TOKO SPP</span>
                  <p className="text-sm font-black text-white">
                    {spp ? `Bulan ${MONTH_NAMES[spp.month - 1]} ${spp.year}` : "Pembayaran Aman"}
                  </p>
                  {spp && (
                    <p className="text-xs font-bold text-slate-400">
                      Rp {spp.amount.toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {spp && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${spp.status === "PENDING" || spp.status === "UNPAID" ? "bg-red-950/80 border-red-500 text-red-400" : "bg-emerald-950/80 border-emerald-500 text-emerald-400"}`}>
                    {spp.status === "PENDING" || spp.status === "UNPAID" ? "BELUM LUNAS" : "LUNAS"}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>
        </Link>

        {/* Quick Menu Grid */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <Link href="/m/schedule" className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 shadow-md flex items-center gap-3.5 active:scale-95 transition-all">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">JADWAL</p>
              <p className="text-xs font-black text-white">Latihan</p>
            </div>
          </Link>
          <Link href="/m/ukt" className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 shadow-md flex items-center gap-3.5 active:scale-95 transition-all">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">UJIAN UKT</p>
              <p className="text-xs font-black text-white">Progress</p>
            </div>
          </Link>
          <Link href="/m/profile" className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 shadow-md flex items-center gap-3.5 active:scale-95 transition-all">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">PROFIL</p>
              <p className="text-xs font-black text-white">Atlet</p>
            </div>
          </Link>
          <Link href="/m/spp" className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 shadow-md flex items-center gap-3.5 active:scale-95 transition-all">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">RIWAYAT</p>
              <p className="text-xs font-black text-white">Pembayaran</p>
            </div>
          </Link>
        </div>

        {/* --- DYNAMIC EVENT SECTION --- */}
        <div className="mt-2 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-[#FFD700]" />
            <h3 className="font-black text-sm uppercase tracking-wide">Turnamen & Kejuaraan</h3>
          </div>
          {events.length === 0 ? (
            <p className="text-xs text-slate-500 font-bold p-1">Belum ada kejuaraan terdekat.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {events.map(ev => (
                <div key={ev.id} className="game-card p-4 border-slate-800 bg-slate-950/70">
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-[9px] font-black uppercase bg-[#E10600]/10 border border-[#E10600]/20 text-[#E10600] px-2 py-0.5 rounded-full">
                      {ev.level}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold">
                      {new Date(ev.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white leading-tight">{ev.title}</h4>
                  <div className="flex items-center gap-1 mt-2 text-slate-400 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold truncate">{ev.location}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- DYNAMIC NEWS / ARTICLES SECTION --- */}
        <div className="mt-2 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="w-5 h-5 text-blue-400" />
            <h3 className="font-black text-sm uppercase tracking-wide">Berita Dojang</h3>
          </div>
          {articles.length === 0 ? (
            <p className="text-xs text-slate-500 font-bold p-1">Belum ada berita terbaru.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {articles.map(art => (
                <div key={art.id} className="game-card p-4 border-slate-800 flex gap-3.5 items-start bg-slate-950/50">
                  {art.imageUrl && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-800 bg-slate-900">
                      <img src={art.imageUrl} alt={art.title} className="object-cover w-full h-full" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-white leading-snug line-clamp-2">{art.title}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">{art.content.replace(/<[^>]*>/g, '')}</p>
                    <div className="flex justify-between items-center mt-2 text-[9px] text-slate-500 font-black uppercase">
                      <span>Oleh {art.author}</span>
                      <span>{new Date(art.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
