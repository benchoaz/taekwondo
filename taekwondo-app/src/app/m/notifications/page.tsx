"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, ArrowLeft, Calendar, CreditCard, Trophy, Megaphone, Sword, CheckCheck, Filter } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string; label: string; emoji: string }> = {
  EVENT:        { icon: Calendar,   color: "#3B82F6", bg: "rgba(59,130,246,0.15)",  label: "Event",        emoji: "🗓️" },
  SPP:          { icon: CreditCard, color: "#EF4444", bg: "rgba(239,68,68,0.15)",   label: "SPP Terlambat",emoji: "💰" },
  UKT:          { icon: Trophy,     color: "#F59E0B", bg: "rgba(245,158,11,0.15)",  label: "UKT",          emoji: "🥋" },
  ANNOUNCEMENT: { icon: Megaphone,  color: "#8B5CF6", bg: "rgba(139,92,246,0.15)", label: "Pengumuman",   emoji: "📢" },
  QUEST:        { icon: Sword,      color: "#10B981", bg: "rgba(16,185,129,0.15)", label: "Daily Quest",  emoji: "⚔️" },
};

const FILTER_TABS = ["SEMUA", "EVENT", "SPP", "UKT", "ANNOUNCEMENT", "QUEST"];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Baru saja";
  if (mins < 60)  return `${mins} menit yang lalu`;
  if (hours < 24) return `${hours} jam yang lalu`;
  return `${days} hari yang lalu`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState("SEMUA");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUserId(JSON.parse(stored)?.id || null); } catch {}
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data || []);
        setUnreadCount(json.unreadCount || 0);
      }
    } catch {}
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId, fetchNotifications]);

  const markAllRead = async () => {
    if (!userId) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.isRead && userId) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, notificationIds: [notif.id] }),
      });
      setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (notif.link) router.push(notif.link);
  };

  const filtered = activeFilter === "SEMUA"
    ? notifications
    : notifications.filter((n) => n.type === activeFilter);

  return (
    <div className="min-h-screen bg-[#060D1A] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#060D1A]/90 backdrop-blur-md border-b border-[#1E293B] px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-[#1E293B] flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-black text-lg tracking-tight">Notifikasi</h1>
            {unreadCount > 0 && (
              <p className="text-slate-400 text-xs">{unreadCount} belum dibaca</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Baca semua
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTER_TABS.map((tab) => {
            const cfg = typeConfig[tab];
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#E10600] text-white shadow-[0_2px_8px_rgba(225,6,0,0.4)]"
                    : "bg-[#1E293B] text-slate-400 hover:text-white"
                }`}
                style={isActive && cfg ? { background: cfg.color } : {}}
              >
                {cfg ? cfg.emoji : "🔔"} {cfg ? cfg.label : "Semua"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#1E293B] animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#1E293B] flex items-center justify-center">
              <Bell className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">Tidak ada notifikasi</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const cfg = typeConfig[notif.type] || typeConfig.ANNOUNCEMENT;
            const Icon = cfg.icon;
            return (
              <button
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                  !notif.isRead
                    ? "bg-[#1E293B] border-[#334155] shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
                    : "bg-[#0F1A2E] border-[#1E293B]"
                }`}
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.color}40` }}
                >
                  <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold leading-tight ${!notif.isRead ? "text-white" : "text-slate-400"}`}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-slate-600">{timeAgo(notif.createdAt)}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
