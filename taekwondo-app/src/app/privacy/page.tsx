import React from "react";

export const metadata = {
  title: "Kebijakan Privasi - White Tiger Kraksaan",
  description: "Kebijakan Privasi untuk aplikasi mobile dan website White Tiger Kraksaan Academy",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0b1329] text-gray-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-[#1c2541] rounded-2xl shadow-xl p-8 md:p-12 border border-gray-800">
        <h1 className="text-3xl font-extrabold text-white mb-6 border-b border-gray-700 pb-4 text-center">
          Kebijakan Privasi
        </h1>
        <p className="text-sm text-gray-400 mb-8 text-center">
          Terakhir diperbarui: 20 Juli 2026
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">1. Informasi Umum</h2>
            <p className="leading-relaxed">
              Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat Anda menggunakan aplikasi mobile <strong>White Tiger Kraksaan Member</strong> dan situs web kami di <strong>whitetigerkraksaan.com</strong>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">2. Informasi yang Kami Kumpulkan</h2>
            <p className="leading-relaxed mb-3">
              Kami mengumpulkan informasi yang Anda berikan secara langsung saat pendaftaran member atau penggunaan aplikasi, antara lain:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Informasi Profil: Nama lengkap, email, nomor WhatsApp/telepon, tanggal lahir, dan foto profil.</li>
              <li>Data Membership: Level sabuk taekwondo, riwayat latihan, absensi, dan riwayat kenaikan sabuk.</li>
              <li>Data Transaksi SPP: Riwayat pembayaran bulanan SPP dan pembelian peralatan taekwondo di modul shop.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">3. Penggunaan Informasi Anda</h2>
            <p className="leading-relaxed mb-3">
              Kami menggunakan informasi pribadi Anda untuk tujuan berikut:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Mengidentifikasi dan memverifikasi status keanggotaan Anda di White Tiger Kraksaan Academy.</li>
              <li>Mengirimkan notifikasi tagihan SPP bulanan, pengumuman, dan konfirmasi pembayaran melalui WhatsApp.</li>
              <li>Melacak kehadiran, log fisik, misi harian, serta perkembangan latihan member.</li>
              <li>Memproses transaksi pembelian barang/peralatan di Toko (Shop) internal kami.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">4. Perlindungan Data</h2>
            <p className="leading-relaxed">
              Kami berkomitmen untuk menjaga keamanan data pribadi Anda. Kami menggunakan langkah-langkah teknis dan organisasional yang sesuai untuk melindungi data pribadi Anda dari akses yang tidak sah, kehilangan, perubahan, atau penyalahgunaan.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">5. Layanan Pihak Ketiga</h2>
            <p className="leading-relaxed">
              Aplikasi kami menggunakan layanan <strong>Firebase Cloud Messaging</strong> untuk mengirimkan notifikasi penting (push notifications) ke perangkat Anda. Layanan ini tunduk pada kebijakan privasi masing-masing penyedia layanan.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">6. Kontak Kami</h2>
            <p className="leading-relaxed">
              Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau ingin mengajukan permohonan penghapusan akun/data, silakan hubungi kami di:
            </p>
            <div className="mt-3 p-4 bg-[#0b1329] rounded-lg border border-gray-800">
              <p><strong>White Tiger Kraksaan Academy</strong></p>
              <p>Email: admin@whitetigerkraksaan.com</p>
              <p>Website: whitetigerkraksaan.com</p>
            </div>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} White Tiger Kraksaan Academy. Hak Cipta Dilindungi.
        </div>
      </div>
    </div>
  );
}
