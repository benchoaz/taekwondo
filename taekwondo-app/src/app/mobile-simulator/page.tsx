"use client";
import React, { useState } from 'react';
import { Lock, Mail, Wifi, BatteryFull, LogOut, User, Trophy, Calendar } from 'lucide-react';

import StitchDashboard from './StitchDashboard';

export default function MobileSimulator() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Email dan Password harus diisi');
      return;
    }
    
    setIsLoading(true);
    try {
      // Connect to the actual backend API
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login gagal');
      }
      
      // Login successful!
      setUserData(data.user);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 font-sans">
      <div className="text-center mr-16 max-w-md hidden lg:block">
        <h1 className="text-4xl font-black text-white mb-4">Simulator Aplikasi Mobile</h1>
        <p className="text-slate-400">
          Karena server ini tidak memiliki SDK Flutter dan Emulator Android fisik, saya telah membangun simulator virtual ini. 
          Ini adalah wujud persis bagaimana kode Flutter yang saya rancang akan terlihat di HP Android/iOS member Anda.
        </p>
        <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm font-bold">
          ✨ Baru Saja Diperbarui: Menggunakan Desain Asli dari Google Stitch!
        </div>
      </div>

      {/* Phone Frame */}
      <div className="relative w-[375px] h-[812px] bg-black rounded-[50px] shadow-2xl border-[8px] border-black overflow-hidden ring-1 ring-white/20 flex flex-col">
        {/* Top Notch/Dynamic Island area */}
        <div className="absolute top-0 inset-x-0 h-7 flex justify-between items-center px-6 z-50 text-white text-[11px] font-medium pointer-events-none">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <BatteryFull className="w-4 h-4" />
          </div>
        </div>
        <div className="absolute top-0 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="w-32 h-6 bg-black rounded-b-3xl"></div>
        </div>

        {/* App UI */}
        <div className="flex-1 w-full bg-[#F8FAFC] flex flex-col relative pt-12 overflow-y-auto hide-scrollbar">
          
          {!isLoggedIn ? (
            /* Login Screen Mockup */
            <div className="flex-1 flex flex-col justify-center px-8 pb-20">
              {/* Logo Area */}
              <div className="flex flex-col items-center mb-12 mt-8">
                <div className="w-32 h-32 flex items-center justify-center mb-6">
                  <img 
                    src="/logo.png" 
                    alt="Taekwondo Academy Logo" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
                <h2 className="text-3xl font-black text-[#0F172A] text-center tracking-tight leading-tight">
                  TAEKWONDO<br />ACADEMY
                </h2>
              </div>

              {/* Form Area */}
              <div className="flex flex-col gap-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 text-center">
                    {error}
                  </div>
                )}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#E10600] focus:border-[#E10600] outline-none transition-all text-[#0F172A]" 
                    placeholder="Email / NIK Member" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#E10600] focus:border-[#E10600] outline-none transition-all text-[#0F172A]" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                <div className="text-right mt-1 mb-4">
                  <a href="#" className="text-xs font-bold text-[#E10600]">Lupa Password?</a>
                </div>

                <button 
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-[#E10600] hover:bg-[#C00500] disabled:bg-slate-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#E10600]/25 transition-all active:scale-95 flex justify-center items-center h-14"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "LOGIN SEKARANG"
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Render Google Stitch UI */
            <div className="flex-1 w-full h-full relative -mt-12">
               {/* Note: -mt-12 negates the pt-12 padding so Stitch UI can take full screen including status bar area safely */}
               <StitchDashboard />
            </div>
          )}
          
          {/* Home Indicator */}
          <div className="absolute bottom-2 inset-x-0 flex justify-center z-[100] pointer-events-none">
            <div className="w-32 h-1.5 bg-slate-800/80 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
