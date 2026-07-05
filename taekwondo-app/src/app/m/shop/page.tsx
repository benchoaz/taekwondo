"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "../_components/BottomNav";
import { ShoppingBag, Star, Zap, Shield, Crown, Palette, Package, CheckCircle, Lock, Coins } from "lucide-react";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: "PROFILE_FRAME" | "TITLE" | "THEME" | "EMBLEM";
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  price: number;
  cssValue: string | null;
  isLimited: boolean;
  owned: boolean;
  equipped: boolean;
}

const RARITY_CONFIG = {
  COMMON:    { label: "Biasa",    color: "#94a3b8", bg: "bg-slate-700",   glow: "",                              stars: 1 },
  RARE:      { label: "Langka",   color: "#3b82f6", bg: "bg-blue-900/60", glow: "shadow-[0_0_16px_#3b82f6aa]",  stars: 2 },
  EPIC:      { label: "Epik",     color: "#a855f7", bg: "bg-purple-900/60",glow: "shadow-[0_0_20px_#a855f7aa]", stars: 3 },
  LEGENDARY: { label: "Legenda",  color: "#FFD700", bg: "bg-yellow-900/40",glow: "shadow-[0_0_24px_#FFD700bb]", stars: 4 },
};

const TYPE_CONFIG = {
  PROFILE_FRAME: { label: "Bingkai",  icon: "🖼️",  tab: 0 },
  TITLE:         { label: "Gelar",    icon: "👑",  tab: 1 },
  THEME:         { label: "Tema",     icon: "🎨",  tab: 2 },
  EMBLEM:        { label: "Emblem",   icon: "🏅",  tab: 3 },
};

const TABS = [
  { label: "Semua", icon: "🛒" },
  { label: "Bingkai", icon: "🖼️" },
  { label: "Gelar", icon: "👑" },
  { label: "Tema", icon: "🎨" },
  { label: "Emblem", icon: "🏅" },
];

const TYPE_BY_TAB: Record<number, string | null> = {
  0: null,
  1: "PROFILE_FRAME",
  2: "TITLE",
  3: "THEME",
  4: "EMBLEM",
};

