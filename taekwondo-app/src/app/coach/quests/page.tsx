"use client";

import { useState } from "react";

export default function CoachQuestForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("FITNESS");
  const [baseXp, setBaseXp] = useState("50");
  const [minAge, setMinAge] = useState("7");
  const [maxAge, setMaxAge] = useState("99");
  const [status, setStatus] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Menyimpan ke database...");
    setIsSuccess(false);

    try {
      const res = await fetch("/api/quests/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category, baseXp, minAge, maxAge }),
      });

      if (res.ok) {
        setStatus("✅ Misi berhasil disimpan dan siap diberikan ke murid!");
        setIsSuccess(true);
        setTitle("");
        setDescription("");
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

          <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
            <h3 className="text-sm font-black text-red-800 mb-4 uppercase tracking-wider">Batasan Kelompok Umur</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-red-600 mb-1">Minimal Umur</label>
                <input 
                  type="number" 
                  value={minAge} 
                  onChange={e => setMinAge(e.target.value)} 
                  className="block w-full px-3 py-2 rounded-lg border border-red-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-bold text-gray-800" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-red-600 mb-1">Maksimal Umur</label>
                <input 
                  type="number" 
                  value={maxAge} 
                  onChange={e => setMaxAge(e.target.value)} 
                  className="block w-full px-3 py-2 rounded-lg border border-red-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-bold text-gray-800" 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-red-500/30 text-base font-black text-white bg-red-600 hover:bg-red-700 hover:shadow-red-600/40 focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-all transform active:scale-95"
          >
            SEBARKAN MISI KE DATABASE
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
