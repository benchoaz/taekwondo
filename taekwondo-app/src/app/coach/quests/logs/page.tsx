"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Video, User, FileText, Loader2, Calendar, Search, ChevronDown, ChevronUp, CheckSquare, Clock } from "lucide-react";

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
  const [dateFilter, setDateFilter] = useState<"TODAY" | "YESTERDAY" | "LAST7" | "ALL">("TODAY");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [expandedStudents, setExpandedStudents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchLogs();
  }, [filter, dateFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = "/api/coach/quest-logs?";
      if (filter === "COMPLETED") url += "completed=true&";
      if (filter === "INCOMPLETE") url += "completed=false&";

      const now = new Date();
      if (dateFilter === "TODAY") {
        const start = new Date(now.setHours(0,0,0,0)).toISOString();
        const end = new Date(now.setHours(23,59,59,999)).toISOString();
        url += `startDate=${start}&endDate=${end}&`;
      } else if (dateFilter === "YESTERDAY") {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const start = new Date(yesterday.setHours(0,0,0,0)).toISOString();
        const end = new Date(yesterday.setHours(23,59,59,999)).toISOString();
        url += `startDate=${start}&endDate=${end}&`;
      } else if (dateFilter === "LAST7") {
        const last7 = new Date(now);
        last7.setDate(last7.getDate() - 7);
        const start = new Date(last7.setHours(0,0,0,0)).toISOString();
        url += `startDate=${start}&`;
      }

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
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const groupedLogs = useMemo(() => {
    const filtered = logs.filter(log => {
      const name = log.member.fullName || log.member.user.name || "";
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const groups: Record<string, { member: QuestLog['member'], logs: QuestLog[], completedCount: number }> = {};
    
    filtered.forEach(log => {
      const name = log.member.fullName || log.member.user.name || "Nama Tidak Diketahui";
      if (!groups[name]) {
        groups[name] = { member: log.member, logs: [], completedCount: 0 };
      }
      groups[name].logs.push(log);
      if (log.completed) groups[name].completedCount++;
    });

    return groups;
  }, [logs, searchQuery]);

  const toggleStudent = (name: string) => {
    setExpandedStudents(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Stats
  const totalCompleted = logs.filter(l => l.completed).length;
  const totalIncomplete = logs.filter(l => !l.completed).length;
  const totalVideos = logs.filter(l => l.completed && l.videoUrl).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex gap-4 mb-2">
              <Link href="/coach/quests" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 font-bold transition-colors">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Builder
              </Link>
              <Link href="/coach/quests/library" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 font-bold transition-colors">
                Library Misi <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Aktivitas Misi Harian Murid
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Pantau pengerjaan, catatan mandiri, dan rekaman video latihan murid
            </p>
          </div>
        </div>

        {/* Mini Dashboard Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 flex flex-col items-center justify-center text-center shadow-sm">
            <CheckSquare className="w-6 h-6 text-emerald-500 mb-2" />
            <span className="text-3xl font-black text-slate-800 leading-none">{totalCompleted}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Misi Selesai</span>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 flex flex-col items-center justify-center text-center shadow-sm">
            <Clock className="w-6 h-6 text-amber-500 mb-2" />
            <span className="text-3xl font-black text-slate-800 leading-none">{totalIncomplete}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Belum Selesai</span>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 flex flex-col items-center justify-center text-center shadow-sm">
            <Video className="w-6 h-6 text-red-500 mb-2" />
            <span className="text-3xl font-black text-slate-800 leading-none">{totalVideos}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Video Diunggah</span>
          </div>
        </div>

        {/* Toolbar: Search, Date Filter, Status Filter */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          <div className="flex-1 w-full relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari nama murid..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder:font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Date Filter */}
            <div className="relative flex-1 lg:flex-none">
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-2xl pl-10 pr-8 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
              >
                <option value="TODAY">Hari Ini</option>
                <option value="YESTERDAY">Kemarin</option>
                <option value="LAST7">7 Hari Terakhir</option>
                <option value="ALL">Semua Waktu</option>
              </select>
              <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 flex-1 lg:flex-none">
              <button onClick={() => setFilter("ALL")} className={`flex-1 px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Semua</button>
              <button onClick={() => setFilter("COMPLETED")} className={`flex-1 px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === "COMPLETED" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500"}`}>Selesai</button>
              <button onClick={() => setFilter("INCOMPLETE")} className={`flex-1 px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === "INCOMPLETE" ? "bg-amber-500 text-white shadow-sm" : "text-slate-500"}`}>Belum</button>
            </div>
          </div>
        </div>

        {/* Content Container */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 flex justify-center items-center border border-slate-100 shadow-sm">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : Object.keys(groupedLogs).length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 text-lg">Belum Ada Aktivitas</h3>
            <p className="text-slate-400 text-xs mt-1">Tidak ada misi murid yang cocok dengan filter atau pencarian saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(groupedLogs).map(([name, group]) => {
              const isExpanded = expandedStudents[name];
              const totalQuests = group.logs.length;
              const completedCount = group.completedCount;
              const isAllDone = completedCount === totalQuests;

              return (
                <div key={name} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                  {/* Accordion Header */}
                  <div 
                    onClick={() => toggleStudent(name)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${isAllDone ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        <User className={`w-6 h-6 ${isAllDone ? 'text-emerald-600' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 leading-tight uppercase">{name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {group.member.currentBelt}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                            isAllDone ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}>
                            {completedCount} / {totalQuests} Selesai
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200/60 text-slate-400 transition-transform">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Accordion Body (Quests List) */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/30 p-4 sm:p-6 grid grid-cols-1 gap-4">
                      {group.logs.map((log) => (
                        <div key={log.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                          
                          {/* Quest Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                log.completed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                              }`}>
                                {log.completed ? "Selesai" : "Belum Selesai"}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                {log.quest.category}
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
                            <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-slate-400">
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ditugaskan: {formatDate(log.assignedAt)}</span>
                              {log.completedAt && (
                                <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="w-3.5 h-3.5" /> Selesai: {formatDate(log.completedAt)}</span>
                              )}
                            </div>
                          </div>

                          {/* Media & Notes */}
                          <div className="w-full md:w-72 shrink-0 flex flex-col gap-3">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <span className="font-black text-slate-400 uppercase text-[9px] tracking-wider flex items-center gap-1 mb-1">
                                <FileText className="w-3.5 h-3.5" /> Catatan Murid
                              </span>
                              <p className="text-slate-700 text-xs italic">
                                {log.notes || "Tidak ada catatan."}
                              </p>
                            </div>
                            {log.completed && log.quest.requireVideo && (
                              log.videoUrl ? (
                                <button
                                  onClick={() => setSelectedVideo(log.videoUrl)}
                                  className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center gap-1.5 text-xs font-black transition-all"
                                >
                                  <Video className="w-4 h-4" /> PUTAR VIDEO
                                </button>
                              ) : (
                                <div className="py-2 px-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-xs font-bold">
                                  Video Belum Diunggah
                                </div>
                              )
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <span className="font-black text-xs text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                <Video className="w-4 h-4 animate-pulse" /> Rekaman Latihan Murid
              </span>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-xs font-black bg-slate-800 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl border border-slate-700 transition-colors"
              >
                TUTUP
              </button>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video src={selectedVideo} controls autoPlay className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