export default function ShopPage() {
  const router = useRouter();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [wallet, setWallet] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [actionStatus, setActionStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchShop = async () => {
    try {
      const res = await fetch("/api/shop");
      if (res.status === 401 || res.status === 403) { router.replace("/m/login"); return; }
      const json = await res.json();
      if (json.success) {
        setItems(json.items);
        setWallet(json.wallet);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchShop(); }, []);

  const filteredItems = items.filter(item => {
    const typeFilter = TYPE_BY_TAB[activeTab];
    return typeFilter === null || item.type === typeFilter;
  });

  const handleBuy = async () => {
    if (!selected) return;
    setActionLoading(true);
    setActionStatus("");
    const res = await fetch("/api/shop/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: selected.id }),
    });
    const json = await res.json();
    if (json.success) {
      setActionStatus("✅ " + json.message);
      setWallet(json.remaining);
      await fetchShop();
      const updated = items.find(i => i.id === selected.id);
      if (updated) setSelected({ ...updated, owned: true });
    } else {
      setActionStatus("❌ " + json.error);
    }
    setActionLoading(false);
  };

  const handleEquip = async () => {
    if (!selected) return;
    setActionLoading(true);
    setActionStatus("");
    const res = await fetch("/api/shop/equip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: selected.id }),
    });
    const json = await res.json();
    if (json.success) {
      setActionStatus("✨ " + json.message);
      await fetchShop();
    } else {
      setActionStatus("❌ " + json.error);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🛒</div>
          <p className="text-slate-400 font-bold">Membuka Toko Dojang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans pb-28">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-[#1a0a2e] to-[#080c14] px-4 pt-10 pb-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#a855f720_0%,_transparent_70%)]" />
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-purple-400" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Toko Dojang
              </span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Belanjakan koin untuk item eksklusif!</p>
          </div>
          {/* Wallet */}
          <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-500/30 rounded-2xl px-4 py-2">
            <span className="text-xl">🪙</span>
            <div>
              <p className="text-[10px] text-yellow-400/70 font-bold uppercase tracking-wide">Dojang Coin</p>
              <p className="text-yellow-300 font-black text-lg leading-none">{wallet.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Coin Earn Info */}
        <div className="relative z-10 bg-slate-800/50 rounded-2xl p-3 flex gap-3 text-xs mb-2">
          <div className="flex items-center gap-1.5 text-green-400"><span>✅</span><span>Misi +5</span></div>
          <div className="flex items-center gap-1.5 text-blue-400"><span>📍</span><span>Hadir +10</span></div>
          <div className="flex items-center gap-1.5 text-yellow-400"><span>⬆️</span><span>Naik Level +50</span></div>
          <div className="flex items-center gap-1.5 text-purple-400"><span>🔥</span><span>Streak 7hr +100</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 overflow-x-auto py-2 no-scrollbar">
        {TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all border ${
              activeTab === i
                ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_12px_#a855f7]"
                : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="px-4 grid grid-cols-2 gap-3 mt-2">
        {filteredItems.length === 0 && (
          <div className="col-span-2 text-center py-16 text-slate-500">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-bold">Tidak ada item di kategori ini</p>
          </div>
        )}
        {filteredItems.map(item => {
          const rarity = RARITY_CONFIG[item.rarity];
          const type = TYPE_CONFIG[item.type];
          return (
            <button
              key={item.id}
              onClick={() => { setSelected(item); setActionStatus(""); }}
              className={`relative ${rarity.bg} border rounded-2xl p-3 text-left transition-all hover:scale-105 active:scale-95 ${
                item.rarity === "LEGENDARY"
                  ? "border-yellow-500/50 " + rarity.glow
                  : item.rarity === "EPIC"
                  ? "border-purple-500/50 " + rarity.glow
                  : item.rarity === "RARE"
                  ? "border-blue-500/50 " + rarity.glow
                  : "border-slate-600"
              }`}
            >
              {/* Badges */}
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: rarity.color + "33", color: rarity.color }}>
                  {rarity.label}
                </span>
                {item.owned && (
                  <span className="text-green-400 text-xs font-black">✓ Dimiliki</span>
                )}
                {item.isLimited && !item.owned && (
                  <span className="text-red-400 text-xs font-black animate-pulse">⏰ Terbatas</span>
                )}
              </div>

              {/* Icon */}
              <div className="text-4xl my-2 text-center">
                {type.icon}
              </div>

              {/* Name */}
              <p className="font-black text-sm text-white leading-tight mb-1">{item.name}</p>

              {/* Stars */}
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: rarity.stars }).map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-current" style={{ color: rarity.color }} />
                ))}
              </div>

              {/* Price */}
              <div className="flex items-center gap-1">
                <span>🪙</span>
                <span className="font-black text-yellow-300 text-sm">{item.price.toLocaleString()} DC</span>
              </div>

              {/* Equipped indicator */}
              {item.equipped && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Item Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) { setSelected(null); setActionStatus(""); } }}
        >
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-700 rounded-t-3xl p-6 space-y-4">
            {/* Rarity gradient bar */}
            <div className="w-12 h-1 rounded-full mx-auto mb-2" style={{ backgroundColor: RARITY_CONFIG[selected.rarity].color }} />

            <div className="flex items-center gap-4">
              <div className="text-5xl">{TYPE_CONFIG[selected.type].icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: RARITY_CONFIG[selected.rarity].color + "33", color: RARITY_CONFIG[selected.rarity].color }}>
                    {RARITY_CONFIG[selected.rarity].label}
                  </span>
                  <span className="text-xs text-slate-400">{TYPE_CONFIG[selected.type].label}</span>
                </div>
                <h3 className="font-black text-lg text-white">{selected.name}</h3>
              </div>
            </div>

            <p className="text-slate-300 text-sm">{selected.description}</p>

            <div className="flex items-center justify-between bg-slate-800/60 rounded-2xl px-4 py-3">
              <div>
                <p className="text-xs text-slate-400 font-bold">HARGA</p>
                <p className="text-yellow-300 font-black text-xl">🪙 {selected.price.toLocaleString()} DC</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-bold">SALDO KAMU</p>
                <p className={`font-black text-lg ${wallet >= selected.price ? "text-green-400" : "text-red-400"}`}>
                  {wallet.toLocaleString()} DC
                </p>
              </div>
            </div>

            {actionStatus && (
              <div className={`text-center text-sm font-bold py-2 px-4 rounded-xl ${actionStatus.startsWith("✅") || actionStatus.startsWith("✨") ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
                {actionStatus}
              </div>
            )}

            {selected.owned ? (
              <button
                onClick={handleEquip}
                disabled={actionLoading || selected.equipped}
                className={`w-full py-4 rounded-2xl font-black text-base transition-all ${
                  selected.equipped
                    ? "bg-green-900/30 text-green-400 border border-green-500/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:opacity-90 active:scale-95"
                }`}
              >
                {selected.equipped ? "✨ Sedang Dipakai" : actionLoading ? "Memasang..." : "✨ Pasang Sekarang"}
              </button>
            ) : (
              <button
                onClick={handleBuy}
                disabled={actionLoading || wallet < selected.price}
                className={`w-full py-4 rounded-2xl font-black text-base transition-all ${
                  wallet < selected.price
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg hover:opacity-90 active:scale-95"
                }`}
              >
                {wallet < selected.price
                  ? `🔒 Koin Kurang ${(selected.price - wallet).toLocaleString()} DC`
                  : actionLoading ? "Memproses..."
                  : `🛒 Beli — ${selected.price.toLocaleString()} DC`}
              </button>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
