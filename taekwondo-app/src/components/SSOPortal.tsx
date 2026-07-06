"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowLeft, Shield, Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function SSOPortal({ 
  onBack,
  onNavigate 
}: { 
  onBack: () => void;
  onNavigate: (view: "member" | "coach" | "admin", email?: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);

  const [settings, setSettings] = useState<{
    logoUrl: string | null;
    heroBgUrl: string | null;
    dojangName: string;
    motto: string;
  }>({
    logoUrl: "/logo.png",
    heroBgUrl: "/hero-fighters.png",
    dojangName: "WHITE TIGER TAEKWONDO",
    motto: "Management Ecosystem"
  });

  React.useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings({
            logoUrl: data.logoUrl || null,
            heroBgUrl: data.heroBgUrl || "/hero-fighters.png",
            dojangName: data.dojangName || "WHITE TIGER TAEKWONDO",
            motto: data.motto || "Management Ecosystem"
          });
        }
      })
      .catch(err => console.error("Error fetching settings:", err))
      .finally(() => setIsSettingsLoaded(true));
  }, []);

  const handleSecureLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login gagal");
      }

      onNavigate(data.role, email);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat masuk.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickCredential = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setPassword("password123");
    setErrorMsg("");
  };

  if (!isSettingsLoaded) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E10600] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0F172A] font-sans overflow-hidden">
      {/* Background Visual */}
      <div className="absolute inset-0 z-0">
        <div 
          className="bg-cover bg-center w-full h-full opacity-20" 
          style={{ 
            backgroundImage: `url('${settings.heroBgUrl}')` 
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#0F172A] to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <button 
          onClick={onBack} 
          className="absolute -top-10 left-6 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          &larr; Back to Landing Page
        </button>

        {/* Login Box Panel */}
        <div className="bg-[#F8FAFC] rounded-[24px] px-6 py-6 shadow-2xl border border-slate-100 flex flex-col items-center">
          
          {/* Logo icon header */}
          <div className="flex flex-col items-center justify-center gap-2 mb-4">
            <img src={settings.logoUrl || "/logo.png"} alt="Logo" className="w-20 h-20 object-contain" />
            <div className="flex flex-col items-center text-center">
              <h2 className="text-lg font-black text-[#0F172A] tracking-tight leading-tight">{settings.dojangName}</h2>
              <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider mt-0.5">{settings.motto}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="w-full mb-4 bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-lg text-center text-[10px] font-bold">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSecureLogin} className="w-full flex flex-col gap-3 mt-1">
            <div>
              <label className="block text-[10px] font-bold text-[#0F172A] mb-1">Email atau ID Anggota</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com atau TKD-2026-0012" 
                  required
                  className="w-full bg-white border border-[#0F172A]/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#0F172A] font-medium outline-none focus:ring-2 focus:ring-[#E10600] focus:border-transparent transition-all"
                />
                <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-[#0F172A]">Password</label>
                <a href="#" className="text-[10px] font-bold text-[#E10600] hover:underline">Forgot Password?</a>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full bg-white border border-[#0F172A]/10 rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#0F172A] font-medium outline-none focus:ring-2 focus:ring-[#E10600] focus:border-transparent transition-all"
                />
                <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-[#0F172A]"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <input type="checkbox" id="remember" className="rounded text-[#E10600] focus:ring-[#E10600] border-gray-300 w-3 h-3" />
              <label htmlFor="remember" className="text-[10px] text-gray-400 font-medium cursor-pointer selection:bg-transparent">Remember me for 30 days</label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#E10600] hover:bg-[#C00500] text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-[#E10600]/25 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer mt-1 disabled:opacity-50"
            >
              {isLoading ? "Mengautentikasi..." : "Secure Login \u2192"}
            </button>
          </form>



          <span className="text-[9px] text-gray-400 font-semibold block text-center mt-4">
            Need technical support? <button type="button" onClick={() => setShowSupportPopup(true)} className="text-[#E10600] hover:underline cursor-pointer">Contact Admin</button>
          </span>
        </div>

        {/* Quick Helper Simulator Tags - Dipindah ke Luar Kotak Utama! */}
        {process.env.NODE_ENV !== "production" && (
          <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-2 mt-6 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
            <span className="text-[9px] font-bold text-white uppercase tracking-wider block">Simulasi Login Cepat:</span>
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => fillQuickCredential("admin@taekwondo.com")} className="bg-red-500 hover:bg-red-600 text-white border border-red-400 rounded px-3 py-1 text-[9px] font-bold transition-colors">Admin</button>
              <button type="button" onClick={() => fillQuickCredential("coach.ahmad@taekwondo.com")} className="bg-blue-500 hover:bg-blue-600 text-white border border-blue-400 rounded px-3 py-1 text-[9px] font-bold transition-colors">Coach</button>
              <button type="button" onClick={() => fillQuickCredential("member.beni@taekwondo.com")} className="bg-slate-600 hover:bg-slate-700 text-white border border-slate-500 rounded px-3 py-1 text-[9px] font-bold transition-colors">Member</button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Contact Popup */}
      {showSupportPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-[#0F172A] mb-2">Technical Support</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Jika Anda mengalami kesulitan login atau masalah teknis lainnya, silakan hubungi admin <strong>White Tiger Kraksaan</strong> melalui WhatsApp:
            </p>
            <div className="flex flex-col gap-3">
              <a 
                href="https://wa.me/6285258183564"
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-[#25D366]/20"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Chat WhatsApp Admin
              </a>
              <button 
                type="button" 
                onClick={() => setShowSupportPopup(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
