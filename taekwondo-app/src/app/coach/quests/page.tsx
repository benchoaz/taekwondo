"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Award, CheckSquare, Square, Video, ShieldAlert, ListFilter } from "lucide-react";

import { Suspense } from "react";

function CoachQuestFormContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("FITNESS");
  const [baseXp, setBaseXp] = useState("50");
  const [minAge, setMinAge] = useState("7");
  const [maxAge, setMaxAge] = useState("99");
  const [requireVideo, setRequireVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [readingContent, setReadingContent] = useState("");
  const [frequency, setFrequency] = useState("ONE_TIME");
  const [isActive, setIsActive] = useState(true);

  // States Kuis
  const [quizType, setQuizType] = useState<string>("NONE");
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState<string[]>(["", "", "", ""]);
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState("");
  
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

  useEffect(() => {
    // Jika mode edit
    if (editId) {
      fetch(`/api/quests/library/${editId}`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            const q = json.data;
            setTitle(q.title);
            setDescription(q.description || "");
            setCategory(q.category);
            setBaseXp(q.baseXp.toString());
            setRequireVideo(q.requireVideo);
            setVideoUrl(q.videoUrl || "");
            setReadingContent(q.readingContent || "");
            setFrequency(q.frequency || "ONE_TIME");
            setIsActive(q.isActive !== undefined ? q.isActive : true);

            // Load kuis jika ada
            if (q.quizQuestions && Array.isArray(q.quizQuestions) && q.quizQuestions.length > 0) {
              const quizObj = q.quizQuestions[0];
              setQuizQuestion(quizObj.question || "");
              if (quizObj.options && Array.isArray(quizObj.options) && quizObj.options.length > 0) {
                setQuizType("MULTIPLE_CHOICE");
                const opts = [...quizObj.options];
                while (opts.length < 4) opts.push("");
                setQuizOptions(opts);
              } else {
                setQuizType("TEXT");
              }
              setQuizCorrectAnswer(quizObj.correctAnswer || "");
            } else {
              setQuizType("NONE");
              setQuizQuestion("");
              setQuizOptions(["", "", "", ""]);
              setQuizCorrectAnswer("");
            }

            if (q.requirements && q.requirements.length > 0) {
              const req = q.requirements[0];
              setMinAge(req.minAge.toString());
              setMaxAge(req.maxAge.toString());
              if (req.allowedBeltIds) {
                setSelectedBeltIds(req.allowedBeltIds);
              }
            }
          }
        });
    } else {
      // Jika bukan mode edit (tambah baru), reset form
      setTitle("");
      setDescription("");
      setCategory("FITNESS");
      setBaseXp("50");
      setRequireVideo(false);
      setVideoUrl("");
      setReadingContent("");
      setFrequency("ONE_TIME");
      setIsActive(true);
      setSelectedBeltIds([]);
      setQuizType("NONE");
      setQuizQuestion("");
      setQuizOptions(["", "", "", ""]);
      setQuizCorrectAnswer("");
    }
  }, [editId]);

  const [isIframe, setIsIframe] = useState(false);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsIframe(window.self !== window.top);
    }
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
    setStatus("Menyimpan misi...");
    setIsSuccess(false);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get("editId");
      
      const method = editId ? "PUT" : "POST";
      const endpoint = editId ? `/api/quests/library/${editId}` : "/api/quests/library";

      // Formulate quizQuestions JSON structure compatible with DB and Mobile format
      let formattedQuiz: any = null;
      if (category === "THEORY" && quizType !== "NONE" && quizQuestion.trim() !== "") {
        formattedQuiz = [
          {
            id: "q1",
            question: quizQuestion.trim(),
            options: quizType === "MULTIPLE_CHOICE" ? quizOptions.filter(o => o.trim() !== "") : null,
            correctAnswer: quizCorrectAnswer.trim()
          }
        ];
      }

      const res = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          baseXp,
          minAge,
          maxAge,
          requireVideo,
          videoUrl,
          readingContent,
          quizQuestions: formattedQuiz,
          frequency,
          isActive,
          allowedBeltIds: selectedBeltIds
        })
      });

      const json = await res.json();
      if (json.success) {
        setStatus(editId ? "Misi berhasil diperbarui!" : "Misi berhasil disebarkan!");
        setIsSuccess(true);
        if (!editId) {
          setTitle("");
          setDescription("");
          setReadingContent("");
          setQuizQuestion("");
          setQuizOptions(["", "", "", ""]);
          setQuizCorrectAnswer("");
          setQuizType("NONE");
        }
        
        setTimeout(() => {
          setStatus("");
          setIsSuccess(false);
        }, 3000);
      } else {
        setStatus("Gagal: " + (json.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      setStatus("Gagal menyambung ke server");
    }
  };

  return (
    <div className={`min-h-screen ${isIframe ? 'bg-transparent py-0 px-0' : 'bg-[#f3f4f5] py-4 sm:py-12 px-2 sm:px-6 lg:px-8'} font-sans`}>
      <div className={`max-w-5xl mx-auto bg-white ${isIframe ? 'rounded-none shadow-none border-none' : 'rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-100'}`}>
        
        {/* Header Premium Merah - Hidden in Iframe */}
        {!isIframe && (
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
        )}

        {/* Navigation Tabs - Visible in Iframe but simplified */}
        {isIframe && (
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6 gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-black text-[#0F172A] font-display">Daily Quests Builder</h2>
              <p className="text-gray-400 text-xs mt-1">Rancang tantangan baru untuk menguji kemampuan teori &amp; fisik murid.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/coach/quests/library" className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95">
                <CheckSquare className="w-4 h-4" /> Library Misi
              </Link>
              <Link href="/coach/quests/logs" className="bg-[#E10600] hover:bg-[#C00500] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95">
                <ListFilter className="w-4 h-4" /> Pantau Latihan
              </Link>
            </div>
          </div>
        )}
        
        {/* Form Isi */}
        <form onSubmit={handleSubmit} className={`${isIframe ? 'px-0 py-0' : 'px-8 py-8'} space-y-6`}>
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
            <div className="space-y-6">
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

              {/* Tipe Kuis Selector */}
              <div className="p-5 bg-red-50/30 rounded-2xl border border-red-100/60">
                <label className="block text-sm font-black text-red-800 mb-2 uppercase tracking-wide">Model Tes / Kuis Teori</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setQuizType("NONE")}
                    className={`p-3 rounded-xl border font-bold text-xs transition-all ${quizType === "NONE" ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  >
                    📖 Hanya Membaca
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuizType("MULTIPLE_CHOICE")}
                    className={`p-3 rounded-xl border font-bold text-xs transition-all ${quizType === "MULTIPLE_CHOICE" ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  >
                    🔠 Pilihan Ganda
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuizType("TEXT")}
                    className={`p-3 rounded-xl border font-bold text-xs transition-all ${quizType === "TEXT" ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  >
                    ✍️ Tulis Jawaban
                  </button>
                </div>
              </div>

              {/* Form Input Pertanyaan & Pilihan */}
              {quizType !== "NONE" && (
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pertanyaan / Soal Kuis</label>
                    <input 
                      type="text"
                      required={quizType !== "NONE"}
                      value={quizQuestion}
                      onChange={e => setQuizQuestion(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-sm font-medium text-gray-800"
                      placeholder="Masukkan pertanyaan kuis di sini..."
                    />
                  </div>

                  {quizType === "MULTIPLE_CHOICE" && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">Pilihan Jawaban</label>
                      {quizOptions.map((opt, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="font-bold text-xs text-gray-400 w-4">{String.fromCharCode(65 + idx)}.</span>
                          <input 
                            type="text"
                            required={quizType === "MULTIPLE_CHOICE"}
                            value={opt}
                            onChange={e => {
                              const nextOpts = [...quizOptions];
                              nextOpts[idx] = e.target.value;
                              setQuizOptions(nextOpts);
                            }}
                            className="block w-full px-4 py-2 rounded-lg border border-gray-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-xs font-medium text-gray-800"
                            placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {quizType === "MULTIPLE_CHOICE" ? "Pilihan Jawaban yang Benar (Harus persis sama dengan salah satu pilihan di atas)" : "Kunci Jawaban Tulis (Case-insensitive)"}
                    </label>
                    <input 
                      type="text"
                      required={quizType !== "NONE"}
                      value={quizCorrectAnswer}
                      onChange={e => setQuizCorrectAnswer(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-sm font-bold text-red-600"
                      placeholder={quizType === "MULTIPLE_CHOICE" ? "Contoh: Momtong" : "Masukkan kunci jawaban di sini..."}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Frekuensi Misi (Sistem Auto-Pilot)</label>
              <select 
                value={frequency} 
                onChange={e => setFrequency(e.target.value)} 
                className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-bold text-gray-800 cursor-pointer"
              >
                <option value="ONE_TIME">🎯 Misi Khusus (Sekali Jalan)</option>
                <option value="DAILY">🔄 Rutinitas Harian (Reset tiap jam 00:00)</option>
                <option value="WEEKLY">🗓️ Tantangan Mingguan (Batas waktu 7 hari)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Status Auto-Pilot</label>
              <div className="flex items-center gap-3 h-[50px]">
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
                <span className={`font-bold ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {isActive ? 'Aktif (Akan didistribusikan)' : 'Mati (Disembunyikan)'}
                </span>
              </div>
            </div>
          </div>

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
            {editId ? "SIMPAN PERUBAHAN MISI" : "SEBARKAN MISI SEKARANG"}
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

export default function CoachQuestForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f3f4f5] flex items-center justify-center font-sans text-gray-500 font-medium">
        Memuat kreator misi...
      </div>
    }>
      <CoachQuestFormContent />
    </Suspense>
  );
}
