"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Shield, 
  Menu, 
  X, 
  ChevronRight, 
  Award, 
  Activity, 
  Calendar, 
  Sparkles,
  TrendingUp,
  MapPin,
  Clock,
  Mail,
  Phone,
  BookOpen,
  User,
  CalendarOff,
  Play,
  Film,
  Video as VideoIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSlider from "@/components/HeroSlider";
import Image from "next/image";

function getInitials(name?: string | null): string {
  if (!name) return "WT";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function LandingPage({ 
  onNavigate 
}: { 
  onNavigate: (view: "landing" | "member" | "coach" | "admin" | "verify" | "schedule-view" | "ukt-registration" | "register") => void 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("SEMUA");

  // Dynamic Settings State
  const [settings, setSettings] = useState({
    logoUrl: "/logo.png" as string | null,
    heroBgUrl: null as string | null,
    dojangName: "WHITE TIGER TAEKWONDO",
    motto: "Disiplin • Integritas • Prestasi",
    heroTitle: "Bentuk Mental Sang Juara. Lahirkan Macan Putih Sejati.",
    description: "Bukan sekadar tempat berlatih, ini adalah rumah bagi para petarung sejati. Temukan potensi terbaikmu dan jadilah juara bersama keluarga besar White Tiger.",
    address: "Pusat Pelatihan White Tiger, Jakarta Selatan",
    email: "halo@whitetiger-tkd.com",
    phone: "+62 811-1234-5678",
    registrationFee: 75000,
    appApkUrl: null as string | null,
    tiktokUrl: "https://www.tiktok.com/@whitetigerkraksaan" as string | null,
    facebookUrl: "https://www.facebook.com/whitetigerkraksaan" as string | null,
    instagramUrl: "https://www.instagram.com/whitetigerkraksaan" as string | null,
    telegramUrl: "https://t.me/whitetigerkraksaan" as string | null,
    youtubeUrl: "https://www.youtube.com/@whitetigerkraksaan" as string | null,
  });

  // Dynamic Articles/Events & Coaches State
  const [articles, setArticles] = useState<any[]>([]);
  const [dbCoaches, setDbCoaches] = useState<any[]>([]);
  const [dbGallery, setDbGallery] = useState<any[]>([]);
  const [dbAchievements, setDbAchievements] = useState<any[]>([]);
  const [dbVideos, setDbVideos] = useState<any[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState({ members: 0, coaches: 0, achievements: 0 });

  const [announcement, setAnnouncement] = useState<any>(null);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  // Top athletes preview for Hall of Fame section
  const defaultAthletes = [
    {
      memberId: "default-1",
      fullName: "M. Farhan Al-Ghifari",
      currentBelt: "Sabuk Merah",
      selfieUrl: null,
      goldCount: 3,
      silverCount: 1,
      bronzeCount: 0,
      totalMedals: 4,
    },
    {
      memberId: "default-2",
      fullName: "Alya Zahra Ramadhani",
      currentBelt: "Sabuk Merah Strip Hitam",
      selfieUrl: null,
      goldCount: 2,
      silverCount: 2,
      bronzeCount: 1,
      totalMedals: 5,
    },
    {
      memberId: "default-3",
      fullName: "Bintang Satria Wicaksana",
      currentBelt: "Sabuk Biru Strip Merah",
      selfieUrl: null,
      goldCount: 2,
      silverCount: 0,
      bronzeCount: 1,
      totalMedals: 3,
    },
    {
      memberId: "default-4",
      fullName: "Nadia Putri Kirana",
      currentBelt: "Sabuk Biru",
      selfieUrl: null,
      goldCount: 1,
      silverCount: 2,
      bronzeCount: 0,
      totalMedals: 3,
    },
  ];

  const topAthletes = useMemo(() => {
    if (!Array.isArray(dbAchievements) || dbAchievements.length === 0) {
      return defaultAthletes;
    }

    const groupMap = new Map<string, {
      memberId: string;
      fullName: string;
      selfieUrl: string | null;
      currentBelt: string | null;
      achievements: any[];
      goldCount: number;
      silverCount: number;
      bronzeCount: number;
      totalMedals: number;
    }>();

    dbAchievements.forEach((ach: any) => {
      const memberId = ach.member?.id || `unknown-${ach.id}`;
      const memberName = ach.member?.fullName || "Atlet White Tiger";
      const currentBelt = ach.member?.currentBelt || "Atlet Resmi";
      const heroPhotoUrl = ach.photoUrl || ach.member?.selfieUrl || null;

      if (!groupMap.has(memberId)) {
        groupMap.set(memberId, {
          memberId,
          fullName: memberName,
          selfieUrl: heroPhotoUrl,
          currentBelt,
          achievements: [],
          goldCount: 0,
          silverCount: 0,
          bronzeCount: 0,
          totalMedals: 0,
        });
      }

      const group = groupMap.get(memberId)!;
      group.achievements.push(ach);

      if (ach.photoUrl || (!group.selfieUrl && ach.member?.selfieUrl)) {
        group.selfieUrl = ach.photoUrl || ach.member?.selfieUrl || group.selfieUrl;
      }

      const rankLower = (ach.rank || "").toLowerCase();
      if (rankLower.includes("emas") || rankLower.includes("juara 1") || rankLower === "1") {
        group.goldCount++;
      } else if (rankLower.includes("perak") || rankLower.includes("juara 2") || rankLower === "2") {
        group.silverCount++;
      } else {
        group.bronzeCount++;
      }
      group.totalMedals = group.achievements.length;
    });

    const sorted = Array.from(groupMap.values()).sort((a, b) => {
      if (b.goldCount !== a.goldCount) return b.goldCount - a.goldCount;
      if (b.silverCount !== a.silverCount) return b.silverCount - a.silverCount;
      if (b.bronzeCount !== a.bronzeCount) return b.bronzeCount - a.bronzeCount;
      return b.achievements.length - a.achievements.length;
    });

    return sorted.length > 0 ? sorted.slice(0, 4) : defaultAthletes;
  }, [dbAchievements]);


  useEffect(() => {
    // Fetch Settings
    fetch("/api/settings", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setSettings(data);
      })
      .catch(err => console.error("Error fetching settings:", err))
      .finally(() => setIsSettingsLoaded(true));

    // Fetch Latest Active Announcement
    fetch("/api/announcements?active=true")
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.announcement) {
          setAnnouncement(data.announcement);
        }
      })
      .catch(err => console.error("Error fetching announcement:", err));

    // Fetch Articles
    fetch("/api/articles")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setArticles(data);
      })
      .catch(err => console.error("Error fetching articles:", err));
      
    // Fetch Events from Database
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(err => console.error("Error fetching events:", err));

    // Fetch Landing Stats
    fetch("/api/landing-stats")
      .then(res => res.json())
      .then(data => {
        if (data) setDbStats(data);
      })
      .catch(err => console.error("Error fetching stats:", err));

    // Fetch Coaches from Database
    fetch("/api/coaches")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbCoaches(data);
      })
      .catch(err => console.error("Error fetching coaches:", err));

    // Fetch Gallery from Database
    fetch("/api/gallery")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbGallery(data);
      })
      .catch(err => console.error("Error fetching gallery:", err));

    // Fetch Achievements from Database
    fetch("/api/achievements?status=APPROVED")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbAchievements(data);
      })
      .catch(err => console.error("Error fetching achievements:", err));

    // Fetch Videos from Database
    fetch("/api/videos")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbVideos(data);
      })
      .catch(err => console.error("Error fetching videos:", err));

    // Fetch Events from Database
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) setEvents(data.data.slice(0, 3));
      })
      .catch(err => console.error("Error fetching events:", err));
  }, []);

  const programs = [
    {
      category: "Anak-anak",
      age: "Usia 5-12 tahun",
      benefit: "Melatih motorik halus, kedisiplinan sejak dini, rasa percaya diri, dan sosialisasi.",
      icon: <Sparkles className="w-8 h-8 text-[#E10600]" />,
    },
    {
      category: "Remaja",
      age: "Usia 13-18 tahun",
      benefit: "Pembentukan karakter, penyaluran energi positif, pertahanan diri, dan fisik bugar.",
      icon: <Activity className="w-8 h-8 text-[#E10600]" />,
    },
    {
      category: "Dewasa",
      age: "Usia 18+ tahun",
      benefit: "Pelepas stres, kebugaran kardiovaskular maksimal, self-defense taktis, dan fleksibilitas.",
      icon: <TrendingUp className="w-8 h-8 text-[#E10600]" />,
    },
    {
      category: "Prestasi / Atlet",
      age: "Kelas Kompetisi",
      benefit: "Persiapan Kejuaraan Nasional & Internasional (Kyorugi & Poomsae), latihan intensif.",
      icon: <Award className="w-8 h-8 text-[#E10600]" />,
    }
  ];

  if (!isSettingsLoaded) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E10600] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const coaches = [
    {
      name: "Master Ahmad S.B.",
      rank: "Dan 5 Kukkiwon",
      exp: "15 Tahun Pengalaman",
      awards: "Mantan Atlet Nasional, Pelatih Sertifikasi PBTI",
      img: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Sabeum Nim Rian",
      rank: "Dan 3 Kukkiwon",
      exp: "8 Tahun Pengalaman",
      awards: "Medali Emas Kejurnas Poomsae 2023",
      img: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=500&q=80"
    },
    {
      name: "Sabeum Nim Clarissa",
      rank: "Dan 3 Kukkiwon",
      exp: "6 Tahun Pengalaman",
      awards: "Spesialisasi Kelas Anak & Kyorugi Putri",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80"
    }
  ];

  const galleryItems = [
    { type: "UKT", title: "Ujian Kenaikan Tingkat Des 2025", img: "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=600&q=80" },
    { type: "KEJUARAAN", title: "Kejuaraan Provinsi Banten 2025", img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80" },
    { type: "LATIHAN", title: "Latihan Fisik Bersama", img: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=600&q=80" },
    { type: "SEMINAR", title: "Seminar Wasit & Pelatih 2026", img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80" }
  ];

  const displayGallery = dbGallery.length > 0 ? dbGallery.map(g => ({
    type: g.category,
    title: g.title || g.category,
    img: g.imageUrl
  })) : galleryItems;

  const filteredGallery = activeCategory === "SEMUA" 
    ? displayGallery 
    : displayGallery.filter(item => item.type === activeCategory);

  const displayCoaches = dbCoaches.length > 0 ? dbCoaches.map(c => ({
    name: c.fullName,
    rank: c.danRank,
    exp: c.experience,
    awards: c.specialty,
    img: c.photoUrl || "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=500&q=80"
  })) : coaches;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#FFFFFF]/80 backdrop-blur-xl border-b border-[#0F172A]/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src={settings.logoUrl || "/logo.png"} alt="Logo" width={48} height={48} className="object-contain" />
            <div className="hidden md:block">
              <span className="font-extrabold text-lg text-[#0F172A] block tracking-tight font-display">{settings.dojangName}</span>
              <span className="text-[10px] uppercase font-bold text-[#E10600] tracking-widest -mt-1 block">{settings.motto}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 font-medium text-sm text-[#0F172A]">
            <a href="#events" onClick={(e) => { e.preventDefault(); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="hover:text-[#E10600] transition-colors">Informasi</a>
            <a href="#achievements" onClick={(e) => { e.preventDefault(); document.getElementById('achievements')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="hover:text-[#E10600] transition-colors font-bold text-[#E10600]">Hall of Fame</a>
            <a href="#coaches" onClick={(e) => { e.preventDefault(); document.getElementById('coaches')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="hover:text-[#E10600] transition-colors">Pelatih</a>
            <a href="#gallery" className="hover:text-[#E10600] transition-colors">Galeri</a>
            <a href="#videos" onClick={(e) => { e.preventDefault(); document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="hover:text-[#E10600] transition-colors font-bold text-red-600">Video</a>
            <button onClick={() => onNavigate("schedule-view")} className="hover:text-[#E10600] transition-colors cursor-pointer text-left">Jadwal</button>
            <button onClick={() => onNavigate("verify")} className="hover:text-[#E10600] transition-colors cursor-pointer text-left">Verifikasi Sertifikat</button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate("member")} 
              className="bg-[#E10600] hover:bg-[#C00500] text-white px-3 py-2 md:px-5 md:py-2.5 rounded-[8px] md:rounded-[12px] font-bold text-[10px] md:text-xs transition-all shadow-md shadow-[#E10600]/25 active:scale-95 cursor-pointer"
            >
              Login Aplikasi
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#0F172A]"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[73px] w-full bg-white z-40 border-b border-[#0F172A]/5 py-6 px-6 flex flex-col gap-4 shadow-lg lg:hidden"
          >
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-[#0F172A]">Tentang Kami</a>
            <a href="#programs" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-[#0F172A]">Program</a>
            <a href="#events" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-[#0F172A]">Agenda</a>
            <a href="#achievements" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-[#E10600]">Hall of Fame</a>
            <a href="#coaches" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-[#0F172A]">Pelatih</a>
            <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-[#0F172A]">Galeri</a>
            <a href="#videos" onClick={() => { setMobileMenuOpen(false); document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth' }); }} className="font-semibold text-red-600">Video Dokumentasi</a>
            <button onClick={() => { setMobileMenuOpen(false); onNavigate("schedule-view"); }} className="font-semibold text-[#0F172A] text-left">Jadwal</button>
            <button onClick={() => { setMobileMenuOpen(false); onNavigate("verify"); }} className="font-semibold text-[#0F172A] text-left">Verifikasi Sertifikat</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teks Berjalan Pengumuman Terakhir */}
      {announcement && (
        <div className="mt-[80px] bg-[#E10600] text-white py-2 overflow-hidden border-b border-[#C00500] z-30 relative">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
            <span className="bg-white text-[#E10600] text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest shrink-0 animate-pulse">📢 INFO</span>
            {React.createElement('marquee', {
              className: "text-xs font-bold font-sans tracking-wide",
              scrollamount: "4"
            } as any, `${announcement.title}: ${announcement.message}${
              announcement.expiresAt
                ? `  [Berlaku s.d. ${new Date(announcement.expiresAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} WIB]`
                : ""
            }`)}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative w-full min-h-[819px] flex items-center justify-center overflow-hidden bg-[#0F172A]">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-110 opacity-40" 
            style={{ 
              backgroundImage: isSettingsLoaded ? `url('${settings.heroBgUrl || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1920&q=80'}')` : 'none'
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/60 via-[#0F172A]/80 to-[#0F172A]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center flex flex-col items-center gap-8 py-16 pt-32 md:pt-16">
          <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.1] max-w-4xl drop-shadow-lg font-display">
            {settings.heroTitle}
          </h1>

          <p className="text-gray-200 text-sm sm:text-base max-w-2xl leading-relaxed drop-shadow-md">
            {settings.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 items-center">
            <button 
              onClick={() => onNavigate("register")} 
              className="bg-white hover:bg-slate-100 text-[#E10600] px-8 py-4 rounded-[12px] font-bold text-sm transition-all shadow-xl active:scale-95 w-full sm:w-auto"
            >
              Daftar Sekarang (Rp {settings.registrationFee.toLocaleString("id-ID")})
            </button>
            <button 
              onClick={() => onNavigate("schedule-view")} 
              className="bg-[#E10600]/30 hover:bg-[#E10600]/50 text-white border border-white/50 px-8 py-4 rounded-[12px] font-bold text-sm transition-all backdrop-blur-md active:scale-95 w-full sm:w-auto"
            >
              Jadwal Latihan
            </button>
            {settings.appApkUrl && (
              <a 
                href={settings.appApkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all hover:scale-105 active:scale-95 w-[160px] inline-block"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Download di Google Play" 
                  className="w-full h-auto"
                />
              </a>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-12 mt-8 pt-8 border-t border-white/20 text-white w-full max-w-2xl">
            <div className="text-center">
              <span className="block font-black text-4xl">{dbStats.members > 0 ? dbStats.members : "500+"}</span>
              <span className="text-gray-300 text-xs font-semibold uppercase tracking-widest mt-1 block">Anggota</span>
            </div>
            <div className="text-center">
              <span className="block font-black text-4xl">{dbStats.coaches > 0 ? dbStats.coaches : displayCoaches.length}</span>
              <span className="text-gray-300 text-xs font-semibold uppercase tracking-widest mt-1 block">Pelatih Bersertifikat</span>
            </div>
            <div className="text-center">
              <span className="block font-black text-4xl">{dbStats.achievements > 0 ? dbStats.achievements : "100+"}</span>
              <span className="text-gray-300 text-xs font-semibold uppercase tracking-widest mt-1 block">Medali</span>
            </div>
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section className="py-24 max-w-7xl mx-auto px-6" id="programs">
        <div className="text-center mb-16">
          <span className="text-xs font-black uppercase text-[#E10600] tracking-widest">KATEGORI PROGRAM</span>
          <h2 className="text-4xl font-extrabold text-[#0F172A] mt-2 font-display">Program Spesialisasi White Tiger</h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">Pilih program latihan terbaik yang didesain secara khusus untuk usia dan tingkat keahlian Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {programs.map((prog, idx) => (
            <div key={idx} className="glass-card p-8 hover:scale-[1.03] duration-300 transition-all glow-hover flex flex-col justify-between group cursor-pointer">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#E10600]/5 flex items-center justify-center mb-6 group-hover:bg-[#E10600] transition-colors duration-300">
                  {React.cloneElement(prog.icon, { className: "w-7 h-7 text-[#E10600] group-hover:text-white transition-colors" })}
                </div>
                <span className="text-xs font-bold text-[#E10600] uppercase tracking-wider block mb-1">{prog.age}</span>
                <h3 className="text-xl font-bold text-[#0F172A] mb-3">{prog.category}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{prog.benefit}</p>
              </div>
              <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1 group-hover:text-[#E10600] transition-colors">
                Daftar Kelas <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Agenda Section */}
      <section className="py-24 bg-white border-t border-b border-[#0F172A]/5" id="events">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase text-[#E10600] tracking-widest">AGENDA KEGIATAN &amp; BERITA</span>
            <h2 className="text-4xl font-extrabold text-[#0F172A] mt-2 font-display">Aktivitas &amp; Pengumuman Terkini</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">Ikuti kabar terbaru seputar jadwal kejuaraan, ujian kenaikan tingkat, dan info penting dojang.</p>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs bg-[#F8FAFC] rounded-2xl border border-slate-100">
              Belum ada berita atau agenda yang diterbitkan saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {articles.slice(0, 3).map((art) => (
                <div key={art.id} className="bg-[#F8FAFC] border border-[#0F172A]/5 rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    {art.imageUrl && (
                      <div className="h-52 w-full overflow-hidden relative">
                        <Image src={art.imageUrl} alt={art.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold mb-2">
                        <span>Oleh: {art.author}</span>
                        <span>{new Date(art.createdAt).toLocaleDateString("id-ID")}</span>
                      </div>
                      <h3 className="font-extrabold text-base text-[#0F172A] mb-2">{art.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-4 whitespace-pre-wrap mb-4">{art.content}</p>
                      
                      {art.proposalUrl && (
                        <a 
                          href={art.proposalUrl} 
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#E10600]/10 hover:bg-[#E10600]/20 text-[#E10600] font-bold text-xs rounded-lg transition-colors border border-[#E10600]/10"
                        >
                          📥 Unduh Proposal (PDF)
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION: PRESTASI (HALL OF FAME PREVIEW) ── */}
      <section className="py-24 bg-[#0a0908] text-[#ece4d3] relative overflow-hidden font-jost" id="achievements">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-[#c6a15b]/10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <span className="font-jost text-xs font-black tracking-[0.3em] uppercase text-[#c6a15b] mb-3 block">
            WHITE TIGER KRAKSAAN
          </span>
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold text-[#ece4d3] mb-4">
            HALL OF <span className="text-[#e6c883]">FAME</span>
          </h2>
          <p className="font-jost text-[#8d8676] text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
            Dinding penghormatan resmi atlet sang juara. Dedikasi, disiplin, dan perjuangan mengukir medali kebanggaan Dojang.
          </p>

          {/* Decorative Divider with Central Diamond */}
          <div className="flex items-center gap-4 w-full max-w-md mx-auto mb-12">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#c6a15b]/40 to-[#c6a15b]/40" />
            <div className="w-2.5 h-2.5 rotate-45 border border-[#e6c883] bg-[#7c1f26] shrink-0 shadow-[0_0_8px_rgba(230,200,131,0.5)]" />
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#c6a15b]/40 to-[#c6a15b]/40" />
          </div>

          {/* Top Athlete Cards Preview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left mb-12">
            {topAthletes.map((athlete) => (
              <Link
                href="/hall-of-fame"
                key={athlete.memberId}
                className="group relative bg-gradient-to-b from-[#131110] to-[#1b1815] border border-[#c6a15b]/20 hover:border-[#e6c883] p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_15px_35px_-10px_rgba(198,161,91,0.25)] cursor-pointer flex flex-col justify-between"
              >
                {/* Corner Brackets (Sudut Siku Emas) */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#c6a15b]/50 group-hover:border-[#e6c883] transition-colors" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#c6a15b]/50 group-hover:border-[#e6c883] transition-colors" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#c6a15b]/50 group-hover:border-[#e6c883] transition-colors" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#c6a15b]/50 group-hover:border-[#e6c883] transition-colors" />

                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-5">
                    {/* Cincin Gradasi Emas-Merah */}
                    <div className="p-[3px] rounded-full bg-gradient-to-tr from-[#7c1f26] via-[#c6a15b] to-[#e6c883] shadow-lg group-hover:shadow-[0_0_15px_rgba(230,200,131,0.4)] transition-shadow">
                      <div className="p-[2px] bg-[#131110] rounded-full">
                        {athlete.selfieUrl ? (
                          <img
                            src={athlete.selfieUrl}
                            alt={athlete.fullName}
                            loading="lazy"
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-[#1b1815] flex items-center justify-center border border-[#c6a15b]/20">
                            <span className="font-cinzel font-bold text-lg text-[#e6c883]">
                              {getInitials(athlete.fullName)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Club Seal Badge */}
                    <div
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#7c1f26] border-2 border-[#c6a15b] flex items-center justify-center text-[9px] font-black text-[#e6c883] font-cinzel shadow-md"
                      title="White Tiger Club Seal"
                    >
                      WTK
                    </div>
                  </div>

                  {/* Member Name */}
                  <h3 className="font-cinzel text-base font-bold text-[#ece4d3] group-hover:text-[#e6c883] transition-colors leading-tight mb-1 line-clamp-1">
                    {athlete.fullName}
                  </h3>

                  {/* Belt Subtitle */}
                  <p className="font-jost text-[10px] tracking-[0.15em] text-[#8d8676] uppercase line-clamp-1 mb-3">
                    {athlete.currentBelt || "Atlet Resmi"}
                  </p>

                  {/* Medal Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-center bg-[#0a0908]/80 border border-[#c6a15b]/20 px-3 py-1.5 rounded-full mb-3">
                    {athlete.goldCount > 0 && (
                      <span className="text-[10px] font-bold text-[#e6c883] flex items-center gap-0.5">
                        🥇 {athlete.goldCount} <span className="hidden sm:inline">Emas</span>
                      </span>
                    )}
                    {athlete.silverCount > 0 && (
                      <span className="text-[10px] font-bold text-slate-300 flex items-center gap-0.5">
                        🥈 {athlete.silverCount} <span className="hidden sm:inline">Perak</span>
                      </span>
                    )}
                    {athlete.bronzeCount > 0 && (
                      <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                        🥉 {athlete.bronzeCount} <span className="hidden sm:inline">Perunggu</span>
                      </span>
                    )}
                    {athlete.goldCount === 0 && athlete.silverCount === 0 && athlete.bronzeCount === 0 && (
                      <span className="text-[10px] text-[#8d8676]">{athlete.totalMedals || 1} Prestasi</span>
                    )}
                  </div>

                  {/* Divider Line */}
                  <div className="w-7 h-[1.5px] bg-[#c6a15b]/40 my-2 group-hover:w-12 group-hover:bg-[#e6c883] transition-all" />
                </div>

                {/* Hover Action Text */}
                <div className="mt-2 text-center overflow-hidden">
                  <span className="font-jost text-[10px] font-bold tracking-[0.25em] text-[#e6c883] uppercase opacity-80 group-hover:opacity-100 transform translate-y-0 transition-all duration-300 inline-flex items-center gap-1">
                    Lihat Prestasi →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/hall-of-fame"
            className="inline-flex items-center gap-3 border-2 border-[#c6a15b] bg-[#131110] text-[#e6c883] hover:bg-[#c6a15b] hover:text-[#0a0908] font-bold text-sm uppercase tracking-[0.2em] px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-[0_0_25px_rgba(198,161,91,0.4)] group"
          >
            <span>Buka Dinding Kehormatan (Hall of Fame)</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </section>

      {/* Coaches Section */}
      <section className="py-24 bg-slate-50" id="coaches">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase text-[#E10600] tracking-widest">TIM COACH</span>
            <h2 className="text-4xl font-extrabold text-[#0F172A] mt-2 font-display">Pelatih Berpengalaman &amp; Berlisensi</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">Dipandu langsung oleh master dan sabeum pemegang Dan hitam resmi Kukkiwon World Taekwondo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayCoaches.map((coach, idx) => (
              <div key={idx} className="bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all group border border-[#0F172A]/5">
                <div className="relative h-72 w-full overflow-hidden">
                  <Image 
                    src={coach.img} 
                    alt={coach.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 bg-[#E10600] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {coach.rank}
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs text-gray-400 font-semibold block uppercase mb-1">{coach.exp}</span>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">{coach.name}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{coach.awards}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 max-w-7xl mx-auto px-6" id="gallery">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-black uppercase text-[#E10600] tracking-widest">GALERI AKTIVITAS</span>
            <h2 className="text-4xl font-extrabold text-[#0F172A] mt-2 font-display">Aktivitas Terkini Dojang</h2>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {["SEMUA", "UKT", "KEJUARAAN", "LATIHAN", "SEMINAR"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
                  activeCategory === cat 
                    ? "bg-[#E10600] text-white" 
                    : "bg-[#0F172A]/5 text-[#0F172A] hover:bg-[#0F172A]/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredGallery.map((item, idx) => {
              // Menentukan tinggi dinamis secara pseudo-random tapi konsisten berdasarkan index
              // Pola variasi tinggi untuk nuansa scrapbook/masonry
              const heights = ["h-[300px]", "h-[450px]", "h-[250px]", "h-[380px]", "h-[500px]", "h-[320px]"];
              const randomHeight = heights[idx % heights.length];

              return (
                <motion.div
                  key={item.img + idx}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, delay: (idx % 6) * 0.1, ease: "easeOut" }}
                  className={`relative rounded-3xl overflow-hidden ${randomHeight} w-full shadow-lg group border-4 border-white break-inside-avoid hover:z-10`}
                >
                  <Image 
                    src={item.img} 
                    alt={item.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" 
                    className="object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full inline-block mb-3 shadow-sm">
                      {item.type}
                    </span>
                    <h4 className="text-white font-extrabold text-lg sm:text-xl leading-snug drop-shadow-lg">{item.title}</h4>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* ── SECTION: VIDEO & DOKUMENTASI AKSI ── */}
      {(() => {
        const defaultVideos = [
          {
            id: "default-v1",
            title: "Highlight Aksi Kejuaraan Taekwondo White Tiger Kraksaan",
            description: "Dokumentasi kejuaraan resmi para atlet White Tiger Kraksaan mengukir prestasi medali emas di ajang tingkat daerah dan provinsi.",
            youtubeUrl: "https://www.youtube.com/watch?v=kXYiU_JCYtU",
            category: "KEJUARAAN",
            authorName: "White Tiger Team"
          },
          {
            id: "default-v2",
            title: "Demonstrasi Teknik Poomsae & Tendangan Akrobatik",
            description: "Koreografi jurus Poomsae presisi tinggi, kelenturan fisik, dan teknik tendangan berputar (Twist & Spin Kick).",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            category: "LATIHAN",
            authorName: "Coach White Tiger"
          },
          {
            id: "default-v3",
            title: "Ujian Kenaikan Tingkat (UKT) & Pemecahan Papan",
            description: "Uji ketangguhan fisik, disiplin mental, dan keberanian murid saat memecahkan papan kayu (Kyukpa) dalam ujian kenaikan sabuk.",
            youtubeUrl: "https://www.youtube.com/watch?v=J---aiyznGQ",
            category: "UKT",
            authorName: "Admin Dojang"
          }
        ];

        const displayVideos = dbVideos.length > 0 ? dbVideos : defaultVideos;
        const currentVideo = displayVideos.find(v => v.id === selectedVideoId) || displayVideos[0];
        const currentYtId = getYouTubeId(currentVideo?.youtubeUrl) || "dQw4w9WgXcQ";

        return (
          <section className="py-24 bg-slate-900 text-white relative overflow-hidden" id="videos">
            {/* Ambient Lighting Background */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#E10600]/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                <div>
                  <span className="text-xs font-black uppercase text-[#E10600] tracking-widest flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 fill-[#E10600]" /> DOKUMENTASI AKSI & KEJUARAAN
                  </span>
                  <h2 className="text-4xl font-extrabold text-white mt-2 font-display">
                    Galeri Video Publik 🎬
                  </h2>
                  <p className="text-slate-400 mt-2 text-sm max-w-xl leading-relaxed">
                    Tonton cuplikan aksi atlet, video latihan fisik, teknik poomsae, hingga momen kejuaraan Dojang White Tiger Kraksaan.
                  </p>
                </div>
                {settings.youtubeUrl && (
                  <a 
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E10600] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-red-600/30 active:scale-95 shrink-0"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Channel YouTube Resmi</span>
                  </a>
                )}
              </div>

              {/* Theater & Playlist Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Video Theater (8 Cols) */}
                <div className="lg:col-span-8 bg-slate-800/80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl p-4 md:p-6 backdrop-blur-sm">
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
                    {currentYtId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${currentYtId}?rel=0&modestbranding=1`}
                        title={currentVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                        <Film className="w-12 h-12 stroke-[1.5]" />
                        <p className="text-xs font-semibold">Video belum tersedia</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 bg-[#E10600] text-white text-[10px] font-black uppercase rounded tracking-wider">
                        {currentVideo.category || "DOKUMENTASI"}
                      </span>
                      {currentVideo.authorName && (
                        <span className="text-xs text-slate-400 font-medium">
                          Diunggah oleh: <strong className="text-slate-200">{currentVideo.authorName}</strong>
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
                      {currentVideo.title}
                    </h3>
                    {currentVideo.description && (
                      <p className="text-slate-300 text-xs md:text-sm mt-2 leading-relaxed">
                        {currentVideo.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Video Playlist Selector (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Pilihan Video ({displayVideos.length})
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[580px] overflow-y-auto pr-1">
                    {displayVideos.map((vid, idx) => {
                      const ytId = getYouTubeId(vid.youtubeUrl);
                      const isPlaying = vid.id === currentVideo.id;
                      const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

                      return (
                        <div
                          key={vid.id || idx}
                          onClick={() => setSelectedVideoId(vid.id)}
                          className={`group cursor-pointer rounded-xl p-3 transition-all border flex gap-3.5 items-center ${
                            isPlaying 
                              ? "bg-red-600/15 border-[#E10600] shadow-[0_0_15px_rgba(225,6,0,0.2)]" 
                              : "bg-slate-800/60 hover:bg-slate-800 border-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className="relative w-28 h-18 rounded-lg overflow-hidden shrink-0 bg-black">
                            {thumb ? (
                              <img 
                                src={thumb} 
                                alt={vid.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-700">
                                <Film className="w-6 h-6 text-slate-400" />
                              </div>
                            )}
                            <div className={`absolute inset-0 flex items-center justify-center transition-colors ${
                              isPlaying ? "bg-[#E10600]/40" : "bg-black/30 group-hover:bg-black/10"
                            }`}>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                isPlaying ? "bg-white text-[#E10600]" : "bg-black/60 text-white group-hover:bg-[#E10600]"
                              } transition-all shadow-md`}>
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-black uppercase text-[#E10600] block mb-0.5">
                              {vid.category || "VIDEO"}
                            </span>
                            <h4 className={`text-xs font-bold leading-snug line-clamp-2 transition-colors ${
                              isPlaying ? "text-white font-extrabold" : "text-slate-300 group-hover:text-white"
                            }`}>
                              {vid.title}
                            </h4>
                            {vid.authorName && (
                              <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1">
                                {vid.authorName}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Upcoming Events Section */}
      <section className="py-24 bg-[#0F172A] text-white border-y border-white/10" id="events">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12">
            <div>
              <span className="text-xs font-black uppercase text-[#E10600] tracking-widest">JADWAL PERTANDINGAN</span>
              <h2 className="text-4xl font-extrabold mt-2 font-display">Kalender Kejuaraan 🏆</h2>
            </div>
            <Link href="/events" className="mt-4 md:mt-0 px-6 py-3 bg-[#E10600] text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-[2px_2px_0px_#FFFFFF] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
              Lihat Semua Event &rarr;
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12 border border-white/10 rounded-xl bg-white/5">
              <CalendarOff className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 font-medium">Belum ada jadwal kejuaraan terdekat.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((evt) => {
                const isNews = evt.source === 'AUTOMATIC_RSS';
                const start = new Date(evt.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                const end = new Date(evt.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                return (
                  <div key={evt.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:-translate-y-2 transition-transform group shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${isNews ? 'bg-yellow-500/20 text-yellow-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {isNews ? 'Berita/Rumor' : 'Terverifikasi'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold bg-white/10 px-2 py-1 rounded">{evt.level}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-[#E10600] transition-colors line-clamp-2">{evt.title}</h3>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="material-symbols-outlined text-[16px] mr-2">calendar_month</span>
                        {start} {start !== end && `- ${end}`}
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="material-symbols-outlined text-[16px] mr-2">location_on</span>
                        {evt.location}
                      </div>
                    </div>
                    {evt.link ? (
                      <a href={evt.link} target="_blank" rel="noopener noreferrer" className="block w-full py-2 text-center border border-white/20 rounded hover:bg-white hover:text-[#0F172A] font-bold text-sm transition-colors">
                        Lihat Sumber Berita
                      </a>
                    ) : (
                      <button disabled className="w-full py-2 text-center border border-white/10 text-gray-500 rounded font-bold text-sm">
                        Proposal Belum Tersedia
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12 mb-12">
          <div>
            <span className="font-extrabold text-xl block mb-4">{settings.dojangName}</span>
            <p className="text-gray-400 text-sm leading-relaxed">
              {settings.description}
            </p>
            <p className="text-[#E10600] text-xs font-bold mt-2">
              📍 Pusat Latihan Taekwondo Terpercaya di Kraksaan, Probolinggo.
            </p>
            {settings.appApkUrl && (
              <div className="mt-4">
                <a 
                  href={settings.appApkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transition-transform hover:scale-105 active:scale-95 w-36"
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                    alt="Download di Google Play" 
                    className="w-full h-auto"
                  />
                </a>
              </div>
            )}

            {/* Social Media Links */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                Media Sosial Kami:
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* TikTok */}
                <a
                  href={settings.tiktokUrl || "https://www.tiktok.com/@whitetigerkraksaan"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-black text-white hover:text-cyan-300 flex items-center justify-center transition-all hover:scale-110 shadow-sm border border-white/10 hover:border-cyan-400/50 group"
                  title="TikTok @whitetigerkraksaan"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.3 6.3 0 0 0 1.93-4.52V8.53a8.27 8.27 0 0 0 4.84 1.56V6.69h-1z"/>
                  </svg>
                </a>

                {/* Telegram */}
                <a
                  href={settings.telegramUrl || "https://t.me/whitetigerkraksaan"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#229ED9] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm border border-white/10 hover:border-[#229ED9] group"
                  title="Telegram White Tiger"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={settings.facebookUrl || "https://www.facebook.com/whitetigerkraksaan"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#1877F2] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm border border-white/10 hover:border-[#1877F2] group"
                  title="Facebook White Tiger Kraksaan"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={settings.instagramUrl || "https://www.instagram.com/whitetigerkraksaan"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm border border-white/10 hover:border-pink-500/50 group"
                  title="Instagram @whitetigerkraksaan"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href={settings.youtubeUrl || "https://www.youtube.com/@whitetigerkraksaan"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#FF0000] text-white flex items-center justify-center transition-all hover:scale-110 shadow-sm border border-white/10 hover:border-[#FF0000] group"
                  title="YouTube White Tiger Kraksaan"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-[#E10600]">Alamat Dojang</h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {settings.address || "Kraksaan, Probolinggo, Jawa Timur"}
            </p>
            <div className="w-full h-32 rounded-lg overflow-hidden border border-white/10 opacity-80 hover:opacity-100 transition-opacity">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.5103444005886!2d113.413247!3d-7.7816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7006855555555%3A0x5555555555555555!2sKraksaan%2C%20Probolinggo%2C%20East%20Java!5e0!3m2!1sid!2sid!4v1721234567890!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-[#E10600]">Hubungi Kami</h4>
            <p className="text-gray-400 text-sm">Email: {settings.email}</p>
            <p className="text-gray-400 text-sm mt-1">Telp: {settings.phone}</p>
            <a 
              href={`https://wa.me/${settings.phone?.replace(/[^0-9]/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 mt-4 text-xs font-bold bg-[#25D366] text-white px-3 py-1.5 rounded-lg hover:bg-[#20ba5a] transition-colors"
            >
              <Phone className="w-3 h-3" /> Chat WhatsApp
            </a>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-[#E10600]">Link Cepat</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <button onClick={() => onNavigate("schedule-view")} className="hover:text-white transition-colors text-left">Jadwal Latihan</button>
              <button onClick={() => onNavigate("verify")} className="hover:text-white transition-colors text-left">Sertifikasi Online</button>
              <button onClick={() => onNavigate("register")} className="hover:text-white transition-colors text-left">Registrasi Baru</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs">
          <span>&copy; 2026 {settings.dojangName}. Hak Cipta Dilindungi.</span>
          <span>{settings.motto}</span>
        </div>
      </footer>
    </div>
  );
}
