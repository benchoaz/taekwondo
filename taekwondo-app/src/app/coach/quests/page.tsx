"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, CheckSquare, Square, Video, ShieldAlert, ListFilter } from "lucide-react";

export default function CoachQuestForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("FITNESS");
  const [baseXp, setBaseXp] = useState("50");
  const [minAge, setMinAge] = useState("7");
  const [maxAge, setMaxAge] = useState("99");
  const [requireVideo, setRequireVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [readingContent, setReadingContent] = useState("");
  
  const [belts, setBelts] = useState<{ id: string; name: string }[]>([]);
  const [selectedBeltIds, setSelectedBeltIds] = useState<string[]>([]);
  
  const [status, setStatus] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Ambil daftar sabuk dari kurikulum untuk pembatasan tingkatan
    fetch("/api/curriculum")
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setBelts(json.data.map((b: any) => ({ id: b.id, name: b.name })));
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleBelt = (id: string) => {
    setSelectedBeltIds(prev => 
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  const handleSelectAllBelts = () => {
    if (selectedBeltIds.length === belts.length) {
      setSelectedBeltIds([]);
    } else {
      setSelectedBeltIds(belts.map(b => b.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Menyimpan misi ke database...");
    setIsSuccess(false);

    try {
      const res = await fetch("/api/quests/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          description, 
          category, 
          baseXp, 
          minAge, 
          maxAge,
          allowedBeltIds: selectedBeltIds,
          requireVideo,
          videoUrl: videoUrl || null,
          readingContent: category === "THEORY" ? (readingContent || null) : null
        }),
      });

      if (res.ok) {
        setStatus("✅ Misi berhasil disimpan dan siap disebarkan ke murid!");
        setIsSuccess(true);
        setTitle("");
        setDescription("");
        setVideoUrl("");
        setReadingContent("");
        setSelectedBeltIds([]);
        setRequireVideo(false);
      } else {
        const err = await res.json();
        setStatus("❌ Gagal menyimpan: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      setStatus("❌ Terjadi kesalahan jaringan. Cek koneksi Anda.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f5] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Premium Merah */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-center gap-4 mb-4 relative z-10">
            <span className="bg-white/20 text-white text-xs font-black px-3.5 py-1 rounded-full border border-white/30 uppercase tracking-widest">
              Quest Builder
            </span>
            <Link href="/coach/quests/library" className="bg-red-950/40 text-red-100 hover:text-white text-xs font-black px-3.5 py-1 rounded-full border border-red-700/30 uppercase tracking-widest transition-colors flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" /> Library Misi
            </Link>
            <Link href="/coach/quests/logs" className="bg-red-950/40 text-red-100 hover:text-white text-xs font-black px-3.5 py-1 rounded-full border border-red-700/30 uppercase tracking-widest transition-colors flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5" /> Pantau Latihan Murid
            </Link>
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight relative z-10">
            Kreator Misi Harian
          </h2>
          <p className="mt-2 text-red-100 font-medium relative z-10">
            Rancang tantangan baru untuk menguji batas kemampuan murid Dojang
          </p>
        </div>
        
        {/* Form Isi */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Nama Latihan / Misi</label>
            <input 
              required 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-medium text-gray-800" 
              placeholder="Contoh: Tendangan Ap Chagi 100x" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Instruksi Eksekusi</label>
            <textarea 
              required 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-medium text-gray-800 resize-none" 
              rows={4} 
              placeholder="Jelaskan detail cara melakukan latihan agar murid tidak cedera..." 
            />
          </div>

          {category === "THEORY" && (
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Materi Bacaan (Opsional)</label>
              <textarea 
                value={readingContent} 
                onChange={e => setReadingContent(e.target.value)} 
                className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-medium text-gray-800 resize-none" 
                rows={6} 
                placeholder="Masukkan teks bahan bacaan, sejarah, atau teori Taekwondo di sini agar murid bisa membacanya..." 
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Kategori Fokus</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-bold text-gray-800 cursor-pointer"
              >
                <option value="FITNESS">💪 Fisik (Kardio & Kekuatan)</option>
                <option value="TECHNICAL">🥋 Teknik (Tendangan & Pukulan)</option>
                <option value="DISCIPLINE">🧘 Disiplin (Poomsae & Etika)</option>
                <option value="THEORY">📖 Teori & Membaca (Pengetahuan)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Poin XP yang Didapat</label>
              <div className="relative">
                <input 
                  required 
                  type="number" 
                  value={baseXp} 
                  onChange={e => setBaseXp(e.target.value)} 
                  className="block w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-black text-red-600 text-lg" 
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="font-bold text-gray-400">XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Link Video Panduan */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Link Video Panduan (YouTube/Lainnya) (Opsional)</label>
            <input 
              type="url" 
              value={videoUrl} 
              onChange={e => setVideoUrl(e.target.value)} 
              className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-medium text-gray-800" 
              placeholder="Contoh: https://www.youtube.com/watch?v=..." 
            />
            <p className="text-[10px] text-gray-500 mt-1">Sediakan tautan video peragaan gerakan agar murid bisa mencontoh sebelum berlatih.</p>
          </div>

          {/* Pengaturan Tambahan: Wajib Video */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">Wajib Unggah Bukti Video</h4>
                <p className="text-xs text-gray-500">Siswa harus mengunggah rekaman latihan untuk menyelesaikan misi ini</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRequireVideo(!requireVideo)}
              className={`w-12 h-6 rounded-full p-1 transition-all ${requireVideo ? 'bg-red-600 flex justify-end' : 'bg-gray-300 flex justify-start'}`}
            >
              <span className="w-4 h-4 bg-white rounded-full shadow-md" />
            </button>
          </div>

          {/* Batasan Umur */}
          <div className="p-5 bg-red-50/50 rounded-2xl border border-red-100">
            <h3 className="text-sm font-black text-red-800 mb-4 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Batasan Kelompok Umur
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-red-600 mb-1">Minimal Umur (Tahun)</label>
                <input 
                  type="number" 
                  value={minAge} 
                  onChange={e => setMinAge(e.target.value)} 
                  className="block w-full px-3 py-2 rounded-lg border border-red-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-bold text-gray-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-red-600 mb-1">Maksimal Umur (Tahun)</label>
                <input 
                  type="number" 
                  value={maxAge} 
                  onChange={e => setMaxAge(e.target.value)} 
                  className="block w-full px-3 py-2 rounded-lg border border-red-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-bold text-gray-800" 
                />
              </div>
            </div>
          </div>

          {/* Batasan Tingkatan Sabuk */}
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Batasan Sabuk (Tingkatan)
              </h3>
              <button
                type="button"
                onClick={handleSelectAllBelts}
                className="text-xs text-red-600 font-bold hover:underline"
              >
                {selectedBeltIds.length === belts.length ? "Hapus Semua" : "Pilih Semua Sabuk"}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">Misi hanya akan didistribusikan ke tingkatan sabuk yang dicentang. Kosongkan jika misi ini bisa didapatkan semua murid.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
              {belts.map(belt => {
                const isChecked = selectedBeltIds.includes(belt.id);
                return (
                  <button
                    key={belt.id}
                    type="button"
                    onClick={() => handleToggleBelt(belt.id)}
                    className={`flex items-center gap-2 p-2 px-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isChecked
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-red-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-300 shrink-0" />
                    )}
                    <span className="truncate">{belt.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-red-500/30 text-base font-black text-white bg-red-600 hover:bg-red-700 hover:shadow-red-600/40 focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-all transform active:scale-95"
          >
            SEBARKAN MISI SEKARANG
          </button>
          
          {status && (
            <div className={`p-4 rounded-xl text-center font-bold text-sm ${isSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
