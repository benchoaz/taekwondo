import React from 'react';

interface EventCardProps {
  title: string;
  level: string;
  location: string;
  startDate: string;
  endDate: string;
  link?: string | null;
  proposalUrl?: string | null;
  source: string;
}

export default function EventCard({ title, level, location, startDate, endDate, link, proposalUrl, source }: EventCardProps) {
  const isNews = source === 'AUTOMATIC_RSS';
  const start = new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const end = new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-950/20 transition-all flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${isNews ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            {isNews ? 'Berita/Rumor 📰' : 'Terverifikasi ✅'}
          </span>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/5 border border-white/10 text-slate-300">
            {level}
          </span>
        </div>
        
        <h3 className="text-xl font-black text-white mb-4 font-spaceGrotesk leading-tight">
          {title}
        </h3>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm font-medium text-slate-300">
            <span className="material-symbols-outlined text-[18px] mr-2 text-slate-400">calendar_month</span>
            {start} {start !== end && `- ${end}`}
          </div>
          <div className="flex items-center text-sm font-medium text-slate-300">
            <span className="material-symbols-outlined text-[18px] mr-2 text-slate-400">location_on</span>
            {location}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {proposalUrl && (
          <a 
            href={proposalUrl} 
            download 
            target="_blank"
            rel="noopener noreferrer" 
            className="block w-full py-2.5 text-center bg-[#E10600]/10 hover:bg-[#E10600]/20 text-[#E10600] font-black rounded-xl border border-[#E10600]/20 transition-all text-xs uppercase"
          >
            📥 Unduh Proposal (PDF)
          </a>
        )}
        
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="block w-full py-2.5 text-center bg-[#E10600] hover:bg-red-700 text-white font-bold rounded-xl transition-all text-xs uppercase">
            Lihat Sumber
          </a>
        ) : (
          !proposalUrl && (
            <button disabled className="w-full py-2.5 text-center bg-white/5 text-slate-500 font-bold rounded-xl border border-white/5 text-xs">
              Proposal Belum Tersedia
            </button>
          )
        )}
      </div>
    </div>
  );
}
