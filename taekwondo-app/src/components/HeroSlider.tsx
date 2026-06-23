"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";

interface Slide {
  id: string;
  imageUrl: string;
  caption?: string | null;
  subtext?: string | null;
  order: number;
}

// Fallback demo slides using Unsplash taekwondo images
const FALLBACK_SLIDES: Slide[] = [
  {
    id: "f1",
    imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80",
    caption: "Juara Nasional Kyorugi Putra",
    subtext: "Medali Emas — Kejurnas PBTI 2025",
    order: 0,
  },
  {
    id: "f2",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
    caption: "Prestasi Poomsae Putri",
    subtext: "Medali Perak — Piala Presiden 2025",
    order: 1,
  },
  {
    id: "f3",
    imageUrl: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=1200&q=80",
    caption: "Atlet Junior Berprestasi",
    subtext: "Medali Perunggu — Kejurda DKI Jakarta 2025",
    order: 2,
  },
  {
    id: "f4",
    imageUrl: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?auto=format&fit=crop&w=1200&q=80",
    caption: "Tim White Tiger — Juara Beregu",
    subtext: "Medali Emas — Indonesia Open Championship 2025",
    order: 3,
  },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/hero-slides")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
        } else {
          setSlides(FALLBACK_SLIDES);
        }
      })
      .catch(() => setSlides(FALLBACK_SLIDES));
  }, []);

  const goTo = useCallback(
    (index: number, dir: "next" | "prev") => {
      if (isAnimating || slides.length === 0) return;
      setDirection(dir);
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setIsAnimating(false);
      }, 600);
    },
    [isAnimating, slides.length]
  );

  const next = useCallback(() => {
    const nextIndex = (current + 1) % slides.length;
    goTo(nextIndex, "next");
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    const prevIndex = (current - 1 + slides.length) % slides.length;
    goTo(prevIndex, "prev");
  }, [current, slides.length, goTo]);

  // Auto-play
  useEffect(() => {
    if (slides.length === 0 || isPaused) return;
    intervalRef.current = setInterval(next, 4500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slides.length, isPaused, next]);

  if (slides.length === 0) return null;

  const prev2 = (current - 1 + slides.length) % slides.length;
  const next2 = (current + 1) % slides.length;
  const next3 = (current + 2) % slides.length;

  return (
    <section
      className="relative w-full bg-[#0a0f1e] overflow-hidden"
      style={{ minHeight: "520px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#E10600]/10 blur-[120px] rounded-full" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0F172A] via-transparent to-[#0F172A] opacity-80" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-12 pb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-[#E10600]/10 border border-[#E10600]/30 rounded-full px-4 py-1.5 mb-3">
          <Trophy className="w-4 h-4 text-[#E10600]" />
          <span className="text-[#E10600] text-xs font-black uppercase tracking-widest">
            Hall of Champions
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white font-display">
          Wajah Para Juara White Tiger
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Kebanggaan dojang kami, prestasi nyata yang menginspirasi
        </p>
      </div>

      {/* 3D Carousel */}
      <div
        className="relative z-10 flex items-center justify-center gap-4 py-8 px-4"
        style={{ perspective: "1200px", minHeight: "360px" }}
      >
        {/* Prev ghost card */}
        <div
          className="hidden md:block relative rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 border border-white/5 shadow-2xl"
          style={{
            width: "180px",
            height: "260px",
            transform: "rotateY(25deg) scale(0.75) translateX(30px)",
            opacity: 0.4,
            filter: "blur(1px)",
            transition: "all 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
          onClick={prev}
        >
          <img
            src={slides[prev2].imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0F172A]/60" />
        </div>

        {/* Main card */}
        <div
          className="relative rounded-3xl overflow-hidden flex-shrink-0 border border-white/10 shadow-[0_30px_80px_-10px_rgba(225,6,0,0.4)] group cursor-pointer"
          style={{
            width: "clamp(260px, 45vw, 420px)",
            height: "clamp(320px, 55vw, 520px)",
            transform: isAnimating
              ? direction === "next"
                ? "rotateY(-15deg) scale(0.95)"
                : "rotateY(15deg) scale(0.95)"
              : "rotateY(0deg) scale(1)",
            transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
            zIndex: 10,
          }}
          onClick={next}
        >
          <img
            src={slides[current].imageUrl}
            alt={slides[current].caption || "Champion"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />

          {/* Trophy badge */}
          <div className="absolute top-4 right-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-2.5 shadow-lg shadow-yellow-500/50">
            <Trophy className="w-5 h-5 text-[#0F172A]" />
          </div>

          {/* Caption */}
          {(slides[current].caption || slides[current].subtext) && (
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="bg-[#0F172A]/80 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                {slides[current].caption && (
                  <h3 className="text-white font-black text-lg leading-tight">
                    {slides[current].caption}
                  </h3>
                )}
                {slides[current].subtext && (
                  <p className="text-yellow-400 text-xs font-bold mt-1 uppercase tracking-wide">
                    🏆 {slides[current].subtext}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Slide counter */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
            {current + 1} / {slides.length}
          </div>
        </div>

        {/* Next ghost card */}
        <div
          className="hidden md:block relative rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 border border-white/5 shadow-2xl"
          style={{
            width: "180px",
            height: "260px",
            transform: "rotateY(-25deg) scale(0.75) translateX(-30px)",
            opacity: 0.4,
            filter: "blur(1px)",
            transition: "all 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
          onClick={next}
        >
          <img
            src={slides[next2].imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0F172A]/60" />
        </div>

        {/* Far right ghost (lg+) */}
        <div
          className="hidden lg:block relative rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 border border-white/5"
          style={{
            width: "120px",
            height: "200px",
            transform: "rotateY(-35deg) scale(0.55) translateX(-60px)",
            opacity: 0.2,
            filter: "blur(2px)",
            transition: "all 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
          onClick={next}
        >
          <img
            src={slides[next3].imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0F172A]/70" />
        </div>
      </div>

      {/* Arrow Controls */}
      <div className="absolute inset-y-0 left-4 flex items-center z-20">
        <button
          onClick={prev}
          className="bg-white/10 hover:bg-[#E10600] backdrop-blur-md border border-white/20 text-white rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#E10600]/40"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-4 flex items-center z-20">
        <button
          onClick={next}
          className="bg-white/10 hover:bg-[#E10600] backdrop-blur-md border border-white/20 text-white rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#E10600]/40"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="relative z-10 flex justify-center gap-2 pb-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx, idx > current ? "next" : "prev")}
            className={`transition-all duration-300 rounded-full ${
              idx === current
                ? "w-8 h-2.5 bg-[#E10600] shadow-md shadow-[#E10600]/60"
                : "w-2.5 h-2.5 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!isPaused && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/10 z-20">
          <div
            key={current}
            className="h-full bg-[#E10600]"
            style={{
              animation: "progressBar 4.5s linear forwards",
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
