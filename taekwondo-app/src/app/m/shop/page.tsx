"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "../_components/BottomNav";
import { Star, ChevronRight, ChevronDown, HelpCircle, X, Check } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ShopItem {
  id: string; name: string; description: string;
  type: "PROFILE_FRAME" | "TITLE" | "THEME" | "EMBLEM";
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  price: number; cssValue: string | null; isLimited: boolean;
  owned: boolean; equipped: boolean;
}

// ─── Configs ─────────────────────────────────────────────────────────────────
const RARITY = {
  COMMON:    { label: "Biasa",   color: "#94a3b8", bg: "#1e293b", border: "#334155", stars: 1 },
  RARE:      { label: "Langka",  color: "#60a5fa", bg: "#172554", border: "#2563eb", stars: 2 },
  EPIC:      { label: "Epik",    color: "#c084fc", bg: "#2e1065", border: "#7c3aed", stars: 3 },
  LEGENDARY: { label: "Legenda", color: "#fbbf24", bg: "#451a03", border: "#d97706", stars: 4 },
};
const TYPE = {
  PROFILE_FRAME: { label: "Bingkai", icon: "🖼️", desc: "Tampil di sekeliling foto profilmu" },
  TITLE:         { label: "Gelar",   icon: "👑", desc: "Teks berwarna di bawah namamu" },
  THEME:         { label: "Tema",    icon: "🎨", desc: "Warna kartu profilmu" },
  EMBLEM:        { label: "Emblem",  icon: "🏅", desc: "Lencana unik di halaman profil" },
};
const TABS = [
  { label: "Semua", icon: "🛒", filter: null },
  { label: "Bingkai", icon: "🖼️", filter: "PROFILE_FRAME" },
  { label: "Gelar", icon: "👑", filter: "TITLE" },
  { label: "Tema", icon: "🎨", filter: "THEME" },
  { label: "Emblem", icon: "🏅", filter: "EMBLEM" },
];
const HOW_TO_EARN = [
  { icon: "✅", label: "Selesaikan Misi Harian", reward: "+5 DC", color: "#4ade80" },
  { icon: "📍", label: "Hadir Latihan (Absen)", reward: "+10 DC", color: "#60a5fa" },
  { icon: "⬆️", label: "Naik Level", reward: "+50 DC", color: "#fbbf24" },
  { icon: "🔥", label: "Streak 7 Hari Berturut", reward: "+100 DC", color: "#f97316" },
  { icon: "🏆", label: "Juara Turnamen (Pelatih)", reward: "+500 DC", color: "#c084fc" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ShopPage() {
  const router = useRouter();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [wallet, setWallet] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [actionStatus, setActionStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const fetchShop = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shop");
      if (res.status === 401 || res.status === 403) { router.replace("/m/login"); return; }
      const json = await res.json();
      if (json.success) { setItems(json.items || []); setWallet(json.wallet ?? 0); }
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { fetchShop(); }, []);

  const filtered = items.filter(item =>
    TABS[activeTab].filter === null || item.type === TABS[activeTab].filter
  );

  const handleBuy = async () => {
    if (!selected || actionLoading) return;
    setActionLoading(true);
    setActionStatus(null);
    const res = await fetch("/api/shop/buy", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: selected.id }),
    });
    const json = await res.json();
    if (json.success) {
      setActionStatus({ msg: `🎉 ${json.message}`, ok: true });
      setWallet(json.remaining);
      await fetchShop();
      // Update selected to reflect ownership
      setSelected(prev => prev ? { ...prev, owned: true } : null);
    } else {
      setActionStatus({ msg: `❌ ${json.error}`, ok: false });
    }
    setActionLoading(false);
  };

  const handleEquip = async () => {
    if (!selected || actionLoading) return;
    setActionLoading(true);
    setActionStatus(null);
    const res = await fetch("/api/shop/equip", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: selected.id }),
    });
    const json = await res.json();
    if (json.success) {
      setActionStatus({ msg: `✨ ${json.message}`, ok: true });
      await fetchShop();
      setSelected(prev => prev ? { ...prev, equipped: true } : null);
    } else {
      setActionStatus({ msg: `❌ ${json.error}`, ok: false });
    }
    setActionLoading(false);
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center gap-3">
      <div className="text-5xl animate-bounce">🛒</div>
      <p className="text-slate-400 font-bold text-sm">Memuat Toko Dojang...</p>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans pb-28 select-none">

      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1a0a2e] to-[#080c14] px-4 pt-10 pb-5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#a855f720_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#3b82f610_0%,_transparent_60%)]" />

        <div className="relative z-10 flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <span className="text-2xl">🛒</span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Toko Dojang
              </span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Belanjakan koin untuk item eksklusif!</p>
          </div>

          {/* Wallet + Help */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowGuide(true)} className="p-2 rounded-xl bg-slate-800/60 border border-slate-700">
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </button>
            <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-500/40 rounded-2xl px-3 py-2">
              <span className="text-lg">🪙</span>
              <div>
                <p className="text-[9px] text-yellow-400/70 font-black uppercase tracking-widest">Koinmu</p>
                <p className="text-yellow-300 font-black text-base leading-none">{wallet.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* How to earn coins — mini bar */}
        <div className="relative z-10 bg-slate-800/50 border border-slate-700/40 rounded-2xl px-3 py-2.5 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest shrink-0">Cara dapat koin:</p>
          {HOW_TO_EARN.slice(0, 4).map((e, i) => (
            <div key={i} className="flex items-center gap-1 shrink-0">
              <span className="text-sm">{e.icon}</span>
              <span className="text-xs font-black" style={{ color: e.color }}>{e.reward}</span>
            </div>
          ))}
          <button onClick={() => setShowGuide(true)} className="flex items-center gap-0.5 text-[10px] font-bold text-purple-400 shrink-0">
            Selengkapnya <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto no-scrollbar">
        {TABS.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-xs whitespace-nowrap transition-all border ${
              activeTab === i
                ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_14px_#a855f780]"
                : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500"
            }`}>
            <span>{tab.icon}</span><span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Stats Bar ── */}
      <div className="px-4 mb-3">
        <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl px-4 py-2 flex items-center justify-between text-xs">
          <span className="text-slate-500">{filtered.length} item tersedia</span>
          <span className="text-slate-500">
            {filtered.filter(i => i.owned).length} dimiliki · {filtered.filter(i => i.equipped).length} dipakai
          </span>
        </div>
      </div>

      {/* ── Empty State ── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <p className="text-5xl mb-3">📦</p>
          <p className="font-black text-base">Tidak ada item</p>
          <p className="text-xs mt-1">Belum ada item di kategori ini</p>
        </div>
      )}

      {/* ── Items Grid ── */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filtered.map(item => {
          const r = RARITY[item.rarity];
          const t = TYPE[item.type];
          const canAfford = wallet >= item.price;
          return (
            <button key={item.id} onClick={() => { setSelected(item); setActionStatus(null); }}
              className="relative rounded-2xl p-3 text-left transition-all hover:scale-105 active:scale-95 border"
              style={{ background: r.bg, borderColor: r.border }}>

              {/* Rarity glow for LEGENDARY/EPIC */}
              {(item.rarity === "LEGENDARY" || item.rarity === "EPIC") && (
                <div className="absolute inset-0 rounded-2xl opacity-20 blur-xl" style={{ background: r.color }} />
              )}

              {/* Top badges */}
              <div className="relative flex items-start justify-between mb-2">
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full border"
                  style={{ color: r.color, borderColor: r.color + "60", background: r.color + "15" }}>
                  {r.label}
                </span>
                <div className="flex items-center gap-1">
                  {item.isLimited && <span className="text-[9px] font-black text-red-400 animate-pulse">⏰</span>}
                  {item.owned && <span className="text-[9px] font-black text-green-400">✓</span>}
                </div>
              </div>

              {/* Icon */}
              <div className="relative text-4xl text-center my-3">{t.icon}</div>

              {/* Name */}
              <p className="relative font-black text-sm text-white leading-tight mb-1">{item.name}</p>

              {/* Stars */}
              <div className="relative flex gap-0.5 mb-2">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-current" style={{ color: r.color }} />
                ))}
              </div>

              {/* Price + affordability */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-sm">🪙</span>
                  <span className={`font-black text-sm ${canAfford && !item.owned ? "text-yellow-300" : item.owned ? "text-green-400" : "text-slate-400"}`}>
                    {item.owned ? "Dimiliki" : item.price.toLocaleString() + " DC"}
                  </span>
                </div>
                {item.equipped && (
                  <span className="text-[9px] bg-green-500/20 text-green-400 border border-green-500/40 px-1.5 py-0.5 rounded-full font-black">Aktif</span>
                )}
              </div>

              {/* Can't afford overlay */}
              {!item.owned && !canAfford && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs">🔒</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── How To Guide Modal ── */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full max-w-md mx-auto bg-[#0f172a] border border-slate-700 rounded-t-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-white">📖 Panduan Toko Dojang</h3>
              <button onClick={() => setShowGuide(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* What are Dojang Coins */}
            <div>
              <h4 className="font-black text-yellow-400 mb-2 text-sm">🪙 Apa itu Dojang Coin (DC)?</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Dojang Coin adalah mata uang virtual yang kamu kumpulkan dari aktivitas latihan. 
                Gunakan DC untuk membeli item kosmetik eksklusif di toko ini. 
                <span className="text-yellow-400 font-bold"> DC tidak memengaruhi nilai sabuk atau nilai latihan</span> — murni untuk tampilan profil.
              </p>
            </div>

            {/* How to earn */}
            <div>
              <h4 className="font-black text-green-400 mb-3 text-sm">💰 Cara Mendapatkan DC</h4>
              <div className="space-y-2">
                {HOW_TO_EARN.map((e, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{e.icon}</span>
                      <span className="text-sm text-slate-200">{e.label}</span>
                    </div>
                    <span className="font-black text-sm" style={{ color: e.color }}>{e.reward}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Item types */}
            <div>
              <h4 className="font-black text-purple-400 mb-3 text-sm">🎁 Jenis Item</h4>
              <div className="space-y-2">
                {Object.entries(TYPE).map(([key, val]) => (
                  <div key={key} className="flex items-start gap-3 bg-slate-800/60 rounded-xl px-3 py-2.5">
                    <span className="text-2xl mt-0.5">{val.icon}</span>
                    <div>
                      <p className="font-black text-sm text-white">{val.label}</p>
                      <p className="text-xs text-slate-400">{val.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to use */}
            <div>
              <h4 className="font-black text-blue-400 mb-3 text-sm">🔧 Cara Menggunakan Item</h4>
              <div className="space-y-2 text-sm text-slate-300">
                {[
                  { step: "1", text: "Kumpulkan DC dari misi & latihan harian", color: "#4ade80" },
                  { step: "2", text: 'Buka halaman TOKO → pilih item yang diinginkan', color: "#60a5fa" },
                  { step: "3", text: 'Klik item → tekan tombol "Beli" (memotong saldo DC)', color: "#fbbf24" },
                  { step: "4", text: 'Setelah dibeli, klik "Pasang" untuk mengaktifkan', color: "#c084fc" },
                  { step: "5", text: 'Item aktif tampil di halaman Profil (ATLET) kamu!', color: "#f97316" },
                ].map(({ step, text, color }) => (
                  <div key={step} className="flex items-center gap-3 bg-slate-800/40 rounded-xl px-3 py-2.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0" style={{ background: color + "30", color }}>
                      {step}
                    </div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rarity tiers */}
            <div>
              <h4 className="font-black text-orange-400 mb-3 text-sm">⭐ Tingkatan Kelangkaan</h4>
              <div className="space-y-2">
                {Object.entries(RARITY).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between rounded-xl px-3 py-2 border" style={{ borderColor: val.border, background: val.bg }}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: val.stars }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" style={{ color: val.color }} />
                        ))}
                      </div>
                      <span className="font-black text-sm" style={{ color: val.color }}>{val.label}</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {key === "COMMON" ? "50–150 DC" : key === "RARE" ? "200–500 DC" : key === "EPIC" ? "750–1.500 DC" : "2.000–5.000 DC"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setShowGuide(false)} className="w-full py-3 bg-purple-600 rounded-2xl font-black text-base hover:bg-purple-700 transition">
              Mengerti, Mulai Belanja! 🛒
            </button>
          </div>
        </div>
      )}

      {/* ── Item Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end" onClick={e => { if (e.target === e.currentTarget) { setSelected(null); setActionStatus(null); } }}>
          <div className="w-full max-w-md mx-auto bg-[#0f172a] border border-slate-700 rounded-t-3xl p-6 space-y-4">
            {/* Handle bar */}
            <div className="w-10 h-1 rounded-full mx-auto" style={{ background: RARITY[selected.rarity].color }} />

            {/* Item header */}
            <div className="flex items-center gap-4">
              <div className="text-5xl">{TYPE[selected.type].icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full border"
                    style={{ color: RARITY[selected.rarity].color, borderColor: RARITY[selected.rarity].color + "60", background: RARITY[selected.rarity].color + "15" }}>
                    {RARITY[selected.rarity].label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{TYPE[selected.type].label}</span>
                </div>
                <h3 className="font-black text-xl text-white">{selected.name}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{TYPE[selected.type].desc}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/40 rounded-xl p-3">{selected.description}</p>

            {/* Price vs Wallet */}
            <div className="flex items-center justify-between bg-slate-800/60 rounded-2xl px-4 py-3 border border-slate-700">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-0.5">
                  {selected.owned ? "STATUS" : "HARGA BELI"}
                </p>
                {selected.owned
                  ? <p className="text-green-400 font-black text-lg flex items-center gap-1"><Check className="w-4 h-4" /> Sudah Dimiliki</p>
                  : <p className="text-yellow-300 font-black text-xl">🪙 {selected.price.toLocaleString()} DC</p>
                }
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-0.5">SALDO KAMU</p>
                <p className={`font-black text-xl ${wallet >= selected.price || selected.owned ? "text-green-400" : "text-red-400"}`}>
                  {wallet.toLocaleString()} DC
                </p>
              </div>
            </div>

            {/* How to use note */}
            {selected.owned && (
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-300">
                💡 Klik <strong>"Pasang Sekarang"</strong> untuk mengaktifkan item ini. Item akan muncul di halaman <strong>Profil (ATLET)</strong> kamu secara otomatis.
              </div>
            )}
            {!selected.owned && wallet < selected.price && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 text-xs text-red-300">
                🔒 Koin belum cukup. Butuh <strong>{(selected.price - wallet).toLocaleString()} DC</strong> lagi. 
                Selesaikan misi harian dan hadir latihan untuk mengumpulkan koin!
              </div>
            )}

            {/* Status message */}
            {actionStatus && (
              <div className={`text-center text-sm font-bold py-2.5 px-4 rounded-xl ${actionStatus.ok ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
                {actionStatus.msg}
              </div>
            )}

            {/* Action Button */}
            {selected.owned ? (
              <button onClick={handleEquip} disabled={actionLoading || selected.equipped}
                className={`w-full py-4 rounded-2xl font-black text-base transition-all ${
                  selected.equipped
                    ? "bg-green-900/30 text-green-400 border border-green-500/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:opacity-90 active:scale-95"
                }`}>
                {actionLoading ? "⏳ Memasang..." : selected.equipped ? "✨ Sedang Dipakai" : "✨ Pasang Sekarang"}
              </button>
            ) : (
              <button onClick={handleBuy} disabled={actionLoading || wallet < selected.price}
                className={`w-full py-4 rounded-2xl font-black text-base transition-all ${
                  wallet < selected.price
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg hover:opacity-90 active:scale-95"
                }`}>
                {actionLoading
                  ? "⏳ Memproses..."
                  : wallet < selected.price
                  ? `🔒 Butuh ${(selected.price - wallet).toLocaleString()} DC lagi`
                  : `🛒 Beli Sekarang — ${selected.price.toLocaleString()} DC`}
              </button>
            )}

            {/* Already owned unequip hint */}
            {selected.owned && !selected.equipped && (
              <p className="text-center text-xs text-slate-500">
                Kamu memiliki item ini. Pasang untuk menampilkannya di profil.
              </p>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
