export async function GET() {
  const articles = [
    {
      id: "1",
      title: "Pentingnya Fleksibilitas dalam Taekwondo",
      content: "Fleksibilitas tubuh sangat penting untuk menunjang performa tendangan tinggi...",
      author: "Master Ahmad S.B."
    },
    {
      id: "2",
      title: "Filosofi Sabuk Taekwondo dari Putih ke Hitam",
      content: "Setiap warna sabuk memiliki arti dan tingkatan pemahaman tersendiri...",
      author: "Master Ahmad S.B."
    }
  ];

  const gallery = [
    {
      id: "1",
      imageUrl: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=800&q=80",
      category: "LATIHAN",
      title: "Latihan Rutin Kelas Dewasa"
    },
    {
      id: "2",
      imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80",
      category: "KEJUARAAN",
      title: "Kejuaraan Daerah Banten 2025"
    },
    {
      id: "3",
      imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=800&q=80",
      category: "UKT",
      title: "Pelaksanaan UKT Periode Akhir 2025"
    }
  ];

  return Response.json({ articles, gallery });
}
