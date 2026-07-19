"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, ListFilter, Trash2, Library, PlusCircle, Send, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function QuestLibraryPage() {
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [distributing, setDistributing] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const fetchQuests = () => {
    setLoading(true);
    fetch("/api/quests/library")
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setQuests(json.data);
        } else {
          setError(json.error || "Gagal mengambil data misi");
        }
      })
      .catch(() => setError("Terjadi kesalahan jaringan"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Hapus misi "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/quests/library/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("Misi berhasil dihapus dari Library.");
        fetchQuests();
      } else {
        showToast("Gagal menghapus: " + json.error, "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    }
  };

  // Toggle aktif / nonaktif
  const handleToggleActive = async (q: any) => {
    setToggling(q.id);
    try {
      const res = await fetch(`/api/quests/library/${q.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...q, isActive: !q.isActive })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Misi "${q.title}" kini ${!q.isActive ? "AKTIF" : "NONAKTIF"}.`);
        fetchQuests();
      } else {
        showToast("Gagal mengubah status: " + json.error, "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setToggling(null);
    }
  };

  // Distribusikan langsung ke DailyQuestLog member hari ini
  const handleDistribute = async (q: any) => {
    if (!window.confirm(`Distribusikan misi "${q.title}" langsung ke semua member yang eligible HARI INI?\n\nMember yang sudah punya quest ini hari ini akan dilewati otomatis.`)) return;
    setDistributing(q.id);
    try {
      const res = await fetch(`/api/quests/library/${q.id}/distribute`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showToast(`✅ ${json.message}`);
      } else {
        showToast("Gagal: " + json.error, "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setDistributing(null);
    }
  };

  const categoryColor: Record<string, string> = {
    FITNESS: "text-orange-700 bg-orange-100",
    TECHNICAL: "text-blue-700 bg-blue-100",
    DISCIPLINE: "text-purple-700 bg-purple-100",
    THEORY: "text-teal-700 bg-teal-100",
  };

  return (
    <div className="min-h-screen bg-[#f3f4f5] py-4 sm:py-12 px-2 sm:px-6 lg:px-8 font-sans">

      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-50 flex items-start gap-3 max-w-sm px-5 py-4 rounded-2xl shadow-2xl text-sm font-semibold transition-all animate-fade-in
          ${toastType === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toastType === "success"
            ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-100">

        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 px-4 sm:px-8 py-8 sm:py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

          <div className="flex justify-center gap-2 sm:gap-4 mb-4 relative z-10 flex-wrap">
            <Link href="/coach/quests" className="bg-red-950/40 text-red-100 hover:text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full border border-red-700/30 uppercase tracking-widest transition-colors flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" /> Buat Misi Baru
            </Link>
            <span className="bg-white/20 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full border border-white/30 uppercase tracking-widest flex items-center gap-1.5">
              <Library className="w-3.5 h-3.5" /> Library Misi
            </span>
            <Link href="/coach/quests/logs" className="bg-red-950/40 text-red-100 hover:text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full border border-red-700/30 uppercase tracking-widest transition-colors flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5" /> Pantau Latihan
            </Link>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight relative z-10">
            Library Misi
          </h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-100 font-medium relative z-10">
            Kolam template misi yang siap didistribusikan ke member sesuai sabuk &amp; usia.
          </p>
        </div>

        {/* Legend */}
        <div className="bg-amber-50 border-b border-amber-100 px-4 sm:px-8 py-3 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs text-amber-800 font-semibold">
          <span className="flex items-center gap-1.5"><ToggleRight className="w-4 h-4 text-green-600 shrink-0" /> Toggle = Aktifkan/Nonaktifkan misi</span>
          <span className="flex items-center gap-1.5"><Send className="w-4 h-4 text-red-600 shrink-0" /> Kirim = Distribusikan langsung hari ini</span>
        </div>

        {/* Konten */}
        <div className="p-4 sm:p-8">
          {loading ? (
            <div className="text-center py-12 text-gray-500 font-medium animate-pulse">
              Memuat data misi...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 font-medium bg-red-50 rounded-xl">
              {error}
            </div>
          ) : quests.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-medium">
              Belum ada misi di Library. Silakan buat misi baru terlebih dahulu.
            </div>
          ) : (
            <div className="grid gap-4">
              {quests.map((q) => (
                <div
                  key={q.id}
                  className={`p-4 sm:p-5 border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all
                    ${q.isActive
                      ? "border-gray-100 bg-gray-50/50 hover:bg-white"
                      : "border-dashed border-gray-300 bg-gray-100/70 opacity-60"}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                      {/* Status badge */}
                      <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md
                        ${q.isActive ? "text-green-700 bg-green-100" : "text-gray-500 bg-gray-200"}`}>
                        {q.isActive ? "● AKTIF" : "○ NONAKTIF"}
                      </span>
                      <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${categoryColor[q.category] ?? "text-gray-600 bg-gray-100"}`}>
                        {q.category}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-md">
                        {q.baseXp} XP
                      </span>
                      {q.requirements && q.requirements.length > 0 && (
                        <>
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                            USIA: {q.requirements[0].minAge}-{q.requirements[0].maxAge} TH
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            {q.requirements[0].allowedBeltIds?.length > 0
                              ? `${q.requirements[0].allowedBeltIds.length} SABUK`
                              : 'SEMUA SABUK'}
                          </span>
                        </>
                      )}
                      {q.videoUrl && (
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-pink-700 bg-pink-100 px-2 py-0.5 rounded-md">
                          📹 VIDEO
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-800 text-base sm:text-lg leading-tight mb-1">{q.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-snug">{q.description}</p>

                    <div className="mt-2 text-[10px] sm:text-xs font-medium text-gray-400">
                      Dibuat: {new Date(q.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </div>

                  {/* Action Buttons (flex-row on mobile, flex-col on desktop) */}
                  <div className="flex flex-row md:flex-col gap-1.5 sm:gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 mt-1 md:mt-0 border-slate-100">
                    {/* Toggle Aktif/Nonaktif */}
                    <button
                      onClick={() => handleToggleActive(q)}
                      disabled={toggling === q.id}
                      className={`p-2 rounded-xl transition-all
                        ${q.isActive
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-400 hover:bg-gray-100"}`}
                      title={q.isActive ? "Nonaktifkan misi" : "Aktifkan misi"}
                    >
                      {q.isActive
                        ? <ToggleRight className="w-5 h-5" />
                        : <ToggleLeft className="w-5 h-5" />}
                    </button>

                    {/* Edit */}
                    <Link
                      href={`/coach/quests?editId=${q.id}`}
                      className="p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                      title="Edit data misi"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>

                    {/* Distribusikan Sekarang */}
                    <button
                      onClick={() => handleDistribute(q)}
                      disabled={distributing === q.id || !q.isActive}
                      className={`p-2 rounded-xl transition-all
                        ${q.isActive
                          ? "text-gray-400 hover:bg-red-50 hover:text-red-600"
                          : "text-gray-300 cursor-not-allowed"}`}
                      title={q.isActive ? "Distribusikan ke member sekarang" : "Aktifkan misi dulu untuk mendistribusikan"}
                    >
                      {distributing === q.id
                        ? <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <Send className="w-5 h-5" />}
                    </button>

                    {/* Hapus */}
                    <button
                      onClick={() => handleDelete(q.id, q.title)}
                      className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                      title="Hapus misi dari Library"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
