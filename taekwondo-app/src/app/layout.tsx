import AuthProvider from "@/components/AuthProvider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "White Tiger Taekwondo Club - Disiplin, Integritas, Prestasi",
  description: "Dojang & Club Taekwondo Premium. Bangun Mental Juara, Disiplin dan Prestasi Bersama Kami.",
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: "White Tiger Taekwondo Club",
    description: "Bangun Mental Juara, Disiplin dan Prestasi Bersama Kami",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased overflow-x-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
