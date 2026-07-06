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
            <img src={settings.logoUrl || "/logo.png"} alt="Logo" className="w-10 h-10 object-contain" />
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

          {/* Social login divider */}
          <div className="w-full flex items-center justify-center gap-3 my-4">
            <hr className="w-full border-slate-200" />
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center shrink-0">OR CONTINUE WITH</span>
            <hr className="w-full border-slate-200" />
          </div>

          {/* Google SSO */}
          <button 
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full bg-white border border-slate-200 text-gray-700 py-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer mb-2.5"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
              <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.93 1 12 1 7.37 1 3.4 3.65 1.44 7.51l3.79 2.94C6.18 7.42 8.87 5.04 12 5.04z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.58l3.7 2.87c2.16-1.99 3.71-4.92 3.71-8.6z"/>
              <path fill="#FBBC05" d="M5.23 14.75a7.12 7.12 0 0 1 0-4.5l-3.79-2.94a11.98 11.98 0 0 0 0 10.38l3.79-2.94z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.13 0-5.82-2.38-6.77-5.41L1.44 16.3C3.4 20.15 7.37 23 12 23z"/>
            </svg>
            Continue with Google
          </button>
          
          {/* Email Magic Link */}
          <button 
            type="button"
            onClick={() => {
              if(!email) {
                setErrorMsg("Silakan isi alamat email Anda terlebih dahulu.");
                return;
              }
              setIsLoading(true);
              signIn("email", { email, callbackUrl: "/dashboard", redirect: false })
                .then((res) => {
                  setIsLoading(false);
                  if (res?.error) setErrorMsg("Gagal mengirim link ke email Anda.");
                  else setErrorMsg("✅ Link Ajaib berhasil dikirim ke " + email + ". Cek Inbox Anda!");
                });
            }}
            className="w-full bg-[#0F172A] text-white py-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            Send Magic Link to Email
          </button>

          <span className="text-[9px] text-gray-400 font-semibold block text-center mt-4">
            Need technical support? <a href="#" className="text-[#E10600] hover:underline">Contact Admin</a>
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
    </div>
  );
}
