"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, DollarSign, X, Gamepad, Award, Sparkles, ChevronRight, Zap } from "lucide-react";

interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  rarity: string;
  price: number;
  imageUrl: string | null;
  previewUrl: string | null;
  cssValue: string | null;
  isActive: boolean;
  isLimited: boolean;
  sortOrder: number;
}

export default function GamificationManagement() {
  const [activeTab, setActiveTab] = useState<"shop" | "coins">("shop");
  
  // Shop State
  const [items, setItems] = useState<ShopItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", description: "", type: "PROFILE_FRAME", rarity: "COMMON", 
    price: 0, imageUrl: "", cssValue: "", sortOrder: 0
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("type", "gallery"); // Uses gallery type for public CDN/VPS storage

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        alert(data.error || "Gagal mengupload gambar");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengupload gambar");
    } finally {
      setIsUploading(false);
    }
  };

  // Coin State
  const [memberId, setMemberId] = useState("");
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [coinDescription, setCoinDescription] = useState("");
  const [isProcessingCoin, setIsProcessingCoin] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoadingItems(true);
    try {
      const res = await fetch("/api/admin/gamification/shop");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingItem ? `/api/admin/gamification/shop/${editingItem.id}` : `/api/admin/gamification/shop`;
    const method = editingItem ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchItems();
      } else {
        alert("Gagal menyimpan item");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Hapus item ini dari toko? Tindakan ini tidak dapat dibatalkan.")) return;
    
    try {
      const res = await fetch(`/api/admin/gamification/shop/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleProcessCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || coinAmount === 0) return alert("ID Member dan Jumlah Koin tidak valid");

    setIsProcessingCoin(true);
    try {
      const res = await fetch("/api/admin/gamification/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, amount: coinAmount, description: coinDescription }),
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(`Berhasil! Saldo Koin Dojang member sekarang: ${data.newBalance} DC`);
        setMemberId("");
        setCoinAmount(0);
        setCoinDescription("");
      } else {
        alert(data.error || "Gagal memproses koin");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    } finally {
      setIsProcessingCoin(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[600px] flex flex-col font-sans overflow-hidden">
      {/* Premium Header */}
      <div className="relative border-b border-slate-100 px-8 py-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-red-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-black text-white tracking-tight">Gamification Center</h2>
            </div>
            <p className="text-sm text-slate-400 font-medium max-w-md">Bangun loyalitas dan semangat member melalui sistem koin & toko virtual eksklusif.</p>
          </div>
          
          <div className="flex bg-slate-800/80 backdrop-blur-sm p-1.5 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setActiveTab("shop")}
              className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === "shop" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}
            >
              <Gamepad className="w-4 h-4 mr-2" />
              Toko Virtual
            </button>
            <button
              onClick={() => setActiveTab("coins")}
              className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === "coins" ? "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Koin Member
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 flex-grow bg-slate-50/50">
        {/* SHOP TAB */}
        {activeTab === "shop" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Katalog Item</h3>
                <p className="text-sm text-slate-500 mt-1">Item yang dijual di aplikasi member</p>
              </div>
              <button 
                onClick={() => {
                  setEditingItem(null);
                  setFormData({ name: "", description: "", type: "PROFILE_FRAME", rarity: "COMMON", price: 0, imageUrl: "", cssValue: "", sortOrder: 0 });
                  setIsModalOpen(true);
                }}
                className="group relative px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-slate-900/20 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Item Baru
                </div>
              </button>
            </div>

            {/* Permanent AI Asset Generator Instructions Card */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-2xl p-6 text-white border border-indigo-500/20 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-3xl pointer-events-none"></div>
              <div className="relative flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-indigo-200">Panduan & Prompt AI Pembuatan Aset Gambar Toko</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  Gunakan petunjuk di bawah ini untuk membuat gambar item toko gamifikasi secara instan menggunakan AI. Salin prompt ke generator gambar AI favorit Anda seperti **Canva Magic Media** atau **Midjourney**, lalu upload hasilnya ke form **"Buat Item Baru"**.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">1. Bingkai Profil (Frame)</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Wajib berdimensi 1:1 (Kotak) dan latar belakang transparan/bolong tengahnya.
                    </p>
                    <code className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-[9px] font-mono text-indigo-200 select-all block leading-tight">
                      Circular avatar profile frame border (aspect ratio 1:1, size 512x512 pixels), taekwondo belt wrapped around border style, glowing neon red and cyan accents, clean transparent hollow center inside circle, game asset, solid black background --ar 1:1
                    </code>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">2. Gelar / Spanduk (Title)</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Berdimensi memanjang horizontal (Landscape) untuk papan gelar siswa.
                    </p>
                    <code className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-[9px] font-mono text-indigo-200 select-all block leading-tight">
                      Horizontal title banner plate (aspect ratio 16:4, size 1024x256 pixels), luxury golden banner ribbon overlay, game user interface asset, premium dark gold details, red highlights, modern taekwondo style, glowing lighting, black clean background, 3D style asset --ar 4:1
                    </code>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">3. Lencana Khusus (Emblem)</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Lencana bulat/perisai berdimensi 1:1 untuk ikon khusus di profil siswa.
                    </p>
                    <code className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-[9px] font-mono text-indigo-200 select-all block leading-tight">
                      Mythical white tiger head shield emblem logo badge (aspect ratio 1:1, size 512x512 pixels), futuristic taekwondo champions style, shiny metallic gold and red glow borders, game asset badge design, solid dark blue background, clean 3D render --ar 1:1
                    </code>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">4. Tema Profil (Theme)</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Latar belakang kartu anggota (VIP Card) profil berdimensi landscape 16:9.
                    </p>
                    <code className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-[9px] font-mono text-indigo-200 select-all block leading-tight">
                      Minimalist gaming profile dashboard card theme template background (aspect ratio 16:9, size 1920x1080 pixels), cyber red white tiger neon pattern grid, premium abstract dark card UI design --ar 16:9
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Preview Item</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kelangkaan</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Harga</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {isLoadingItems ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Toko masih kosong. Mulai buat item pertama Anda!</td></tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden mr-4 bg-slate-100 border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Award className="w-6 h-6 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</div>
                              <div className="text-xs text-slate-500 max-w-[200px] truncate mt-0.5" title={item.description || ""}>{item.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {item.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                            item.rarity === 'LEGENDARY' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            item.rarity === 'EPIC' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' :
                            item.rarity === 'RARE' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {item.rarity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-black text-amber-500">
                            <Zap className="w-4 h-4 fill-amber-500" />
                            {item.price.toLocaleString()} DC
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setEditingItem(item);
                                setFormData({
                                  name: item.name, description: item.description || "", type: item.type, rarity: item.rarity,
                                  price: item.price, imageUrl: item.imageUrl || "", cssValue: item.cssValue || "", sortOrder: item.sortOrder
                                });
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COINS TAB */}
        {activeTab === "coins" && (
          <div className="max-w-xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
              {/* Abstract decorative background */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="text-center mb-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-400/30 transform -rotate-6">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Manual Coin Transfer</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium">Top-up koin hadiah turnamen atau kurangi saldo untuk penalti.</p>
              </div>

              <form onSubmit={handleProcessCoins} className="space-y-6 relative z-10">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">ID Member Target</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 12345678"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Jumlah Koin (Dojang Coin)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                    </div>
                    <input
                      type="number"
                      required
                      placeholder="5000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-lg font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300"
                      value={coinAmount || ""}
                      onChange={(e) => setCoinAmount(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Keterangan Transaksi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hadiah Juara 1 Kejurda"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
                    value={coinDescription}
                    onChange={(e) => setCoinDescription(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessingCoin}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-4 font-bold transition-all flex justify-center items-center gap-2 group active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-xl shadow-slate-900/20"
                >
                  {isProcessingCoin ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Proses Transaksi Koin
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* PREMIUM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900">{editingItem ? "Edit Spesifikasi Item" : "Desain Item Baru"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form id="item-form" onSubmit={handleSaveItem} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Nama Item</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Deskripsi Memikat</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Kategori</label>
                    <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                      <option value="PROFILE_FRAME">Bingkai Profil (FRAME)</option>
                      <option value="TITLE">Gelar (TITLE)</option>
                      <option value="THEME">Tema Profil (THEME)</option>
                      <option value="EMBLEM">Lencana Khusus (EMBLEM)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Kelangkaan</label>
                    <select required value={formData.rarity} onChange={e => setFormData({...formData, rarity: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                      <option value="COMMON">Common (Biasa)</option>
                      <option value="RARE">Rare (Langka)</option>
                      <option value="EPIC">Epic (Epik)</option>
                      <option value="LEGENDARY">Legendary (Sangat Langka)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Harga Jual (DC)</label>
                    <input type="number" required min={0} value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-amber-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Urutan Tampil</label>
                    <input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700">File Gambar / Bingkai (PNG Transparan)</label>
                    <div className="flex gap-4 items-center">
                      <div className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                        {formData.imageUrl ? (
                          <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                          <Award className="w-8 h-8 text-slate-300" />
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow space-y-2">
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleImageUpload} 
                          className="hidden" 
                          id="item-image-file" 
                        />
                        <label 
                          htmlFor="item-image-file" 
                          className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                        >
                          Pilih Gambar
                        </label>
                        <input 
                          type="text" 
                          placeholder="Atau masukkan URL manual: /shop/frame.png" 
                          value={formData.imageUrl} 
                          onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                        />
                      </div>
                    </div>
                    
                    {/* AI Prompt generator helper */}
                    <div className="mt-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                        <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">Asisten Pembuat Gambar AI (Canva / Midjourney)</span>
                      </div>
                      <p className="text-[11px] text-indigo-800 leading-relaxed">
                        Salin perintah di bawah ini ke Canva Magic Media atau generator AI Anda untuk mendapatkan desain yang presisi dan premium:
                      </p>
                      
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 relative group">
                        <code className="text-[10px] font-mono text-indigo-200 block whitespace-pre-wrap select-all leading-relaxed">
                          {formData.type === "PROFILE_FRAME" && (
                            "Circular avatar profile frame border (aspect ratio 1:1, size 512x512 pixels), taekwondo belt wrapped around border style, glowing neon red and cyan accents, clean transparent hollow center inside circle, game asset, solid black background, highly detailed rendering --ar 1:1"
                          )}
                          {formData.type === "TITLE" && (
                            "Horizontal title banner plate (aspect ratio 16:4, size 1024x256 pixels), luxury golden banner ribbon overlay, game user interface asset, premium dark gold details, red highlights, modern taekwondo style, glowing lighting, black clean background, 3D style asset --ar 4:1"
                          )}
                          {formData.type === "EMBLEM" && (
                            "Mythical white tiger head shield emblem logo badge (aspect ratio 1:1, size 512x512 pixels), futuristic taekwondo champions style, shiny metallic gold and red glow borders, game asset badge design, solid dark blue background, clean 3D render --ar 1:1"
                          )}
                          {formData.type === "THEME" && (
                            "Minimalist gaming profile dashboard card theme template background (aspect ratio 16:9, size 1920x1080 pixels), cyber red white tiger neon pattern grid, premium abstract dark card UI design --ar 16:9"
                          )}
                        </code>
                      </div>
                      <div className="text-[10px] text-indigo-500 font-bold flex items-center justify-between">
                        <span>💡 Tips: Pilih gaya "3D" atau "Concept Art" di Canva untuk hasil terbaik.</span>
                        <span className="text-indigo-600">Klik teks untuk menyalin</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Penting: Jika mengupload Bingkai, gunakan format **PNG dengan latar belakang transparan (bolong tengahnya)** agar menyatu dengan foto profil member.</p>
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">CSS Injector (Penerapan Gaya di App)</label>
                    <input type="text" placeholder="Contoh: border: 3px solid #3b82f6; border-radius: 50%; box-shadow: 0 0 10px #3b82f6;" value={formData.cssValue} onChange={e => setFormData({...formData, cssValue: e.target.value})} className="w-full bg-slate-900 border border-slate-800 text-slate-300 font-mono rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
                    <p className="text-xs text-slate-500 mt-1.5">Sintaks CSS yang akan dirender langsung oleh aplikasi (*engine* profil).</p>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors">
                Batalkan
              </button>
              <button type="submit" form="item-form" className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-slate-900/20">
                {editingItem ? "Perbarui Item" : "Rilis ke Toko"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
