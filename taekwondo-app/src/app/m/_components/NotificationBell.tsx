"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Calendar, CreditCard, Trophy, Megaphone, Sword, CheckCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_MAP: Record<string, { icon: any; color: string; dot: string }> = {
  EVENT:        { icon: Calendar,   color: "#3B82F6", dot: "bg-blue-400"   },
  SPP:          { icon: CreditCard, color: "#EF4444", dot: "bg-red-400"    },
  UKT:          { icon: Trophy,     color: "#F59E0B", dot: "bg-amber-400"  },
  ANNOUNCEMENT: { icon: Megaphone,  color: "#8B5CF6", dot: "bg-violet-400" },
  QUEST:        { icon: Sword,      color: "#10B981", dot: "bg-emerald-400"},
};

const LINK_MAP: Record<string, string> = {
  EVENT:        "/m/schedule",
  SPP:          "/m/spp",
  UKT:          "/m/profile",
  ANNOUNCEMENT: "/m/dashboard",
  QUEST:        "/m/quests",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m}m lalu`;
  if (h < 24) return `${h}j lalu`;
  return `${d}h lalu`;
}

export default function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifs = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      const j = await res.json();
      if (j.success) {
        setNotifs((j.data || []).slice(0, 5));
        setUnread(j.unreadCount || 0);
      }
    } catch {}
  }, [userId]);

  useEffect(() => {
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 30000);
    return () => clearInterval(iv);
  }, [fetchNotifs]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setNotifs((p) => p.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, notificationIds: [n.id] }),
      });
      setUnread((c) => Math.max(0, c - 1));
    }
    const dest = n.link || LINK_MAP[n.type] || "/m/dashboard";
    setOpen(false);
    router.push(dest);
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-800/80 border-2 border-slate-700 hover:border-slate-500 transition-all active:scale-95"
      >
        <Bell className={`w-5 h-5 transition-colors ${unread > 0 ? "text-white" : "text-slate-400"}`} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white border-2 border-slate-900 animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Compact Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-64 bg-[#0F172A]/96 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
          style={{ animation: "notifSlide 0.15s ease-out both" }}
        >
          <style>{`
            @keyframes notifSlide {
              from { opacity:0; transform:translateY(-6px) scale(0.96); }
              to   { opacity:1; transform:translateY(0) scale(1); }
            }
          `}</style>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-white tracking-widest uppercase">Notifikasi</span>
              {unread > 0 && (
                <span className="text-[9px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                  {unread}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-400 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                Baca semua
              </button>
            )}
          </div>

          {/* Items */}
          <div className="flex flex-col">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center py-7 gap-1.5">
                <Bell className="w-5 h-5 text-slate-700" />
                <p className="text-slate-600 text-[11px]">Tidak ada notifikasi</p>
              </div>
            ) : (
              notifs.map((n, i) => {
                const cfg = TYPE_MAP[n.type] || TYPE_MAP.ANNOUNCEMENT;
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-slate-800/50 group ${
                      i < notifs.length - 1 ? "border-b border-slate-800/40" : ""
                    } ${!n.isRead ? "bg-slate-800/20" : ""}`}
                  >
                    {/* Colored icon dot */}
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: cfg.color + "18", border: `1px solid ${cfg.color}35` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    </div>

                    {/* Title + time */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {!n.isRead && (
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        )}
                        <p className={`text-[11px] font-semibold leading-tight truncate ${
                          !n.isRead ? "text-white" : "text-slate-500"
                        }`}>
                          {n.title}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5 ml-0">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-3 h-3 text-slate-700 group-hover:text-slate-400 flex-shrink-0 transition-colors" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer link */}
          {notifs.length > 0 && (
            <div className="border-t border-slate-800 py-2">
              <button
                onClick={() => { router.push("/m/notifications"); setOpen(false); }}
                className="w-full text-[10px] font-black text-slate-600 hover:text-blue-400 transition-colors text-center tracking-widest uppercase py-0.5"
              >
                Lihat Semua
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
