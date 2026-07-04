"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function MobileLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login gagal.");
      if (data.role !== "member") {
        throw new Error("Akses khusus member.");
      }
      router.replace("/m/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center min-h-screen bg-[#020617] text-white relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-[url('/bg_taekwondo_kick.png')] bg-cover bg-top opacity-30 pointer-events-none" 
        style={{ mixBlendMode: 'screen' }} 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent pointer-events-none" />

      {/* Decorative Game Header */}
      <div className="relative pt-10 pb-8 px-6 flex flex-col items-center z-10">
        {/* Glow red light */}
        <div className="absolute top-0 w-72 h-72 bg-[#E10600]/20 rounded-full blur-[80px]" />
        
        <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-100 border-2 border-white/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(225,6,0,0.4)] animate-game-float relative z-10">
          <Image src="/logo.png" alt="Logo" width={80} height={80} className="object-contain p-2 drop-shadow-md" />
        </div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#E2E8F0] to-[#94A3B8] tracking-wider text-center leading-none uppercase relative z-10 drop-shadow-lg">
          WHITE TIGER<br />
          <span className="text-[#E10600] drop-shadow-[0_0_8px_rgba(225,6,0,0.8)]">TAEKWONDO CLUB</span>
        </h1>
        <p className="text-slate-400 text-[10px] font-black mt-3 uppercase tracking-[0.3em] relative z-10">
          — Portal Member —
        </p>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[90%] mx-auto bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.5)] mb-10 ring-1 ring-white/10">
        <div>
          <h2 className="text-2xl font-black">MEMULAI PETUALANGAN 🥋</h2>
          <p className="text-xs text-slate-400 mt-1">Masuk dengan email & password terdaftar Anda</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-950/80 border-2 border-red-500/30 text-red-400 p-3.5 rounded-2xl text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Email Atlet</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="atlet@email.com"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border-2 border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 outline-none focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600]/30 transition-all font-bold"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">Password</label>
              <a href="#" className="text-[10px] font-black text-[#E10600] uppercase tracking-wide">Lupa PIN/Password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-12 py-3.5 bg-slate-950 border-2 border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 outline-none focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600]/30 transition-all font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-battle py-4 text-base active:scale-95 transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "MULAI BATTLE (LOGIN)"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-auto">
          Ingin beralih ke portal utama?{" "}
          <a href="/" className="text-[#E10600] font-black hover:underline uppercase">
            Kembali
          </a>
        </p>
      </div>
    </div>
  );
}
