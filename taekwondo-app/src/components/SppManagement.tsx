"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";

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

export default function SppManagement() {
  const [invoices, setInvoices] = useState<SppInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReminding, setIsReminding] = useState(false);

  const [targetMonth, setTargetMonth] = useState(new Date().getMonth() + 1);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());

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
    if (!confirm(`Apakah Anda yakin ingin meng-generate tagihan SPP untuk bulan ${targetMonth} tahun ${targetYear} untuk SEMUA member aktif?`)) return;
    
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

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-[#0F172A] font-display">Manajemen SPP Online</h2>
          <p className="text-gray-500 text-sm mt-1">Generate tagihan bulanan dan otomatisasi pengingat WhatsApp.</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A]">Generate Tagihan Baru</h3>
              <p className="text-xs text-gray-500">Buat tagihan untuk semua member aktif</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <select 
              value={targetMonth} 
              onChange={e => setTargetMonth(parseInt(e.target.value))}
              className="w-1/2 bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-2 text-sm outline-none"
            >
              {monthNames.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
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
            {isGenerating ? "Proses Generate..." : "Generate Tagihan"}
          </button>
        </div>

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
            <p className="text-xs text-red-600 text-center font-medium">Sistem akan mengecek status UNPAID yang melewati tanggal jatuh tempo (tanggal 10).</p>
          </div>
          
          <button 
            onClick={handleSendReminders}
            disabled={isReminding}
            className="w-full bg-[#E10600] text-white py-3 rounded-xl font-bold text-xs shadow-md hover:bg-[#C00500] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isReminding ? "Mengirim..." : "Kirim Blast Pengingat (WA)"}
          </button>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-extrabold text-[#0F172A]">Daftar Tagihan SPP</h3>
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{invoices.length} Data</span>
        </div>
        
        {isLoading ? (
          <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-[#E10600] border-t-transparent rounded-full animate-spin"></div></div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">Belum ada tagihan SPP yang digenerate.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#0F172A]/5">
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Periode</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tagihan</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#0F172A]/5">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#0F172A]">{inv.member?.fullName}</div>
                      <div className="text-[10px] text-gray-500">ID: {inv.member?.memberNumber}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-600">
                      {monthNames[inv.month - 1]} {inv.year}
                    </td>
                    <td className="p-4 font-bold text-[#E10600]">
                      Rp {inv.amount.toLocaleString("id-ID")}
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
                      <a 
                        href={`/payment/${inv.paymentId}`} 
                        target="_blank"
                        className="text-[10px] text-blue-600 font-bold hover:underline"
                      >
                        Lihat Link Bayar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
