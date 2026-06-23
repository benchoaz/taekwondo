"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Trophy, ArrowRight } from "lucide-react";
import Image from "next/image";

interface Slide {
  id: string;
  imageUrl: string;
  caption?: string | null;
  subtext?: string | null;
  order: number;
}

const FALLBACK_SLIDES: Slide[] = [
  {
    id: "f1",
    imageUrl:
      "https://res.cloudinary.com/dgmbgsonr/image/upload/v1782127036/taekwondo_dojang/hero_slider/tkd_champ_1.jpg",
    caption: "Juara Nasional Kyorugi Putra",
    subtext: "Medali Emas · Indonesia Open Championship 2025",
    order: 0,
  },
  {
    id: "f2",
    imageUrl:
      "https://res.cloudinary.com/dgmbgsonr/image/upload/v1782127051/taekwondo_dojang/hero_slider/tkd_champ_2.jpg",
    caption: "Prestasi Poomsae Putri",
    subtext: "Medali Perak · Kejuaraan Nasional PBTI 2025",
    order: 1,
  },
  {
    id: "f3",
    imageUrl:
      "https://res.cloudinary.com/dgmbgsonr/image/upload/v1782127060/taekwondo_dojang/hero_slider/tkd_champ_3.jpg",
    caption: "Atlet Junior Berprestasi",
    subtext: "Medali Perunggu · Kejurnas Pelajar Junior 2025",
    order: 2,
  },
  {
    id: "f4",
    imageUrl:
      "https://res.cloudinary.com/dgmbgsonr/image/upload/v1782127062/taekwondo_dojang/hero_slider/tkd_champ_4.jpg",
    caption: "Tim White Tiger — Juara Beregu",
    subtext: "Medali Emas · Indonesia Open Championship 2025",
    order: 3,
  },
];

