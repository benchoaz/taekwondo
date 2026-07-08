const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/MemberDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('Upload Sertifikat/Dokumen UKT')) {
    content = content.replace('{activeTab === "certificates" && (',
`{activeTab === "certificates" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A] font-display">Sertifikat Digital</h2>
                  <p className="text-gray-400 text-xs mt-1">Unduh dan verifikasi sertifikat kenaikan sabuk resmi Anda yang terdaftar pada sistem.</p>
                </div>
                <button 
                  onClick={() => setShowAchievementModal(true)} 
                  className="bg-[#E10600] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-[#C00500] transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Dokumen UKT/Sertifikat
                </button>
              </div>`);
}

// Ensure the Achievement Modal can be used for UKT Docs
// Or create a new modal. For now, since Achievement Modal exists and we can upload certificates there, we'll use it or a dedicated one.
// Let's just create a simple Upload Section below the QR code.

if (!content.includes('Unggah Mandiri Dokumen UKT')) {
    content = content.replace('{/* Actions & QR Verification block */}',
`{/* Actions & QR Verification block */}
                  <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0F172A] mb-3">Unggah Mandiri Dokumen UKT</h3>
                      <p className="text-gray-400 text-[10px] leading-relaxed mb-4">
                        Jika sertifikat digital belum diterbitkan oleh sistem, Anda dapat mengunggah dokumen sementara (foto/scan sertifikat atau hasil ujian UKT) di sini.
                      </p>
                      
                      <div className="mb-6 relative">
                        <input 
                          type="file" 
                          id="manualCertUpload" 
                          className="hidden" 
                          onChange={async (e) => {
                            if (!e.target.files?.[0]) return;
                            alert("Simulasi: Mengunggah dokumen " + e.target.files[0].name + "...");
                            // In a real app, upload to /api/upload then update member.certDocUrl
                          }} 
                        />
                        <label 
                          htmlFor="manualCertUpload"
                          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 bg-slate-50 text-slate-500 rounded-xl py-6 cursor-pointer hover:border-[#E10600] hover:text-[#E10600] transition-colors"
                        >
                          <Upload className="w-5 h-5" />
                          <span className="font-bold text-xs">Pilih File Sertifikat</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm text-[#0F172A] mb-3">Verifikasi &amp; Cetak Sertifikat</h3>`);
                      
    // Remove the original heading so it doesn't duplicate if I replaced the wrong part.
    content = content.replace(/<h3 className="font-extrabold text-sm text-\[\#0F172A\] mb-3">Verifikasi &amp; Cetak Sertifikat<\/h3>\s*<p className="text-gray-400 text-xs leading-relaxed mb-6">/g, '<p className="text-gray-400 text-xs leading-relaxed mb-6">');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Certificates section patched!');
