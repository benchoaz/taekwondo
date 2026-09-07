"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Bell, CheckCircle2, ChevronRight, Clock, RefreshCw, 
  X, Award, CreditCard, UserPlus, Sparkles, ExternalLink 
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: "BELT_CLAIM" | "MEMBER_REGISTRATION" | "PAYMENT" | "SYSTEM";
  title: string;
  message: string;
  time: string;
  targetTab: string;
  badgeColor: string;
  icon: string;
  data?: any;
}

interface NotificationCounts {
  beltClaims: number;
  pendingMembers: number;
  pendingPayments: number;
  system: number;
}

export default function AdminNotificationBell({
  onNavigateTab
}: {
  onNavigateTab: (tabId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({
    beltClaims: 0,
    pendingMembers: 0,
    pendingPayments: 0,
    system: 0
  });
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setItems(json.items || []);
          setCounts(json.counts || { beltClaims: 0, pendingMembers: 0, pendingPayments: 0, system: 0 });
          setTotalCount(json.totalCount || 0);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil notifikasi admin:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSecs < 60) return "Baru saja";
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins} menit lalu`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} jam lalu`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} hari lalu`;
    } catch {
      return "";
    }
  };

  const filteredItems = items.filter(item => {
    if (activeFilter === "ALL") return true;
    return item.type === activeFilter;
  });

  const handleItemClick = (item: NotificationItem) => {
    setIsOpen(false);
    if (item.targetTab) {
      onNavigateTab(item.targetTab);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell Trigger Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all relative ${
          isOpen
            ? "bg-slate-900 text-white shadow-sm"
            : totalCount > 0
            ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300"
            : "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200"
        }`}
        title={totalCount > 0 ? `${totalCount} tugas menunggu tindakan` : "Tidak ada notifikasi baru"}
        aria-label="Notifikasi Admin"
      >
        <Bell className={`w-4 h-4 ${totalCount > 0 ? "animate-[wiggle_1s_ease-in-out_infinite]" : ""}`} />
        
        {totalCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 bg-[#E10600] text-white text-[10px] font-black rounded-full absolute -top-1.5 -right-1.5 flex items-center justify-center ring-2 ring-white shadow-sm animate-pulse">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Flyout Panel ── */}
      {isOpen && (
        <div className="absolute right-0 top-11 w-[380px] max-w-[92vw] bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 overflow-hidden flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white/10 rounded-lg text-amber-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider">Pusat Aksi Admin</h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  {totalCount > 0 ? `${totalCount} pengajuan butuh tindakan` : "Semua tugas beres"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchNotifications()}
                disabled={isLoading}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Perbarui data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Tutup"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          {totalCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-100 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                  activeFilter === "ALL"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Semua ({totalCount})
              </button>
              {counts.beltClaims > 0 && (
                <button
                  onClick={() => setActiveFilter("BELT_CLAIM")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap flex items-center gap-1 ${
                    activeFilter === "BELT_CLAIM"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100"
                  }`}
                >
                  <span>🥋 Sabuk</span>
                  <span className="px-1 py-0.2 bg-amber-200 text-amber-950 rounded-full text-[9px]">{counts.beltClaims}</span>
                </button>
              )}
              {counts.pendingPayments > 0 && (
                <button
                  onClick={() => setActiveFilter("PAYMENT")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap flex items-center gap-1 ${
                    activeFilter === "PAYMENT"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100"
                  }`}
                >
                  <span>💳 SPP</span>
                  <span className="px-1 py-0.2 bg-emerald-200 text-emerald-950 rounded-full text-[9px]">{counts.pendingPayments}</span>
                </button>
              )}
              {counts.pendingMembers > 0 && (
                <button
                  onClick={() => setActiveFilter("MEMBER_REGISTRATION")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap flex items-center gap-1 ${
                    activeFilter === "MEMBER_REGISTRATION"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-blue-50 text-blue-900 border border-blue-300 hover:bg-blue-100"
                  }`}
                >
                  <span>👤 Member</span>
                  <span className="px-1 py-0.2 bg-blue-200 text-blue-950 rounded-full text-[9px]">{counts.pendingMembers}</span>
                </button>
              )}
            </div>
          )}

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-black text-slate-700">Semua Tugas Selesai!</p>
                <p className="text-[11px] text-slate-400 max-w-[220px]">
                  Tidak ada pengajuan sabuk, pendaftaran, atau pembayaran yang menunggu verifikasi saat ini.
                </p>
              </div>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start gap-3"
                >
                  {/* Category Icon */}
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-base shadow-xs group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        {item.title}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTimeAgo(item.time)}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800 leading-snug truncate">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        Butuh Tindakan
                      </span>
                      <span className="text-[10px] font-bold text-[#E10600] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Buka & Tindak ➔
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Quick Links */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span>Sistem Otomatis White Tiger</span>
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigateTab("users");
              }}
              className="text-[#E10600] hover:underline flex items-center gap-0.5 font-black"
            >
              Ke Manajemen User ↗
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
