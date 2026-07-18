"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Camera, FileText, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import imageCompression from "browser-image-compression";

export default function RegistrationForm({ 
  onBack 
}: { 
  onBack: () => void 
}) {
  const [activeMode, setActiveMode] = useState<"register" | "payment">("register");

  // Registration states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [kk, setKk] = useState<string | null>(null);
  
  // Payment upload states
  const [paymentEmail, setPaymentEmail] = useState("");
  const [paymentProof, setPaymentProof] = useState<string | null>(null);

  // Status & loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [qrisData, setQrisData] = useState<{qrString: string, amount: number} | null>(null);

  const uploadToServer = async (file: File | Blob, filename: string): Promise<string | null> => {
    try {
      let fileToUpload = file;
      
      // Only compress if it's an image
      if (file.type && file.type.startsWith("image/")) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        // Convert Blob to File if needed because browser-image-compression expects a File or Blob
        const fileObj = file instanceof File ? file : new File([file], filename, { type: file.type });
        fileToUpload = await imageCompression(fileObj, options);
      }

      const formData = new FormData();
      formData.append("file", fileToUpload, filename);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        return data.url;
      }
      return null;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  // Handle KK File Upload (Upload direct to server)
  const handleKkChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadToServer(file, file.name);
      if (url) {
        setKk(url);
      } else {
        setErrorMsg("Gagal mengunggah KK. Coba lagi.");
      }
    }
  };

  // Handle Payment Proof File Upload (Upload direct to server)
  const handlePaymentProofChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadToServer(file, file.name);
      if (url) {
        setPaymentProof(url);
      } else {
        setErrorMsg("Gagal mengunggah bukti pembayaran. Coba lagi.");
      }
    }
  };

  // Submit Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setQrisData(null);

    // Validasi input dasar
    const cleanName = fullName.trim().replace(/[^a-zA-Z\s]/g, "");
    if (cleanName.length < 3) {
      setErrorMsg("Nama lengkap harus berupa huruf minimal 3 karakter.");
      return;
    }

    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    const cleanPhone = phone.trim().replace(/[-\s]/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMsg("Format nomor WhatsApp tidak valid. Gunakan format seperti 08123456789.");
      return;
    }

    if (!kk) {
      setErrorMsg("Silakan unggah pindaian/foto Kartu Keluarga (KK) Anda.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          phone,
          birthDate,
          kk,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.payment && data.payment.qrString) {
          setSuccessMsg("Pendaftaran Berhasil! Silakan scan QRIS di bawah ini untuk mengaktifkan keanggotaan Anda secara instan.");
          setQrisData({ qrString: data.payment.qrString, amount: data.payment.amount });
        } else {
          setSuccessMsg(`Pendaftaran Berhasil! Silakan periksa email Anda (${email}) untuk instruksi pembayaran manual.`);
        }
        // Reset form data but keep success msg/qris
        setFullName("");
        setEmail("");
        setPhone("");
        setBirthDate("");
        setKk(null);
      } else {
        setErrorMsg(data.error || "Gagal melakukan pendaftaran.");
      }
    } catch (err: any) {
      setErrorMsg("Terjadi kesalahan koneksi saat pendaftaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Payment Proof
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!paymentProof) {
      setErrorMsg("Silakan unggah foto/pindaian bukti transfer pembayaran.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/register/upload-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: paymentEmail,
          paymentProof,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Bukti pembayaran berhasil diunggah! Admin akan segera memverifikasi data Anda.");
        setPaymentEmail("");
        setPaymentProof(null);
      } else {
        setErrorMsg(data.error || "Gagal mengunggah bukti pembayaran.");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan koneksi saat mengunggah bukti pembayaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans py-24 px-6 relative overflow-hidden">
      {/* Background gradients matching LandingPage */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#E10600] rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#000000] rounded-full filter blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col gap-8">
        <button 
          onClick={() => { onBack(); }} 
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        {/* Tab Selector */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-1.5 flex gap-2 w-full">
          <button
            onClick={() => { setErrorMsg(""); setSuccessMsg(""); setActiveMode("register"); }}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeMode === "register" 
                ? "bg-[#E10600] text-white shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Pendaftaran Online Baru
          </button>
          <button
            onClick={() => { setErrorMsg(""); setSuccessMsg(""); setActiveMode("payment"); }}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeMode === "payment" 
                ? "bg-[#E10600] text-white shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Unggah Bukti Bayar
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-[#1E293B]/70 backdrop-blur-xl border border-white/10 rounded-[28px] p-8 md:p-10 shadow-2xl">
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex gap-3 mb-6 items-center">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <span className="text-xs font-bold leading-relaxed">{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex gap-3 mb-6 items-center">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span className="text-xs font-bold leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {qrisData ? (
            <div className="flex flex-col items-center justify-center py-8">
              <h2 className="text-2xl font-black font-display text-white mb-2">Selesaikan Pembayaran</h2>
              <p className="text-gray-400 text-xs mb-8 text-center max-w-sm">Scan kode QRIS ini dengan aplikasi M-Banking atau E-Wallet pilihan Anda untuk mengaktifkan keanggotaan. Biaya pendaftaran: <strong className="text-white">Rp {qrisData.amount.toLocaleString("id-ID")}</strong></p>
              <div className="bg-white p-4 rounded-2xl shadow-xl">
                <img src={qrisData.qrString} alt="QRIS Payment" className="w-64 h-64 object-contain" />
              </div>
              <p className="text-[#E10600] text-[10px] font-bold mt-4 animate-pulse">Menunggu pembayaran otomatis terverifikasi...</p>
              <button onClick={() => setQrisData(null)} className="mt-8 text-xs text-gray-400 hover:text-white underline">Kembali ke form Pendaftaran</button>
            </div>
          ) : activeMode === "register" ? (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-6">
              <div className="text-center md:text-left mb-2">
                <h2 className="text-2xl font-black font-display text-white">Formulir Registrasi Anggota</h2>
                <p className="text-gray-400 text-xs mt-1">Lengkapi data Anda dan unggah pindaian Kartu Keluarga.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Beni Setiawan"
                    required
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600] text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Alamat Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600] text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Nomor WhatsApp / Telp</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    required
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600] text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Tanggal Lahir</label>
                  <input 
                    type="date" 
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600] text-white"
                  />
                </div>
              </div>
              {/* KK Upload Section */}
              <div className="border border-white/10 rounded-2xl p-6 bg-[#0F172A]/50">
                <label className="block text-xs font-bold text-gray-300 uppercase mb-3">Foto / Scan Kartu Keluarga (KK)</label>
                
                {kk ? (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold">Kartu Keluarga Berhasil Dipilih</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setKk(null)}
                      className="text-xs font-bold text-red-400 hover:underline cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="relative flex flex-col items-center justify-center border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={handleKkChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors mb-3" />
                    <span className="text-xs font-bold block mb-1">Unggah dokumen Kartu Keluarga Anda</span>
                    <span className="text-[10px] text-gray-400">Format gambar (JPG, PNG) atau PDF (Maks 5MB)</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#E10600] hover:bg-[#C00500] text-white py-4 rounded-2xl font-bold text-xs shadow-lg shadow-[#E10600]/25 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 cursor-pointer"
              >
                {isSubmitting ? "Sedang Mengirim..." : "Kirim Formulir Pendaftaran \u2192"}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-6">
              <div className="text-center md:text-left mb-2">
                <h2 className="text-2xl font-black font-display text-white">Unggah Bukti Transfer Pembayaran</h2>
                <p className="text-gray-400 text-xs mt-1">Verifikasi keanggotaan Anda dengan mengunggah struk transfer pendaftaran.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Alamat Email Pendaftar</label>
                <input 
                  type="email" 
                  value={paymentEmail}
                  onChange={(e) => setPaymentEmail(e.target.value)}
                  placeholder="Masukkan email yang Anda daftarkan sebelumnya"
                  required
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600] text-white"
                />
              </div>

              {/* Payment Proof File Selector */}
              <div className="border border-white/10 rounded-2xl p-6 bg-[#0F172A]/50">
                <label className="block text-xs font-bold text-gray-300 uppercase mb-3 font-display">Struk / Bukti Transfer Mandiri</label>
                
                {paymentProof ? (
                  <div className="relative w-48 h-64 mx-auto rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md">
                    <img src={paymentProof} alt="Proof preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setPaymentProof(null)}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-full cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="relative flex flex-col items-center justify-center border border-dashed border-white/20 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePaymentProofChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors mb-3" />
                    <span className="text-xs font-bold block mb-1">Unggah Struk Transfer Pembayaran</span>
                    <span className="text-[10px] text-gray-400">Pastikan nominal transfer tertera dengan jelas</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#E10600] hover:bg-[#C00500] text-white py-4 rounded-2xl font-bold text-xs shadow-lg shadow-[#E10600]/25 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 cursor-pointer"
              >
                {isSubmitting ? "Sedang Mengirim..." : "Kirim Bukti Pembayaran"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
