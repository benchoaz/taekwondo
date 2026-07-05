"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, CreditCard, CheckCircle, AlertCircle, Loader2, 
  DollarSign, ChevronLeft, ChevronRight, Calendar, UserCheck, ShieldAlert 
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

const MONTHS_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const MONTHS_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MEI", "JUN", 
  "JUL", "AGU", "SEP", "OKT", "NOV", "DES"
];

export default function SppPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<SppInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(new Date().getMonth());

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
    return invoices.find(inv => inv.month === (monthIndex + 1) && inv.year === selectedYear);
  };

  const activeInvoice = getMonthInvoice(activeMonthIndex);

  // Kalkulasi total tertunggak keseluruhan (all years)
  const unpaidInvoices = invoices.filter(i => i.status === "PENDING" || i.status === "UNPAID");
  const totalUnpaid = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0);

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
            <h1 className="font-black text-lg uppercase tracking-wide">Laporan SPP Tahunan</h1>
            <p className="text-slate-400 text-xs">Pantau status iuran bulanan Anda sepanjang tahun</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Total Tunggakan (jika ada) */}
        {unpaidInvoices.length > 0 && (
          <div className="game-card p-4 game-border-red">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-0.5">TOTAL TUNGGAKAN</p>
                <p className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  Rp {totalUnpaid.toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Selesaikan tagihan tertunggak Anda segera</p>
              </div>
              <span className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-xs shrink-0">
                {unpaidInvoices.length}x
              </span>
            </div>
          </div>
        )}

        {/* Pemilih Tahun */}
        <div className="flex items-center justify-between bg-slate-900/80 border-2 border-slate-800 p-2.5 rounded-2xl">
          <button 
            onClick={() => setSelectedYear(y => y - 1)}
            className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-black text-sm tracking-widest text-slate-200">TAHUN {selectedYear}</span>
          <button 
            onClick={() => setSelectedYear(y => y + 1)}
            className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#E10600] animate-spin" />
          </div>
        ) : (
          <>
            {/* Grid 12 Bulan */}
            <div className="grid grid-cols-3 gap-2">
              {MONTHS_SHORT.map((name, index) => {
                const inv = getMonthInvoice(index);
                const isActive = activeMonthIndex === index;
                
                let cardStyle = "border-slate-800 bg-slate-950/40 text-slate-500";
                let statusLabel = "Belum Tagih";

                if (inv) {
                  if (inv.status === "PAID") {
                    cardStyle = "border-emerald-500/40 bg-emerald-950/20 text-emerald-400";
                    statusLabel = "Lunas";
                  } else {
                    cardStyle = "border-red-500/40 bg-red-950/20 text-red-400";
                    statusLabel = "Tunggak";
                  }
                }

                return (
                  <button
                    key={name}
                    onClick={() => setActiveMonthIndex(index)}
                    className={`game-card p-3 flex flex-col items-center justify-center text-center transition-all active:scale-95 border-2 ${cardStyle} ${
                      isActive ? "ring-2 ring-[#E10600] border-transparent scale-[1.03] shadow-[0_0_12px_rgba(225,6,0,0.2)]" : ""
                    }`}
                  >
                    <span className="font-black text-sm tracking-wider">{name}</span>
                    <span className="text-[8px] font-black uppercase mt-1 px-1.5 py-0.5 rounded bg-black/40">
                      {statusLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Panel Detail Bulan Terpilih */}
            <div className="game-card p-5 border-slate-800 bg-slate-950/50 mt-2">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <h3 className="font-black text-sm uppercase tracking-wide">
                    Detail {MONTHS_FULL[activeMonthIndex]} {selectedYear}
                  </h3>
                </div>
              </div>

              {!activeInvoice ? (
                <div className="py-6 text-center">
                  <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="font-bold text-slate-500 text-xs">Belum Ada Tagihan</p>
                  <p className="text-[10px] text-slate-600 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Tagihan SPP bulan ini belum diterbitkan oleh pihak Dojang/Admin.
                  </p>
                </div>
              ) : activeInvoice.status === "PAID" ? (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold uppercase">Status</span>
                    <span className="text-[10px] font-black bg-emerald-950/80 text-emerald-400 border border-emerald-500 px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> LUNAS
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold uppercase">Jumlah Iuran</span>
                    <span className="text-sm font-black text-white">
                      Rp {activeInvoice.amount.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {activeInvoice.payment && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex flex-col gap-2 bg-black/30 p-3 rounded-2xl border border-white/5">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-500 uppercase tracking-wide">Metode Pembayaran</span>
                        <span className="font-black text-white uppercase">{activeInvoice.payment.paymentMethod || "MANUAL"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-500 uppercase tracking-wide">Tanggal Verifikasi</span>
                        <span className="font-bold text-white">
                          {activeInvoice.payment.paidAt ? new Date(activeInvoice.payment.paidAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-500 uppercase tracking-wide">Status Validasi</span>
                        <span className="font-bold text-emerald-400 uppercase flex items-center gap-1 text-right">
                          <UserCheck className="w-3.5 h-3.5 shrink-0" /> 
                          <span>
                            {activeInvoice.payment.receiver?.name 
                              ? `Divalidasi: Coach ${activeInvoice.payment.receiver.name}` 
                              : activeInvoice.payment.paymentMethod === "QRIS_ONLINE" 
                                ? "Terverifikasi Otomatis (QRIS)" 
                                : "Terverifikasi Pelatih"
                            }
                          </span>
                        </span>
                      </div>
                      {activeInvoice.payment.externalId && (
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-500 uppercase tracking-wide">Referensi ID</span>
                          <span className="font-mono text-slate-300 text-[10px] truncate max-w-[150px]" title={activeInvoice.payment.externalId}>
                            {activeInvoice.payment.externalId}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold uppercase">Status</span>
                    <span className="text-[10px] font-black bg-red-950/80 text-red-500 border border-red-500 px-3 py-1 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> BELUM BAYAR
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold uppercase">Jumlah Iuran</span>
                    <span className="text-sm font-black text-red-400">
                      Rp {activeInvoice.amount.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <button
                    onClick={() => router.push(`/m/spp/pay?invoiceId=${activeInvoice.id}`)}
                    className="w-full btn-battle py-3 mt-1 flex items-center justify-center gap-1.5 font-black text-sm"
                  >
                    <DollarSign className="w-4 h-4" /> BAYAR SPP SEKARANG
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