// ─── PHASE 1: Cinematic Intro Animation ───────────────────────────────────────
function IntroAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"tiger" | "fighters" | "logo" | "strike" | "exit">("tiger");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fighters"), 3500);
    const t2 = setTimeout(() => setPhase("logo"), 6500);
    const t3 = setTimeout(() => setPhase("strike"), 9000);
    const t4 = setTimeout(() => setPhase("exit"), 10500);
    const t5 = setTimeout(onDone, 11500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [onDone]);

  if (phase === "exit") return null;

  return (
    <motion.div
      key="intro-anim"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Skip */}
      <button
        onClick={onDone}
        className="absolute top-8 right-8 z-[110] text-white/40 hover:text-white flex items-center gap-2 font-display uppercase tracking-[0.2em] text-xs transition-colors"
      >
        Skip Intro
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" />
        </svg>
      </button>

      {/* Particles */}
      <div className="absolute inset-0 z-[5] opacity-20 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '50px 50px', filter: 'blur(1px)' }} />

      <AnimatePresence mode="wait">
        {/* Scene 1: Tiger */}
        {phase === "tiger" && (
          <motion.div key="s-tiger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 flex items-center justify-center">
            <motion.div initial={{ scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: 5, ease: "easeOut" }} className="absolute inset-0">
              <Image src="/hero-tiger-solo.png" alt="Tiger" fill priority sizes="100vw" className="object-contain opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
              <div className="absolute inset-0 bg-black/30" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1.5 }} className="relative z-10 text-center mt-64">
              <h2 className="text-2xl md:text-3xl text-white font-black tracking-[0.6em] uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">The Spirit</h2>
              <p className="text-gray-400 mt-2 text-sm tracking-[0.4em] uppercase font-bold">Is Awakening</p>
            </motion.div>
          </motion.div>
        )}

        {/* Scene 2: Fighters */}
        {phase === "fighters" && (
          <motion.div key="s-fighters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0 flex items-center justify-center">
            <motion.div initial={{ scale: 1.05, x: 10 }} animate={{ scale: 1, x: 0 }} transition={{ duration: 5, ease: "easeOut" }} className="absolute inset-0">
              <Image src="/hero-fighters.png" alt="Fighters" fill priority sizes="100vw" className="object-cover object-[center_30%] opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent" />
              <div className="absolute inset-0 bg-black/40" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1.5 }} className="relative z-10 text-center mt-64">
              <h2 className="text-2xl md:text-3xl text-white font-black tracking-[0.6em] uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">The Clash</h2>
              <p className="text-red-500 mt-2 text-sm tracking-[0.4em] uppercase font-bold">Of Champions</p>
            </motion.div>
          </motion.div>
        )}

        {/* Scene 3 & 4: Logo + Strike */}
        {(phase === "logo" || phase === "strike") && (
          <motion.div key="s-logo" initial={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`relative z-20 flex flex-col items-center justify-center h-full w-full bg-black/90 ${phase === "strike" ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
          >
            <motion.div className="w-24 h-24 bg-gradient-to-tr from-[#E10600] via-orange-600 to-yellow-500 rounded-2xl shadow-[0_0_50px_rgba(225,6,0,0.8)] flex items-center justify-center p-1 transform -rotate-3 mb-6">
              <div className="w-full h-full bg-[#050505] rounded-xl flex items-center justify-center">
                <span className="text-4xl font-black text-white italic tracking-tighter drop-shadow-md">TKD</span>
              </div>
            </motion.div>
            <div className="flex flex-col items-center w-full px-4">
              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-[0.1em] sm:tracking-widest font-display text-center">TAEKWONDO</motion.h1>
              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-2xl sm:text-3xl md:text-5xl font-black text-[#E10600] tracking-[0.1em] sm:tracking-widest font-display text-center mt-[-5px] md:mt-[-10px]">ACADEMY</motion.h1>
              <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="text-gray-300 text-[10px] sm:text-xs md:text-sm mt-6 font-medium tracking-[0.15em] sm:tracking-[0.4em] uppercase text-center">Disiplin • Integritas • Prestasi</motion.p>
            </div>
          </motion.div>
        )}

        {/* Strike FX */}
        {phase === "strike" && (
          <motion.div key="s-strike" className="absolute inset-0 z-[200] pointer-events-none flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [1, 0] }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-white" />
            <div className="relative w-[90vw] md:w-[700px] h-[90vw] md:h-[700px] transform -rotate-[15deg]">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" style={{ filter: "drop-shadow(0px 0px 15px rgba(225,6,0,0.8))" }}>
                <defs>
                  <linearGradient id="fireSlash" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" /><stop offset="20%" stopColor="#ffea00" /><stop offset="50%" stopColor="#ff0000" /><stop offset="100%" stopColor="#3a0000" />
                  </linearGradient>
                  <filter id="jaggedSlash" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves={4} result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale={3.5} xChannelSelector="R" yChannelSelector="G" result="displaced" />
                    <feGaussianBlur in="displaced" stdDeviation={0.8} result="blurred" />
                    <feMerge><feMergeNode in="blurred" /><feMergeNode in="displaced" /></feMerge>
                  </filter>
                </defs>
                <motion.g initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }} animate={{ clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)", "inset(0 0 0% 0)", "inset(0 0 0% 0)"], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.5, times: [0, 0.1, 0.8, 1] }}>
                  <path d="M 55 -5 Q 30 45 -5 90 Q 38 45 55 -5 Z" fill="url(#fireSlash)" filter="url(#jaggedSlash)" />
                  <path d="M 70 0 Q 45 50 10 95 Q 52 50 70 0 Z" fill="url(#fireSlash)" filter="url(#jaggedSlash)" />
                  <path d="M 85 5 Q 60 55 25 100 Q 66 55 85 5 Z" fill="url(#fireSlash)" filter="url(#jaggedSlash)" />
                  <path d="M 100 10 Q 75 60 40 105 Q 79 60 100 10 Z" fill="url(#fireSlash)" filter="url(#jaggedSlash)" />
                </motion.g>
              </svg>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `@keyframes shake { 0%,100%{transform:translate(0,0)rotate(0deg)} 10%,30%,50%,70%,90%{transform:translate(-25px,15px)rotate(-5deg)} 20%,40%,60%,80%{transform:translate(25px,-15px)rotate(5deg)} }` }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── PHASE 2: Champion Slider — Teknik nth-child Positional (Mohammed-Faysal style) ──
function ChampionSlider({ onEnter }: { onEnter: () => void }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/hero-slides")
      .then((r) => r.json())
      .then((data) => setSlides(Array.isArray(data) && data.length > 0 ? data : FALLBACK_SLIDES))
      .catch(() => setSlides(FALLBACK_SLIDES));
  }, []);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!slides.length || isPaused) return;
    intervalRef.current = setInterval(next, 4500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [slides.length, isPaused, next]);

  if (!slides.length) return null;

  // Build ordered list: active first, then the rest in order
  const ordered = Array.from({ length: slides.length }, (_, i) =>
    slides[(active + i) % slides.length]
  );

  // ── Compute per-item style based on position relative to active ──────────
  // pos=0 → hero fullscreen | pos=1,2,3 → aligned small thumbnail cards | pos>=4 → hidden
  const getItemStyle = (pos: number): React.CSSProperties => {
    const commonTransition = "all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    const cardWidth = 150;
    const cardHeight = 220;
    const gap = 20;
    const startLeft = "55%"; // position from left for the first small card

    if (pos === 0) return {
      // HERO: fullscreen background
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: 0,
      zIndex: 10,
      filter: "none",
      opacity: 1,
      transform: "none",
      boxShadow: "none",
      transition: commonTransition,
    };

    // For small thumbnail cards (pos >= 1)
    if (pos >= 1 && pos <= 3) {
      const indexOffset = pos - 1; // 0 for pos=1, 1 for pos=2, etc.
      return {
        bottom: "80px",
        left: `calc(${startLeft} + ${indexOffset * (cardWidth + gap)}px)`,
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        transform: "none",
        borderRadius: "20px",
        zIndex: 20,
        filter: "brightness(0.8) contrast(1.1)",
        opacity: 1, // fully opaque, no transparency
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        transition: commonTransition,
      };
    }

    // Hidden off-screen right
    return {
      bottom: "80px",
      left: "120%",
      width: `${cardWidth}px`,
      height: `${cardHeight}px`,
      transform: "none",
      borderRadius: "20px",
      zIndex: 5,
      opacity: 0,
      transition: commonTransition,
    };
  };

  return (
    <motion.div
      key="champion-slider"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="fixed inset-0 z-[100] bg-[#0a0c10] overflow-hidden"
      style={{ fontFamily: "'Poppins', sans-serif" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── CAROUSEL CONTAINER ── */}
      <div className="relative w-full h-full">

        {/* Items — positioned absolutely like Mohammed-Faysal technique */}
        {ordered.map((slide, pos) => (
          <div
            key={slide.id}
            style={{
              position: "absolute",
              backgroundImage: `url(${slide.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              ...getItemStyle(pos),
            }}
          >
            {/* Overlay gradient hanya di hero (pos 0) */}
            {pos === 0 && (
              <>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, #000 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.2) 100%)"
                }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 60%)"
                }} />
              </>
            )}
          </div>
        ))}

        {/* ── CONTENT OVERLAY — hanya untuk slide aktif ── */}
        <div className="absolute inset-0 z-30 flex flex-col justify-center px-6 md:px-16 lg:px-24 pointer-events-none">
          {/* Hall of Champions badge */}
          <motion.div
            key={ordered[0]?.id + "-badge"}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-4 md:mb-6"
          >
            <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
            <span className="text-yellow-400 font-black text-xs md:text-sm uppercase tracking-[0.3em]">
              Hall of Champions
            </span>
          </motion.div>

          {/* Caption — slide dengan re-key agar re-animate */}
          <div className="h-[240px] md:h-[340px] flex flex-col justify-end mb-6 md:mb-8">
            <motion.div
              key={ordered[0]?.id + "-content"}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {/* 🏆 Badge prestasi */}
              <div className="inline-flex items-center gap-2 bg-[#E10600]/20 border border-[#E10600]/40 rounded-full px-3 py-1 md:px-4 md:py-1.5 mb-3 md:mb-4">
                <span className="text-[#E10600] text-[10px] md:text-xs font-black uppercase tracking-widest">
                  🥇 Sang Juara
                </span>
              </div>

              {ordered[0]?.caption && (
                <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-3 md:mb-4 max-w-xl"
                  style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
                  {ordered[0].caption}
                </h2>
              )}

              {ordered[0]?.subtext && (
                <p className="text-[#E10600] text-sm sm:text-base md:text-xl font-bold uppercase tracking-widest mb-2">
                  {ordered[0].subtext}
                </p>
              )}
            </motion.div>
          </div>

          {/* ── ENTER BUTTON ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="pointer-events-auto flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <button
              onClick={onEnter}
              className="group relative flex items-center justify-center gap-3 bg-[#E10600] hover:bg-white text-white hover:text-[#E10600] px-6 py-3 md:px-8 md:py-4 rounded-full font-black text-sm md:text-base uppercase tracking-widest shadow-[0_0_40px_rgba(225,6,0,0.5)] hover:shadow-none transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <span>Masuk ke Dojang</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
              {/* Pulsing ring */}
              <span className="absolute inset-0 rounded-full border-2 border-[#E10600] animate-ping opacity-30 pointer-events-none" />
            </button>

            {/* Dot indicators */}
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`transition-all duration-500 rounded-full pointer-events-auto ${
                    i === active
                      ? "w-6 h-2 md:w-8 md:h-2.5 bg-[#E10600] shadow-md shadow-[#E10600]/50"
                      : "w-2 h-2 md:w-2.5 md:h-2.5 bg-white/30 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Navigation Arrows ── */}
        <div className="absolute bottom-8 right-6 md:bottom-12 md:right-24 z-40 flex items-center gap-3 md:gap-4">
          <button
            onClick={prev}
            className="bg-black/50 md:bg-white/10 hover:bg-[#E10600] backdrop-blur-md border border-white/20 text-white rounded-full p-2.5 md:p-3 transition-all hover:scale-110 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={next}
            className="bg-black/50 md:bg-white/10 hover:bg-[#E10600] backdrop-blur-md border border-white/20 text-white rounded-full p-2.5 md:p-3 transition-all hover:scale-110 shadow-lg"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Slide counter */}
        <div className="absolute top-8 right-8 z-40 text-white/50 text-xs font-bold tracking-widest">
          {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>

        {/* ── Progress bar ── */}
        {!isPaused && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/10 z-40">
            <motion.div
              key={active}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 4.5, ease: "linear" }}
              className="h-full bg-[#E10600]"
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes ping {
          75%, 100% { transform: scale(1.4); opacity: 0; }
        }
        .animate-ping { animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite; }
      `}</style>
    </motion.div>
  );
}


// ─── MAIN EXPORT: Orchestrates Intro → Champion Slider → Landing ──────────────
export default function WebsiteIntro({ onEnter }: { onEnter: () => void }) {
  const [phase, setPhase] = useState<"intro" | "slider" | "done">("intro");

  if (phase === "done") return null;

  return (
    <AnimatePresence mode="wait">
      {phase === "intro" && (
        <IntroAnimation key="intro" onDone={() => setPhase("slider")} />
      )}
      {phase === "slider" && (
        <ChampionSlider key="slider" onEnter={() => { setPhase("done"); onEnter(); }} />
      )}
    </AnimatePresence>
  );
}
