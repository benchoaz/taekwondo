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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsActivityLocation",
              "name": "White Tiger Taekwondo Club",
              "image": "https://whitetigerkraksaan.com/logo.png",
              "description": "Dojang & Club Taekwondo Premium di Kraksaan, Probolinggo. Membangun karakter pemenang melalui dedikasi fisik, moral tinggi, dan prestasi.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Kraksaan",
                "addressLocality": "Probolinggo",
                "addressRegion": "Jawa Timur",
                "postalCode": "67282",
                "addressCountry": "ID"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -7.7816,
                "longitude": 113.4158
              },
              "url": "https://whitetigerkraksaan.com",
              "telephone": "+6281234567890",
              "priceRange": "$$",
              "sameAs": [
                "https://www.instagram.com/wtk_taekwondoclub"
              ]
            })
          }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
