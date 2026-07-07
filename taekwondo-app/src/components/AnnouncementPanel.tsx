"use client";
import React, { useState, useEffect } from "react";
import { Megaphone, Send, Bell, CheckCircle, AlertTriangle, Info, Sword, Clock, Users } from "lucide-react";

interface AnnouncementHistory {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

const TYPES = [
  { value: "ANNOUNCEMENT", label: "📢 Pengumuman Umum", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", icon: Megaphone },
  { value: "EVENT", label: "🗓️ Agenda / Event", color: "#3B82F6", bg: "rgba(59,130,246,0.1)", icon: Bell },
  { value: "UKT", label: "🥋 Info UKT / Ujian", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: AlertTriangle },
  { value: "SPP", label: "💰 Info SPP / Keuangan", color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: Info },
  { value: "QUEST", label: "⚔️ Info Daily Quest", color: "#10B981", bg: "rgba(16,185,129,0.1)", icon: Sword },
];

export default function AnnouncementPanel() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("ANNOUNCEMENT");
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<AnnouncementHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/notifications?userId=ALL");
      const json = await res.json();
      if (json.success) setHistory(json.data || []);
    } catch {}
    setLoadingHistory(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, type, sendWhatsApp }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(`✅ Pengumuman berhasil dikirim ke ${json.notified || 0} member!`);
        setTitle("");
        setMessage("");
        fetchHistory();
      } else {
        setError(json.message || "Gagal mengirim pengumuman.");
      }
    } catch {
      setError("Koneksi ke server terputus.");
    }
    setSending(false);
  };

  const selectedType = TYPES.find((t) => t.value === type) || TYPES[0];
  const TypeIcon = selectedType.icon;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-[#0F172A]">📢 Kirim Pengumuman</h2>
        <p className="text-gray-400 text-xs mt-1">
          Broadcast pengumuman insidentil ke seluruh member aktif via notifikasi push & in-app.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm">
        <h3 className="font-extrabold text-sm text-[#0F172A] mb-5 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-[#E10600]" /> Buat Pengumuman Baru
        </h3>

        <form onSubmit={handleSend} className="flex flex-col gap-5">
          {/* Tipe */}
          <div>
            <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-widest mb-2">
              Tipe Pengumuman
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TYPES.map((t) => {
                const TIcon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                      type === t.value
                        ? "border-current text-white"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                    style={type === t.value ? { backgroundColor: t.color, borderColor: t.color } : {}}
                  >
                    <TIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{t.label.slice(3)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Judul */}
          <div>
            <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-widest mb-2">
              Judul Notifikasi
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="contoh: Latihan Sabtu Ditiadakan"
              maxLength={80}
              required
              className="w-full border-2 border-[#0F172A]/10 rounded-xl px-4 py-3 text-sm font-semibold text-[#0F172A] focus:outline-none focus:border-[#E10600] transition-colors"
            />
            <p className="text-gray-400 text-[10px] mt-1 text-right">{title.length}/80</p>
          </div>

          {/* Pesan */}
          <div>
            <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-widest mb-2">
              Isi Pengumuman
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan lengkap di sini..."
              rows={4}
              maxLength={500}
              required
              className="w-full border-2 border-[#0F172A]/10 rounded-xl px-4 py-3 text-sm text-[#0F172A] focus:outline-none focus:border-[#E10600] transition-colors resize-none"
            />
            <p className="text-gray-400 text-[10px] mt-1 text-right">{message.length}/500</p>
          </div>

          {/* Preview */}
          {(title || message) && (
            <div
              className="rounded-xl p-4 border"
              style={{ background: selectedType.bg, borderColor: selectedType.color + "30" }}
            >
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: selectedType.color }}>
                Preview Notifikasi
              </p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: selectedType.color }}>
                  <TypeIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">{title || "Judul pengumuman..."}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{message || "Isi pesan..."}</p>
                </div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm font-semibold">
              <CheckCircle className="w-4 h-4" /> {success}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}

          {/* WhatsApp Toggle */}
          <div 
            className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer select-none transition-colors hover:bg-slate-100/50" 
            onClick={() => setSendWhatsApp(!sendWhatsApp)}
          >
            <input 
              type="checkbox"
              checked={sendWhatsApp}
              onChange={() => {}} // Handled by container div click
              className="w-4 h-4 rounded border-gray-300 text-[#E10600] focus:ring-[#E10600] cursor-pointer"
            />
            <div>
              <p className="text-xs font-bold text-[#0F172A]">Kirim Broadcast via WhatsApp</p>
              <p className="text-[10px] text-gray-500">Kirim juga pesan ini ke nomor WhatsApp anggota yang terdaftar menggunakan WAHA gateway.</p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={sending || !title.trim() || !message.trim()}
            className="flex items-center justify-center gap-2 bg-[#E10600] hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm px-6 py-3 rounded-xl transition-all shadow-[0_4px_0_0_#990000] active:shadow-none active:translate-y-1"
          >
            {sending ? (
              <><Clock className="w-4 h-4 animate-spin" /> Mengirim...</>
            ) : (
              <><Send className="w-4 h-4" /> Kirim ke Semua Member</>
            )}
          </button>
        </form>
      </div>

      {/* Riwayat */}
      <div className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm">
        <h3 className="font-extrabold text-sm text-[#0F172A] mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" /> Riwayat Pengumuman
        </h3>
        {loadingHistory ? (
          <div className="flex flex-col gap-2">
            {[1,2,3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : history.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Belum ada pengumuman yang dikirim.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.slice(0, 10).map((h) => {
              const t = TYPES.find((x) => x.value === h.type) || TYPES[0];
              const TIcon = t.icon;
              return (
                <div key={h.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: t.bg }}>
                    <TIcon className="w-3.5 h-3.5" style={{ color: t.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] truncate">{h.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{h.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(h.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-md flex-shrink-0" style={{ color: t.color, background: t.bg }}>
                    {t.label.slice(0, 8)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
