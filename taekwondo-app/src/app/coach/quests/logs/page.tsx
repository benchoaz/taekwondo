"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, AlertCircle, Video, User, FileText, Loader2, Calendar } from "lucide-react";

interface QuestLog {
  id: string;
  completed: boolean;
  completedAt: string | null;
  assignedAt: string;
  videoUrl: string | null;
  notes: string | null;
  quest: {
    title: string;
    description: string | null;
    category: string;
    baseXp: number;
    requireVideo: boolean;
  };
  member: {
    memberNumber: string;
    currentBelt: string;
    fullName: string;
    user: {
      name: string | null;
      email: string;
    };
  };
}

export default function CoachQuestLogs() {
  const [logs, setLogs] = useState<QuestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "INCOMPLETE">("ALL");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = "/api/coach/quest-logs";
      if (filter === "COMPLETED") url += "?completed=true";
      if (filter === "INCOMPLETE") url += "?completed=false";

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex gap-4 mb-2">
              <Link href="/coach/quests" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 font-bold transition-colors">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Builder
              </Link>
              <Link href="/coach/quests/library" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 font-bold transition-colors">
                Library Misi <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Aktivitas Misi Harian Murid
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Pantau pengerjaan, catatan mandiri, dan rekaman video latihan murid
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300/30 gap-1 self-start sm:self-center">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                filter === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Semua Misi
            </button>
            <button
              onClick={() => setFilter("COMPLETED")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                filter === "COMPLETED" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Selesai
            </button>
            <button
              onClick={() => setFilter("INCOMPLETE")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                filter === "INCOMPLETE" ? "bg-amber-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Aktif / Belum
            </button>
          </div>
        </div>

        {/* Content Container */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 flex justify-center items-center border border-slate-100 shadow-sm">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-lg">Belum Ada Aktivitas</h3>
            <p className="text-slate-400 text-xs mt-1">Tidak ada misi murid yang cocok dengan filter saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {logs.map((log) => (
              <div key={log.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start gap-4 hover:shadow-md transition-shadow">
                
                {/* Left Info: Member and Quest */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <User className="w-3 h-3" /> {log.member.fullName || log.member.user.name || "Nama Tidak Diketahui"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      ({log.member.currentBelt})
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      log.completed 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      {log.completed ? "Selesai" : "Belum Selesai"}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-800 leading-tight">
                    {log.quest.title}
                  </h3>
                  {log.quest.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {log.quest.description}
                    </p>
                  )}

                  {/* Dates */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3.5 text-[11px] text-slate-400 font-medium border-t border-slate-50 pt-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Ditugaskan: {formatDate(log.assignedAt)}
                    </span>
                    {log.completedAt && (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selesai pada: {formatDate(log.completedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Info: Media and Notes */}
                <div className="w-full md:w-80 flex flex-col gap-2 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {/* Notes */}
                  <div className="text-xs">
                    <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider block mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Catatan Murid
                    </span>
                    <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/50 italic min-h-[50px]">
                      {log.notes || "Tidak ada catatan tambahan."}
                    </p>
                  </div>

                  {/* Video Proof Button */}
                  {log.completed && (
                    <div className="mt-1">
                      <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider block mb-1">
                        Bukti Rekaman
                      </span>
                      {log.videoUrl ? (
                        <button
                          onClick={() => setSelectedVideo(log.videoUrl)}
                          className="w-full py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200/50 flex items-center justify-center gap-1.5 text-xs font-black transition-all"
                        >
                          <Video className="w-4 h-4" /> PUTAR VIDEO LATIHAN
                        </button>
                      ) : (
                        <div className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-400 border border-slate-200/50 flex items-center justify-center gap-1 text-xs font-bold">
                          Tidak ada bukti video.
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <span className="font-black text-xs text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                <Video className="w-4 h-4 animate-pulse" /> Rekaman Latihan Murid
              </span>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-xs font-black bg-slate-800 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl border border-slate-700 transition-colors"
              >
                TUTUP PLAYER
              </button>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                src={selectedVideo}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
