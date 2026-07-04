"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, Calendar, Target, CreditCard, User } from "lucide-react";

const navItems = [
  { href: "/m/dashboard", icon: Home, label: "LOBBY" },
  { href: "/m/schedule", icon: Calendar, label: "AGENDA" },
  { href: "/m/quests", label: "MISI" },
  { href: "/m/spp", icon: CreditCard, label: "TOKO SPP" },
  { href: "/m/profile", icon: User, label: "ATLET" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-[395px] bg-[#0F172A] border-2 border-[#334155] rounded-3xl shadow-[0_8px_0_0_#020617,0_12px_24px_rgba(0,0,0,0.5)] z-50">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          const isQuest = label === "MISI";
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all relative ${
                isQuest ? "-mt-7" : ""
              }`}
            >
              <div
                className={`transition-all duration-200 ${
                  isQuest
                    ? isActive
                      ? "scale-125 filter drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]"
                      : "scale-115 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] hover:scale-120"
                    : isActive
                      ? "p-2 rounded-2xl bg-[#E10600] scale-110 shadow-[0_4px_0_0_#990000,0_4px_10px_rgba(225,6,0,0.4)] border border-white"
                      : "p-2 rounded-2xl bg-transparent text-slate-400 hover:text-white"
                }`}
              >
                {isQuest ? (
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <img
                      src="/daily_quest_tiger_transparent.png"
                      alt="Quest"
                      className="object-contain w-full h-full"
                    />
                  </div>
                ) : Icon ? (
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  />
                ) : null}
              </div>
              <span
                className={`text-[9px] font-black tracking-wider transition-all uppercase ${
                  isQuest 
                    ? "mt-0.5 text-[#FFD700] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                    : isActive ? "text-white scale-105" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
