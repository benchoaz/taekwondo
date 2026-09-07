import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Taekwondo Academy - Member App",
  description: "Aplikasi Mobile Member Taekwondo Academy",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#E10600",
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#090d16] bg-[radial-gradient(ellipse_at_top,_#1e1b4b_0%,_#090d16_75%)] flex flex-col items-center justify-start overflow-x-hidden">
      {/* Desktop Helper Bar */}
      <header className="hidden md:flex items-center justify-between w-full max-w-[430px] py-3 px-2 text-xs text-slate-400">
        <span className="font-bold text-slate-300">White Tiger · Mobile Portal</span>
        <a href="/" className="hover:text-cyan-300 transition-colors flex items-center gap-1 font-semibold">
          <span>← Kembali ke Web</span>
        </a>
      </header>

      {/* Main Phone Container */}
      <div className="w-full max-w-[430px] min-h-screen md:min-h-[860px] flex flex-col relative bg-[#020617] text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] md:rounded-[32px] md:border-4 md:border-slate-800/80 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
