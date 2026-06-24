"use client";

import React, { useState, useEffect } from "react";
import { Plus, GripVertical, Trash2, CheckSquare, Edit3, ChevronDown, ChevronUp } from "lucide-react";

export default function ExerciseBuilder() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/exercises");
      if (res.ok) {
        const data = await res.json();
        setPrograms(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProgram = async () => {
    const title = prompt("Nama Program Latihan (Contoh: Program Minggu 1, Daily Quest Fisik Dasar):");
    if (!title) return;

    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_PROGRAM",
          payload: { title, description: "" }
        })
      });
      if (res.ok) fetchExercises();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddExercise = async (programId: string) => {
    const name = prompt("Nama Quest (Contoh: Push Up):");
    if (!name) return;
    
    const repsStr = prompt("Jumlah Repetisi (Angka, contoh: 50):") || "0";
    const setsStr = prompt("Jumlah Set (Angka, contoh: 3):") || "1";

    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_EXERCISE",
          payload: { programId, name, reps: parseInt(repsStr), sets: parseInt(setsStr) }
        })
      });
      if (res.ok) fetchExercises();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="text-center py-12 font-bold text-gray-500 animate-pulse">Memuat Program Latihan...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button 
          onClick={handleAddProgram}
          className="bg-[#E10600] hover:bg-[#C00500] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Buat Program Baru
        </button>
      </div>

      {(!programs || programs.length === 0) && (
        <div className="bg-white border border-[#0F172A]/5 p-12 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
            <Edit3 className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-[#0F172A]">Belum ada program latihan.</h3>
          <p className="text-gray-500 text-sm mt-2 max-w-md">Klik "Buat Program Baru" untuk menyusun Daily Quests bagi siswa.</p>
        </div>
      )}

      {programs.map((prog) => (
        <div key={prog.id} className="bg-white border border-[#0F172A]/5 rounded-2xl overflow-hidden shadow-sm">
          <div 
            className="p-6 flex items-center justify-between cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
            onClick={() => setExpandedProgram(expandedProgram === prog.id ? null : prog.id)}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-[#0F172A] text-lg">{prog.title}</h3>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Aktif</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{prog.exercises?.length || 0} Tugas Latihan di dalam program ini</p>
              </div>
            </div>
            {expandedProgram === prog.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>

          {expandedProgram === prog.id && (
            <div className="p-6 border-t border-slate-100 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                {(!prog.exercises || prog.exercises.length === 0) ? (
                  <div className="text-center py-4 text-gray-400 text-sm italic">Belum ada tugas di program ini.</div>
                ) : (
                  prog.exercises.map((exe: any) => (
                    <div key={exe.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                        <div>
                          <span className="text-sm font-bold text-[#0F172A] block">{exe.name}</span>
                          <span className="text-xs text-gray-500 font-medium">Target: {exe.sets} Set × {exe.reps} Repetisi</span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={() => handleAddExercise(prog.id)}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-gray-500 hover:text-[#0F172A] hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Tambah Quest (Contoh: Push Up 50x)
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
