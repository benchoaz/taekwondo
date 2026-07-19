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
    <div className="bg-white border-2 border-[#191C1D] shadow-[4px_4px_0px_#191C1D] rounded-xl p-6 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#191C1D] transition-all flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 border-[#191C1D] ${isNews ? 'bg-[#FFDEB4]' : 'bg-[#E0F2FE]'}`}>
            {isNews ? 'Berita/Rumor 📰' : 'Terverifikasi ✅'}
          </span>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 border-2 border-[#191C1D]">
            {level}
          </span>
        </div>
        
        <h3 className="text-xl font-black text-[#191C1D] mb-4 font-spaceGrotesk leading-tight">
          {title}
        </h3>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm font-medium text-gray-700">
            <span className="material-symbols-outlined text-[18px] mr-2">calendar_month</span>
            {start} {start !== end && `- ${end}`}
          </div>
          <div className="flex items-center text-sm font-medium text-gray-700">
            <span className="material-symbols-outlined text-[18px] mr-2">location_on</span>
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
            className="block w-full py-2.5 text-center bg-[#FFDEB4] hover:bg-[#ffe3c2] text-[#191C1D] font-black rounded-lg border-2 border-[#191C1D] shadow-[2px_2px_0px_#191C1D] active:translate-y-[2px] active:shadow-none transition-all text-xs uppercase"
          >
            📥 Unduh Proposal (PDF)
          </a>
        )}
        
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="block w-full py-2.5 text-center bg-[#0052DC] hover:bg-blue-700 text-white font-bold rounded-lg border-2 border-[#191C1D] text-xs uppercase">
            Lihat Sumber
          </a>
        ) : (
          !proposalUrl && (
            <button disabled className="w-full py-2.5 text-center bg-gray-200 text-gray-500 font-bold rounded-lg border-2 border-gray-300 text-xs">
              Proposal Belum Tersedia
            </button>
          )
        )}
      </div>
    </div>
  );
}
