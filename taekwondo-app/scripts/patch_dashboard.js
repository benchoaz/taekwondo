const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/MemberDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports
if (!content.includes('Activity,')) {
    content = content.replace('} from "lucide-react";', '  Activity,\n  LineChart as ChartIcon\n} from "lucide-react";\nimport { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";');
}

// 2. Add Physical logs states
if (!content.includes('const [isSavingPhysical, setIsSavingPhysical]')) {
    content = content.replace('const [loading, setLoading] = useState(true);', 
`const [loading, setLoading] = useState(true);

  // Physical Stats States
  const [inputWeight, setInputWeight] = useState("");
  const [inputHeight, setInputHeight] = useState("");
  const [inputWaist, setInputWaist] = useState("");
  const [isSavingPhysical, setIsSavingPhysical] = useState(false);`);
}

// 3. Add handleSavePhysical
if (!content.includes('const handleSavePhysical = async')) {
    content = content.replace('const handleSaveProfile = async (e: React.FormEvent) => {',
`const handleSavePhysical = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPhysical(true);
    try {
      const res = await fetch("/api/profile/biometrics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: inputWeight || null,
          height: inputHeight || null,
          waistCircum: inputWaist || null
        })
      });

      if (!res.ok) throw new Error("Gagal menyimpan data fisik");

      const resData = await res.json();
      if (resData.success) {
        alert("Data fisik berhasil diperbarui!");
        // Update local state by forcing a reload or just appending to physicalLogs
        window.location.reload();
      }
    } catch (error) {
      alert("Terjadi kesalahan, silakan coba lagi.");
    } finally {
      setIsSavingPhysical(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {`);
}

// 4. Add Tab
if (!content.includes('{ id: "physical_growth"')) {
    content = content.replace('{ id: "dashboard", label: "Overview & Dashboard",',
`{ id: "physical_growth", label: "Tumbuh Kembang", icon: <Activity className="w-4 h-4" /> },
                { id: "dashboard", label: "Overview & Dashboard",`);
}

// 5. Add Physical Growth UI Block
if (!content.includes('activeTab === "physical_growth"')) {
    content = content.replace('{activeTab === "history" && (',
`{activeTab === "physical_growth" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A] font-display">Tumbuh Kembang Fisik</h2>
                <p className="text-gray-400 text-xs mt-1">Pantau perkembangan tinggi dan berat badan Anda dari waktu ke waktu.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[24px] p-8 border border-[#0F172A]/5 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-extrabold text-sm text-[#0F172A]">Grafik Pertumbuhan</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#E10600]"></div><span className="text-xs text-gray-400">Berat (kg)</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div><span className="text-xs text-gray-400">Tinggi (cm)</span></div>
                    </div>
                  </div>
                  
                  {profile?.physicalLogs && profile.physicalLogs.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={profile.physicalLogs.map((log: any) => ({
                          ...log,
                          dateStr: new Date(log.recordedAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="dateStr" stroke="#64748b" fontSize={10} tickMargin={12} />
                          <YAxis yAxisId="left" stroke="#64748b" fontSize={10} domain={['auto', 'auto']} width={30} />
                          <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} domain={['auto', 'auto']} width={30} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                            itemStyle={{ fontWeight: 'bold' }}
                          />
                          <Line yAxisId="left" type="monotone" dataKey="weight" name="Berat (kg)" stroke="#E10600" strokeWidth={3} dot={{ r: 4, fill: '#E10600', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#E10600' }} />
                          <Line yAxisId="right" type="monotone" dataKey="height" name="Tinggi (cm)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#3b82f6' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 w-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-gray-400 font-medium">Belum ada data pertumbuhan</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-[24px] p-8 border border-[#0F172A]/5 shadow-sm">
                  <h3 className="font-extrabold text-sm text-[#0F172A] mb-6">Pembaruan Data Fisik</h3>
                  <form onSubmit={handleSavePhysical} className="flex flex-col gap-5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tinggi Badan (cm)</label>
                      <input 
                        type="number" step="0.1" 
                        value={inputHeight} onChange={(e) => setInputHeight(e.target.value)}
                        placeholder={profile?.physicalLogs?.length ? String(profile.physicalLogs[profile.physicalLogs.length-1].height || '') : ''}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/5 text-[#0F172A] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#E10600]/30 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Berat Badan (kg)</label>
                      <input 
                        type="number" step="0.1" 
                        value={inputWeight} onChange={(e) => setInputWeight(e.target.value)}
                        placeholder={profile?.physicalLogs?.length ? String(profile.physicalLogs[profile.physicalLogs.length-1].weight || '') : ''}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/5 text-[#0F172A] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#E10600]/30 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Lingkar Perut (cm)</label>
                      <input 
                        type="number" step="0.1" 
                        value={inputWaist} onChange={(e) => setInputWaist(e.target.value)}
                        placeholder={profile?.physicalLogs?.length ? String(profile.physicalLogs[profile.physicalLogs.length-1].waistCircum || '') : ''}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/5 text-[#0F172A] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#E10600]/30 transition-all font-semibold"
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isSavingPhysical || (!inputWeight && !inputHeight && !inputWaist)}
                      className="w-full mt-2 bg-[#E10600] hover:bg-[#C00500] text-white py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingPhysical ? "Menyimpan..." : "Simpan Catatan Baru"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (`);
}

// 6. Provide a way to manually upload certificates. 
// Since "Dokumen Sertifikat Sabuk" was previously in Edit Profil, let's add it to the Certificates Tab.
// Or if Certificates Wallet is sufficient, we just need to ensure they can upload.
// I will add a small upload form in certificates tab if needed.

fs.writeFileSync(filePath, content, 'utf8');
console.log('MemberDashboard patched!');
