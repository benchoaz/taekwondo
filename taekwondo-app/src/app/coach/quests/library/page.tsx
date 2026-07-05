"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, ListFilter, Trash2, Library, PlusCircle } from "lucide-react";

export default function QuestLibraryPage() {
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    if (!window.confirm(`Apakah Anda yakin ingin menghapus misi "${title}"?`)) return;

    try {
      const res = await fetch(`/api/quests/library/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        alert("Misi berhasil dihapus.");
        fetchQuests(); // Refresh data
      } else {
        alert("Gagal menghapus: " + json.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f5] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Premium Merah */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-center gap-4 mb-4 relative z-10">
            <Link href="/coach/quests" className="bg-red-950/40 text-red-100 hover:text-white text-xs font-black px-3.5 py-1 rounded-full border border-red-700/30 uppercase tracking-widest transition-colors flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" /> Buat Misi Baru
            </Link>
            <span className="bg-white/20 text-white text-xs font-black px-3.5 py-1 rounded-full border border-white/30 uppercase tracking-widest flex items-center gap-1.5">
              <Library className="w-3.5 h-3.5" /> Library Misi
            </span>
            <Link href="/coach/quests/logs" className="bg-red-950/40 text-red-100 hover:text-white text-xs font-black px-3.5 py-1 rounded-full border border-red-700/30 uppercase tracking-widest transition-colors flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5" /> Pantau Latihan
            </Link>
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight relative z-10">
            Daftar Seluruh Misi (Library)
          </h2>
          <p className="mt-2 text-red-100 font-medium relative z-10">
            Kumpulan misi dari database pusat dan misi yang Anda buat sendiri.
          </p>
        </div>
        
        {/* Konten */}
        <div className="p-8">
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
              Belum ada misi yang tersimpan di dalam Library.
            </div>
          ) : (
            <div className="grid gap-4">
              {quests.map((q) => (
                <div key={q.id} className="p-5 border border-gray-100 bg-gray-50/50 hover:bg-white rounded-2xl flex items-start justify-between gap-4 transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded-md">
                        {q.category}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-md">
                        {q.baseXp} XP
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1.5">{q.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-snug">{q.description}</p>
                    
                    <div className="mt-3 text-xs font-medium text-gray-400">
                      Dibuat pada: {new Date(q.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(q.id, q.title)}
                    className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all shrink-0"
                    title="Hapus Misi"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
