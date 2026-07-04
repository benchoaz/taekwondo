"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, MapPin, User, Calendar, Loader2, Target } from "lucide-react";
import BottomNav from "../_components/BottomNav";

interface Schedule {
  id: string; dayOfWeek: string; startTime: string; endTime: string;
  className: string; location: string;
  coach: { fullName: string; danRank: string };
}

const DAY_ORDER = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];
const DAY_EN_TO_ID: Record<string,string> = {
  "MONDAY":"Senin","TUESDAY":"Selasa","WEDNESDAY":"Rabu",
  "THURSDAY":"Kamis","FRIDAY":"Jumat","SATURDAY":"Sabtu","SUNDAY":"Minggu"
};
const DAY_COLORS = ["#E10600","#3b82f6","#22c55e","#f59e0b","#8b5cf6","#FFD700","#64748b"];

export default function SchedulePage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const todayIdx = new Date().getDay(); // 0=Sun, 1=Mon...
  const todayName = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"][todayIdx];

  useEffect(() => {
    fetch("/api/schedules")
      .then(r => { if (!r.ok && (r.status===401||r.status===403)) router.replace("/m/login"); return r.json(); })
      .then(data => { if (Array.isArray(data)) setSchedules(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const grouped = DAY_ORDER.reduce((acc, day) => {
    const items = schedules.filter(s => (DAY_EN_TO_ID[s.dayOfWeek] || s.dayOfWeek) === day);
    if (items.length > 0) acc[day] = items;
    return acc;
  }, {} as Record<string, Schedule[]>);

  return (
    <div className="flex-1 flex flex-col pb-28 bg-[#020617] text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 pt-12 pb-6 px-5 border-b-4 border-[#334155]">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-400 text-xs mb-4">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center animate-game-float">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="font-black text-lg uppercase tracking-wide">Agenda Latihan</h1>
            <p className="text-slate-400 text-xs">Hari ini: <span className="text-[#E10600] font-black">{todayName}</span></p>
          </div>
        </div>
      </div>

      {/* Grouped Day Schedules */}
      <div className="px-4 py-4 flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 text-[#E10600] animate-spin" /></div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-black">Belum ada agenda latihan dirilis</p>
          </div>
        ) : (
          Object.entries(grouped).map(([day, items], di) => (
            <div key={day} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: day === todayName ? "#E10600" : DAY_COLORS[di % DAY_COLORS.length] }}
                />
                <span className={`text-[10px] font-black uppercase tracking-widest ${day === todayName ? "text-[#E10600] scale-105" : "text-slate-400"}`}>
                  {day} {day === todayName && "• HARI INI"}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {items.map(s => (
                  <div key={s.id} className={`game-card p-4 transition-all ${day === todayName ? "border-[#E10600] shadow-[0_6px_0_0_#990000]" : "border-slate-800"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-black text-white text-sm uppercase tracking-wide">{s.className}</span>
                      {day === todayName && (
                        <span className="text-[9px] font-black bg-[#E10600] text-white px-2.5 py-0.5 rounded-full border border-white/15">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Clock className="w-4 h-4 text-[#FFD700]" />
                        <span className="font-bold">{s.startTime} – {s.endTime} WIB</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <MapPin className="w-4 h-4 text-red-400" />
                        <span className="font-semibold">{s.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <User className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold">{s.coach?.fullName} <span className="text-slate-500 text-[10px]">({s.coach?.danRank})</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}
