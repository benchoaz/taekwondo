"use client";
import React from 'react';
import './StitchTheme.css';

export default function StitchDashboard() {
  return (
    <div className="stitch-theme bg-background text-on-background font-body-md min-h-full pb-24 relative w-full h-full overflow-y-auto hide-scrollbar">
      {/* Import Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD,opsz@300,0,0,24&display=swap" rel="stylesheet" />
      <style>{`
        .stitch-theme { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
      `}</style>

      {/* TopAppBar Section */}
      <header className="w-full top-0 sticky z-50 bg-surface border-b border-outline-variant shadow-sm flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
            <img 
              className="w-full h-full object-cover" 
              alt="Profile" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpkSBVjy4FmHK14ytpPJR4_Wre-HaVv-QBoz9cI3y7tHYX900QzveSpjz1fjzNBGTW89g11rVsouS3IVeJzlwZAFpOYa4jh5-MTaQNV7UBer9t9qC1QWtAAs3fYF5H_NXxOHXrrfVghUIMAqHMUK5UwI4dc-bFDL9JlG9_textTZLTylaIkfV-qqqbvPUpkKKdsNWVEBXVrgfLD0O2d6g51VG0mQofkh4-ZWDPBXm3ojK_hMiGtncJvbJiCF7PVcFa9CU8DsAemJ4"
            />
          </div>
          <h1 className="font-headline-lg text-primary uppercase" style={{ margin: 0 }}>DOJO MASTER</h1>
        </div>
        <button className="material-symbols-outlined text-primary p-2 hover:bg-surface-container-low transition-colors rounded-full active:scale-95">
          notifications
        </button>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 py-6 space-y-6">
        {/* Hero / Summary Section */}
        <section className="flex flex-col gap-4">
          {/* Balance Card */}
          <div className="bg-primary rounded-xl p-5 text-on-primary shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-primary-container opacity-20 rounded-full blur-3xl"></div>
            <div className="z-10">
              <p className="font-label-bold opacity-80 uppercase tracking-widest text-[10px]">TOTAL TAGIHAN AKTIF</p>
              <h2 className="font-headline-xl mt-1">Rp 150.000</h2>
            </div>
            <div className="z-10 flex gap-3 mt-5">
              <button className="bg-secondary text-on-secondary px-4 py-2 rounded-lg font-label-bold uppercase hover:opacity-90 active:scale-95 transition-all text-xs">BAYAR SEKARANG</button>
              <button className="border border-white text-white px-4 py-2 rounded-lg font-label-bold uppercase hover:bg-white hover:text-primary active:scale-95 transition-all text-xs">LIHAT RIWAYAT</button>
            </div>
          </div>

          {/* Quick Belt Rank / Stats */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="font-headline-md text-primary" style={{ margin: 0 }}>Status Anggota</h3>
              <p className="text-on-surface-variant font-body-md mt-1 text-sm">Aktif • Sabuk Hitam (Dan 1)</p>
            </div>
            {/* Specialty Component - Belt Indicator */}
            <div className="h-4 w-full rounded-full bg-surface-container flex overflow-hidden border border-outline-variant mt-3">
              <div className="h-full w-1/4 bg-on-surface"></div>
              <div className="h-full w-1/4 bg-secondary"></div>
              <div className="h-full w-1/4 bg-primary"></div>
              <div className="h-full w-1/4 bg-surface-container-lowest flex items-center justify-center text-[8px] font-bold text-primary">ELIT</div>
            </div>
          </div>
        </section>

        {/* Financial Categories Bento */}
        <section className="flex flex-col gap-4">
          {/* SPP History */}
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined">payments</span>
                <span className="font-headline-md text-sm">Riwayat SPP</span>
              </div>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">Lihat riwayat pembayaran SPP bulanan Anda di sini.</p>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="absolute bottom-0 left-0 right-0 w-full z-50 bg-surface border-t border-outline-variant shadow-lg h-[72px] flex justify-around items-center px-2 pb-2 rounded-b-[40px]">
        <a className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-2 active:scale-90 duration-200 transition-all" href="#">
          <span className="material-symbols-outlined text-[26px]">dashboard</span>
          <span className="font-label-sm text-[11px] mt-1">Beranda</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-2 active:scale-90 duration-200 transition-all" href="#">
          <span className="material-symbols-outlined text-[26px]">payments</span>
          <span className="font-label-sm text-[11px] mt-1">Keuangan</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-secondary text-on-secondary rounded-[14px] px-5 py-2 active:scale-90 duration-200 transition-all shadow-sm" href="#">
          <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>calendar_today</span>
          <span className="font-label-sm text-[11px] mt-1 font-bold">Jadwal</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-2 active:scale-90 duration-200 transition-all" href="#">
          <span className="material-symbols-outlined text-[26px]">qr_code_scanner</span>
          <span className="font-label-sm text-[11px] mt-1">Absensi</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-2 active:scale-90 duration-200 transition-all" href="#">
          <span className="material-symbols-outlined text-[26px]">campaign</span>
          <span className="font-label-sm text-[11px] mt-1">Berita</span>
        </a>
      </nav>
    </div>
  );
}
