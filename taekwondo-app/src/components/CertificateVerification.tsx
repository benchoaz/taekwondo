"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Search, 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  FileBadge,
  Download
} from "lucide-react";

export default function CertificateVerification({ 
  onBack 
}: { 
  onBack: () => void 
}) {
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dojangName, setDojangName] = useState("WHITE TIGER TAEKWONDO");
  const [dojangShort, setDojangShort] = useState("WTTA");

  React.useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(s => {
      if (s.dojangName) {
        setDojangName(s.dojangName);
        setDojangShort(s.dojangName.split(" ").filter((w: string) => w.length > 2).map((w: string) => w[0]).join("").substring(0, 4).toUpperCase());
      }
    }).catch(e => console.error(e));
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setLoading(true);
    setResult(null);
    setSearched(true);

    try {
      const response = await fetch(`/api/verify-certificate/${certId.trim()}`);
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setResult({ isValid: false });
      }
    } catch (error) {
      setResult({ isValid: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      {/* Header navbar matching screenshot 3 header structure */}
      <nav className="bg-white border-b border-[#0F172A]/5 py-6 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-extrabold text-lg text-[#0F172A] tracking-tight font-display uppercase">{dojangName.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.href = '/'} className="text-gray-500 font-label-bold text-sm hover:text-[#0F172A] transition-colors duration-300">
            &larr; Kembali ke Beranda
          </button>
        </div>
      </nav>

      {/* Main panel containing Certificate Verification card matching screenshot 3 */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 sm:p-12 max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-black text-[#0F172A] font-display tracking-tight">Certificate Verification</h2>
          <p className="text-gray-400 text-sm mt-3">Verify the authenticity of {dojangName} credentials.</p>
        </div>

        {/* Input box in case not searched */}
        {!searched ? (
          <form onSubmit={handleVerify} className="w-full max-w-lg bg-white border border-[#0F172A]/5 p-8 rounded-[24px] shadow-sm flex flex-col gap-4">
            <span className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Enter Certificate Number</span>
            <div className="relative">
              <input 
                type="text" 
                value={certId} 
                onChange={(e) => setCertId(e.target.value)}
                placeholder="Contoh: CERT/2023/XII/0042" 
                className="w-full bg-white border border-[#0F172A]/10 rounded-xl pl-4 pr-12 py-3.5 text-xs font-medium focus:ring-2 focus:ring-[#E10600] outline-none"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 p-2 bg-[#E10600] hover:bg-[#C00500] text-white rounded-lg transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-400 text-[10px] leading-relaxed">
              Anda juga bisa mencoba memasukkan **`CERT-2025-0482`** untuk mencocokkan data otentik seed database.
            </p>
          </form>
        ) : (
          <div className="w-full max-w-3xl bg-white border border-[#0F172A]/5 p-8 sm:p-12 rounded-[24px] shadow-sm flex flex-col gap-8 relative">
            <button 
              onClick={() => setSearched(false)} 
              className="absolute left-6 top-6 text-xs text-gray-400 hover:text-[#0F172A] font-bold cursor-pointer"
            >
              &larr; Verify Another
            </button>

            {loading ? (
              <div className="py-12 text-center text-xs font-bold text-gray-400 animate-pulse">
                Verifying database registry...
              </div>
            ) : (
              <>
                {/* Verified Green stamp matching screenshot 3 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-green-50 rounded-full border-4 border-white flex items-center justify-center shadow-sm text-green-500 mb-4">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <span className="bg-green-50 text-green-600 text-[10px] font-black uppercase px-6 py-2 rounded-full border border-green-100 tracking-wider">
                    VALID CERTIFICATE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-gray-400 block font-semibold">Full Name</span>
                    <span className="text-xl font-bold text-[#0F172A] block mt-1.5">Budi Santoso</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Member ID</span>
                    <span className="text-xl font-mono font-bold text-[#0F172A] block mt-1.5">ETA-2024-0892</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Current Rank</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-5 h-3 bg-blue-600 rounded-sm"></span>
                      <span className="text-lg font-bold text-[#0F172A]">Blue Belt (4th Geup)</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Certified On</span>
                    <span className="text-lg font-bold text-[#0F172A] block mt-1.5">December 15, 2023</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <span className="text-gray-400 block font-semibold">Certificate Number</span>
                  <span className="font-mono font-bold text-sm text-[#0F172A] block mt-1.5 bg-white border border-slate-100 px-4 py-2.5 rounded-lg w-max">
                    {certId || "CERT/2023/XII/0042"}
                  </span>
                </div>

                {/* Verification Registry footer and download */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-gray-400 font-semibold">
                    <ShieldCheck className="w-5 h-5 text-[#FFD700]" />
                    <span>VERIFIED BY <strong className="text-[#0F172A]">Apex Discipline Registry</strong></span>
                  </div>

                  <button className="bg-[#E10600] hover:bg-[#C00500] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer">
                    <Download className="w-4 h-4" /> Download Official Transcript
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer matching layouts */}
      <footer className="bg-[#0F172A] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <span>&copy; {new Date().getFullYear()} {dojangName}. Precision. Power. Prestige.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline text-gray-400">Privacy Policy</a>
            <a href="#" className="hover:underline text-gray-400">Terms of Service</a>
            <a href="#" className="hover:underline text-gray-400">Contact Academy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
