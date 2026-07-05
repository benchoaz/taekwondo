"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, CreditCard, CheckCircle, AlertCircle, Loader2, 
  DollarSign, Calendar, UserCheck, ShieldAlert 
} from "lucide-react";
import BottomNav from "../_components/BottomNav";

interface SppInvoice {
  id: string;
  month: number;
  year: number;
  amount: number;
  status: string;
  payment?: {
    paymentMethod?: string;
    paidAt?: string;
    receivedById?: string;
    externalId?: string;
    receiver?: {
      name: string;
    } | null;
  } | null;
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function SppPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<SppInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMonthIndex, setActiveMonthIndex] = useState<number | null>(null);
  
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetch("/api/spp")
      .then(r => { 
        if (!r.ok && (r.status === 401 || r.status === 403)) {
          router.replace("/m/login"); 
        }
        return r.json(); 
      })
      .then(data => { 
        if (Array.isArray(data)) {
          setInvoices(data); 
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const getMonthInvoice = (monthIndex: number) => {
    // Cari invoice untuk bulan ini pada tahun berjalan
    return invoices.find(inv => inv.month === (monthIndex + 1) && inv.year === currentYear);
  };

  // Hitung total tunggakan tahun berjalan
  const currentYearUnpaid = invoices.filter(
    i => i.year === currentYear && (i.status === "PENDING" || i.status === "UNPAID")
  );
  const totalUnpaid = currentYearUnpaid.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="flex-1 flex flex-col pb-28 bg-[#020617] text-white min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 pt-12 pb-6 px-5 border-b-4 border-[#334155]">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-400 text-xs mb-4">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center animate-game-float">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-black text-lg uppercase tracking-wide">Laporan SPP {currentYear}</h1>
            <p className="text-slate-400 text-xs">Status iuran bulanan dari Januari s.d Desember</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Total Tunggakan Tahun Ini */}
        {currentYearUnpaid.length > 0 && (
          <div className="game-card p-4 game-border-red shadow-[0_4px_12px_rgba(225,6,0,0.15)]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-0.5">TUNGGAKAN TAHUN {currentYear}</p>
                <p className="text-2xl font-black text-white">
                  Rp {totalUnpaid.toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Segera lunasi iuran yang tertunda</p>
              </div>
              <span className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-xs shrink-0">
                {currentYearUnpaid.length}x
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#E10600] animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Daftar Bulan (Januari - Desember)</p>
            
            {MONTHS.map((name, index) => {
              const inv = getMonthInvoice(index);
              const isSelected = activeMonthIndex === index;
              
              let statusBadge = (
                <span className="text-[9px] font-black bg-slate-900 text-slate-500 border border-slate-800 px-3 py-1 rounded-full">
                  BELUM DITAGIH
                </span>
              );
              let cardBorder = "border-slate-800/80 bg-slate-950/40 opacity-70";
              let amountText = "-";

              if (inv) {
                amountText = `Rp ${inv.amount.toLocaleString("id-ID")}`;
                if (inv.status === "PAID") {
                  statusBadge = (
                    <span className="text-[9px] font-black bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> LUNAS
                    </span>
                  );
                  cardBorder = "border-slate-800 bg-slate-950/80";
                } else {
                  statusBadge = (
                    <span className="text-[9px] font-black bg-red-950/80 text-[#E10600] border border-red-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> BELUM BAYAR
                    </span>
                  );
                  cardBorder = "border-red-950/30 bg-slate-950/80";
                }
              }

              return (
                <div key={name} className="flex flex-col">
                  {/* Month Row Button */}
                  <button
                    onClick={() => setActiveMonthIndex(isSelected ? null : index)}
                    className={`game-card p-4 transition-all text-left flex items-center justify-between border-2 ${cardBorder} ${
                      isSelected ? "ring-1 ring-[#E10600] border-transparent" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        inv?.status === "PAID" 
                          ? "bg-slate-900 border-slate-700 text-slate-400" 
                          : inv 
                            ? "bg-red-500/10 border-red-500/20 text-[#E10600]" 
                            : "bg-slate-950 border-slate-900 text-slate-700"
                      }`}>
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-wide">{name}</p>
                        <p className="text-slate-400 text-xs font-bold mt-0.5">{amountText}</p>
                      </div>
                    </div>
                    <div>
                      {statusBadge}
                    </div>
                  </button>

                  {/* Expanded Detail Panel */}
                  {isSelected && (
                    <div className="bg-slate-950 border-x-2 border-b-2 border-slate-800 p-4 rounded-b-2xl -mt-2 mb-2 flex flex-col gap-3 relative z-10">
                      {!inv ? (
                        <div className="py-4 text-center">
                          <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="font-bold text-slate-500 text-xs uppercase">Belum Ada Tagihan</p>
                          <p className="text-[10px] text-slate-600 mt-1 max-w-[240px] mx-auto leading-relaxed">
                            Tagihan SPP bulan ini belum diterbitkan oleh pihak Dojang/Admin.
                          </p>
                        </div>
                      ) : inv.status === "PAID" ? (
                        <div className="flex flex-col gap-2.5 text-[11px] text-slate-400">
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-500 uppercase tracking-wide">Metode Pembayaran</span>
                            <span className="font-black text-white uppercase">{inv.payment?.paymentMethod || "MANUAL"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-500 uppercase tracking-wide">Tanggal Bayar</span>
                            <span className="font-bold text-white">
                              {inv.payment?.paidAt ? new Date(inv.payment.paidAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-500 uppercase tracking-wide">Divalidasi Oleh</span>
                            <span className="font-bold text-emerald-400 uppercase flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {inv.payment?.receiver?.name 
                                  ? `Sabeum ${inv.payment.receiver.name}` 
                                  : inv.payment?.paymentMethod === "QRIS_ONLINE" 
                                    ? "Sistem Otomatis (QRIS)" 
                                    : "Sabeum Dojang"
                                }
                              </span>
                            </span>
                          </div>
                          {inv.payment?.externalId && (
                            <div className="flex justify-between">
                              <span className="font-bold text-slate-500 uppercase tracking-wide">Referensi ID</span>
                              <span className="font-mono text-slate-300 text-[10px] truncate max-w-[150px]">{inv.payment.externalId}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-500 uppercase">Iuran SPP</span>
                            <span className="font-black text-red-400">Rp {inv.amount.toLocaleString("id-ID")}</span>
                          </div>
                          <button
                            onClick={() => router.push(`/m/spp/pay?invoiceId=${inv.id}`)}
                            className="w-full btn-battle py-2.5 flex items-center justify-center gap-1.5 font-black text-xs"
                          >
                            <DollarSign className="w-4 h-4" /> BAYAR SPP SEKARANG
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
