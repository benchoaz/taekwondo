"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap, CheckCircle, Clock, Dumbbell, Shield, BookOpen, Loader2, Upload, Video, X } from "lucide-react";
import BottomNav from "../_components/BottomNav";

interface QuestLog {
  id: string; completed: boolean; completedAt?: string;
  quest: { title: string; description: string; baseXp: number; category: string; requireVideo?: boolean };
}

const CATEGORY_MAP: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  FITNESS:    { label: "Fisik",     icon: Dumbbell,  color: "text-blue-400",   bg: "bg-blue-950/50" },
  TECHNICAL:  { label: "Teknik",    icon: Shield,    color: "text-purple-400", bg: "bg-purple-950/50" },
  DISCIPLINE: { label: "Disiplin",  icon: BookOpen,  color: "text-amber-400",  bg: "bg-amber-950/50" },
};

export default function QuestsPage() {
  const router = useRouter();
  const [quests, setQuests] = useState<QuestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  // Modal Submit States
  const [activeQuest, setActiveQuest] = useState<QuestLog | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/quests")
      .then(r => { if (!r.ok && (r.status===401||r.status===403)) { router.replace("/m/login"); } return r.json(); })
      .then(data => { if (data.success) setQuests(data.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmitQuest = async () => {
    if (!activeQuest || completing) return;
    
    // Validasi video wajib
    if (activeQuest.quest.requireVideo && !videoFile) {
      alert("❌ Anda wajib menyertakan bukti rekaman video untuk menyelesaikan misi ini.");
      return;
    }

    setCompleting(activeQuest.id);
    setUploading(true);

    try {
      let uploadedUrl = "";
      if (videoFile) {
        const formData = new FormData();
        formData.append("file", videoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.success) {
          uploadedUrl = uploadData.url;
        } else {
          alert(uploadData.error || "Gagal mengunggah video.");
          setCompleting(null);
          setUploading(false);
          return;
        }
      }

      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logId: activeQuest.id,
          videoUrl: uploadedUrl || null,
          notes: notes || null
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuests(prev => prev.map(q => q.id === activeQuest.id ? { ...q, completed: true } : q));
        setActiveQuest(null);
        setVideoFile(null);
        setNotes("");
      }
    } catch {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setCompleting(null);
      setUploading(false);
    }
  };

  const completed = quests.filter(q => q.completed).length;
  const totalXp = quests.filter(q => q.completed).reduce((sum, q) => sum + q.quest.baseXp, 0);

  return (
    <div className="flex-1 flex flex-col pb-28 bg-[#020617] text-white min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 pt-12 pb-6 px-5 border-b-4 border-[#334155]">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-400 text-xs mb-4">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Lobby
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center shrink-0 animate-game-float">
              <img
                src="/daily_quest_tiger_transparent.png"
                alt="Daily Quest Mascot"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-black text-lg uppercase tracking-wide">Misi Harian</h1>
              <p className="text-slate-400 text-xs">{completed}/{quests.length} diselesaikan hari ini</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[#FFD700] font-black text-2xl drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]">+{totalXp} XP</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">HADIAH HARI INI</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#E10600] animate-spin" />
          </div>
        ) : quests.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Zap className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-black">Tidak ada misi harian yang aktif</p>
          </div>
        ) : (
          quests.map(q => {
            const cat = CATEGORY_MAP[q.quest.category] || { label: "Umum", icon: Zap, color: "text-slate-400", bg: "bg-slate-900" };
            const CatIcon = cat.icon;
            return (
              <div
                key={q.id}
                className={`game-card p-4 transition-all duration-200 ${q.completed ? "border-emerald-800/40 opacity-60 bg-slate-950" : "border-slate-800"}`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 border border-white/5 rounded-xl flex items-center justify-center shrink-0 ${cat.bg}`}>
                    <CatIcon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/5 ${cat.bg} ${cat.color}`}>
                        {cat.label}
                      </span>
                      <span className="text-[9px] font-black text-[#FFD700] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        +{q.quest.baseXp} XP
                      </span>
                    </div>
                    <p className={`text-sm font-black leading-snug ${q.completed ? "text-slate-500 line-through" : "text-white"}`}>
                      {q.quest.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{q.quest.description}</p>
                  </div>
                  <div className="shrink-0 pt-1">
                    {q.completed ? (
                      <CheckCircle className="w-7 h-7 text-emerald-500" />
                    ) : (
                      <button
                        onClick={() => setActiveQuest(q)}
                        className="btn-battle px-3.5 py-2 text-xs"
                      >
                        KLAIM
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- SUBMIT MISSION POP-UP MODAL --- */}
      {activeQuest && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-[0_0_24px_rgba(0,0,0,0.8)]">
            <div className="p-4 border-b-2 border-slate-800 flex justify-between items-center bg-slate-950">
              <span className="font-black text-xs text-red-400 uppercase tracking-widest">Kirim Bukti Latihan</span>
              <button onClick={() => { setActiveQuest(null); setVideoFile(null); setNotes(""); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div>
                <h3 className="font-black text-sm uppercase text-white">{activeQuest.quest.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{activeQuest.quest.description}</p>
              </div>

              {/* Video upload input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <span>Video Bukti Latihan</span>
                  {activeQuest.quest.requireVideo ? (
                    <span className="text-red-500 font-extrabold text-[9px] bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full">WAJIB</span>
                  ) : (
                    <span className="text-slate-500 text-[9px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded-full">Opsional</span>
                  )}
                </label>
                <div className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-950 cursor-pointer transition-colors ${
                  activeQuest.quest.requireVideo && !videoFile ? 'border-red-500/40 hover:border-red-500' : 'border-slate-700 hover:border-[#E10600]'
                }`}>
                  <input
                    type="file"
                    accept="video/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setVideoFile(e.target.files[0]);
                      }
                    }}
                  />
                  {videoFile ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <Video className="w-5 h-5" />
                      <span className="truncate max-w-[180px]">{videoFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-500 mb-1" />
                      <span className="text-[11px] text-slate-400 font-semibold">Pilih atau Rekam Video</span>
                      <span className="text-[9px] text-slate-500 mt-0.5">Format: MP4, MOV, WebM</span>
                    </>
                  )}
                </div>
              </div>

              {/* Notes input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Catatan Tambahan (Latihan di rumah)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ceritakan secara singkat latihan mandiri Anda hari ini..."
                  className="bg-slate-950 border-2 border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#E10600] resize-none h-20"
                />
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmitQuest}
                disabled={uploading}
                className="w-full btn-battle py-3 mt-1 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    <span>Memproses Pengiriman...</span>
                  </>
                ) : (
                  <span>KIRIM SEKARANG (+{activeQuest.quest.baseXp} XP)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
