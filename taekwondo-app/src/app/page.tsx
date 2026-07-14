"use client";

import React, { useState, useEffect } from "react";
// Cache buster: 2026-06-23 v2
import LandingPage from "@/components/LandingPage";
import MemberDashboard from "@/components/MemberDashboard";
import CoachDashboard from "@/components/CoachDashboard";
import CertificateVerification from "@/components/CertificateVerification";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import SSOPortal from "@/components/SSOPortal";
import AdminDashboard from "@/components/AdminDashboard";
import RegistrationForm from "@/components/RegistrationForm";
import WebsiteIntro from "@/components/intro/WebsiteIntro";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [currentView, setCurrentView] = useState<"landing" | "member" | "coach" | "admin" | "verify" | "schedule-view" | "sso" | "register">("landing");
  const [userEmail, setUserEmail] = useState("");

  // Start with intro by default to prevent blocking UI
  useEffect(() => {
    // Cek apakah ada sesi aktif yang tersimpan
    const savedView = typeof window !== 'undefined' ? sessionStorage.getItem('currentView') as any : null;
    const savedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('userEmail') : null;
    
    if (savedView && savedView !== 'landing' && savedView !== 'sso') {
      setCurrentView(savedView);
      if (savedEmail) setUserEmail(savedEmail);
      setShowIntro(false);
      setLoadingSettings(false);
    } else {
      // Show intro immediately to avoid blank screen or infinite spinner
      setShowIntro(true);
      setLoadingSettings(false);
      
      // Fetch settings in background
      fetch("/api/settings")
        .then(res => res.json())
        .then(data => {
          if (data && data.showIntro === false) {
            setShowIntro(false);
          }
        })
        .catch(err => {
          console.error("Error loading settings:", err);
        });
    }
  }, []);

  const handleNavigate = (view: "landing" | "member" | "coach" | "admin" | "verify" | "schedule-view" | "sso" | "register", email?: string) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentView', view);
    }
    
    if (email) {
      setUserEmail(email);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('userEmail', email);
      }
    } else {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('userEmail');
      }
    }
  };

  // Safe fallback if still explicitly loading (should immediately resolve now)
  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#38bdf8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showIntro && (
          <WebsiteIntro key="intro" onEnter={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {!showIntro && (
        <>
          {currentView === "landing" && (
            <LandingPage onNavigate={(v) => {
              if (v === "member" || v === "coach") {
                setCurrentView("sso");
              } else {
                setCurrentView(v as any);
              }
            }} />
          )}

          {currentView === "sso" && (
            <SSOPortal 
              onBack={() => handleNavigate("landing")}
              onNavigate={(role, email) => handleNavigate(role as any, email)}
            />
          )}

          {currentView === "member" && (
            <MemberDashboard userEmail={userEmail} onBack={() => handleNavigate("sso")} />
          )}

          {currentView === "coach" && (
            <CoachDashboard userEmail={userEmail} onBack={() => handleNavigate("sso")} />
          )}

          {currentView === "admin" && (
            <AdminDashboard onBack={() => handleNavigate("sso")} />
          )}

          {currentView === "verify" && (
            <CertificateVerification onBack={() => handleNavigate("landing")} />
          )}

          {currentView === "schedule-view" && (
            <ScheduleCalendar onBack={() => handleNavigate("landing")} />
          )}

          {currentView === "register" && (
            <RegistrationForm onBack={() => handleNavigate("landing")} />
          )}
        </>
      )}
    </>
  );
}
