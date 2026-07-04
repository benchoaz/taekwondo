"use client";
import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      const j = await res.json();
      if (j.success) {
        setUnread(j.unreadCount || 0);
      }
    } catch {}
  }, [userId]);

  useEffect(() => {
    fetchUnread();
    const iv = setInterval(fetchUnread, 30000);
    return () => clearInterval(iv);
  }, [fetchUnread]);

  return (
    <button
      onClick={() => router.push("/m/notifications")}
      className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-800/80 border-2 border-slate-700 hover:border-slate-500 transition-all active:scale-95"
    >
      <Bell className={`w-5 h-5 transition-colors ${unread > 0 ? "text-white" : "text-slate-400"}`} />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white border-2 border-slate-900 animate-pulse">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}
