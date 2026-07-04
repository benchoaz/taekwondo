"use client";
import { useState, useEffect, useCallback } from "react";
import { Bell, X, Calendar, CreditCard, Trophy, Megaphone, Sword, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  EVENT:        { icon: Calendar,  color: "#3B82F6", bg: "rgba(59,130,246,0.15)",  label: "Event" },
  SPP:          { icon: CreditCard, color: "#EF4444", bg: "rgba(239,68,68,0.15)",  label: "SPP" },
  UKT:          { icon: Trophy,    color: "#F59E0B", bg: "rgba(245,158,11,0.15)",  label: "UKT" },
  ANNOUNCEMENT: { icon: Megaphone, color: "#8B5CF6", bg: "rgba(139,92,246,0.15)", label: "Info" },
  QUEST:        { icon: Sword,     color: "#10B981", bg: "rgba(16,185,129,0.15)",  label: "Quest" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Baru saja";
  if (mins < 60)  return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return `${days} hari lalu`;
}

interface Props { userId: string }

export default function NotificationBell({ userId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data || []);
        setUnreadCount(json.unreadCount || 0);
      }
    } catch {}
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, notificationIds: [notif.id] }),
      });
      setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (notif.link) router.push(notif.link);
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-[#1E293B] border border-[#334155] hover:border-[#475569] transition-all active:scale-95"
      >
        <Bell className="w-5 h-5 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-[#0F172A] animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-12 w-[320px] max-h-[480px] bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B]">
              <div>
                <h3 className="text-white font-bold text-sm">Notifikasi</h3>
                {unreadCount > 0 && (
                  <p className="text-slate-400 text-xs">{unreadCount} belum dibaca</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Baca semua
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Bell className="w-8 h-8 text-slate-600" />
                  <p className="text-slate-500 text-xs">Tidak ada notifikasi</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const cfg = typeConfig[notif.type] || typeConfig.ANNOUNCEMENT;
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`w-full flex items-start gap-3 px-4 py-3 border-b border-[#1E293B] text-left transition-colors hover:bg-[#1E293B] ${
                        !notif.isRead ? "bg-[#1E293B]/50" : ""
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: cfg.bg }}
                      >
                        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-bold truncate ${!notif.isRead ? "text-white" : "text-slate-300"}`}>
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                        <p className="text-[10px] text-slate-600 mt-1">{timeAgo(notif.createdAt)}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-[#1E293B]">
              <button
                onClick={() => { router.push("/m/notifications"); setOpen(false); }}
                className="w-full text-xs text-center text-blue-400 hover:text-blue-300 transition-colors py-1"
              >
                Lihat semua notifikasi →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
