"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  User 
} from "lucide-react";

export default function ScheduleCalendar({ 
  onBack 
}: { 
  onBack: () => void 
}) {
  const [filterDay, setFilterDay] = useState("SEMUA");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch("/api/schedules");
        if (res.ok) {
          const data = await res.json();
          setSchedules(data);
        }
      } catch (err) {
        console.error("Error fetching schedules:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const filtered = filterDay === "SEMUA" 
    ? schedules 
    : schedules.filter(s => s.dayOfWeek === filterDay);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <nav className="bg-white border-b border-[#0F172A]/5 py-4 px-4 sm:px-6 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 sm:gap-2 text-xs font-bold text-[#0F172A] hover:text-[#E10600] transition-colors w-20 sm:w-24 shrink-0">
          <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Kembali</span>
        </button>
        <span className="font-extrabold text-[10px] sm:text-sm text-[#0F172A] text-center flex-1 truncate px-2">KALENDER JADWAL LATIHAN</span>
        <div className="w-20 sm:w-24 shrink-0"></div>
      </nav>

      <main className="flex-grow p-6 max-w-5xl mx-auto w-full flex flex-col gap-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-black text-[#0F172A] font-display">Kalender Latihan Dojang</h2>
          <p className="text-gray-500 text-xs mt-1">Gunakan filter hari untuk menemukan sesi kelas taekwondo Anda.</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {["SEMUA", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDay(d)}
              className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
                filterDay === d 
                  ? "bg-[#E10600] text-white" 
                  : "bg-white border border-[#0F172A]/5 text-[#0F172A]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-500 font-bold text-sm">Memuat data jadwal...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s, idx) => (
              <div key={idx} className="glass-card p-6 border border-slate-100 flex flex-col justify-between min-h-[180px]">
                <div>
                  <span className="bg-[#E10600]/10 text-[#E10600] text-[9px] font-black uppercase px-2.5 py-1 rounded block w-max mb-3 tracking-wider">
                    {s.dayOfWeek}
                  </span>
                  <h3 className="font-bold text-[#0F172A] text-base mb-1">{s.className}</h3>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <Clock className="w-3.5 h-3.5" /> {s.startTime} - {s.endTime}
                  </span>
                </div>

                <div className="pt-4 border-t border-[#0F172A]/5 text-xs text-gray-400 flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#E10600]" /> Pelatih: {s.coach?.fullName}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#E10600]" /> Lokasi: {s.location}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-500">
                Tidak ada jadwal pada hari tersebut.
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-gray-400 text-[10px]">
        &copy; 2026 Taekwondo Academy Schedule System
      </footer>
    </div>
  );
}
