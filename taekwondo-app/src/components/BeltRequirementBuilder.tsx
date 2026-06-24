"use client";

import React, { useState, useEffect } from "react";
import { Settings2, Save } from "lucide-react";

export default function BeltRequirementBuilder() {
  const [belts, setBelts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/curriculum");
      if (res.ok) {
        const data = await res.json();
        const b = data.data || [];
        setBelts(b);
        
        // Initialize form data
        const fd: Record<string, any> = {};
        b.forEach((belt: any) => {
          fd[belt.id] = {
            minAttendance: belt.minAttendance || 80,
            minTechScore: belt.minTechScore || 70,
            minPoomsae: belt.minPoomsae || 70,
            minPhysical: belt.minPhysical || 70,
          };
        });
        setFormData(fd);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (beltId: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [beltId]: {
        ...prev[beltId],
        [field]: parseInt(value) || 0
      }
    }));
  };

  const handleSave = async (beltId: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_BELT_REQ",
          payload: {
            beltId,
            ...formData[beltId]
          }
        })
      });
      if (res.ok) {
        alert("Syarat kelulusan sabuk berhasil diperbarui!");
      } else {
        alert("Gagal memperbarui syarat kelulusan.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-center py-12 font-bold text-gray-500 animate-pulse">Memuat Data Sabuk...</div>;

  return (
    <div className="flex flex-col gap-6">
      {belts.map((belt) => (
        <div key={belt.id} className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] text-lg">Syarat Kenaikan ke {belt.name}</h3>
              <p className="text-xs text-gray-500 mt-1">Atur ambang batas nilai (passing grade) minimum.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#0F172A] uppercase mb-1">Kehadiran Minimal (%)</label>
              <input 
                type="number" 
                value={formData[belt.id]?.minAttendance || 0}
                onChange={(e) => handleInputChange(belt.id, 'minAttendance', e.target.value)}
                className="w-full h-12 bg-[#F8FAFC] border-none rounded-xl px-4 text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-[#E10600] outline-none" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#0F172A] uppercase mb-1">Nilai Teknik Min.</label>
              <input 
                type="number" 
                value={formData[belt.id]?.minTechScore || 0}
                onChange={(e) => handleInputChange(belt.id, 'minTechScore', e.target.value)}
                className="w-full h-12 bg-[#F8FAFC] border-none rounded-xl px-4 text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-[#E10600] outline-none" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#0F172A] uppercase mb-1">Nilai Poomsae Min.</label>
              <input 
                type="number" 
                value={formData[belt.id]?.minPoomsae || 0}
                onChange={(e) => handleInputChange(belt.id, 'minPoomsae', e.target.value)}
                className="w-full h-12 bg-[#F8FAFC] border-none rounded-xl px-4 text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-[#E10600] outline-none" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#0F172A] uppercase mb-1">Nilai Fisik Min.</label>
              <input 
                type="number" 
                value={formData[belt.id]?.minPhysical || 0}
                onChange={(e) => handleInputChange(belt.id, 'minPhysical', e.target.value)}
                className="w-full h-12 bg-[#F8FAFC] border-none rounded-xl px-4 text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-[#E10600] outline-none" 
              />
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <button 
              onClick={() => handleSave(belt.id)}
              disabled={isSaving}
              className="bg-[#0F172A] hover:bg-[#E10600] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Simpan Syarat
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
