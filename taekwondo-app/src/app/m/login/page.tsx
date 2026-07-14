"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
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
      setError("Identitas masuk dan password wajib diisi.");
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login gagal.");

      // Login success
      router.push("/m/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6">
      {/* Brand header */}
      <div className="flex flex-col items-center mt-8">
        <div className="w-20 h-20 relative bg-slate-900 border-2 border-slate-800 rounded-3xl p-3 flex items-center justify-center shadow-lg shadow-black/40">
          <Image
            src="/wt-logo-mini.png"
            alt="Dojang Logo"
            width={60}
            height={60}
            className="object-contain"
          />
        </div>
        <h1 className="text-xl font-black tracking-tight mt-4 uppercase">White Tiger</h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Dojang Management App</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm mx-auto bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md mt-6">
        <h2 className="text-lg font-black uppercase mb-1">Mulai Latihan</h2>
        <p className="text-xs text-slate-400 mb-6">Masuk menggunakan email, username, atau no. WA terdaftar.</p>

        {error && (
          <div className="flex items-start gap-2 bg-red-950/80 border-2 border-red-500/30 text-red-400 p-3.5 rounded-2xl text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Email / Username / Phone */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">EMAIL / USERNAME / NO. WA</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username, Email, atau No. WhatsApp"
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

        <div className="mt-8 pt-6 border-t border-slate-800/50">
          <p className="text-center text-xs text-slate-400">
            Ingin beralih ke portal utama?{" "}
            <a href="/" className="text-[#E10600] font-black hover:underline uppercase transition-all">
              Kembali
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
