"use client";
import React, { useState, useEffect } from "react";
import { Megaphone, Send, Bell, CheckCircle, AlertTriangle, Info, Sword, Clock, Users, Pencil, Trash2, X, CalendarRange, Eye } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  startAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

const TYPES = [
  { value: "ANNOUNCEMENT", label: "📢 Pengumuman Umum", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", icon: Megaphone },
  { value: "EVENT", label: "🗓️ Agenda / Event", color: "#3B82F6", bg: "rgba(59,130,246,0.1)", icon: Bell },
  { value: "UKT", label: "🥋 Info UKT / Ujian", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: AlertTriangle },
  { value: "SPP", label: "💰 Info SPP / Keuangan", color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: Info },
  { value: "QUEST", label: "⚔️ Info Daily Quest", color: "#10B981", bg: "rgba(16,185,129,0.1)", icon: Sword },
];

function toLocalDatetimeValue(isoStr?: string | null): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  // Format to datetime-local value: YYYY-MM-DDTHH:MM
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getStatusLabel(item: Announcement) {
  const now = new Date();
  const start = item.startAt ? new Date(item.startAt) : null;
  const expires = item.expiresAt ? new Date(item.expiresAt) : null;

  if (expires && expires < now) return { label: "Kadaluwarsa", color: "#EF4444", bg: "rgba(239,68,68,0.1)" };
  if (start && start > now) return { label: "Terjadwal", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" };
  return { label: "Aktif", color: "#10B981", bg: "rgba(16,185,129,0.1)" };
}

export default function AnnouncementPanel() {
  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("ANNOUNCEMENT");
  const [link, setLink] = useState("");
  const [startAt, setStartAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // List state
  const [history, setHistory] = useState<Announcement[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/announcements");
      const json = await res.json();
      if (json.success) setHistory(json.data || []);
    } catch {}
    setLoadingHistory(false);
  };

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setType("ANNOUNCEMENT");
    setLink("");
    setStartAt("");
    setExpiresAt("");
    setSendWhatsApp(false);
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleEdit = (item: Announcement) => {
    setEditingId(item.id);
    setTitle(item.title);
    setMessage(item.message);
    setType(item.type);
    setLink(item.link || "");
    setStartAt(toLocalDatetimeValue(item.startAt));
    setExpiresAt(toLocalDatetimeValue(item.expiresAt));
    setSendWhatsApp(false);
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus pengumuman ini?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setHistory((prev) => prev.filter((h) => h.id !== id));
      } else {
        alert(json.message || "Gagal menghapus.");
      }
    } catch {
      alert("Koneksi terputus.");
    }
    setDeletingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    if (expiresAt && startAt && new Date(expiresAt) <= new Date(startAt)) {
      setError("Tanggal selesai harus setelah tanggal mulai.");
      return;
    }

    setSending(true);
    setSuccess("");
    setError("");

    try {
      const isEditing = !!editingId;
      const res = await fetch("/api/announcements", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEditing && { id: editingId }),
          title,
          message,
          type,
          link: link || null,
          startAt: startAt || null,
          expiresAt: expiresAt || null,
          sendWhatsApp: !isEditing && sendWhatsApp,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(
          isEditing
            ? "✅ Pengumuman berhasil diperbarui!"
            : `✅ Pengumuman berhasil dikirim ke ${json.notified || 0} member!`
        );
        resetForm();
        fetchHistory();
      } else {
        setError(json.message || "Gagal menyimpan pengumuman.");
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
        <h2 className="text-3xl font-black text-[#0F172A]">📢 Kelola Pengumuman</h2>
        <p className="text-gray-400 text-xs mt-1">
          Buat, jadwalkan, edit, dan hapus pengumuman dengan masa aktif yang dapat diatur.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-extrabold text-sm text-[#0F172A] flex items-center gap-2">
            {editingId ? (
              <><Pencil className="w-4 h-4 text-blue-500" /> Edit Pengumuman</>
            ) : (
              <><Megaphone className="w-4 h-4 text-[#E10600]" /> Buat Pengumuman Baru</>
            )}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-all"
            >
              <X className="w-3.5 h-3.5" /> Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

          {/* Link (opsional) */}
          <div>
            <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-widest mb-2">
              Link Terkait <span className="text-gray-400 font-normal normal-case">(opsional)</span>
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://... atau /halaman"
              className="w-full border-2 border-[#0F172A]/10 rounded-xl px-4 py-3 text-sm text-[#0F172A] focus:outline-none focus:border-[#E10600] transition-colors"
            />
          </div>

          {/* Rentang Tanggal */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
            <p className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5 text-[#E10600]" /> Masa Aktif Pengumuman
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5">
                  📅 Mulai Tampil
                </label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full border-2 border-[#0F172A]/10 rounded-xl px-3 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#E10600] transition-colors bg-white"
                />
                <p className="text-[9px] text-gray-400 mt-1">Kosongkan = tampil segera</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5">
                  ⏰ Berakhir / Kadaluwarsa
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full border-2 border-[#0F172A]/10 rounded-xl px-3 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#E10600] transition-colors bg-white"
                />
                <p className="text-[9px] text-gray-400 mt-1">Kosongkan = tidak ada batas waktu</p>
              </div>
            </div>
          </div>

          {/* Preview */}
          {(title || message) && (
            <div
              className="rounded-xl p-4 border"
              style={{ background: selectedType.bg, borderColor: selectedType.color + "30" }}
            >
              <p className="text-[10px] font-black uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: selectedType.color }}>
                <Eye className="w-3 h-3" /> Preview Notifikasi
              </p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: selectedType.color }}>
                  <TypeIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">{title || "Judul pengumuman..."}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{message || "Isi pesan..."}</p>
                  {(startAt || expiresAt) && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      {startAt && `Mulai: ${new Date(startAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}`}
                      {startAt && expiresAt && " · "}
                      {expiresAt && `Berakhir: ${new Date(expiresAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}`}
                    </p>
                  )}
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

          {/* WhatsApp Toggle (only for new announcements) */}
          {!editingId && (
            <div
              className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer select-none transition-colors hover:bg-slate-100/50"
              onClick={() => setSendWhatsApp(!sendWhatsApp)}
            >
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={() => {}}
                className="w-4 h-4 rounded border-gray-300 text-[#E10600] focus:ring-[#E10600] cursor-pointer"
              />
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Kirim Broadcast via WhatsApp</p>
                <p className="text-[10px] text-gray-500">Kirim juga pesan ini ke nomor WhatsApp anggota yang terdaftar menggunakan WAHA gateway.</p>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={sending || !title.trim() || !message.trim()}
            className={`flex items-center justify-center gap-2 ${editingId ? "bg-blue-600 hover:bg-blue-700 shadow-[0_4px_0_0_#1e40af]" : "bg-[#E10600] hover:bg-red-700 shadow-[0_4px_0_0_#990000]"} disabled:opacity-50 text-white font-black text-sm px-6 py-3 rounded-xl transition-all active:shadow-none active:translate-y-1`}
          >
            {sending ? (
              <><Clock className="w-4 h-4 animate-spin" /> {editingId ? "Menyimpan..." : "Mengirim..."}</>
            ) : editingId ? (
              <><Pencil className="w-4 h-4" /> Simpan Perubahan</>
            ) : (
              <><Send className="w-4 h-4" /> Kirim ke Semua Member</>
            )}
          </button>
        </form>
      </div>

      {/* Riwayat */}
      <div className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm">
        <h3 className="font-extrabold text-sm text-[#0F172A] mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" /> Riwayat & Daftar Pengumuman
        </h3>
        {loadingHistory ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : history.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Belum ada pengumuman yang dikirim.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((h) => {
              const t = TYPES.find((x) => x.value === h.type) || TYPES[0];
              const TIcon = t.icon;
              const status = getStatusLabel(h);
              const isActive = status.label === "Aktif";
              return (
                <div
                  key={h.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${editingId === h.id ? "border-blue-400 bg-blue-50" : "bg-gray-50 border-gray-100"}`}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: t.bg }}>
                    <TIcon className="w-3.5 h-3.5" style={{ color: t.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-[#0F172A] truncate">{h.title}</p>
                      <span
                        className="text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ color: status.color, background: status.bg }}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">{h.message}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-[10px] text-gray-400">
                        Dibuat: {new Date(h.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {h.startAt && (
                        <p className="text-[10px] text-blue-400">
                          📅 Mulai: {new Date(h.startAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                      {h.expiresAt && (
                        <p className="text-[10px] text-orange-400">
                          ⏰ Berakhir: {new Date(h.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(h)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 text-blue-400 hover:text-blue-600 transition-colors"
                      title="Edit pengumuman"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(h.id)}
                      disabled={deletingId === h.id}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                      title="Hapus pengumuman"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
