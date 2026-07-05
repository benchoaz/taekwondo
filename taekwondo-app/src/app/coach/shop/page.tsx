"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Coins, ShoppingBag, Edit, Trash2, Plus, Check, X } from "lucide-react";

const TYPES = ["PROFILE_FRAME", "TITLE", "THEME", "EMBLEM"];
const RARITIES = ["COMMON", "RARE", "EPIC", "LEGENDARY"];
const RARITY_COLORS: Record<string, string> = {
  COMMON: "#94a3b8", RARE: "#3b82f6", EPIC: "#a855f7", LEGENDARY: "#FFD700"
};

interface ShopItem {
  id: string; name: string; description?: string;
  type: string; rarity: string; price: number;
  cssValue?: string; isActive: boolean; isLimited: boolean; sortOrder: number;
  _count: { purchases: number };
}

export default function CoachShopPage() {
  const router = useRouter();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ShopItem | null>(null);
  const [form, setForm] = useState({ name: "", description: "", type: "PROFILE_FRAME", rarity: "COMMON", price: "100", cssValue: "", isLimited: false, sortOrder: "0" });
  const [status, setStatus] = useState("");
  // Grant coins form
  const [memberId, setMemberId] = useState("");
  const [grantAmount, setGrantAmount] = useState("100");
  const [grantDesc, setGrantDesc] = useState("");

  const fetchItems = async () => {
    const res = await fetch("/api/coach/shop");
    const json = await res.json();
    if (json.success) setItems(json.data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Menyimpan...");
    const method = editItem ? "PUT" : "POST";
    const body = editItem ? { ...form, id: editItem.id } : form;
    const res = await fetch("/api/coach/shop", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    if (json.success) {
      setStatus("✅ Berhasil disimpan!");
      setShowForm(false); setEditItem(null);
      setForm({ name: "", description: "", type: "PROFILE_FRAME", rarity: "COMMON", price: "100", cssValue: "", isLimited: false, sortOrder: "0" });
      fetchItems();
    } else {
      setStatus("❌ " + json.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus item ini?")) return;
    const res = await fetch("/api/coach/shop", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if ((await res.json()).success) fetchItems();
  };

  const handleToggleActive = async (item: ShopItem) => {
    await fetch("/api/coach/shop", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, isActive: !item.isActive }) });
    fetchItems();
  };

  const handleGrantCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Memberikan koin...");
    const res = await fetch("/api/coach/shop/grant-coins", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, amount: parseInt(grantAmount), description: grantDesc })
    });
    const json = await res.json();
    setStatus(json.success ? `✅ Koin diberikan! Saldo baru: ${json.newBalance} DC` : "❌ " + json.error);
  };

  const openEdit = (item: ShopItem) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || "", type: item.type, rarity: item.rarity, price: item.price.toString(), cssValue: item.cssValue || "", isLimited: item.isLimited, sortOrder: item.sortOrder.toString() });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f5] py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><ShoppingBag className="text-purple-600" /> Manajemen Toko Dojang</h1>
            <p className="text-slate-500 text-sm">Kelola item kosmetik yang bisa dibeli murid dengan Dojang Coin</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditItem(null); }} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-purple-700 transition">
            <Plus className="w-4 h-4" /> Tambah Item
          </button>
        </div>

        {status && <div className="mb-4 p-3 rounded-xl text-sm font-bold bg-white border border-slate-200">{status}</div>}

        {/* Grant Coins Panel */}
        <div className="bg-white rounded-2xl shadow p-5 mb-6 border border-yellow-200">
          <h2 className="font-black text-slate-800 mb-3 flex items-center gap-2"><Coins className="w-4 h-4 text-yellow-500" /> Berikan Dojang Coin Manual</h2>
          <form onSubmit={handleGrantCoins} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ID Member</label>
              <input required value={memberId} onChange={e => setMemberId(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-52" placeholder="UUID member..." />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Jumlah DC</label>
              <input required type="number" value={grantAmount} onChange={e => setGrantAmount(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-24" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Keterangan</label>
              <input value={grantDesc} onChange={e => setGrantDesc(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-52" placeholder="Juara turnamen..." />
            </div>
            <button type="submit" className="bg-yellow-500 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition">🪙 Berikan</button>
          </form>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-black text-slate-600">Item</th>
                <th className="text-left px-4 py-3 font-black text-slate-600">Tipe</th>
                <th className="text-left px-4 py-3 font-black text-slate-600">Rarity</th>
                <th className="text-left px-4 py-3 font-black text-slate-600">Harga</th>
                <th className="text-left px-4 py-3 font-black text-slate-600">Pembeli</th>
                <th className="text-left px-4 py-3 font-black text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-black text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-slate-500">{item.type}</td>
                  <td className="px-4 py-3">
                    <span className="font-black text-xs px-2 py-1 rounded-full" style={{ color: RARITY_COLORS[item.rarity], backgroundColor: RARITY_COLORS[item.rarity] + "22" }}>{item.rarity}</span>
                  </td>
                  <td className="px-4 py-3 font-black text-yellow-600">🪙 {item.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-600">{item._count.purchases} murid</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleActive(item)} className={`text-xs font-black px-2 py-1 rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                      {item.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-800">{editItem ? "Edit Item" : "Tambah Item Baru"}</h3>
                <button onClick={() => { setShowForm(false); setEditItem(null); }}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama item" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi..." rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Tipe</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Rarity</label>
                    <select value={form.rarity} onChange={e => setForm({ ...form, rarity: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                      {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Harga (DC)</label>
                    <input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Sort Order</label>
                    <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                <input value={form.cssValue} onChange={e => setForm({ ...form, cssValue: e.target.value })} placeholder="CSS value (warna/gradient untuk bingkai/tema)" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={form.isLimited} onChange={e => setForm({ ...form, isLimited: e.target.checked })} />
                  Item Edisi Terbatas
                </label>
                <button type="submit" className="w-full bg-purple-600 text-white font-black py-3 rounded-xl hover:bg-purple-700 transition">
                  {editItem ? "Simpan Perubahan" : "Tambah ke Toko"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
