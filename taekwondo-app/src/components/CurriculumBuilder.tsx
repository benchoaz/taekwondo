"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, Video, FileText, ChevronDown, ChevronUp,
  Edit2, Check, X, Settings2, Image as ImageIcon, Save, BookOpen, Shield,
} from "lucide-react";

// ────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────
interface Belt {
  id: string;
  name: string;
  level: number;
  imageUrl?: string | null;
  minAttendance: number;
  minTechScore: number;
  minPoomsae: number;
  minPhysical: number;
  categories: Category[];
}

interface Category {
  id: string;
  beltId: string;
  name: string;
  order: number;
  materials: Material[];
}

interface Material {
  id: string;
  categoryId: string;
  title: string;
  videoUrl?: string | null;
  order: number;
}

type TabId = "belts" | "curriculum";

// ────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────
const api = async (action: string, payload: object) => {
  const res = await fetch("/api/curriculum", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Request gagal");
  return res.json();
};

const uploadImage = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append("file", file);
  form.append("filename", file.name);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload gagal");
  const data = await res.json();
  return data.url;
};

// ────────────────────────────────────────────────────
// Modal Component
// ────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  children: React.ReactNode;
}

function Modal({ title, onClose, onSave, saving, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-black text-[#0F172A] text-lg">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex flex-col gap-4">{children}</div>
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#E10600] text-white font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────
// Belt Form Fields (reusable)
// ────────────────────────────────────────────────────
interface BeltFormProps {
  form: Partial<Belt>;
  onChange: (f: Partial<Belt>) => void;
  uploading: boolean;
  onUploadImage: (file: File) => void;
}

function BeltFormFields({ form, onChange, uploading, onUploadImage }: BeltFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const field = (label: string, key: keyof Belt, type = "text") => (
    <div>
      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">{label}</label>
      <input
        type={type}
        value={(form[key] as any) ?? ""}
        onChange={(e) => onChange({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
        className="w-full h-11 bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 text-sm font-semibold text-[#0F172A] focus:ring-2 focus:ring-[#E10600] focus:border-[#E10600] outline-none transition"
      />
    </div>
  );

  return (
    <>
      {field("Nama Sabuk *", "name")}
      {field("Level / Urutan *", "level", "number")}

      {/* Image Upload */}
      <div>
        <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Gambar Sabuk</label>
        <div className="flex items-center gap-3">
          {form.imageUrl ? (
            <div className="relative w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
              <img src={form.imageUrl} alt="belt" className="w-12 h-12 object-contain" />
              <button
                onClick={() => onChange({ ...form, imageUrl: null })}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {uploading ? "Mengupload..." : "Pilih Gambar"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadImage(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* UKT Requirements */}
      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs font-bold text-slate-500 uppercase mb-3">Syarat Lulus UKT (nilai minimum)</p>
        <div className="grid grid-cols-2 gap-3">
          {field("Kehadiran (%)", "minAttendance", "number")}
          {field("Teknik", "minTechScore", "number")}
          {field("Poomsae", "minPoomsae", "number")}
          {field("Fisik", "minPhysical", "number")}
        </div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────
export default function CurriculumBuilder() {
  const [belts, setBelts] = useState<Belt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("belts");
  const [expandedBelt, setExpandedBelt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Belt modal state
  const [beltModal, setBeltModal] = useState<{ open: boolean; mode: "add" | "edit"; form: Partial<Belt> }>({
    open: false, mode: "add", form: {}
  });

  // Category modal state
  const [catModal, setCatModal] = useState<{ open: boolean; beltId: string; catId?: string; name: string }>({
    open: false, beltId: "", name: ""
  });

  // Material modal state
  const [matModal, setMatModal] = useState<{
    open: boolean; categoryId: string; matId?: string; title: string; videoUrl: string;
  }>({ open: false, categoryId: "", title: "", videoUrl: "" });

  // ── Data ──────────────────────────────────────────
  const load = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/curriculum");
      if (res.ok) {
        const data = await res.json();
        setBelts(data.data || []);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // ── Belt handlers ──────────────────────────────────
  const openAddBelt = () => setBeltModal({
    open: true, mode: "add",
    form: { minAttendance: 80, minTechScore: 70, minPoomsae: 70, minPhysical: 70 }
  });

  const openEditBelt = (belt: Belt) => setBeltModal({
    open: true, mode: "edit",
    form: { ...belt }
  });

  const handleSaveBelt = async () => {
    const f = beltModal.form;
    if (!f.name?.trim()) return alert("Nama sabuk wajib diisi!");
    if (!f.level) return alert("Level sabuk wajib diisi!");
    setSaving(true);
    try {
      if (beltModal.mode === "add") {
        await api("CREATE_BELT", f);
      } else {
        await api("UPDATE_BELT", { ...f, beltId: f.id });
      }
      setBeltModal({ open: false, mode: "add", form: {} });
      await load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDeleteBelt = async (belt: Belt) => {
    if (!confirm(`Hapus sabuk "${belt.name}"?\n\nSemua kategori dan materi di dalamnya akan ikut terhapus.`)) return;
    try {
      await api("DELETE_BELT", { beltId: belt.id });
      await load();
    } catch (e: any) { alert(e.message); }
  };

  const handleUploadBeltImage = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setBeltModal(prev => ({ ...prev, form: { ...prev.form, imageUrl: url } }));
    } catch (e: any) { alert(e.message); }
    finally { setUploading(false); }
  };

  const handleUpdateBeltImageDirect = async (beltId: string, file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      await api("UPDATE_BELT_IMAGE", { beltId, imageUrl: url });
      await load();
    } catch (e: any) { alert(e.message); }
    finally { setUploading(false); }
  };

  // ── Category handlers ──────────────────────────────
  const handleSaveCategory = async () => {
    if (!catModal.name.trim()) return alert("Nama kategori wajib diisi!");
    setSaving(true);
    try {
      if (catModal.catId) {
        await api("UPDATE_CATEGORY", { categoryId: catModal.catId, name: catModal.name });
      } else {
        const catCount = belts.find(b => b.id === catModal.beltId)?.categories.length ?? 0;
        await api("ADD_CATEGORY", { beltId: catModal.beltId, name: catModal.name, order: catCount });
      }
      setCatModal({ open: false, beltId: "", name: "" });
      await load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`Hapus kategori "${cat.name}"? Semua materi di dalamnya akan terhapus.`)) return;
    try {
      await api("DELETE_CATEGORY", { categoryId: cat.id });
      await load();
    } catch (e: any) { alert(e.message); }
  };

  // ── Material handlers ──────────────────────────────
  const handleSaveMaterial = async () => {
    if (!matModal.title.trim()) return alert("Nama materi wajib diisi!");
    setSaving(true);
    try {
      if (matModal.matId) {
        await api("UPDATE_MATERIAL", {
          materialId: matModal.matId,
          title: matModal.title,
          videoUrl: matModal.videoUrl,
        });
      } else {
        const belt = belts.find(b => b.categories.some(c => c.id === matModal.categoryId));
        const cat = belt?.categories.find(c => c.id === matModal.categoryId);
        const matCount = cat?.materials.length ?? 0;
        await api("ADD_MATERIAL", {
          categoryId: matModal.categoryId,
          title: matModal.title,
          videoUrl: matModal.videoUrl,
          order: matCount,
        });
      }
      setMatModal({ open: false, categoryId: "", title: "", videoUrl: "" });
      await load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDeleteMaterial = async (mat: Material) => {
    if (!confirm(`Hapus materi "${mat.title}"?`)) return;
    try {
      await api("DELETE_MATERIAL", { materialId: mat.id });
      await load();
    } catch (e: any) { alert(e.message); }
  };

  // ── Render ─────────────────────────────────────────
  if (isLoading) return (
    <div className="text-center py-16 font-bold text-gray-400 animate-pulse text-sm">
      Memuat Data Kurikulum...
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Tab bar ── */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab("belts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            tab === "belts"
              ? "bg-white text-[#0F172A] shadow-sm"
              : "text-slate-500 hover:text-[#0F172A]"
          }`}
        >
          <Shield className="w-4 h-4" />
          Manajemen Sabuk
        </button>
        <button
          onClick={() => setTab("curriculum")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            tab === "curriculum"
              ? "bg-white text-[#0F172A] shadow-sm"
              : "text-slate-500 hover:text-[#0F172A]"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Materi & Kategori
        </button>
      </div>

      {/* ══════════════════════════════════════════════
          TAB 1: Manajemen Sabuk (CRUD BeltRank)
         ══════════════════════════════════════════════ */}
      {tab === "belts" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Daftar Tingkatan Sabuk</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {belts.length} sabuk terdaftar · Urut berdasarkan level (rendah → tinggi)
              </p>
            </div>
            <button
              onClick={openAddBelt}
              className="bg-[#E10600] hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-red-200 transition-all"
            >
              <Plus className="w-4 h-4" /> Tambah Sabuk
            </button>
          </div>

          {belts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-400 text-sm">Belum ada sabuk terdaftar</p>
              <p className="text-xs text-slate-300 mt-1">Klik "Tambah Sabuk" untuk mulai</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase">Sabuk</th>
                    <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase">Level</th>
                    <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase">Kehadiran</th>
                    <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase">Teknik</th>
                    <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase">Poomsae</th>
                    <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase">Fisik</th>
                    <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase">Gambar</th>
                    <th className="p-4 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {belts.map((belt, i) => (
                    <tr key={belt.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${i === belts.length - 1 ? "border-b-0" : ""}`}>
                      <td className="p-4">
                        <span className="font-bold text-[#0F172A]">{belt.name}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#E10600]/10 text-[#E10600] font-black text-xs">
                          {belt.level}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-600 font-semibold">{belt.minAttendance}%</td>
                      <td className="p-4 text-center text-slate-600 font-semibold">{belt.minTechScore}</td>
                      <td className="p-4 text-center text-slate-600 font-semibold">{belt.minPoomsae}</td>
                      <td className="p-4 text-center text-slate-600 font-semibold">{belt.minPhysical}</td>
                      <td className="p-4 text-center">
                        {belt.imageUrl ? (
                          <div className="flex items-center justify-center gap-2">
                            <img src={belt.imageUrl} alt={belt.name} className="w-8 h-8 object-contain rounded" />
                            <label className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer">
                              Ganti
                              <input type="file" accept="image/*" className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpdateBeltImageDirect(belt.id, f); e.target.value = ""; }}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer flex items-center justify-center gap-1">
                            <ImageIcon className="w-3 h-3" /> Upload
                            <input type="file" accept="image/*" className="hidden"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpdateBeltImageDirect(belt.id, f); e.target.value = ""; }}
                            />
                          </label>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditBelt(belt)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-100 flex items-center justify-center transition-colors group"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteBelt(belt)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 flex items-center justify-center transition-colors group"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 2: Materi & Kategori (Curriculum tree)
         ══════════════════════════════════════════════ */}
      {tab === "curriculum" && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Kurikulum per Sabuk</h2>
            <p className="text-xs text-slate-400 mt-0.5">Klik sabuk untuk expand, kelola kategori dan materi pembelajaran</p>
          </div>

          {belts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-400 text-sm">Belum ada sabuk — tambah di tab Manajemen Sabuk dulu</p>
            </div>
          ) : (
            belts.map((belt) => (
              <div key={belt.id} className="bg-white border border-[#0F172A]/5 rounded-2xl overflow-hidden shadow-sm">
                {/* ── Belt header (click to expand) ── */}
                <div
                  className="p-5 flex items-center justify-between cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                  onClick={() => setExpandedBelt(expandedBelt === belt.id ? null : belt.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#E10600]/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {belt.imageUrl
                        ? <img src={belt.imageUrl} alt={belt.name} className="w-8 h-8 object-contain" />
                        : <span className="text-xs font-black text-[#E10600]">{belt.level}</span>
                      }
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0F172A]">{belt.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {belt.categories?.length || 0} kategori ·{" "}
                        {belt.categories?.reduce((sum, c) => sum + c.materials.length, 0) || 0} materi
                      </p>
                    </div>
                  </div>
                  {expandedBelt === belt.id
                    ? <ChevronUp className="w-5 h-5 text-slate-400" />
                    : <ChevronDown className="w-5 h-5 text-slate-400" />
                  }
                </div>

                {/* ── Expanded content ── */}
                {expandedBelt === belt.id && (
                  <div className="p-5 border-t border-slate-100 flex flex-col gap-4">
                    {belt.categories.length === 0 ? (
                      <p className="text-center text-sm text-slate-400 italic py-4">Belum ada kategori. Klik "+ Tambah Kategori" di bawah.</p>
                    ) : (
                      belt.categories.map((cat) => (
                        <div key={cat.id} className="border border-slate-200 rounded-xl overflow-hidden">
                          {/* Category header */}
                          <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b border-slate-100">
                            <h4 className="font-bold text-[#0F172A] text-sm">{cat.name}</h4>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setCatModal({ open: true, beltId: belt.id, catId: cat.id, name: cat.name })}
                                className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-blue-50 transition-colors group"
                                title="Edit kategori"
                              >
                                <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                              </button>
                              <button
                                onClick={() => setMatModal({ open: true, categoryId: cat.id, title: "", videoUrl: "" })}
                                className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-green-50 transition-colors group"
                                title="Tambah materi"
                              >
                                <Plus className="w-3 h-3 text-slate-400 group-hover:text-green-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat)}
                                className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50 transition-colors group"
                                title="Hapus kategori"
                              >
                                <Trash2 className="w-3 h-3 text-slate-400 group-hover:text-red-500" />
                              </button>
                            </div>
                          </div>
                          {/* Materials */}
                          <div className="divide-y divide-slate-50">
                            {cat.materials.length === 0 ? (
                              <p className="text-xs text-slate-400 italic px-4 py-3">Belum ada materi.</p>
                            ) : (
                              cat.materials.map((mat) => (
                                <div key={mat.id} className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    {mat.videoUrl
                                      ? <Video className="w-4 h-4 text-[#E10600] flex-shrink-0" />
                                      : <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    }
                                    <span className="text-sm font-semibold text-[#0F172A]">{mat.title}</span>
                                    {mat.videoUrl && (
                                      <a href={mat.videoUrl} target="_blank" rel="noreferrer"
                                        className="text-[10px] text-blue-500 hover:underline font-bold" onClick={(e) => e.stopPropagation()}>
                                        [Video]
                                      </a>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => setMatModal({ open: true, categoryId: cat.id, matId: mat.id, title: mat.title, videoUrl: mat.videoUrl || "" })}
                                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 flex items-center justify-center transition-colors group"
                                    >
                                      <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMaterial(mat)}
                                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 flex items-center justify-center transition-colors group"
                                    >
                                      <Trash2 className="w-3 h-3 text-slate-400 group-hover:text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    {/* Add category button */}
                    <button
                      onClick={() => setCatModal({ open: true, beltId: belt.id, name: "" })}
                      className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-400 hover:text-[#0F172A] hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Tambah Kategori (Poomsae / Teknik Dasar / Fisik)
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          Modals
         ══════════════════════════════════════════════ */}

      {/* Belt Modal */}
      {beltModal.open && (
        <Modal
          title={beltModal.mode === "add" ? "Tambah Sabuk Baru" : `Edit: ${beltModal.form.name}`}
          onClose={() => setBeltModal({ open: false, mode: "add", form: {} })}
          onSave={handleSaveBelt}
          saving={saving}
        >
          <BeltFormFields
            form={beltModal.form}
            onChange={(f) => setBeltModal(prev => ({ ...prev, form: f }))}
            uploading={uploading}
            onUploadImage={handleUploadBeltImage}
          />
        </Modal>
      )}

      {/* Category Modal */}
      {catModal.open && (
        <Modal
          title={catModal.catId ? "Edit Kategori" : "Tambah Kategori"}
          onClose={() => setCatModal({ open: false, beltId: "", name: "" })}
          onSave={handleSaveCategory}
          saving={saving}
        >
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Nama Kategori *</label>
            <input
              type="text"
              placeholder="Contoh: Poomsae, Teknik Dasar, Fisik"
              value={catModal.name}
              onChange={(e) => setCatModal(prev => ({ ...prev, name: e.target.value }))}
              className="w-full h-11 bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 text-sm font-semibold text-[#0F172A] focus:ring-2 focus:ring-[#E10600] outline-none"
            />
          </div>
        </Modal>
      )}

      {/* Material Modal */}
      {matModal.open && (
        <Modal
          title={matModal.matId ? "Edit Materi" : "Tambah Materi"}
          onClose={() => setMatModal({ open: false, categoryId: "", title: "", videoUrl: "" })}
          onSave={handleSaveMaterial}
          saving={saving}
        >
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Nama Materi *</label>
            <input
              type="text"
              placeholder="Contoh: Ap Chagi, Taegeuk Il Jang"
              value={matModal.title}
              onChange={(e) => setMatModal(prev => ({ ...prev, title: e.target.value }))}
              className="w-full h-11 bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 text-sm font-semibold text-[#0F172A] focus:ring-2 focus:ring-[#E10600] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">URL Video (Opsional)</label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={matModal.videoUrl}
              onChange={(e) => setMatModal(prev => ({ ...prev, videoUrl: e.target.value }))}
              className="w-full h-11 bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 text-sm font-semibold text-[#0F172A] focus:ring-2 focus:ring-[#E10600] outline-none"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
