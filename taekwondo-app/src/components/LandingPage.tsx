"use client";

import React, { useState, useEffect } from "react";
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
  CalendarOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSlider from "@/components/HeroSlider";
import Image from "next/image";
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
  });

  // Dynamic Articles/Events & Coaches State
  const [articles, setArticles] = useState<any[]>([]);
  const [dbCoaches, setDbCoaches] = useState<any[]>([]);
  const [dbGallery, setDbGallery] = useState<any[]>([]);
  const [dbAchievements, setDbAchievements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState({ members: 0, coaches: 0, achievements: 0 });

  const [announcement, setAnnouncement] = useState<any>(null);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    // Fetch Settings
    fetch("/api/settings")
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
            <Link href="/hall-of-fame" className="hover:text-[#E10600] transition-colors font-bold text-[#E10600]">Hall of Fame</Link>
            <a href="#coaches" onClick={(e) => { e.preventDefault(); document.getElementById('coaches')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="hover:text-[#E10600] transition-colors">Pelatih</a>
            <a href="#gallery" className="hover:text-[#E10600] transition-colors">Galeri</a>
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
            <a href="#coaches" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-[#0F172A]">Pelatih</a>
            <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-[#0F172A]">Galeri</a>
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
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-110" 
            style={{ 
              backgroundImage: isSettingsLoaded ? `url('${settings.heroBgUrl || '/hero-fighters.png'}')` : 'none'
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[900px] h-[500px] bg-[#c6a15b]/10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <span className="font-jost text-xs font-black tracking-[0.3em] uppercase text-[#c6a15b] mb-3 block">
            WHITE TIGER KRAKSAAN
          </span>
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold text-[#ece4d3] mb-4">
            HALL OF <span className="text-[#e6c883]">FAME</span>
          </h2>
          <p className="font-jost text-[#8d8676] text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Dinding penghormatan resmi atlet sang juara. Dedikasi, disiplin, dan perjuangan mengukir medali kebanggaan Dojang.
          </p>

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
