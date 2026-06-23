import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Izinkan Next.js memuat resource JavaScript (HMR) melalui tunnel Cloudflare
  allowedDevOrigins: ['whitetigertkd.my.id'],
  async headers() {
    // Di tahap produksi, ganti ALLOWED_ORIGIN di file .env dengan domain frontend (misal: https://taekwondodojang.com)
    // Jika tidak di-set, defaultnya aman dengan mengembalikan localhost.
    const allowedOrigin = process.env.NODE_ENV === 'production' 
        ? (process.env.ALLOWED_ORIGIN || 'https://taekwondodojang.com')
        : '*';

    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: allowedOrigin },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
};

export default nextConfig;
