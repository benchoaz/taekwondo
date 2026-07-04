"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle, Clock, Loader2, DollarSign } from "lucide-react";
import BottomNav from "../_components/BottomNav";

interface SppInvoice {
  id: string; month: number; year: number; amount: number; status: string;
}

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function SppPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<SppInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/spp")
      .then(r => { if (!r.ok && (r.status===401||r.status===403)) router.replace("/m/login"); return r.json(); })
      .then(data => { if (Array.isArray(data)) setInvoices(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const unpaid = invoices.filter(i => i.status === "PENDING" || i.status === "UNPAID");
  const totalUnpaid = unpaid.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="flex-1 flex flex-col pb-28 bg-[#020617] text-white">
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
            <h1 className="font-black text-lg uppercase tracking-wide">Toko SPP Atlet</h1>
            <p className="text-slate-400 text-xs">{invoices.length} total invoice terdata</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Total Unpaid (Game style chest alert) */}
        {unpaid.length > 0 ? (
          <div className="game-card p-4 game-border-red">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-0.5">TERTUNGGAK</p>
                <p className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  Rp {totalUnpaid.toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Selesaikan transaksi sebelum jatuh tempo</p>
              </div>
              <span className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-xs shrink-0">
                {unpaid.length}x
              </span>
            </div>
          </div>
        ) : (
          <div className="game-card p-4 border-emerald-800 shadow-[0_8px_0_0_#064e3b]">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">STATUS</p>
            <p className="text-lg font-black text-white">SPP Lunas Sempurna! 🎉</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Terima kasih atas disiplin administrasinya</p>
          </div>
        )}

        {/* Invoice List */}
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 text-[#E10600] animate-spin" /></div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-black">Belum ada invoice SPP</p>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mt-2">Daftar Transaksi (Audit Trail)</p>
            <div className="flex flex-col gap-3.5">
              {invoices.map((inv: any) => {
                const isPaid = inv.status === "PAID";
                const paymentInfo = inv.payment;
                return (
                  <div key={inv.id} className={`game-card p-4 transition-all ${isPaid ? "border-slate-800 bg-slate-950/80" : "border-red-950/50"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isPaid ? "bg-slate-900 border-slate-700 text-slate-400" : "bg-red-500/10 border-red-500/20 text-[#E10600]"}`}>
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase tracking-wide">{MONTHS[inv.month - 1]} {inv.year}</p>
                          <p className="text-slate-400 text-xs font-bold mt-0.5">Rp {inv.amount.toLocaleString("id-ID")}</p>
                        </div>
                      </div>
                      <div>
                        {isPaid ? (
                          <span className="flex items-center gap-1 text-[9px] font-black bg-emerald-950/80 text-emerald-400 border border-emerald-500 px-3 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" /> LUNAS
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9px] font-black bg-red-950/80 text-[#E10600] border border-red-500 px-3 py-1 rounded-full">
                            <AlertCircle className="w-3 h-3" /> BELUM BAYAR
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Jejak Audit Tambahan (Audit Trail) */}
                    {isPaid && paymentInfo && (
                      <div className="mt-3.5 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 flex flex-col gap-1 bg-black/10 p-2.5 rounded-xl border border-white/5">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-500 uppercase tracking-wide">Metode</span>
                          <span className="font-black text-white uppercase">{paymentInfo.paymentMethod || "MANUAL"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-500 uppercase tracking-wide">Tgl Bayar</span>
                          <span className="font-bold text-white">
                            {paymentInfo.paidAt ? new Date(paymentInfo.paidAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                          </span>
                        </div>
                        {paymentInfo.receivedById && (
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-500 uppercase tracking-wide">Petugas Validasi</span>
                            <span className="font-bold text-emerald-400 uppercase">Terverifikasi Pelatih</span>
                          </div>
                        )}
                        {paymentInfo.externalId && (
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-500 uppercase tracking-wide">Ref ID</span>
                            <span className="font-mono text-slate-400 select-all truncate max-w-[150px]">{paymentInfo.externalId}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
