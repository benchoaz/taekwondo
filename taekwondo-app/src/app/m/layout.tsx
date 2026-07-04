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
    <div className="min-h-screen bg-slate-200 flex flex-col items-center">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative bg-[#F8FAFC] shadow-xl">
        {children}
      </div>
    </div>
  );
}
