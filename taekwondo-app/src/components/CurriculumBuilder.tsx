"use client";

import React, { useState, useEffect } from "react";
import { Plus, GripVertical, Trash2, Video, FileText, ChevronDown, ChevronUp } from "lucide-react";

export default function CurriculumBuilder() {
  const [belts, setBelts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedBelt, setExpandedBelt] = useState<string | null>(null);

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/curriculum");
      if (res.ok) {
        const data = await res.json();
        setBelts(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (beltId: string) => {
    const name = prompt("Nama Kategori (Contoh: Poomsae, Teknik Dasar):");
    if (!name) return;

    try {
      const res = await fetch("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_CATEGORY",
          payload: { beltId, name }
        })
      });
      if (res.ok) fetchCurriculum();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMaterial = async (categoryId: string) => {
    const title = prompt("Nama Materi (Contoh: Ap Chagi):");
    if (!title) return;
    
    const videoUrl = prompt("URL Video (Opsional, YouTube / MP4 url):") || "";

    try {
      const res = await fetch("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_MATERIAL",
          payload: { categoryId, title, videoUrl }
        })
      });
      if (res.ok) fetchCurriculum();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="text-center py-12 font-bold text-gray-500 animate-pulse">Memuat Struktur Kurikulum...</div>;

  return (
    <div className="flex flex-col gap-6">
      {belts.map((belt) => (
        <div key={belt.id} className="bg-white border border-[#0F172A]/5 rounded-2xl overflow-hidden shadow-sm">
          <div 
            className="p-6 flex items-center justify-between cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
            onClick={() => setExpandedBelt(expandedBelt === belt.id ? null : belt.id)}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E10600]/10 flex items-center justify-center overflow-hidden">
                {belt.imageUrl ? (
                  <img src={belt.imageUrl} alt={belt.name} className="w-8 h-8 object-contain" />
                ) : (
                  <div className="w-6 h-2 bg-[#E10600] rounded-sm" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-[#0F172A] text-lg">{belt.name}</h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                  <span>{belt.categories?.length || 0} Kategori Pembelajaran</span>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <label className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer">
                      Ubah Aset Sabuk
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          const formData = new FormData();
                          formData.append("file", file);
                          formData.append("filename", file.name);
                          
                          try {
                            const resUpload = await fetch("/api/upload", {
                              method: "POST",
                              body: formData
                            });
                            if (resUpload.ok) {
                              const dataUpload = await resUpload.json();
                              const resImage = await fetch("/api/curriculum", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  action: "UPDATE_BELT_IMAGE",
                                  payload: { beltId: belt.id, imageUrl: dataUpload.url }
                                })
                              });
                              if (resImage.ok) {
                                alert("Gambar sabuk berhasil diperbarui!");
                                fetchCurriculum();
                              }
                            }
                          } catch (err) {
                            console.error(err);
                            alert("Gagal mengunggah gambar.");
                          }
                        }}
                      />
                    </label>
                    {belt.imageUrl && (
                      <>
                        <span className="text-slate-300">/</span>
                        <button 
                          onClick={async () => {
                            if (!confirm("Hapus gambar kustom sabuk?")) return;
                            try {
                              const resImage = await fetch("/api/curriculum", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  action: "UPDATE_BELT_IMAGE",
                                  payload: { beltId: belt.id, imageUrl: null }
                                })
                              });
                              if (resImage.ok) {
                                alert("Gambar kustom sabuk dihapus.");
                                fetchCurriculum();
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="text-[11px] text-red-500 font-bold hover:underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {expandedBelt === belt.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>

          {expandedBelt === belt.id && (
            <div className="p-6 border-t border-slate-100 flex flex-col gap-6">
              {(!belt.categories || belt.categories.length === 0) ? (
                <div className="text-center py-8 text-gray-400 text-sm italic">Belum ada kategori pembelajaran untuk sabuk ini.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {belt.categories.map((cat: any) => (
                    <div key={cat.id} className="border border-slate-200 rounded-xl p-4 bg-[#F8FAFC]">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-[#0F172A] flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                          {cat.name}
                        </h4>
                        <button 
                          onClick={() => handleAddMaterial(cat.id)}
                          className="text-xs font-bold text-[#3B82F6] hover:text-blue-700 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Tambah Materi
                        </button>
                      </div>

                      <div className="flex flex-col gap-2 pl-6">
                        {(!cat.materials || cat.materials.length === 0) ? (
                          <div className="text-xs text-gray-400">Belum ada materi di kategori ini.</div>
                        ) : (
                          cat.materials.map((mat: any) => (
                            <div key={mat.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                              <div className="flex items-center gap-3">
                                {mat.videoUrl ? <Video className="w-4 h-4 text-[#E10600]" /> : <FileText className="w-4 h-4 text-gray-400" />}
                                <span className="text-sm font-semibold text-[#0F172A]">{mat.title}</span>
                              </div>
                              <button className="text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={() => handleAddCategory(belt.id)}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-gray-500 hover:text-[#0F172A] hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Tambah Kategori (Contoh: Jurus / Fisik)
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
