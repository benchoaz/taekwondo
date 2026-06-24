"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Send, CheckCircle, Clock, AlertCircle, X, Banknote, Filter } from "lucide-react";

interface Member {
  id: string;
  fullName: string;
  memberNumber: string;
}

interface Payment {
  id: string;
  status: string;
  paymentProofUrl?: string;
  externalId?: string;
}

interface SppInvoice {
  id: string;
  memberId: string;
  member: Member;
  month: number;
  year: number;
  amount: number;
  dueDate: string;
  status: string;
  paymentId?: string;
  payment?: Payment;
}

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function SppManagement() {
  const [invoices, setInvoices] = useState<SppInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReminding, setIsReminding] = useState(false);

  const [targetMonth, setTargetMonth] = useState(new Date().getMonth() + 1);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());

  // Filter
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterMonth, setFilterMonth] = useState<number>(0); // 0 = semua bulan

  // Modal konfirmasi lunas manual
  const [selectedInvoice, setSelectedInvoice] = useState<SppInvoice | null>(null);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [catatanAdmin, setCatatanAdmin] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/spp");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInvoices = async () => {
    if (!confirm(`Generate tagihan SPP bulan ${monthNames[targetMonth - 1]} ${targetYear} untuk SEMUA member aktif?`)) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/spp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: targetMonth, year: targetYear })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchInvoices();
      } else {
        alert(data.error || "Gagal generate SPP");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendReminders = async () => {
    if (!confirm("Kirim pengingat WhatsApp ke semua member yang menunggak (OVERDUE)?")) return;
    setIsReminding(true);
    try {
      const res = await fetch("/api/whatsapp/remind", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchInvoices();
      } else {
        alert(data.error || "Gagal mengirim reminder");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReminding(false);
    }
  };

  // ─── Konfirmasi Lunas Manual ───────────────────────────────────────
  const handleMarkAsPaid = async () => {
    if (!selectedInvoice?.paymentId) {
      alert("Invoice ini tidak memiliki Payment ID. Silakan generate ulang.");
      return;
    }
    setIsMarkingPaid(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-status",
          id: selectedInvoice.paymentId,
          status: "COMPLETED",
          note: catatanAdmin || "Pembayaran tunai/transfer dicatat manual oleh admin"
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ SPP ${monthNames[selectedInvoice.month - 1]} ${selectedInvoice.year} untuk ${selectedInvoice.member.fullName} telah dicatat sebagai LUNAS.`);
        setSelectedInvoice(null);
        setCatatanAdmin("");
        fetchInvoices();
      } else {
        alert(data.error || "Gagal memperbarui status");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan");
    } finally {
      setIsMarkingPaid(false);
    }
  };

  // ─── Filter Logic ───────────────────────────────────────────────────
  const filteredInvoices = invoices.filter(inv => {
    const statusMatch = filterStatus === "ALL" || inv.status === filterStatus;
    const monthMatch = filterMonth === 0 || inv.month === filterMonth;
    return statusMatch && monthMatch;
  });

  // ─── Stats ──────────────────────────────────────────────────────────
  const totalPaid = invoices.filter(i => i.status === "PAID").length;
  const totalUnpaid = invoices.filter(i => i.status === "UNPAID").length;
  const totalOverdue = invoices.filter(i => i.status === "OVERDUE").length;
  const totalRevenue = invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-[#0F172A] font-display">Manajemen SPP Online</h2>
          <p className="text-gray-500 text-sm mt-1">Generate tagihan, konfirmasi lunas manual, dan kirim pengingat WhatsApp.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Lunas", val: totalPaid, color: "text-green-600", bg: "bg-green-50" },
          { label: "Belum Bayar", val: totalUnpaid, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Menunggak", val: totalOverdue, color: "text-red-600", bg: "bg-red-50" },
          { label: "Pendapatan SPP", val: `Rp ${totalRevenue.toLocaleString("id-ID")}`, color: "text-[#0F172A]", bg: "bg-blue-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-5 flex flex-col gap-1`}>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{s.label}</span>
            <span className={`text-2xl font-black ${s.color}`}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Generate Tagihan */}
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A]">Generate Tagihan Baru</h3>
              <p className="text-xs text-gray-500">Buat tagihan otomatis untuk semua member aktif</p>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={targetMonth}
              onChange={e => setTargetMonth(parseInt(e.target.value))}
              className="w-1/2 bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-2 text-sm outline-none"
            >
              {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <input
              type="number"
              value={targetYear}
              onChange={e => setTargetYear(parseInt(e.target.value))}
              className="w-1/2 bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-2 text-sm outline-none"
            />
          </div>
          <button
            onClick={handleGenerateInvoices}
            disabled={isGenerating}
            className="w-full bg-[#0F172A] text-white py-3 rounded-xl font-bold text-xs hover:bg-black transition-colors disabled:opacity-50"
          >
            {isGenerating ? "⏳ Proses Generate..." : "⚡ Generate Tagihan"}
          </button>
        </div>

        {/* Blast Reminder WA */}
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A]">Pengingat Tunggakan</h3>
              <p className="text-xs text-gray-500">Kirim WhatsApp otomatis ke member yang telat bayar</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] rounded-xl border border-red-100 p-4">
            <p className="text-xs text-red-600 text-center font-medium">
              Sistem akan mengupdate status UNPAID → OVERDUE dan mengirim WA ke semua member yang melewati jatuh tempo.
            </p>
          </div>
          <button
            onClick={handleSendReminders}
            disabled={isReminding}
            className="w-full bg-[#E10600] text-white py-3 rounded-xl font-bold text-xs shadow-md hover:bg-[#C00500] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isReminding ? "⏳ Mengirim..." : "📱 Kirim Blast Pengingat (WA)"}
          </button>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Header + Filter */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-3">
            <h3 className="font-extrabold text-[#0F172A]">Daftar Tagihan SPP</h3>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{filteredInvoices.length} Data</span>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(parseInt(e.target.value))}
              className="bg-[#F8FAFC] border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none"
            >
              <option value={0}>Semua Bulan</option>
              {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-[#F8FAFC] border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="UNPAID">Belum Bayar</option>
              <option value="OVERDUE">Menunggak</option>
              <option value="PAID">Lunas</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-[#E10600] border-t-transparent rounded-full animate-spin"></div></div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">Belum ada tagihan SPP yang sesuai filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#0F172A]/5">
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Periode</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tagihan</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Jatuh Tempo</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#0F172A]/5">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#0F172A]">{inv.member?.fullName}</div>
                      <div className="text-[10px] text-gray-500">No: {inv.member?.memberNumber}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-600">
                      {monthNames[inv.month - 1]} {inv.year}
                    </td>
                    <td className="p-4 font-bold text-[#E10600]">
                      Rp {inv.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {new Date(inv.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="p-4">
                      {inv.status === "PAID" && (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3" /> LUNAS
                        </span>
                      )}
                      {inv.status === "UNPAID" && (
                        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                          <Clock className="w-3 h-3" /> BELUM BAYAR
                        </span>
                      )}
                      {inv.status === "OVERDUE" && (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                          <AlertCircle className="w-3 h-3" /> MENUNGGAK
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {inv.status !== "PAID" ? (
                        <button
                          onClick={() => { setSelectedInvoice(inv); setCatatanAdmin(""); }}
                          className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          <Banknote className="w-3.5 h-3.5" /> Tandai Lunas
                        </button>
                      ) : (
                        <span className="text-[10px] text-green-500 font-bold">✓ Sudah Lunas</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Konfirmasi Lunas Manual ── */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 flex justify-between items-start">
              <div>
                <span className="text-[10px] text-green-200 font-bold uppercase tracking-wider">Konfirmasi Pembayaran Manual</span>
                <h3 className="text-xl font-black text-white mt-0.5">Tandai Lunas</h3>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-5">
              {/* Detail tagihan */}
              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-3 border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-semibold">Member</span>
                  <span className="text-sm font-black text-[#0F172A]">{selectedInvoice.member.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-semibold">Periode SPP</span>
                  <span className="text-sm font-bold text-[#0F172A]">{monthNames[selectedInvoice.month - 1]} {selectedInvoice.year}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                  <span className="text-xs text-gray-500 font-semibold">Total Tagihan</span>
                  <span className="text-lg font-black text-[#E10600]">Rp {selectedInvoice.amount.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Catatan Admin */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Catatan Pembayaran (Opsional)</label>
                <textarea
                  value={catatanAdmin}
                  onChange={e => setCatatanAdmin(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Dibayar tunai ke pelatih Ahmad, Selasa 24 Juni 2026"
                  className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-[10px] text-yellow-800 font-medium">
                ⚠️ Tindakan ini akan mengubah status tagihan menjadi <strong>LUNAS</strong> dan mengirim notifikasi WhatsApp ke member (jika nomor HP tersedia).
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-1/3 bg-slate-100 text-gray-600 py-3 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleMarkAsPaid}
                disabled={isMarkingPaid}
                className="w-2/3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-xl font-black text-xs shadow-lg shadow-green-500/25 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {isMarkingPaid ? "Memproses..." : "Konfirmasi LUNAS"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
