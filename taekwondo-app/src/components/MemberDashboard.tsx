"use client";

import React, { useState, useEffect } from "react";
import { 
  Award, 
  Calendar, 
  FileText, 
  LogOut, 
  TrendingUp, 
  Star,
  ChevronRight,
  Clock,
  Settings,
  HelpCircle,
  Users,
  CheckCircle,
  FileBadge,
  UserCheck,
  Zap,
  MapPin,
  QrCode,
  Download,
  CreditCard,
  Upload,
  Check,
  X,
  Lock,
  Plus
} from "lucide-react";
import confetti from "canvas-confetti";

export default function MemberDashboard({ 
  userEmail,
  onBack 
}: { 
  userEmail?: string;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentBelt, setCurrentBelt] = useState("Biru Strip Merah (4 Geup)");
  
  // Database states
  const [profile, setProfile] = useState<{
    id: string;
    userId: string;
    fullName: string;
    memberNumber: string;
    currentBelt: string;
    progress: number;
    email: string;
    selfieUrl?: string | null;
    certDocUrl?: string | null;
  } | null>(null);

  // Profile Edit States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSelfieUrl, setEditSelfieUrl] = useState<string | null>(null);
  const [editCertDocUrl, setEditCertDocUrl] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [dojoMembers, setDojoMembers] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Self-Upload Achievement States
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [achTitle, setAchTitle] = useState("");
  const [achEventName, setAchEventName] = useState("");
  const [achDate, setAchDate] = useState("");
  const [achRank, setAchRank] = useState("Emas");
  const [achCertificateUrl, setAchCertificateUrl] = useState<string | null>(null);
  const [isSavingAchievement, setIsSavingAchievement] = useState(false);

  // Dynamic fee calculations
  const sppFeeRate = settings?.sppFee || 100000;
  const sessionFeeRate = settings?.sessionFee || 15000;

  const unpaidMeetingsCount = 2; // Simulated base meetings unpaid
  const meetingFeeAmount = unpaidMeetingsCount * sessionFeeRate;

  // Dynamic UKT Registration States
  const [activeExam, setActiveExam] = useState<any>(null);
  const [memberRegistration, setMemberRegistration] = useState<any>(null);
  const [docRequirements, setDocRequirements] = useState<string[]>([]);
  const [registrationUploads, setRegistrationUploads] = useState<Record<string, string>>({});
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);

  // Digital Payment States
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPurpose, setCheckoutPurpose] = useState("");
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [checkoutPaymentId, setCheckoutPaymentId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "transfer">("qris");
  const [uploadedReceipt, setUploadedReceipt] = useState<string | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [expandedSyl, setExpandedSyl] = useState<number | null>(null);

  // Xendit QRIS Dynamic States
  const [qrString, setQrString] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [qrPaid, setQrPaid] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrPollingRef, setQrPollingRef] = useState<NodeJS.Timeout | null>(null);

  const uploadToServer = async (file: File | Blob, filename: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file, filename);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        return data.url;
      }
      return null;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  // Ranks sequence configuration (WT/Kukkiwon)
  const beltSequence = [
    { 
      name: "Sabuk Putih", 
      level: "10 Geup", 
      next: "Sabuk Kuning (9 Geup)", 
      syllabus: [
        {
          title: "Saju Jirugi 1 & 2 (Pukulan 4 Arah)",
          type: "Basic Pattern (Pola Dasar)",
          philosophy: "Melambangkan pondasi pertama kehidupan di mana praktisi belajar melangkah ke 4 penjuru angin untuk membangun keseimbangan tubuh dan orientasi arah.",
          steps: [
            "Langkah maju ke depan dengan kuda-kuda pendek Ap Seogi diikuti pukulan Momtong Jirugi.",
            "Putar badan 90 derajat ke arah kiri dengan tangkisan bawah Are Maki.",
            "Lakukan pengulangan gerakan maju-pukul dan putar-tangkis hingga kembali ke posisi semula.",
            "Saju Jirugi 2 menggunakan tangkisan dalam (An Maki) sebagai variasi pertahanan."
          ],
          tips: "Pastikan kepalan tangan (Jumok) diputar penuh 180 derajat saat mendekati target pukulan, dan posisi punggung harus selalu tegak."
        },
        {
          title: "Ap Chagi (Tendangan Depan)",
          type: "Basic Kicking (Tendangan)",
          philosophy: "Tendangan dasar terpenting yang melambangkan kecepatan lecutan kaki. Menyerang area ulu hati (momtong) atau dagu (eolgul).",
          steps: [
            "Angkat lutut kaki penendang tinggi-tinggi ke arah dada dengan melipat betis.",
            "Lecutkan kaki ke depan menggunakan bagian depan telapak kaki (Ap Chuk).",
            "Tarik kembali kaki penendang ke arah dada sebelum diturunkan ke lantai.",
            "Kaki tumpuan harus sedikit menekuk demi menjaga keseimbangan."
          ],
          tips: "Jangan menendang dengan kaki lurus sejak awal. Ingat prinsip: angkat lutut - lecutkan - tarik lutut kembali - letakkan kaki."
        },
        {
          title: "Tangkisan Are Maki (Tangkisan Bawah)",
          type: "Basic Defense (Tangkisan)",
          philosophy: "Pertahanan awal untuk menangkal serangan tendangan lurus bawah atau pukulan rendah ke arah kemaluan.",
          steps: [
            "Tarik tangan penangkis menyilang di atas pundak telinga bagian luar.",
            "Sapu tangan penangkis ke bawah secara lurus sejajar paha dengan jarak satu kepal.",
            "Tarik tangan pembantu ke pinggang (hikuite) dengan kencang.",
            "Fokuskan mata ke depan."
          ],
          tips: "Gunakan putaran pinggul saat menyapu tangan ke bawah. Sentakan di akhir gerakan memberikan daya tolak tangkisan yang maksimal."
        }
      ]
    },
    { 
      name: "Sabuk Kuning", 
      level: "9 Geup", 
      next: "Kuning Strip Hijau (8 Geup)", 
      syllabus: [
        {
          title: "Poomsae Taegeuk 1 Jang",
          type: "Official Poomsae (Jurus 1)",
          philosophy: "Melambangkan 'Keon' (Langit). Mewakili awal mula penciptaan alam semesta, kekuatan kosmik primer, keagungan, dan cahaya matahari pertama.",
          steps: [
            "Lakukan gerakan ke kiri dan kanan dengan Are Maki diikuti pukulan Momtong Jirugi.",
            "Melangkah maju ke depan dengan tangkisan dalam Momtong An Maki dan pukulan beruntun.",
            "Lakukan tangkisan atas Eolgul Maki di baris tengah jurus.",
            "Selesaikan jurus dengan melangkah kembali ke posisi awal diakhiri teriakan Kihap."
          ],
          tips: "Ini adalah jurus pertama resmi Anda. Jaga konsistensi lebar kuda-kuda Ap Seogi Anda (lebar satu langkah kaki)."
        },
        {
          title: "Yeop Chagi (Tendangan Samping)",
          type: "Basic Kicking (Tendangan)",
          philosophy: "Tendangan pisau kaki yang membutuhkan kelenturan pinggul, melambangkan kekuatan penetrasi dan ketajaman serangan samping.",
          steps: [
            "Angkat lutut menyamping ke arah dada dengan posisi tubuh condong miring.",
            "Putar kaki tumpuan berputar 180 derajat membelakangi arah tendangan.",
            "Luruskan kaki penendang dengan mendorong tumit dan pisau kaki (Balnal) ke sasaran.",
            "Tarik kembali lutut ke dada sebelum mendaratkan kaki."
          ],
          tips: "Putar tumit kaki tumpuan sepenuhnya hingga menghadap ke belakang. Hal ini membuka ruang pinggul agar tendangan tidak tertahan."
        },
        {
          title: "Tangkisan Momtong An Maki (Tangkisan Dalam)",
          type: "Basic Defense (Tangkisan)",
          philosophy: "Menghalau pukulan lurus dada lawan ke luar garis tubuh demi menjaga vitalitas organ tengah.",
          steps: [
            "Tarik tangan penangkis lurus ke belakang samping tubuh setinggi bahu.",
            "Dorong melingkar ke depan dada dengan siku menekuk 90 derajat.",
            "Pastikan tangan berhenti tepat di garis tengah tubuh Anda.",
            "Tangan pembantu terikat kuat di pinggang."
          ],
          tips: "Jangan melompat saat menangkis. Jaga tinggi badan tetap stabil dengan merendahkan lutut kuda-kuda."
        }
      ]
    },
    { 
      name: "Kuning Strip Hijau", 
      level: "8 Geup", 
      next: "Sabuk Hijau (7 Geup)", 
      syllabus: [
        {
          title: "Poomsae Taegeuk 2 Jang",
          type: "Official Poomsae (Jurus 2)",
          philosophy: "Melambangkan 'Tae' (Danau). Mewakili kedamaian, ketenangan batin, kelembutan batiniah namun dipadukan dengan ketegasan sikap luar.",
          steps: [
            "Lakukan gerakan pembuka Are Maki dan Momtong Jirugi.",
            "Gunakan kombinasi Ap Chagi diikuti pukulan atas Eolgul Jirugi.",
            "Gunakan kombinasi langkah ganda maju-mundur di area poros tengah jurus.",
            "Kihap dilakukan di akhir pukulan lurus terkuat."
          ],
          tips: "Saat melakukan pukulan atas (Eolgul Jirugi), arahkan kepalan tangan sejajar dengan tinggi hidung atau mata Anda sendiri."
        },
        {
          title: "Dwi Chagi (Tendangan Belakang)",
          type: "Advanced Kicking (Tendangan)",
          philosophy: "Tendangan belakang lurus seperti kuda menyepak. Melambangkan taktik serangan balik rahasia yang mengejutkan lawan.",
          steps: [
            "Putar tubuh membelakangi lawan dengan memutar kaki depan.",
            "Intip sasaran melalui bahu belakang untuk presisi arah tendangan.",
            "Sentakkan tumit kaki lurus ke belakang sejajar dengan lantai.",
            "Tarik kembali kaki penendang mendekati tubuh sebelum berputar kembali."
          ],
          tips: "Gesekkan kedua paha Anda saat kaki meluncur ke belakang. Tendangan belakang yang melebar kesamping akan kehilangan tenaga dorongnya."
        },
        {
          title: "Tangkisan Momtong An Maki (Tangkisan Dalam)",
          type: "Basic Defense (Tangkisan)",
          philosophy: "Tangkisan dada yang kokoh untuk membelokkan lintasan serangan lurus dari lawan.",
          steps: [
            "Tarik kepalan penangkis ke belakang setinggi telinga.",
            "Ayunkan melingkar ke depan ulu hati.",
            "Kunci kekuatan pada otot lengan luar saat terjadi benturan hipotesis.",
            "Tarik kepalan tangan non-penangkis erat ke pinggang."
          ],
          tips: "Gunakan pernapasan perut (sentakan napas pendek) tepat saat tangkisan mengunci di depan dada."
        }
      ]
    },
    { 
      name: "Sabuk Hijau", 
      level: "7 Geup", 
      next: "Hijau Strip Biru (6 Geup)", 
      syllabus: [
        {
          title: "Poomsae Taegeuk 3 Jang",
          type: "Official Poomsae (Jurus 3)",
          philosophy: "Melambangkan 'Ri' (Api). Mewakili kehangatan, keceriaan, gairah membara, serta transisi gerak beruntun yang cepat bagaikan api menjalar.",
          steps: [
            "Lakukan tangkisan bawah Are Maki dikombinasikan dengan tendangan Ap Chagi dan pukulan ganda (Dubon Jirugi).",
            "Gunakan sabetan pisau tangan (Sonnal An Chigi) untuk menyerang leher lawan.",
            "Terapkan langkah pertahanan mundur dengan tangkisan pisau tangan ganda.",
            "Jurus diselesaikan dengan serangan sabetan pisau tangan ganda yang cepat."
          ],
          tips: "Dubon Jirugi (pukulan ganda) harus dilakukan dengan irama cepat: satu-dua. Putar pinggul Anda secara aktif pada setiap pukulan."
        },
        {
          title: "Dollyo Chagi (Tendangan Melingkar)",
          type: "Basic Kicking (Tendangan)",
          philosophy: "Tendangan busur melingkar memakai punggung kaki. Melambangkan fleksibilitas putaran pinggul dan daya cambuk kaki.",
          steps: [
            "Angkat lutut ke depan atas seperti akan melakukan tendangan depan.",
            "Putar kaki tumpu 180 derajat ke belakang sambil memiringkan lutut penendang mendatar.",
            "Pecutkan lutut secara horizontal ke arah kepala atau rusuk sasaran.",
            "Tarik kembali betis ke paha sebelum diturunkan."
          ],
          tips: "Pecutkan lutut Anda (snap). Tendangan yang hanya mengayunkan kaki lurus dari bawah akan mudah dihindari dan dibaca lawan."
        },
        {
          title: "Serangan Sonnal Mok Chigi (Sabetan Pisau Tangan)",
          type: "Striking (Serangan Tangan)",
          philosophy: "Menggunakan tepi luar telapak tangan terbuka untuk menebas area vital leher atau pelipis samping lawan.",
          steps: [
            "Tarik tangan penyerang terbuka di belakang pundak telinga.",
            "Sabetkan melingkar horizontal dari luar ke dalam menuju leher sasaran.",
            "Tangan pembantu menutup dada dengan kepalan ditarik ke pinggang.",
            "Pertahankan ketegangan jari-jari tangan penyerang."
          ],
          tips: "Rapatkan ibu jari erat-erat ke telapak tangan untuk mengeraskan area pisau tangan (Sonnal) penyerang."
        }
      ]
    },
    { 
      name: "Hijau Strip Biru", 
      level: "6 Geup", 
      next: "Sabuk Biru (5 Geup)", 
      syllabus: [
        {
          title: "Poomsae Taegeuk 4 Jang",
          type: "Official Poomsae (Jurus 4)",
          philosophy: "Melambangkan 'Jin' (Petir). Mewakili kekuatan besar yang menggetarkan, keberanian luar biasa menghadapi bahaya, serta ketangkasan gerak.",
          steps: [
            "Lakukan tangkisan pisau tangan ganda (Sonnal Momtong Makki) dengan kuda-kuda Duit Seogi.",
            "Dorong tubuh maju melakukan tusukan ujung jari tangan (Pyeon Son Kkeut Seou Jirugi).",
            "Gunakan sabetan melingkar punggung kepalan tangan (Dung Jumok Eolgul Ap Chigi).",
            "Lakukan Are Maki dan tangkisan dalam An Maki secara berurutan cepat."
          ],
          tips: "Kuda-kuda Duit Seogi menuntut 70% beban tubuh berada di kaki belakang. Jaga lutut kaki belakang tetap tertekuk ke luar."
        },
        {
          title: "Neryo Chagi (Tendangan Menurun/Cangkul)",
          type: "Specialist Kicking (Tendangan)",
          philosophy: "Tendangan kapak/cangkul yang menjulang tinggi lalu menghujam kebawah. Melambangkan dominasi vertical atas lawan.",
          steps: [
            "Angkat kaki penendang lurus setinggi-tingginya melewati kepala lawan.",
            "Sentakkan tumit kaki ke bawah secara lurus vertikal mengarah ubun-ubun atau hidung.",
            "Gunakan fleksibilitas otot paha untuk mengangkat kaki tanpa menekuk lutut.",
            "Mendarat dengan stabil menjaga kuda-kuda siap tempur."
          ],
          tips: "Tarik jari kaki ke atas saat menghantam ke bawah agar tumit (Dwichook) menjadi bagian pertama yang menghantam keras target."
        },
        {
          title: "Kuda-kuda Duit Seogi (Kuda-kuda L)",
          type: "Stance (Kuda-kuda)",
          philosophy: "Kuda-kuda defensif utama. Berat badan dipusatkan ke belakang agar kaki depan bebas membalas dengan tendangan cepat.",
          steps: [
            "Posisikan tumit kaki belakang menyilang membentuk sudut 90 derajat dengan kaki depan.",
            "Tekuk lutut kaki belakang dalam-dalam.",
            "Tempatkan 70% berat badan di kaki belakang, 30% di kaki depan.",
            "Jarak antar kaki adalah sekitar 1.5 lebar telapak kaki."
          ],
          tips: "Kaki depan harus menapak ringan di lantai, jangan menekan berat badan ke depan agar refleks kaki depan tetap lincah."
        }
      ]
    },
    { 
      name: "Sabuk Biru", 
      level: "5 Geup", 
      next: "Biru Strip Merah (4 Geup)", 
      syllabus: [
        {
          title: "Poomsae Taegeuk 5 Jang",
          type: "Official Poomsae (Jurus 5)",
          philosophy: "Melambangkan 'Son' (Angin). Mewakili kekuatan hembusan dahsyat yang tak terlihat, kelenturan adaptasi gerak, dan kelembutan hembusan angin sepoi-sepoi.",
          steps: [
            "Lakukan Are Maki di kiri-kanan lalu lompat maju ke kuda-kuda Ap Koobi dengan pukulan beruntun.",
            "Terapkan tangkisan luar Momtong Bakat Maki secara berulang.",
            "Lakukan sabetan siku tangan (Palkup Dollyo Chigi) dengan menahan kepala boneka target.",
            "Gunakan kuda-kuda Beom Seogi di bagian belakang jurus."
          ],
          tips: "Palkup Dollyo Chigi (sabetan siku) membutuhkan tarikan tangan penahan yang kuat agar siku terdorong dengan rotasi pinggul penuh."
        },
        {
          title: "Dwi Huryo Chagi (Tendangan Memutar Belakang)",
          type: "Advanced Kicking (Tendangan)",
          philosophy: "Tendangan putar melingkar 360 derajat memakai tumit. Melambangkan penguasaan ruang udara dan momentum putaran mutlak.",
          steps: [
            "Putar kepala dan tubuh belakang menghadap target terlebih dahulu.",
            "Ayunkan kaki penendang menyapu horizontal sejajar kepala sasaran.",
            "Gunakan kaki tumpu sebagai poros putaran pusat gravitasi tubuh.",
            "Tarik kaki kembali ke posisi awal bersiap kyorugi joonbi."
          ],
          tips: "Pandangan mata harus mengunci sasaran (target lock) sebelum kaki dilecutkan berputar. Putaran buta akan membuat tendangan meleset jauh."
        },
        {
          title: "Tangkisan Momtong Bakat Maki (Tangkisan Luar)",
          type: "Basic Defense (Tangkisan)",
          philosophy: "Menolak serangan dada keluar garis badan dengan menyabetkan tangan dari arah dalam ketiak menuju luar.",
          steps: [
            "Tarik tangan penangkis menyilang di bawah ketiak tangan yang berlawanan.",
            "Dorong melingkar keluar setinggi bahu.",
            "Kunci kekuatan lengan penangkis dengan sudut siku 90 derajat.",
            "Kepalan tangan sejajar tinggi pundak."
          ],
          tips: "Sentakkan pinggul berputar berlawanan arah jarum jam saat menangkis untuk memberi tenaga penolak benturan."
        }
      ]
    },
    { 
      name: "Biru Strip Merah", 
      level: "4 Geup", 
      next: "Sabuk Merah (3 Geup)", 
      syllabus: [
        {
          title: "Poomsae Taegeuk 6 Jang",
          type: "Official Poomsae (Jurus 6)",
          philosophy: "Melambangkan 'Kam' (Air). Mewakili sifat air yang cair, fleksibel mengikuti wadah, tenang menghanyutkan namun bisa meluluhlantakkan karang raksasa.",
          steps: [
            "Lakukan Are Maki dipadu dengan tendangan Dollyo Chagi depan.",
            "Gunakan tangkisan luar pisau tangan tunggal (Hansomnal Momtong Bakat Makki).",
            "Terapkan tangkisan atas memutar (Eolgul Oetgoreo Makki) menyilang tangan.",
            "Gunakan serangan sabetan pisau tangan luar menyilang dada."
          ],
          tips: "Dollyo Chagi dalam jurus ini harus ditahan seimbang sebelum ditarik kembali dan meletakkan kaki kembali ke kuda-kuda awal."
        },
        {
          title: "Dolgae Chagi (Tendangan Tornado)",
          type: "Elite Kicking (Tendangan)",
          philosophy: "Tendangan putar udara 360 derajat menggabungkan gerak tipuan langkah kaki (step) dengan pecutan Dollyo Chagi udara.",
          steps: [
            "Lakukan langkah silang kaki depan ke belakang untuk menciptakan torsi putaran.",
            "Lompat memutar di udara dengan lutut kaki pembantu diangkat tinggi untuk mengangkat tubuh.",
            "Lepaskan tendangan melingkar (Dollyo Chagi) memakai kaki satunya saat berada di titik tertinggi udara.",
            "Mendarat dengan kedua kaki menekuk lentur meminimalisir benturan lutut."
          ],
          tips: "Fokus pada lompatan vertikal ke atas terlebih dahulu, bukan melompat ke depan. Lompatan vertikal memberikan waktu melayang lebih lama."
        },
        {
          title: "Kuda-kuda Beom Seogi (Kuda-kuda Macan)",
          type: "Stance (Kuda-kuda)",
          philosophy: "Kuda-kuda menyerupai seekor harimau yang siap melompat menerkam mangsa. Fleksibel untuk bertahan dan menyerang.",
          steps: [
            "Tekuk lutut kaki belakang dalam-dalam menahan 90% berat badan.",
            "Tempatkan kaki depan sejauh satu telapak kaki di depan dengan posisi tumit menjinjit penuh.",
            "Pastikan berat badan depan hanya 10% (hanya menempel ringan di lantai).",
            "Kedua lutut ditekuk menghadap ke depan lurus."
          ],
          tips: "Kuda-kuda ini sangat lincah untuk meluncurkan serangan tendangan kaki depan instan (Ap Chagi atau Miro Chagi) tanpa perlu mengubah distribusi berat badan."
        }
      ]
    },
    { 
      name: "Sabuk Merah", 
      level: "3 Geup", 
      next: "Merah Strip Hitam 1 (2 Geup)", 
      syllabus: [
        {
          title: "Poomsae Taegeuk 7 Jang",
          type: "Official Poomsae (Jurus 7)",
          philosophy: "Melambangkan 'Kan' (Gunung). Mewakili keteguhan iman, stabilitas emosi, prinsip hidup yang kokoh tak tergoyahkan oleh badai cobaan.",
          steps: [
            "Buka jurus dengan tangkisan bawah menyilang tangan (Are Oetgoreo Makki) dengan kuda-kuda Beom Seogi.",
            "Lakukan tangkisan dalam ganda (An Palmok Momtong Makki).",
            "Gunakan serangan lutut (Ap Chup Murup Chigi) dilanjutkan serangan pukulan ganda.",
            "Terapkan tangkisan bawah Are Maki dipadukan sabetan siku tangan samping."
          ],
          tips: "Jurus ini kaya akan kuda-kuda Beom Seogi dan Duit Seogi. Jaga keseimbangan poros tubuh tengah agar tidak goyah."
        },
        {
          title: "Kyorugi Taktis (Sparring PBTI)",
          type: "Combat Sparring (Pertarungan)",
          philosophy: "Simulasi pertarungan resmi untuk menguji refleks serangan, pertahanan, dan manajemen stamina dalam 3 ronde waktu.",
          steps: [
            "Masuk ke lapangan memakai pelindung kepala (Headgear) dan dada (Protector).",
            "Lakukan gerakan langkah bertarung dinamis (Step Kyorugi).",
            "Gunakan tendangan serangan balik (Counter-kick) seperti Dwi Chagi saat lawan maju menyerang.",
            "Lakukan serangan beruntun menggunakan kombinasi Dollyo Chagi dan Yeop Chagi."
          ],
          tips: "Kunci kemenangan sparring adalah ketenangan mental dan pembacaan gerak tubuh (body language) lawan sebelum mereka menendang."
        },
        {
          title: "Tangkisan Gawi Maki (Tangkisan Gunting)",
          type: "Basic Defense (Tangkisan)",
          philosophy: "Menangkis dua serangan musuh yang datang bersamaan ke arah dada (tengah) dan perut (bawah) secara silang gunting.",
          steps: [
            "Tarik satu tangan ke pundak (Are Maki) dan satu tangan ke ketiak belakang (Momtong An Maki).",
            "Sentakkan kedua tangan menyilang di depan garis dada bersamaan seperti pisau gunting mengatup.",
            "Tangan bawah sejajar paha, tangan atas sejajar dada tengah.",
            "Pertahankan kuda-kuda Ap Koobi yang kokoh."
          ],
          tips: "Kedua gerakan tangkisan harus mengunci tepat pada detik yang sama dengan sentakan napas kencang."
        }
      ]
    },
    { 
      name: "Merah Strip Hitam 1", 
      level: "2 Geup", 
      next: "Merah Strip Hitam 2 (1 Geup)", 
      syllabus: [
        {
          title: "Poomsae Taegeuk 8 Jang",
          type: "Official Poomsae (Jurus 8)",
          philosophy: "Melambangkan 'Kon' (Bumi). Mewakili akhir dari rangkaian siklus dasar Taegeuk, kesuburan, kematangan jiwa, serta landasan kokoh bagi sabuk hitam.",
          steps: [
            "Lakukan langkah maju dengan tangkisan luar ganda dan pukulan dua kepalan meluncur ke rahang lawan.",
            "Eksekusi tendangan lompat ganda (Dubon Ap Chagi) melayang di udara.",
            "Terapkan Are Maki diikuti tangkisan atas silang.",
            "Selesaikan baris akhir jurus dengan tangkisan pisau tangan ganda."
          ],
          tips: "Tendangan lompat ganda (Dubon Ap Chagi) harus meluncurkan tendangan pertama sebagai umpan rendah, dan tendangan kedua setinggi kepala sasaran di udara."
        },
        {
          title: "Target Sparring & Double Kick Combo",
          type: "Advanced Kicking (Tendangan)",
          philosophy: "Penguasaan kombinasi tendangan beruntun tanpa menyentuh tanah untuk melumpuhkan pertahanan ganda lawan.",
          steps: [
            "Lokukan tendangan Dollyo Chagi kanan.",
            "Tanpa menurunkan kaki penendang ke tanah, lakukan rotasi pinggul di udara untuk meluncurkan tendangan kiri (Narae Chagi).",
            "Gabungkan dengan tendangan tipuan (Cut-kick) kaki depan.",
            "Mendarat dengan kuda-kuda siap tempur."
          ],
          tips: "Gunakan ayunan lengan berlawanan arah tendangan untuk membantu memutar tubuh di udara agar tidak kehilangan keseimbangan."
        },
        {
          title: "Tangkisan Oesanteul Maki",
          type: "Basic Defense (Tangkisan)",
          philosophy: "Tangkisan kombinasi satu tangan melakukan tangkisan atas (Eolgul) dan tangan lainnya melakukan tangkisan bawah (Are) menyerupai sayap burung elang.",
          steps: [
            "Tarik tangan atas di sisi telinga luar, tangan bawah menyilang di bahu berlawanan.",
            "Sentakkan secara simultan keluar: satu lengan menangkis atas melingkar kepala, satu lengan menyapu ke bawah sejajar paha.",
            "Pertahankan keseimbangan bahu tetap sejajar mendatar.",
            "Gunakan kuda-kuda Duit Seogi."
          ],
          tips: "Pastikan kekuatan kedua tangkisan terbagi rata, jangan condong ke salah satu sisi tubuh."
        }
      ]
    },
    { 
      name: "Merah Strip Hitam 2", 
      level: "1 Geup", 
      next: "Sabuk Hitam (1 Dan)", 
      syllabus: [
        {
          title: "Poomsae Koryo",
          type: "Black Belt Poomsae (Koryo)",
          philosophy: "Melambangkan semangat tinggi dan keberanian pantang menyerah dari bangsa Dinasti Koryo abad ke-10 yang berhasil mengusir penjajah Mongolia.",
          steps: [
            "Lakukan tangkisan ganda pisau tangan bawah dan serangan pisau tangan ke leher.",
            "Lakukan tendangan Yeop Chagi ganda (rendah-tinggi) bertubi-tubi.",
            "Gunakan tusukan tangan ganda ke ulu hati lawan.",
            "Selesaikan jurus dengan langkah lambat meditasi menenangkan napas (Joonbi Seogi)."
          ],
          tips: "Koryo menuntut transisi gerakan lambat (slow motion) yang diiringi ketegangan otot penuh (isometric tension) sebelum meledak di gerakan cepat."
        },
        {
          title: "Kyorugi Kompetitif Resmi PBTI",
          type: "Tournament Sparring (Kyorugi)",
          philosophy: "Aplikasi penuh taktik pertarungan taekwondo kelas kompetisi nasional untuk menguji mental juara di bawah tekanan.",
          steps: [
            "Terapkan taktik clinch (merapat) untuk menghindari tendangan jarak jauh lawan.",
            "Luncurkan tendangan kepala (Muryo Chagi) untuk meraih poin tertinggi (3 poin).",
            "Gunakan tendangan dorong (Miro Chagi) untuk merusak keseimbangan langkah lawan.",
            "Jaga tempo pernapasan agar stamina tidak habis di ronde ketiga."
          ],
          tips: "Fokus pada kecepatan reaksi mata (visual reaction time). Tendang ke area protektor elektronik dengan punggung kaki kencang agar sensor bunyi berbunyi."
        },
        {
          title: "Teknik Pemecahan Papan (Kyukpa)",
          type: "Power Test (Pemecahan Papan)",
          philosophy: "Pengujian kekuatan fisik riil, konsentrasi pikiran, dan keyakinan diri dengan memecahkan benda keras.",
          steps: [
            "Posisikan diri di depan papan kayu target setebal 2-3 cm.",
            "Lakukan simulasi pukulan/tendangan beberapa kali untuk menyelaraskan jarak jangkauan.",
            "Fokuskan pikiran ke titik di belakang papan, bukan pada permukaannya.",
            "Hantam papan dengan kecepatan penuh menggunakan bagian tumit kaki atau pisau tangan (Sonnal) disertai teriakan Kihap."
          ],
          tips: "Keraguan adalah penyebab utama kegagalan dan cedera. Yakinkan pikiran bahwa papan tersebut sudah pecah sebelum kontak fisik terjadi."
        }
      ]
    },
    { 
      name: "Sabuk Hitam", 
      level: "1 Dan", 
      next: "Sabuk Hitam (2 Dan)", 
      syllabus: [
        {
          title: "Poomsae Keumgang",
          type: "Black Belt Poomsae (Keumgang)",
          philosophy: "Melambangkan kekuatan absolut bagaikan batu berlian (tidak bisa dihancurkan) dan keindahan abadi Gunung Keumgang di Korea Utara.",
          steps: [
            "Lakukan gerakan pembuka Are Maki lambat dengan kuda-kuda Hakdari Seogi (kuda-kuda satu kaki burung bangau).",
            "Gunakan pukulan ganda ke atas (Santul Jirugi) menyilang dada.",
            "Terapkan tangkisan memutar membelah udara.",
            "Selesaikan jurus dengan kuda-kuda samping Joochoom Seogi (kuda-kuda berkuda) yang sangat kokoh."
          ],
          tips: "Keumgang sangat menguji kekuatan otot paha Anda saat berdiri dengan satu kaki (Hakdari Seogi). Jaga keseimbangan tubuh agar tidak goyang sedikit pun."
        },
        {
          title: "Filosofi Taekwondo Kedewasaan",
          type: "Philosophical Theory (Moral)",
          philosophy: "Memahami 5 Prinsip Taekwondo: Kesopanan (Ye Ui), Integritas (Yom Chi), Kegigihan (In Nae), Pengendalian Diri (Guk Gi), dan Semangat Pantang Menyerah (Baekjul Boolgool).",
          steps: [
            "Praktikkan sikap hormat kepada senior dan melindungi junior di dalam maupun di luar Dojang.",
            "Gunakan keahlian taekwondo hanya untuk membela diri dan melindungi orang lain yang lemah.",
            "Terapkan kedisiplinan latihan sehari-hari ke dalam kehidupan akademik dan profesional.",
            "Tulis esai refleksi moral mengenai perjalanan sabuk putih hingga meraih sabuk hitam."
          ],
          tips: "Sabuk hitam bukanlah akhir dari perjalanan, melainkan awal dari pemahaman taekwondo yang sesungguhnya. Tetaplah rendah hati bagaikan padi yang merunduk."
        }
      ]
    }
  ];

  // Fetch dynamic profile & payments from API
  const fetchDashboardData = async () => {
    try {
      const emailToQuery = userEmail || "member.beni@taekwondo.com";
      const resUsers = await fetch("/api/users");
      if (resUsers.ok) {
        const usersList = await resUsers.json();
        const currentUser = usersList.find(
          (u: any) => u.email.toLowerCase() === emailToQuery.toLowerCase()
        );
        if (currentUser && currentUser.memberId) {
          const mId = currentUser.memberId;
          setProfile({
            id: mId,
            userId: currentUser.id,
            fullName: currentUser.name,
            memberNumber: currentUser.memberNumber || "ETA-2026-0089",
            currentBelt: currentUser.currentBelt || "Biru Strip Merah (4 Geup)",
            progress: currentUser.progress || 75,
            email: currentUser.email || "",
            selfieUrl: currentUser.selfieUrl || null,
            certDocUrl: currentUser.certDocUrl || null,
          });
          setCurrentBelt(currentUser.currentBelt || "Biru Strip Merah (4 Geup)");

          // Load payments from API
          const resPayments = await fetch("/api/payments");
          if (resPayments.ok) {
            const allPayments = await resPayments.json();
            const memberPayments = allPayments.filter(
              (p: any) => p.memberId === mId
            );
            setPayments(memberPayments);
          }

          // Fetch achievements
          try {
            // We fetch all achievements without status filter, then filter for this member
            // so member can see their PENDING, REJECTED, APPROVED achievements
            const resAch = await fetch("/api/achievements");
            if (resAch.ok) {
              const allAch = await resAch.json();
              setAchievements(allAch.filter((a: any) => a.memberId === mId));
            }
          } catch (e) { console.error("Error fetching achievements:", e); }

          // Fetch UKT details
          await fetchUktStatus(mId);

          // Fetch schedules
          try {
            const resSched = await fetch("/api/schedules");
            if (resSched.ok) {
              const schedData = await resSched.json();
              setSchedules(Array.isArray(schedData) ? schedData : []);
            }
          } catch (e) { console.error("Error fetching schedules:", e); }

          // Fetch all dojo members
          try {
            const resAllUsers = await fetch("/api/users");
            if (resAllUsers.ok) {
              const allUsers = await resAllUsers.json();
              setDojoMembers(allUsers.filter((u: any) => u.role === "MEMBER" || u.memberId));
            }
          } catch (e) { console.error("Error fetching dojo members:", e); }
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUktStatus = async (mId: string) => {
    try {
      const res = await fetch(`/api/ukt?memberId=${mId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveExam(data.exam);
        setMemberRegistration(data.registration);
      }

      // Fetch settings for dynamic requirements config
      const resSettings = await fetch("/api/settings");
      if (resSettings.ok) {
        const settingsData = await resSettings.json();
        setSettings(settingsData);
        if (settingsData.uktRequirements) {
          setDocRequirements(settingsData.uktRequirements);
        } else {
          setDocRequirements(["Surat Izin Orang Tua", "Foto Selfie 3x4"]);
        }
      }
    } catch (e) {
      console.error("Error loading UKT exam config:", e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userEmail]);

  // Get index of current belt in sequence
  const getCurrentIndex = () => {
    const cleanName = currentBelt.split(" (")[0];
    const idx = beltSequence.findIndex(b => b.name === cleanName);
    return idx !== -1 ? idx : 5;
  };

  const currentIndex = getCurrentIndex();
  const currentBeltConfig = beltSequence[currentIndex];
  const nextBeltInfo = currentBeltConfig.next;

  const uktFeesMap = settings?.uktFees || {};
  const uktFeeRate = uktFeesMap[nextBeltInfo] !== undefined && uktFeesMap[nextBeltInfo] !== null
    ? Number(uktFeesMap[nextBeltInfo])
    : (settings?.uktFee || 150000);

  // Filter history of belt promotions dynamically
  const getDynamicHistory = () => {
    const list = [];
    const dateMock = ["Des 2025", "Mei 2025", "Okt 2024", "Mar 2024", "Des 2023"];
    let dateIdx = 0;

    for (let i = 0; i < currentIndex; i++) {
      list.unshift({
        from: `${beltSequence[i].name} (${beltSequence[i].level})`,
        to: `${beltSequence[i+1].name} (${beltSequence[i+1].level})`,
        date: dateMock[dateIdx % dateMock.length]
      });
      dateIdx++;
    }
    return list;
  };

  const dynamicHistory = getDynamicHistory();

  const handleConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // ─── Checkout & QRIS Handling ───────────────────────────────────────────────

  /** Hentikan polling status pembayaran jika sedang berjalan */
  const stopQrPolling = () => {
    if (qrPollingRef) {
      clearInterval(qrPollingRef);
      setQrPollingRef(null);
    }
  };

  /** Tutup modal dan bersihkan semua state QRIS */
  const handleCloseCheckout = () => {
    stopQrPolling();
    setShowCheckoutModal(false);
    setQrString(null);
    setQrPaid(false);
    setQrError(null);
    setIsGeneratingQr(false);
    setUploadedReceipt(null);
  };

  /** Buka modal checkout */
  const openCheckout = (purpose: string, amount: number, paymentId: string | null = null) => {
    setCheckoutPurpose(purpose);
    setCheckoutAmount(amount);
    setCheckoutPaymentId(paymentId);
    setUploadedReceipt(null);
    setPaymentMethod("qris");
    setQrString(null);
    setQrPaid(false);
    setQrError(null);
    setShowCheckoutModal(true);
  };

  /**
   * Generate QRIS dinamis dari Xendit.
   * Hanya bisa dipanggil jika ada checkoutPaymentId (tagihan dari DB).
   */
  const handleGenerateQRIS = async () => {
    if (!checkoutPaymentId) {
      setQrError("Tagihan belum terdaftar di sistem. Hubungi admin.");
      return;
    }

    setIsGeneratingQr(true);
    setQrError(null);
    setQrString(null);

    try {
      const res = await fetch("/api/payments/create-qris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: checkoutPaymentId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setQrError(data.error || "Gagal membuat kode QRIS. Coba lagi.");
        return;
      }

      setQrString(data.qrString);

      // Mulai polling status pembayaran setiap 5 detik
      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch("/api/payments");
          if (statusRes.ok) {
            const allPayments: any[] = await statusRes.json();
            const thisPayment = allPayments.find(
              (p) => p.id === checkoutPaymentId
            );
            if (thisPayment?.status === "COMPLETED") {
              clearInterval(interval);
              setQrPollingRef(null);
              setQrPaid(true);
              await fetchDashboardData();
            }
          }
        } catch {
          // Abaikan error polling, lanjut cek berikutnya
        }
      }, 5000);

      setQrPollingRef(interval);
    } catch (err: any) {
      setQrError("Terjadi kesalahan koneksi. Pastikan internet tersambung.");
    } finally {
      setIsGeneratingQr(false);
    }
  };


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !profile.userId || !editName || !editEmail) return;

    setIsSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${profile.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          role: "MEMBER",
          currentBelt: profile.currentBelt,
          ...(editSelfieUrl !== null && { selfieUrl: editSelfieUrl }),
          ...(editCertDocUrl !== null && { certDocUrl: editCertDocUrl }),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(prev => prev ? {
          ...prev,
          fullName: editName,
          email: editEmail,
          ...(editSelfieUrl !== null && { selfieUrl: editSelfieUrl }),
          ...(editCertDocUrl !== null && { certDocUrl: editCertDocUrl }),
        } : null);
        setShowEditProfileModal(false);
        alert("Profil berhasil diperbarui!");
      } else {
        alert(data.error || "Gagal memperbarui profil");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memperbarui profil");
    } finally {
      setIsSavingProfile(false);
    }
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadToServer(file, file.name);
    if (url) {
      setUploadedReceipt(url);
    } else {
      alert("Gagal mengunggah bukti pembayaran.");
    }
  };

  const handleDocFileChange = async (docName: string, file: File) => {
    const url = await uploadToServer(file, file.name);
    if (url) {
      setRegistrationUploads(prev => ({
        ...prev,
        [docName]: url
      }));
    } else {
      alert(`Gagal mengunggah dokumen ${docName}`);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || isSubmittingPayment) return;

    setIsSubmittingPayment(true);
    try {
      const payload = checkoutPaymentId 
        ? {
            id: checkoutPaymentId,
            action: "upload-proof",
            paymentProofUrl: uploadedReceipt
          }
        : {
            memberId: profile.id,
            amount: checkoutAmount,
            purpose: checkoutPurpose,
            status: "PENDING",
            paymentProofUrl: uploadedReceipt
          };

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchDashboardData();
        setShowCheckoutModal(false);
        alert("Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.");
      } else {
        alert("Gagal mengunggah pembayaran.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleRegisterUKT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !activeExam || isSubmittingRegistration) return;

    // Verify all dynamic docs are uploaded
    const missingDocs = docRequirements.filter(req => !registrationUploads[req]);
    if (missingDocs.length > 0) {
      alert(`Mohon lengkapi berkas: ${missingDocs.join(", ")}`);
      return;
    }

    setIsSubmittingRegistration(true);
    try {
      const res = await fetch("/api/ukt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: profile.id,
          uktExamId: activeExam.id,
          targetBelt: nextBeltInfo,
          uploadedDocs: registrationUploads
        })
      });

      if (res.ok) {
        alert("Pendaftaran Ujian UKT berhasil dikirim!");
        await fetchDashboardData();
      } else {
        alert("Gagal melakukan pendaftaran UKT.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  // ══════════════ PRINT MEMBER CERTIFICATE ══════════════
  const printMemberCertificate = async () => {
    // Fetch dojang name from settings
    let dojangName = "Taekwondo Academy";
    let dojangShort = "TKD";
    try {
      const sRes = await fetch("/api/settings");
      if (sRes.ok) {
        const s = await sRes.json();
        if (s.dojangName) {
          dojangName = s.dojangName;
          dojangShort = s.dojangName.split(" ").filter((w: string) => w.length > 2).map((w: string) => w[0]).join("").substring(0, 4).toUpperCase();
        }
      }
    } catch (e) { console.error(e); }

    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const memberNum = profile?.memberNumber || "TKD-2026-0000";
    const numPart = memberNum.replace(/[^0-9]/g, "").slice(-4).padStart(4, "0");
    const certNo = `CERT-${dojangShort}-${now.getFullYear()}-${numPart}`;
    const belt = currentBelt.split(" (")[0];
    const qrData = encodeURIComponent(`${window.location.origin}/verify/${certNo}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;
    const lastPassed = dynamicHistory.length > 0 ? dynamicHistory[dynamicHistory.length - 1].date : dateStr;

    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Sertifikat UKT — ${dynamicFullName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,700&family=Inter:wght@400;500;600;700&family=Noto+Serif+KR:wght@600;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 297mm; height: 210mm; background: #f1f5f9; }
    body { font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; padding: 5mm; }
    
    .cert { 
      width: 287mm; 
      height: 200mm; 
      background: #ffffff; 
      border: 8px double #ca8a04; 
      padding: 10mm 15mm; 
      position: relative; 
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }
    
    .cert::before {
      content: '';
      position: absolute;
      inset: 2.5mm;
      border: 1px solid rgba(202, 138, 0, 0.4);
      pointer-events: none;
    }
    
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 80pt;
      font-weight: 900;
      color: rgba(15, 23, 42, 0.025);
      font-family: 'Cinzel', serif;
      z-index: 0;
      letter-spacing: 12px;
      pointer-events: none;
    }

    .korean-decor {
      position: absolute;
      top: 8mm;
      left: 8mm;
      font-family: 'Noto Serif KR', serif;
      font-size: 8.5pt;
      color: #334155;
      line-height: 1.5;
      font-weight: 900;
      writing-mode: vertical-rl;
      text-orientation: upright;
      opacity: 0.85;
      z-index: 1;
      letter-spacing: 2px;
    }

    .geup-indicator {
      position: absolute;
      top: 8mm;
      right: 12mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 1;
    }
    .geup-text {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-family: 'Cinzel', serif;
      font-size: 11pt;
      font-weight: 800;
      letter-spacing: 3px;
      color: #0f172a;
    }
    .geup-number {
      font-family: 'Playfair Display', serif;
      font-size: 36pt;
      font-weight: 900;
      color: #e10600;
      line-height: 1;
      margin-top: 1mm;
    }

    .header-group {
      text-align: center;
      position: relative;
      z-index: 10;
      margin-bottom: 2mm;
    }
    .main-logo {
      width: 15mm;
      height: 15mm;
      margin: 0 auto 1.5mm;
      background: #0f172a;
      border-radius: 50%;
      border: 2px solid #ca8a04;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Cinzel', serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: #fff;
    }
    .org-title {
      font-family: 'Cinzel', serif;
      font-size: 13pt;
      font-weight: 800;
      letter-spacing: 4px;
      color: #0f172a;
      text-transform: uppercase;
      line-height: 1.2;
    }
    .sub-org-title {
      font-size: 6.5pt;
      color: #64748b;
      letter-spacing: 1px;
      margin-top: 0.5mm;
      font-weight: 600;
    }

    .cert-title {
      font-family: 'Playfair Display', serif;
      font-size: 26pt;
      font-weight: 900;
      font-style: italic;
      color: #0f172a;
      text-align: center;
      letter-spacing: 2px;
      margin: 1.5mm 0;
      position: relative;
    }
    .reg-number {
      font-size: 8.5pt;
      color: #334155;
      text-align: center;
      font-family: 'Inter', sans-serif;
      margin-bottom: 4mm;
    }
    .reg-number span {
      border-bottom: 1.5px solid #0f172a;
      padding: 0 4mm 0.5mm;
      font-weight: 700;
    }

    .details-section {
      display: flex;
      gap: 12mm;
      align-items: center;
      margin: 2mm auto;
      max-width: 220mm;
      position: relative;
      z-index: 10;
    }
    
    .photo-container {
      width: 30mm;
      height: 40mm;
      border: 1px solid #cbd5e1;
      position: relative;
      flex-shrink: 0;
      background: #f8fafc;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .info-table {
      flex-grow: 1;
      font-size: 9.5pt;
      color: #0f172a;
      border-collapse: collapse;
    }
    .info-table td {
      padding: 2.2mm 0;
    }
    .info-table .label {
      width: 32mm;
      color: #475569;
      font-weight: 500;
    }
    .info-table .dots {
      width: 4mm;
      text-align: center;
      font-weight: bold;
      color: #334155;
    }
    .info-table .value {
      font-weight: 700;
      color: #0f172a;
      letter-spacing: 0.5px;
    }

    .verdict-paragraph {
      text-align: center;
      font-size: 8.5pt;
      color: #334155;
      line-height: 1.6;
      margin: 3mm auto;
      max-width: 220mm;
      position: relative;
      z-index: 10;
    }
    .verdict-paragraph strong {
      color: #0f172a;
      font-weight: 800;
    }

    .footer-signatures {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 10mm;
      margin-top: 1mm;
      position: relative;
      z-index: 10;
    }
    .sig-block {
      text-align: center;
      min-width: 55mm;
      position: relative;
    }
    .sig-label {
      font-size: 7.5pt;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12mm;
    }
    .sig-underline {
      width: 50mm;
      height: 1px;
      background: #0f172a;
      margin: 1.5mm auto;
    }
    .sig-name {
      font-size: 8.5pt;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
    }
    .sig-title {
      font-size: 7pt;
      font-weight: 600;
      color: #64748b;
      margin-top: 0.5mm;
    }
    
    .qr-verify-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5mm;
    }
    .qr-stamp-box {
      border: 1px solid #e2e8f0;
      padding: 1.2mm;
      border-radius: 1.5mm;
      background: #fff;
    }

    @media print { 
      @page { size: A4 landscape; margin: 0; } 
      html, body { width: 297mm; height: 210mm; background: #fff; } 
      .cert { width: 297mm; height: 210mm; border-radius: 0; box-shadow: none; border-color: #ca8a04; }
    }
  </style>
</head>
<body>
  <div class="cert">
    <div class="watermark">TAEKWONDO</div>
    
    <div class="korean-decor">국기원 태권도</div>

    <div class="geup-indicator">
      <span class="geup-text">GEUP</span>
      <span class="geup-number">${currentBelt.includes("Geup") ? currentBelt.match(/\\d+/)?.[0] || "10" : "1"}</span>
    </div>

    <div class="header-group">
      <div class="main-logo">WTT</div>
      <h2 class="org-title">PENGURUS BESAR TAEKWONDO INDONESIA</h2>
      <p class="sub-org-title">Dojang Pusat ${dojangName} &middot; Afiliasi Resmi Pengprov Taekwondo Indonesia</p>
    </div>

    <div>
      <h1 class="cert-title">Sertifikat</h1>
      <div class="reg-number">No Reg. <span>${numPart}${now.getFullYear()}${Math.floor(1000 + Math.random() * 9000)}</span></div>
    </div>

    <div class="details-section">
      <div class="photo-container">
        ${profile?.selfieUrl ? `<img src="${profile.selfieUrl}" alt="Foto Anggota" class="photo-img" />` : `<div style="width:100%;height:100%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:7pt;font-weight:bold;text-align:center;padding:2mm">FOTO 3X4</div>`}
      </div>
      
      <table class="info-table">
        <tr>
          <td class="label">Nama</td>
          <td class="dots">:</td>
          <td class="value">${dynamicFullName.toUpperCase()}</td>
        </tr>
        <tr>
          <td class="label">Tingkat Sabuk</td>
          <td class="dots">:</td>
          <td class="value">${currentBelt}</td>
        </tr>
        <tr>
          <td class="label">PENGPROV</td>
          <td class="dots">:</td>
          <td class="value">Jawa Timur</td>
        </tr>
        <tr>
          <td class="label">Dojang Asal</td>
          <td class="dots">:</td>
          <td class="value">${dojangName}</td>
        </tr>
      </table>
    </div>

    <p class="verdict-paragraph">
      Telah dinyatakan lulus <strong>UJIAN KENAIKAN TINGKAT</strong> yang diselenggarakan oleh 
      <strong>Pengurus Besar Taekwondo Indonesia (P.B.T.I.)</strong> pada tanggal <strong>${lastPassed}</strong> di <strong>Dojang Pusat ${dojangName}</strong>.
    </p>

    <div class="footer-signatures">
      <div class="sig-block">
        <div class="sig-label">PENGUJI</div>
        <div class="sig-name">Master Ahmad</div>
        <div class="sig-underline"></div>
        <div class="sig-title">DAN 6 / Kukkiwon</div>
      </div>

      <div class="qr-verify-group">
        <div class="qr-stamp-box">
          <img src="${qrUrl}" width="52" height="52" alt="QR Verify" />
        </div>
        <span style="font-size:5pt;color:#64748b;font-weight:700;letter-spacing:0.5px">PINDAI UNTUK VERIFIKASI</span>
      </div>

      <div class="sig-block">
        <div class="sig-label">PENGPROV TI Jawa Timur</div>
        <div class="sig-name">YUSMAN MADAYUN, S.I.P.</div>
        <div class="sig-underline"></div>
        <div class="sig-title">KETUA</div>
      </div>
    </div>
  </div>
  <script>window.onload=function(){setTimeout(function(){window.print();},600);};<\/script>
</body>
</html>`;
    const pw = window.open("", "_blank", "width=1120,height=800");
    if (pw) { pw.document.write(htmlContent); pw.document.close(); }
    else alert("Pop-up diblokir browser. Izinkan pop-up untuk mencetak sertifikat.");
  };

  // Realistic Woven Belt Visual
  const render3DBelt = (beltName: string) => {

    const lower = beltName.toLowerCase();
    
    let startColor = "#3b82f6"; // default blue
    let endColor = "#1d4ed8";
    let stripeHex = "";
    let isWhite = false;
    
    if (lower.includes("putih")) {
      startColor = "#f8fafc";
      endColor = "#e2e8f0";
      isWhite = true;
    } else if (lower.includes("kuning")) {
      startColor = "#fbbf24";
      endColor = "#ca8a04";
      if (lower.includes("hijau") || lower.includes("strip")) stripeHex = "#16a34a";
    } else if (lower.includes("hijau")) {
      startColor = "#22c55e";
      endColor = "#15803d";
      if (lower.includes("biru") || lower.includes("strip")) stripeHex = "#2563eb";
    } else if (lower.includes("biru")) {
      startColor = "#3b82f6";
      endColor = "#1d4ed8";
      if (lower.includes("merah") || lower.includes("strip")) stripeHex = "#dc2626";
    } else if (lower.includes("merah")) {
      startColor = "#ef4444";
      endColor = "#b91c1c";
      if (lower.includes("hitam") || lower.includes("strip")) stripeHex = "#18181b";
    } else if (lower.includes("hitam")) {
      startColor = "#27272a";
      endColor = "#09090b";
      stripeHex = "#d97706"; // Gold strip
    }

    const fabricTexture = "repeating-linear-gradient(0deg, rgba(0,0,0,0.06), rgba(0,0,0,0.06) 1px, transparent 1px, transparent 4px)";
    const verticalGrad = `linear-gradient(to bottom, ${startColor}, ${endColor})`;
    const horizontalGrad = `linear-gradient(to right, ${startColor}, ${endColor})`;
    
    const innerShadow = isWhite 
      ? "inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 3px rgba(0,0,0,0.08)"
      : "inset 0 1.5px 3px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.3)";

    return (
      <div className="relative w-56 h-48 flex items-center justify-center bg-slate-50/50 rounded-full border border-slate-100 shadow-inner group hover:scale-[1.03] transition-all duration-500 shrink-0 overflow-hidden">
        <div className="absolute inset-2 rounded-full bg-white border border-slate-50 shadow-md"></div>
        <div className="relative w-48 h-36 flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)] transform group-hover:rotate-1 transition-all duration-300">
          
          {/* Left Horizontal Wrap */}
          <div 
            className="absolute left-0 w-24 h-4.5 rounded-l shadow-md z-1 overflow-hidden"
            style={{ backgroundImage: `${fabricTexture}, ${verticalGrad}` }}
          >
            <div className="absolute inset-0" style={{ boxShadow: innerShadow }}></div>
            {stripeHex && (
              <div 
                className="absolute inset-y-0 w-full" 
                style={{ backgroundColor: stripeHex, height: "4px", top: "7px" }}
              ></div>
            )}
          </div>
          
          {/* Right Horizontal Wrap */}
          <div 
            className="absolute right-0 w-24 h-4.5 rounded-r shadow-md z-1 overflow-hidden"
            style={{ backgroundImage: `${fabricTexture}, ${verticalGrad}` }}
          >
            <div className="absolute inset-0" style={{ boxShadow: innerShadow }}></div>
            {stripeHex && (
              <div 
                className="absolute inset-y-0 w-full" 
                style={{ backgroundColor: stripeHex, height: "4px", top: "7px" }}
              ></div>
            )}
          </div>

          {/* Left Hanging Tail */}
          <div 
            className="absolute w-16 h-4.5 rounded-[2px] transform -rotate-[30deg] -translate-x-5 translate-y-4 z-3 shadow-lg overflow-hidden"
            style={{ backgroundImage: `${fabricTexture}, ${verticalGrad}` }}
          >
            <div className="absolute inset-0" style={{ boxShadow: innerShadow }}></div>
            {stripeHex && (
              <div 
                className="absolute inset-y-0 w-full" 
                style={{ backgroundColor: stripeHex, height: "4px", top: "7px" }}
              ></div>
            )}
          </div>

          {/* Right Hanging Tail */}
          <div 
            className="absolute w-16 h-4.5 rounded-[2px] transform rotate-[30deg] translate-x-5 translate-y-4 z-3 shadow-lg overflow-hidden"
            style={{ backgroundImage: `${fabricTexture}, ${verticalGrad}` }}
          >
            <div className="absolute inset-0" style={{ boxShadow: innerShadow }}></div>
            {stripeHex && (
              <div 
                className="absolute inset-y-0 w-full" 
                style={{ backgroundColor: stripeHex, height: "4px", top: "7px" }}
              ></div>
            )}
          </div>

          {/* Central Knot Wrap */}
          <div 
            className="absolute w-7 h-9 rounded-[3px] z-10 shadow-2xl border-x border-black/10 overflow-hidden"
            style={{ backgroundImage: `${fabricTexture}, ${horizontalGrad}` }}
          >
            <div className="absolute inset-0 rounded-[3px]" style={{ boxShadow: innerShadow }}></div>
            {stripeHex && (
              <div 
                className="absolute inset-y-0 w-full" 
                style={{ backgroundColor: stripeHex, height: "4px", top: "14px" }}
              ></div>
            )}
            <div className="absolute inset-y-0 left-0 w-0.5 bg-black/20"></div>
            <div className="absolute inset-y-0 right-0 w-0.5 bg-black/20"></div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black/30"></div>
          </div>
        </div>
      </div>
    );
  };

  const dynamicFullName = profile?.fullName || "Beni Setiawan";
  const dynamicMemberNumber = profile?.memberNumber || "ETA-2026-0089";
  const dynamicProgress = profile?.progress || 85;

  // Calculate payment statuses
  const isSppPaidThisMonth = payments.some(
    p => p.purpose === "SPP Juni 2026" && p.status === "COMPLETED"
  );
  const isSppPendingThisMonth = payments.some(
    p => p.purpose === "SPP Juni 2026" && p.status === "PENDING"
  );

  const isMeetingFeePending = payments.some(
    p => p.purpose.includes("Iuran Pertemuan") && p.status === "PENDING"
  );
  const isMeetingFeePaid = payments.some(
    p => p.purpose.includes("Iuran Pertemuan") && p.status === "COMPLETED"
  );

  const uktStatus = payments.find(p => p.purpose.includes("Pendaftaran UKT"))?.status || "NOT_STARTED";

  const pendingTournamentPayments = payments.filter(
    p => (p.purpose.toLowerCase().includes("lomba") || p.purpose.toLowerCase().includes("kejuaraan")) && p.status === "PENDING"
  );

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSavingAchievement(true);
    try {
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: profile.id,
          title: achTitle,
          eventName: achEventName,
          date: achDate,
          rank: achRank,
          photoUrl: null, // You can upload medal/photo if needed, but we'll focus on certificate
          certificateUrl: achCertificateUrl,
          status: "PENDING"
        })
      });

      if (res.ok) {
        fetchDashboardData();
        setShowAchievementModal(false);
        // Reset forms
        setAchTitle("");
        setAchEventName("");
        setAchDate("");
        setAchRank("Emas");
        setAchCertificateUrl(null);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan prestasi");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingAchievement(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#E10600] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold text-xs">Memuat Dashboard Member...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-[#0F172A]/5 p-6 flex flex-col justify-between shrink-0">
          <div className="flex flex-col gap-8">
            {/* User Profile Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#E10600] flex-shrink-0">
                {profile?.selfieUrl ? (
                  <img
                    src={profile.selfieUrl}
                    alt={dynamicFullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-red-50 text-[#E10600] font-black text-lg flex items-center justify-center">
                    {dynamicFullName.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#0F172A] leading-none">{dynamicFullName}</h3>
                <span className="text-[10px] text-gray-400 font-bold block mt-1 uppercase tracking-wider">{dynamicMemberNumber}</span>
              </div>
            </div>

            {/* Nav Menu */}
            <div className="flex flex-col gap-1.5">
              {[
                { id: "dashboard", label: "Overview & Dashboard", icon: <TrendingUp className="w-4 h-4" /> },
                { id: "history", label: "Belt Progress & Kurikulum", icon: <Award className="w-4 h-4" /> },
                { id: "payments", label: "Administrasi Keuangan", icon: <CreditCard className="w-4 h-4" /> },
                { id: "ukt_report", label: "Rapor & Ujian UKT", icon: <Calendar className="w-4 h-4" /> },
                { id: "certificates", label: "Sertifikat Digital", icon: <FileText className="w-4 h-4" /> },
                { id: "achievements", label: "Prestasi Saya", icon: <Star className="w-4 h-4" /> },
                { id: "schedule", label: "Jadwal Latihan", icon: <Clock className="w-4 h-4" /> },
                { id: "members", label: "Teman Se-Dojang", icon: <Users className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-bold text-xs text-left transition-all ${
                    activeTab === tab.id 
                      ? "bg-[#E10600] text-white shadow-md shadow-[#E10600]/15" 
                      : "text-gray-500 hover:bg-[#0F172A]/5 hover:text-[#0F172A]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer of Sidebar */}
          <div className="flex flex-col gap-1 pt-6 border-t border-slate-100 mt-6">
            <button 
              onClick={() => setActiveTab("payments")}
              className="w-full bg-[#E10600] hover:bg-[#C00500] text-white py-3.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 text-center mb-4 cursor-pointer"
            >
              Bayar Administrasi
            </button>
            <button 
              onClick={() => {
                if (profile) {
                  setEditName(profile.fullName);
                  setEditEmail(profile.email || "");
                  setEditSelfieUrl(profile.selfieUrl ?? null);
                  setEditCertDocUrl(profile.certDocUrl ?? null);
                  setShowEditProfileModal(true);
                }
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:text-[#0F172A] font-bold text-xs text-left cursor-pointer transition-all hover:bg-slate-50 rounded-xl"
             >
               <Settings className="w-4 h-4" /> Edit Profil
             </button>
            <button className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:text-[#0F172A] font-bold text-xs text-left">
              <HelpCircle className="w-4 h-4" /> Support
            </button>
            <button onClick={onBack} className="flex items-center gap-3 px-4 py-2.5 text-[#E10600] hover:bg-red-50 font-bold text-xs text-left rounded-xl transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow p-8 sm:p-12 max-w-5xl mx-auto w-full">
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-8">
              {/* Belt card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-8 bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6 min-h-[220px]">
                  <div className="flex-grow max-w-md">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-full block w-max mb-3 tracking-wider">Current Rank</span>
                    <h2 className="text-4xl font-black text-[#0F172A] mb-3 font-display">{currentBelt.split(" (")[0]}</h2>
                    
                    <div className="my-4 flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-bold uppercase shrink-0">Sabuk Aktif:</span>
                      <span className="bg-slate-100 text-[#0F172A] border border-[#0F172A]/5 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider">
                        {currentBelt}
                      </span>
                    </div>

                    <p className="text-gray-400 text-xs leading-relaxed">
                      Latih jurus Poomsae dan latih kekuatan fisik Anda secara konsisten untuk mempersiapkan diri pada ujian UKT berikutnya.
                    </p>
                    <button onClick={() => setActiveTab("ukt_report")} className="mt-6 bg-[#E10600] hover:bg-[#C00500] text-white px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer">
                      Lihat Rapor UKT <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Dynamic 3D Belt Visual */}
                  {render3DBelt(currentBelt)}
                </div>

                {/* Next rank card - Dynamically Connected */}
                <div className="md:col-span-4 bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm flex flex-col justify-between min-h-[300px]">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-extrabold text-sm text-[#0F172A]">Next Rank</h3>
                      <TrendingUp className="w-4 h-4 text-[#E10600]" />
                    </div>
                    <span className="text-[#E10600] font-black text-3xl block font-display">
                      {nextBeltInfo.split(" (")[0]}
                    </span>
                    <span className="text-gray-400 text-xs font-semibold block mt-1">
                      {nextBeltInfo.includes("Geup") ? nextBeltInfo.split(" (")[1].replace(")", "") : "1 Dan"}
                    </span>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                      <span className="text-gray-400">Curriculum Completion</span>
                      <span className="text-[#E10600]">{dynamicProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#E10600] to-[#FFD700] h-full rounded-full transition-all" style={{ width: `${dynamicProgress}%` }}></div>
                    </div>
                    <p className="text-gray-400 text-[10px] mt-3 leading-relaxed">
                      Selesaikan materi latihan sabuk saat ini agar mendapatkan rekomendasi kelayakan UKT dari Pelatih.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Billing Summary on Dashboard Overview */}
              <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-black text-lg text-[#0F172A] font-display">Tagihan &amp; Pembayaran Aktif</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Ringkasan administrasi keuangan wajib Anda bulan ini.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("payments")}
                    className="text-[#E10600] font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Selengkapnya <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {pendingTournamentPayments.length > 0 && (
                  <div className="mb-6 flex flex-col gap-4">
                    {pendingTournamentPayments.map((p) => (
                      <div key={p.id} className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-100/70 text-indigo-600 rounded-xl">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider block">Tagihan Perlombaan / Kejuaraan</span>
                            <span className="font-extrabold text-sm text-[#0F172A] block">{p.purpose}</span>
                            <span className="text-[10px] text-gray-400">Harap segera menyelesaikan registrasi perlombaan Anda.</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                          <span className="font-black text-[#0F172A] text-sm">Rp {p.amount.toLocaleString("id-ID")}</span>
                          <button 
                            onClick={() => openCheckout(p.purpose, p.amount)}
                            className="bg-[#E10600] hover:bg-[#C00500] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                          >
                            Bayar Sekarang
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* SPP Item */}
                  <div className="bg-[#F8FAFC] border border-[#0F172A]/5 rounded-2xl p-5 flex flex-col justify-between min-h-[140px]">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">SPP Bulanan</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          isSppPaidThisMonth ? "bg-green-50 text-green-600" : isSppPendingThisMonth ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                        }`}>
                          {isSppPaidThisMonth ? "Lunas" : isSppPendingThisMonth ? "Pending" : "Belum Bayar"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-[#0F172A]">SPP Juni 2026</h4>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                      <span className="font-black text-[#0F172A] text-sm">Rp {sppFeeRate.toLocaleString("id-ID")}</span>
                      {!isSppPaidThisMonth && !isSppPendingThisMonth && (
                        <button 
                          onClick={() => openCheckout("SPP Juni 2026", sppFeeRate)}
                          className="bg-[#E10600] hover:bg-[#C00500] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer"
                        >
                          Bayar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Iuran Pertemuan Item */}
                  <div className="bg-[#F8FAFC] border border-[#0F172A]/5 rounded-2xl p-5 flex flex-col justify-between min-h-[140px]">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Iuran Pertemuan</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          isMeetingFeePaid ? "bg-green-50 text-green-600" : isMeetingFeePending ? "bg-amber-50 text-amber-600" : meetingFeeAmount > 0 ? "bg-red-50 text-red-600" : "bg-slate-100 text-gray-400"
                        }`}>
                          {isMeetingFeePaid ? "Lunas" : isMeetingFeePending ? "Pending" : meetingFeeAmount > 0 ? "Belum Bayar" : "Lunas"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-[#0F172A]">Iuran 2 Sesi Latihan</h4>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                      <span className="font-black text-[#0F172A] text-sm">
                        {isMeetingFeePaid ? "Rp 0" : `Rp ${meetingFeeAmount.toLocaleString("id-ID")}`}
                      </span>
                      {!isMeetingFeePaid && !isMeetingFeePending && meetingFeeAmount > 0 && (
                        <button 
                          onClick={() => openCheckout(`Iuran Pertemuan (2 Sesi)`, meetingFeeAmount)}
                          className="bg-[#E10600] hover:bg-[#C00500] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer"
                        >
                          Bayar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* UKT Item */}
                  <div className="bg-[#F8FAFC] border border-[#0F172A]/5 rounded-2xl p-5 flex flex-col justify-between min-h-[140px]">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ujian UKT</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          uktStatus === "COMPLETED" ? "bg-green-50 text-green-600" : uktStatus === "PENDING" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                        }`}>
                          {uktStatus === "COMPLETED" ? "Lunas" : uktStatus === "PENDING" ? "Pending" : "Belum Bayar"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-[#0F172A]">Pendaftaran UKT</h4>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                      <span className="font-black text-[#0F172A] text-sm">Rp {uktFeeRate.toLocaleString("id-ID")}</span>
                      {uktStatus !== "COMPLETED" && uktStatus !== "PENDING" && (
                        <button 
                          onClick={() => openCheckout(`Pendaftaran UKT (${nextBeltInfo.split(" (")[0]})`, uktFeeRate)}
                          className="bg-[#E10600] hover:bg-[#C00500] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer"
                        >
                          Bayar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Belt Progression History */}
              <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm">
                <h3 className="font-black text-lg text-[#0F172A] mb-8 font-display">Belt Progression History</h3>
                
                {dynamicHistory.length === 0 ? (
                  <p className="text-gray-400 text-xs text-center py-6">
                    Selamat datang di Taekwondo Academy! Mulai ikuti latihan perdana Anda hari ini.
                  </p>
                ) : (
                  <div className="relative border-l border-slate-100 pl-8 flex flex-col gap-8 ml-4">
                    {dynamicHistory.map((item, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[41px] top-1 w-5 h-5 bg-[#E10600] rounded-full border-4 border-white shadow-sm"></span>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-[#0F172A]">{item.to}</h4>
                            <p className="text-gray-400 text-xs mt-0.5">Lulus Ujian Kenaikan Tingkat (UKT)</p>
                          </div>
                          <span className="px-3 py-1 bg-slate-100 text-gray-500 rounded-full text-[10px] font-bold">{item.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A] font-display">Kurikulum Latihan</h2>
                <p className="text-gray-400 text-xs mt-1">Daftar jurus, teknik tendangan, dan tangkisan yang harus Anda kuasai pada tingkatan sabuk aktif.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Curriculum Card */}
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <Award className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0F172A]">Materi {currentBelt.split(" (")[0]}</h3>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">{currentBeltConfig.level} Syllabus</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {currentBeltConfig.syllabus.map((syl: any, idx: number) => {
                      const isExpanded = expandedSyl === idx;
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setExpandedSyl(isExpanded ? null : idx)}
                          className="flex flex-col gap-3 bg-slate-50 hover:bg-slate-100/50 rounded-xl p-4 border border-slate-100 cursor-pointer transition-all duration-300"
                        >
                          <div className="flex gap-3 items-start">
                            <span className="w-6 h-6 rounded-full bg-[#E10600] text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="flex-grow">
                              <span className="font-bold text-xs text-[#0F172A] block">{syl.title}</span>
                              <span className="text-[9px] text-[#E10600] font-black uppercase tracking-wider mt-0.5 block">{syl.type}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-extrabold select-none">
                              {isExpanded ? "▲ Tutup" : "▼ Pelajari"}
                            </span>
                          </div>

                          {isExpanded && (
                            <div className="mt-2 pt-3 border-t border-slate-200/50 flex flex-col gap-3 text-xs text-gray-600">
                              <div>
                                <span className="font-extrabold text-[10px] text-[#0F172A] uppercase block mb-1">Filosofi &amp; Teori:</span>
                                <p className="text-[11px] leading-relaxed italic text-gray-500">"{syl.philosophy}"</p>
                              </div>
                              <div>
                                <span className="font-extrabold text-[10px] text-[#0F172A] uppercase block mb-1">Panduan Langkah Latihan:</span>
                                <ol className="list-decimal pl-4 text-[11px] leading-relaxed flex flex-col gap-1">
                                  {syl.steps.map((step: string, sIdx: number) => (
                                    <li key={sIdx}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                              <div className="bg-amber-50 border border-amber-200/40 p-3 rounded-lg">
                                <span className="font-extrabold text-[10px] text-amber-800 uppercase block mb-0.5">Wejangan Grandmaster (Dan 9):</span>
                                <p className="text-[11px] leading-relaxed text-amber-700 font-medium">{syl.tips}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress Tracking Timeline */}
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm">
                  <h3 className="font-extrabold text-sm text-[#0F172A] mb-6">Linimasa Kelulusan Sabuk</h3>
                  
                  {dynamicHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs">Belum ada riwayat kelulusan sabuk sebelumnya.</div>
                  ) : (
                    <div className="relative border-l border-slate-100 pl-6 flex flex-col gap-6 ml-2">
                      {dynamicHistory.map((hist, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[31px] top-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-sm"></span>
                          <span className="font-bold text-xs text-[#0F172A] block">{hist.to}</span>
                          <span className="text-[10px] text-gray-400 mt-0.5 block">Lulus pada {hist.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (() => {
            const unpaidBills = payments.filter(p => p.status === "PENDING" || p.status === "OVERDUE");
            const totalUnpaidAmount = unpaidBills.reduce((acc, curr) => acc + curr.amount, 0);
            const completedBills = payments.filter(p => p.status === "COMPLETED");
            const totalPaidAmount = completedBills.reduce((acc, curr) => acc + curr.amount, 0);

            return (
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A] font-display">Administrasi Keuangan</h2>
                  <p className="text-gray-400 text-xs mt-1">Pantau kewajiban iuran bulanan SPP, iuran latihan, dan riwayat transaksi secara real-time.</p>
                </div>

                {/* Financial Summary Counters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-red-100 rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Total Tunggakan Aktif</span>
                      <span className="text-3xl font-black text-[#E10600] block mt-2 font-display">
                        Rp {totalUnpaidAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-3 font-bold uppercase tracking-wider">
                      🚨 {unpaidBills.length} Tagihan Belum Lunas
                    </span>
                  </div>

                  <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">Total Pembayaran Lunas</span>
                      <span className="text-3xl font-black text-green-600 block mt-2 font-display">
                        Rp {totalPaidAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-3 font-bold uppercase tracking-wider">
                      ✅ {completedBills.length} Transaksi Sukses
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-[#0F172A] to-slate-800 text-white rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-gray-400/80 text-[10px] font-bold uppercase tracking-wider block">Metode Pembayaran</span>
                      <span className="text-base font-black block mt-2">QRIS &amp; Transfer Mandiri</span>
                    </div>
                    <span className="text-[10px] text-gray-300 block mt-3 font-bold uppercase tracking-wider">
                      Instant Verification via Dashboard
                    </span>
                  </div>
                </div>

                {/* Grid for Active Bills and Payment Instructions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Active Bills Column */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    <h3 className="font-black text-base text-[#0F172A] font-display">Daftar Tagihan Aktif</h3>
                    
                    {unpaidBills.length === 0 ? (
                      <div className="bg-green-50/50 border border-green-100/50 rounded-2xl p-8 text-center flex flex-col items-center gap-2">
                        <span className="text-lg">🎉</span>
                        <h4 className="font-bold text-green-800 text-sm">Semua Tagihan Lunas!</h4>
                        <p className="text-green-600 text-xs">Hebat! Anda tidak memiliki tunggakan iuran atau SPP saat ini.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {unpaidBills.map((p) => {
                          const isOverdue = p.status === "OVERDUE";
                          return (
                            <div 
                              key={p.id}
                              className={`bg-white border rounded-2xl p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all hover:shadow-sm ${
                                isOverdue ? "border-red-200" : "border-[#0F172A]/5"
                              }`}
                            >
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                    p.purpose.includes("SPP")
                                      ? "bg-blue-50 text-blue-600"
                                      : p.purpose.includes("Pertemuan")
                                      ? "bg-purple-50 text-purple-600"
                                      : "bg-green-50 text-green-600"
                                  }`}>
                                    {p.purpose.includes("SPP") ? "SPP Bulanan" : p.purpose.includes("Pertemuan") ? "Iuran Pertemuan" : "Iuran Kegiatan"}
                                  </span>
                                  {isOverdue && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[8px] font-black uppercase tracking-wider animate-pulse">
                                      TELAT BAYAR (OVERDUE)
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-extrabold text-sm text-[#0F172A]">{p.purpose}</h4>
                                {p.dueDate && (
                                  <span className="text-[10px] text-gray-400 font-bold">
                                    📅 Batas Jatuh Tempo: {new Date(p.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                                <div className="text-left sm:text-right">
                                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Nominal Tagihan</span>
                                  <span className="font-black text-base text-[#0F172A] block mt-0.5">
                                    Rp {p.amount.toLocaleString("id-ID")}
                                  </span>
                                </div>
                                <button
                                  onClick={() => openCheckout(p.purpose, p.amount, p.id)}
                                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer ${
                                    isOverdue 
                                      ? "bg-[#E10600] hover:bg-[#C00500] text-white" 
                                      : "bg-[#0F172A] hover:bg-black text-white"
                                  }`}
                                >
                                  Bayar Sekarang
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Payment Instructions Column */}
                  <div className="lg:col-span-4 bg-white border border-[#0F172A]/5 rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
                    <div>
                      <h3 className="font-black text-sm text-[#0F172A] font-display">Instruksi Pembayaran</h3>
                      <p className="text-gray-400 text-[10px] mt-1">Selesaikan pembayaran Anda menggunakan salah satu metode di bawah ini:</p>
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Bank Mandiri Option */}
                      <div className="border border-slate-100 rounded-xl p-4">
                        <span className="block font-bold text-[10px] text-gray-400 uppercase tracking-wide">Bank Transfer</span>
                        <span className="block font-extrabold text-sm text-[#0F172A] mt-1">Bank Mandiri (Dojang Pusat)</span>
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-[#0F172A]/5 mt-2 font-mono text-xs font-bold text-[#0F172A]">
                          <span>124-00-112233-44</span>
                        </div>
                        <span className="block text-[9px] text-gray-400 mt-1">a.n. WHITE TIGER TAEKWONDO</span>
                      </div>

                      {/* QRIS Option */}
                      <div className="border border-slate-100 rounded-xl p-4 flex flex-col items-center">
                        <span className="block font-bold text-[10px] text-gray-400 uppercase tracking-wide self-start mb-2">QRIS Kode Instan</span>
                        <div className="w-36 h-36 bg-white border border-slate-100 rounded-xl overflow-hidden p-2 flex items-center justify-center">
                          <img 
                            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=qris-elite-taekwondo-academy" 
                            alt="QRIS Code" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[9px] text-gray-400 mt-2 text-center">Scan QRIS di atas dengan m-Banking atau e-Wallet pilihan Anda.</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Transaction Ledger Table */}
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm">
                  <h3 className="font-black text-base text-[#0F172A] mb-6 font-display">Riwayat Pembayaran Lunas</h3>

                  <div className="overflow-hidden border border-slate-100 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-gray-500 font-bold uppercase border-b border-slate-100">
                          <th className="p-4">Tanggal</th>
                          <th className="p-4">Tujuan Pembayaran</th>
                          <th className="p-4">Jumlah (Rp)</th>
                          <th className="p-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedBills.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-400">Belum ada riwayat transaksi pembayaran lunas.</td>
                          </tr>
                        ) : (
                          completedBills.map((p, idx) => (
                            <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                              <td className="p-4 text-gray-400 font-medium">
                                {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-wider ${
                                  p.purpose.includes("SPP") 
                                    ? "bg-blue-50 text-blue-600" 
                                    : p.purpose.includes("UKT") 
                                    ? "bg-green-50 text-green-600" 
                                    : p.purpose.toLowerCase().includes("lomba") || p.purpose.toLowerCase().includes("kejuaraan")
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "bg-purple-50 text-purple-600"
                                }`}>
                                  {p.purpose}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-[#0F172A]">Rp {p.amount.toLocaleString("id-ID")}</td>
                              <td className="p-4 text-right">
                                <span className="px-2.5 py-1 rounded-full font-bold text-[9px] bg-green-50 text-green-600">
                                  LUNAS
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === "ukt_report" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A] font-display">Ujian Kenaikan Tingkat (UKT)</h2>
                <p className="text-gray-400 text-xs mt-1">Daftar ujian kenaikan tingkat aktif serta rapor hasil penilaian evaluasi latihan Anda.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* UKT Registration Info */}
                <div className="md:col-span-2 bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm flex flex-col justify-between gap-6">
                  {activeExam ? (
                    <div>
                      {memberRegistration ? (
                        <div>
                          <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider block w-max mb-3 ${
                            memberRegistration.status === "APPROVED" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                          }`}>
                            {memberRegistration.status === "APPROVED" ? "Berkas Disetujui (Layak Ujian)" : "Menunggu Verifikasi Berkas"}
                          </span>
                          <h3 className="font-black text-lg text-[#0F172A] mb-2 leading-tight">{activeExam.title}</h3>
                          <p className="text-gray-400 text-xs leading-relaxed mb-4">
                            Dokumen pendaftaran Anda telah berhasil diunggah. Tim admin sedang meninjau kelayakan berkas Anda.
                          </p>

                          <div className="border-t border-slate-100 pt-4 flex flex-col gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Jadwal Ujian:</span>
                              <span className="font-bold text-[#0F172A]">{new Date(activeExam.date).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Lokasi:</span>
                              <span className="font-bold text-[#0F172A]">{activeExam.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Target Sabuk:</span>
                              <span className="font-bold text-[#E10600]">{memberRegistration.targetBelt}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleRegisterUKT} className="flex flex-col gap-6">
                          <div>
                            <span className="bg-red-50 text-[#E10600] text-[9px] font-black uppercase px-2.5 py-1 rounded block w-max mb-3 tracking-wider">Ujian Terbuka</span>
                            <h3 className="font-black text-lg text-[#0F172A] mb-2 leading-tight">{activeExam.title}</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">
                              Unggah dokumen pendaftaran yang diwajibkan oleh pelatih di bawah ini untuk mendaftar ke tingkat <strong className="text-[#0F172A]">{nextBeltInfo}</strong>.
                            </p>
                          </div>

                          <div className="border-t border-slate-100 pt-4 flex flex-col gap-4">
                            <span className="text-xs font-bold text-[#0F172A] uppercase">Unggah Syarat Berkas Ujian</span>
                            
                            {docRequirements.map((docName) => {
                              const isUploaded = !!registrationUploads[docName];
                              
                              return (
                                <div key={docName} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs">
                                  <div>
                                    <span className="font-extrabold text-[#0F172A] block">{docName}</span>
                                    <span className="text-[10px] text-gray-400">Harap pilih file resi / berkas valid</span>
                                  </div>
                                  <div>
                                    <label className={`px-4 py-2 rounded-xl text-[10px] font-black cursor-pointer transition-all inline-flex items-center gap-1.5 ${
                                      isUploaded ? "bg-green-50 text-green-600 border border-green-200" : "bg-white border border-slate-200 text-gray-600 hover:bg-slate-50"
                                    }`}>
                                      {isUploaded ? <Check className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                                      {isUploaded ? "Terunggah" : "Pilih File"}
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleDocFileChange(docName, file);
                                        }} 
                                      />
                                    </label>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <button 
                            type="submit" 
                            disabled={isSubmittingRegistration}
                            className="w-full bg-[#E10600] text-white py-4 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isSubmittingRegistration ? "Mengirim..." : `Daftar UKT Sekarang (Biaya Rp ${uktFeeRate.toLocaleString("id-ID")})`}
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 text-xs">
                      Belum ada jadwal UKT aktif terdekat yang dibuka oleh pelatih.
                    </div>
                  )}
                </div>

                {/* Score Report Card */}
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F172A] mb-4">Rapor Hasil Ujian Terakhir</h3>
                    
                    <div className="flex flex-col gap-3">
                      {[
                        { label: "Poomsae (Jurus)", score: 82.5 },
                        { label: "Kyorugi (Sparring)", score: 88.0 },
                        { label: "Teknik Fisik", score: 85.0 },
                        { label: "Teori & Sikap", score: 80.0 },
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">{item.label}</span>
                          <span className="font-extrabold text-[#0F172A]">{item.score} / 100</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Nilai Rata-rata</span>
                      <span className="text-2xl font-black text-[#E10600]">85.1</span>
                    </div>
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">LULUS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "certificates" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A] font-display">Sertifikat Digital</h2>
                <p className="text-gray-400 text-xs mt-1">Unduh dan verifikasi sertifikat kenaikan sabuk resmi Anda yang terdaftar pada sistem.</p>
              </div>

              {dynamicHistory.length === 0 ? (
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-12 text-center text-gray-400 text-xs">
                  Belum ada sertifikat kelulusan yang diterbitkan (Sertifikat diterbitkan secara otomatis setelah lulus ujian UKT).
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Visual Certificate Frame */}
                  <div className="bg-[#1e293b] text-white rounded-[24px] p-8 shadow-xl border border-slate-700/50 flex flex-col justify-between min-h-[340px] relative overflow-hidden">
                    {/* Background design accents */}
                    <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-slate-700/20 blur-xl"></div>
                    <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-red-500/10 blur-xl"></div>

                    <div className="flex justify-between items-start z-10">
                      <div>
                        <span className="text-[8px] font-black tracking-widest text-[#E10600] uppercase block">OFFICIAL DIGITAL CERTIFICATE</span>
                        <h4 className="font-extrabold text-sm tracking-tight mt-1">WHITE TIGER TAEKWONDO</h4>
                      </div>
                      <FileBadge className="w-8 h-8 text-amber-400" />
                    </div>

                    <div className="my-8 text-center z-10">
                      <span className="text-[10px] text-slate-400 block italic">Diberikan Kepada:</span>
                      <h3 className="text-xl font-black tracking-tight mt-2 text-white">{dynamicFullName}</h3>
                      <p className="text-[10px] text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                        Atas kelulusan Ujian Kenaikan Tingkat (UKT) menuju tingkatan <strong className="text-white font-bold">{currentBelt.split(" (")[0]}</strong> dengan predikat kelulusan sangat baik.
                      </p>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-700/50 pt-4 z-10">
                      <div className="text-[9px] text-slate-400 font-mono">
                        <span className="block">NO: CERT-ETA-2026-0089</span>
                        <span className="block mt-0.5">Diterbitkan: Juni 2026</span>
                      </div>
                      <div className="w-10 h-10 bg-white rounded flex items-center justify-center p-1">
                        <QrCode className="w-full h-full text-slate-900" />
                      </div>
                    </div>
                  </div>

                  {/* Actions & QR Verification block */}
                  <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0F172A] mb-3">Verifikasi &amp; Cetak Sertifikat</h3>
                      <p className="text-gray-400 text-xs leading-relaxed mb-6">
                        Sertifikat digital ini terintegrasi penuh dengan database Supabase. Siapa pun dapat memverifikasi keaslian sertifikat Anda dengan memindai kode QR unik yang tercetak.
                      </p>

                      <div className="flex flex-col gap-3.5 text-xs bg-slate-50 border border-slate-100 p-4 rounded-xl">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pemilik Sertifikat:</span>
                          <span className="font-bold text-[#0F172A]">{dynamicFullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tingkat Kelulusan:</span>
                          <span className="font-bold text-[#0F172A]">{currentBelt.split(" (")[0]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status Validasi:</span>
                          <span className="font-black text-green-600 uppercase">VALID &amp; TERDAFTAR</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={printMemberCertificate}
                        className="w-full bg-[#0F172A] hover:bg-black text-white py-3.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> Unduh / Cetak PDF
                      </button>
                      <button
                        onClick={printMemberCertificate}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-gray-600 py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                      >
                        Cetak Piagam
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A] font-display">Jadwal Latihan Anda</h2>
                <p className="text-gray-400 text-xs mt-1">Jadwal rutin mingguan sesi latihan dojang yang disesuaikan dengan tingkatan sabuk aktif.</p>
              </div>

              {schedules.length === 0 ? (
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-12 text-center shadow-sm flex flex-col items-center gap-3">
                  <Clock className="w-12 h-12 text-slate-200" />
                  <p className="font-bold text-gray-400 text-sm">Jadwal Belum Tersedia</p>
                  <p className="text-gray-400 text-xs">Pelatih atau Admin belum mengatur jadwal latihan. Hubungi pelatih Anda untuk informasi jadwal.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {schedules.sort((a: any, b: any) => ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"].indexOf(a.dayOfWeek) - ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"].indexOf(b.dayOfWeek)).map((sched: any, idx: number) => (
                    <div key={idx} className="bg-white border border-[#0F172A]/5 rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[180px] hover:shadow-md transition-all">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-[#E10600]/10 text-[#E10600] text-[9px] font-black uppercase px-2.5 py-1 rounded tracking-wider">{sched.dayOfWeek}</span>
                          <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-1 rounded">{sched.startTime} – {sched.endTime}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-[#0F172A]">{sched.className}</h4>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-50 text-[10px] text-gray-400 flex flex-col gap-1.5">
                        <span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-[#E10600]" /> {sched.coach?.fullName || "Pelatih"} ({sched.coach?.danRank || ""})</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#E10600]" /> {sched.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="flex flex-col gap-8 animate-fade-in pb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black text-[#0F172A] font-display">Prestasi Saya <span className="text-yellow-500 text-2xl">🏆</span></h1>
                  <p className="text-sm text-gray-500 mt-1">Galeri pencapaian pribadi Anda (Hall of Fame). Banggalah dengan apa yang telah Anda raih!</p>
                </div>
                <button 
                  onClick={() => setShowAchievementModal(true)} 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-yellow-500/30 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5" /> Unggah Prestasi
                </button>
              </div>

              {achievements.length === 0 ? (
                <div className="bg-gradient-to-b from-white to-slate-50 rounded-[2rem] border border-slate-200/60 p-16 text-center shadow-sm">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-12 h-12 text-slate-300" />
                  </div>
                  <h3 className="font-black text-xl text-slate-700 mb-2">Belum Ada Prestasi Tercatat</h3>
                  <p className="text-slate-500 max-w-md mx-auto">Anda belum memiliki rekam jejak medali. Ayo semangat berlatih dan mulai ikuti kejuaraan untuk mengisi lemari piala Anda!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {achievements.map((ach) => (
                    <div key={ach.id} className="group relative bg-gradient-to-b from-slate-800 to-[#0F172A] border border-slate-700 hover:border-yellow-500/50 rounded-[2rem] overflow-hidden backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(234,179,8,0.25)] flex flex-col">
                      <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${
                          ach.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          ach.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {ach.status === 'APPROVED' ? 'Disetujui' : ach.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                        </span>
                      </div>

                      <div className="h-48 relative bg-slate-900 w-full overflow-hidden flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent z-10" />
                        {ach.photoUrl || ach.certificateUrl ? (
                          <img 
                            src={ach.photoUrl || ach.certificateUrl || ""} 
                            alt="Prestasi" 
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-20">
                            <Award className="w-20 h-20 text-yellow-500 blur-sm" />
                            <Award className="w-20 h-20 text-yellow-400 absolute" />
                          </div>
                        )}
                        
                        <div className="absolute bottom-4 left-6 z-20">
                          <div className={`p-4 rounded-full shadow-2xl backdrop-blur-md border border-white/10 translate-y-8 group-hover:translate-y-4 transition-transform duration-500 ${
                            ach.rank === "Emas" ? "bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-yellow-500/50" :
                            ach.rank === "Perak" ? "bg-gradient-to-br from-slate-200 to-slate-500 shadow-slate-400/50" :
                            "bg-gradient-to-br from-amber-500 to-orange-700 shadow-orange-500/50"
                          }`}>
                            <Award className="w-8 h-8 text-white drop-shadow-md" />
                          </div>
                        </div>
                      </div>

                      <div className="p-6 pt-10 flex flex-col flex-grow relative z-20">
                        <h4 className="font-extrabold text-white text-lg leading-snug mb-1 group-hover:text-yellow-400 transition-colors">{ach.title}</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">{ach.eventName}</p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-yellow-500" />
                            {new Date(ach.date).toLocaleDateString("id-ID", { day: 'numeric', month: "long", year: "numeric" })}
                          </div>
                          {ach.certificateUrl && (
                            <a href={ach.certificateUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-colors">
                              <FileText className="w-3.5 h-3.5" /> Piagam
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "members" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A] font-display">Teman Se-Dojang</h2>
                <p className="text-gray-400 text-xs mt-1">Daftar seluruh anggota aktif di akademi Taekwondo yang terdaftar dalam sistem.</p>
              </div>

              <div className="bg-white border border-[#0F172A]/5 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 font-bold uppercase border-b border-[#0F172A]/5">
                      <th className="p-4">Nama Lengkap</th>
                      <th className="p-4">Tingkat Sabuk</th>
                      <th className="p-4">Nomor Anggota</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dojoMembers.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-gray-400">Belum ada data anggota tersedia.</td></tr>
                    ) : (
                      dojoMembers.map((member, idx) => {
                        const isMe = member.email === (profile?.email || "");
                        return (
                          <tr key={idx} className={`border-b border-[#0F172A]/5 hover:bg-slate-50/50 ${isMe ? "bg-red-50/30" : ""}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-red-50 border border-[#E10600]/20 flex items-center justify-center font-bold text-[#E10600] text-[9px] shrink-0 overflow-hidden">
                                  {member.selfieUrl ? <img src={member.selfieUrl} alt="" className="w-full h-full object-cover" /> : (member.name || "?").substring(0,2).toUpperCase()}
                                </div>
                                <span className="font-bold text-[#0F172A]">{member.name || "—"}{isMe ? " (Anda)" : ""}</span>
                              </div>
                            </td>
                            <td className="p-4 text-gray-600">{(member.currentBelt || "Sabuk Putih").split(" (")[0]}</td>
                            <td className="p-4 font-mono text-gray-400">{member.memberNumber || "—"}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full font-bold text-[9px] ${
                                isMe ? "bg-red-50 text-[#E10600]" : "bg-green-50 text-green-600"
                              }`}>
                                {isMe ? "Anda · Aktif" : "Aktif Latihan"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Checkout Modal — Xendit QRIS Dinamis */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8FAFC] rounded-[28px] border border-slate-100 p-8 w-full max-w-md shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold text-[#E10600] uppercase tracking-wider block">
                  TKD Pay • Powered by Xendit QRIS
                </span>
                <h3 className="text-xl font-black text-[#0F172A] font-display mt-0.5">
                  {qrPaid ? "Pembayaran Berhasil!" : "Detail Pembayaran"}
                </h3>
              </div>
              <button
                onClick={handleCloseCheckout}
                className="p-1 rounded-lg hover:bg-slate-200 transition-all text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Layar Sukses ── */}
            {qrPaid ? (
              <div className="flex flex-col items-center gap-5 py-4">
                <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <div className="text-center">
                  <p className="font-extrabold text-[#0F172A] text-base">Pembayaran Terverifikasi</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Rp {checkoutAmount.toLocaleString("id-ID")} untuk {checkoutPurpose}
                  </p>
                </div>
                <button
                  onClick={handleCloseCheckout}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-xs shadow-md transition-all"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <>
                {/* Ringkasan Tagihan */}
                <div className="bg-white border border-[#0F172A]/5 p-5 rounded-2xl flex flex-col gap-2">
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Item Tagihan</span>
                  <h4 className="font-extrabold text-[#0F172A] text-sm">{checkoutPurpose}</h4>
                  <hr className="my-2 border-slate-100" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-400 text-xs">Total Pembayaran:</span>
                    <span className="text-xl font-black text-[#E10600]">
                      Rp {checkoutAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                    <span className="text-[10px] text-green-600 font-semibold">
                      Biaya transaksi: Rp 0 (MDR QRIS 0% kategori Usaha Mikro)
                    </span>
                  </div>
                </div>

                {/* Pilih Metode */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-[#0F172A] uppercase">Metode Pembayaran</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod("qris"); setQrString(null); setQrError(null); stopQrPolling(); }}
                      className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                        paymentMethod === "qris"
                          ? "border-[#E10600] bg-red-50/30 text-[#E10600]"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-extrabold text-xs">QRIS (Otomatis)</span>
                      <span className="text-[10px] text-gray-400 font-medium">GoPay · OVO · ShopeePay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setPaymentMethod("transfer"); setQrString(null); setQrError(null); stopQrPolling(); }}
                      className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                        paymentMethod === "transfer"
                          ? "border-[#E10600] bg-red-50/30 text-[#E10600]"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-extrabold text-xs">Transfer Manual</span>
                      <span className="text-[10px] text-gray-400 font-medium">Upload bukti transfer</span>
                    </button>
                  </div>
                </div>

                {/* ── Panel QRIS Dinamis ── */}
                {paymentMethod === "qris" && (
                  <div className="bg-white border border-[#0F172A]/5 p-6 rounded-2xl flex flex-col items-center gap-4">
                    {!qrString && !isGeneratingQr && (
                      <>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <QrCode className="w-14 h-14 text-slate-300" />
                          <p className="text-gray-400 text-xs font-medium">
                            Klik tombol di bawah untuk membuat kode QRIS unik pembayaran ini.
                          </p>
                          <p className="text-[10px] text-green-600 font-bold">
                            ✓ Biaya: Rp 0 · Verifikasi Otomatis
                          </p>
                        </div>
                        {qrError && (
                          <div className="w-full bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-600 font-medium text-center">
                            {qrError}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleGenerateQRIS}
                          disabled={!checkoutPaymentId}
                          className="w-full bg-[#E10600] hover:bg-[#C00500] disabled:opacity-40 text-white py-3.5 rounded-xl font-bold text-xs shadow-md shadow-[#E10600]/20 transition-all flex items-center justify-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          {checkoutPaymentId ? "Buat Kode QRIS Sekarang" : "Tagihan belum tersedia"}
                        </button>
                      </>
                    )}

                    {isGeneratingQr && (
                      <div className="flex flex-col items-center gap-3 py-4">
                        <div className="w-10 h-10 border-4 border-[#E10600]/20 border-t-[#E10600] rounded-full animate-spin" />
                        <p className="text-xs text-gray-400 font-medium">Membuat kode QRIS...</p>
                      </div>
                    )}

                    {qrString && !isGeneratingQr && (
                      <div className="flex flex-col items-center gap-3 w-full">
                        {/* QR Code dari Xendit ditampilkan sebagai gambar via QR generator */}
                        <div className="border-2 border-slate-100 p-3 rounded-2xl bg-white shadow-sm">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrString)}`}
                            alt="Kode QRIS Pembayaran"
                            className="w-44 h-44 rounded-lg"
                          />
                        </div>
                        <div className="text-center flex flex-col gap-1">
                          <p className="text-[11px] font-bold text-[#0F172A]">
                            Scan dengan aplikasi e-wallet Anda
                          </p>
                          <p className="text-[10px] text-gray-400">
                            GoPay · OVO · ShopeePay · Dana · LinkAja · M-Banking
                          </p>
                        </div>

                        {/* Indikator Menunggu Pembayaran */}
                        <div className="w-full bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                          <span className="text-[10px] text-amber-700 font-semibold">
                            Menunggu pembayaran · Status diperbarui otomatis
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => { setQrString(null); stopQrPolling(); }}
                          className="text-[10px] text-gray-400 hover:text-gray-600 underline transition-all"
                        >
                          Buat ulang kode QRIS
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Panel Transfer Manual (Fallback) ── */}
                {paymentMethod === "transfer" && (
                  <form onSubmit={handleSubmitPayment} className="flex flex-col gap-4">
                    <div className="bg-white border border-[#0F172A]/5 p-5 rounded-2xl flex flex-col gap-3">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                        Instruksi Transfer Manual
                      </span>
                      <p className="text-xs text-gray-500">
                        Transfer ke rekening admin dojang, lalu unggah bukti di bawah ini.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">
                        Unggah Bukti Transfer
                      </label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 bg-white text-center flex flex-col items-center gap-3">
                        {uploadedReceipt ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100">
                              <img src={uploadedReceipt} alt="Resi Preview" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                              <Check className="w-4 h-4" /> Bukti Terpilih
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-6 h-6 text-gray-400" />
                            <label className="bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-xs font-extrabold text-gray-600 cursor-pointer transition-all inline-block">
                              Pilih Bukti Transfer
                              <input type="file" accept="image/*" required className="hidden" onChange={handleFileChange} />
                            </label>
                            <span className="text-[9px] text-gray-400">Format JPEG/PNG, Maks. 2MB</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingPayment || !uploadedReceipt}
                      className="w-full bg-[#E10600] hover:bg-[#C00500] disabled:opacity-50 text-white py-4 rounded-xl font-bold text-xs shadow-md shadow-[#E10600]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingPayment ? "Mengunggah..." : "Kirim Bukti & Tunggu Verifikasi"}
                    </button>
                  </form>
                )}
              </>
            )}

          </div>
        </div>
      )}


      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] p-8 shadow-xl relative border border-slate-100 flex flex-col gap-5 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowEditProfileModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-extrabold text-lg text-[#0F172A]">Edit Profil Anda</h3>
              <p className="text-gray-400 text-xs mt-1">Perbarui informasi, foto diri, dan dokumen sertifikat.</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">

              {/* ── Upload Foto Profil / Selfie ── */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#0F172A] uppercase">Foto Profil</label>
                <div className="flex items-center gap-4">
                  {/* Avatar Preview */}
                  <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl overflow-hidden border-2 border-[#0F172A]/10 bg-slate-50 flex items-center justify-center flex-shrink-0">
                    {editSelfieUrl ? (
                      <img src={editSelfieUrl} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-slate-300">
                        {editName.substring(0, 2).toUpperCase() || "??"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      {editSelfieUrl ? "Ganti Foto" : "Unggah Foto Diri"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadToServer(file, file.name);
                          if (url) setEditSelfieUrl(url);
                        }}
                      />
                    </label>
                    {editSelfieUrl && (
                      <button
                        type="button"
                        onClick={() => setEditSelfieUrl(null)}
                        className="text-[10px] text-red-400 hover:text-red-600 font-bold text-left"
                      >
                        Hapus Foto
                      </button>
                    )}
                    <span className="text-[9px] text-gray-400">JPG / PNG, maks 2MB</span>
                  </div>
                </div>
              </div>

              {/* ── Data Profil ── */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  placeholder="Nama Lengkap" 
                  className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Alamat Email</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  placeholder="Email" 
                  className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 flex items-center gap-1.5">
                  Nomor Anggota <Lock className="w-3.5 h-3.5 text-gray-400" />
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={profile?.memberNumber || ""}
                    disabled
                    className="w-full bg-[#F8FAFC] border border-[#0F172A]/5 text-gray-400 rounded-xl px-4 py-3 text-xs outline-none cursor-not-allowed font-semibold"
                  />
                  <span className="text-[9px] text-[#E10600] font-bold block mt-1">Hanya bisa diubah oleh Pelatih/Admin</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 flex items-center gap-1.5">
                  Tingkatan Sabuk / Geup <Lock className="w-3.5 h-3.5 text-gray-400" />
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={profile?.currentBelt || ""}
                    disabled
                    className="w-full bg-[#F8FAFC] border border-[#0F172A]/5 text-gray-400 rounded-xl px-4 py-3 text-xs outline-none cursor-not-allowed font-bold text-[#E10600]"
                  />
                  <span className="text-[9px] text-[#E10600] font-bold block mt-1">Hanya bisa diubah oleh Pelatih/Admin</span>
                </div>
              </div>

              {/* ── Upload Sertifikat Member ── */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#0F172A] uppercase">Dokumen Sertifikat Sabuk</label>
                <p className="text-[10px] text-gray-400">Unggah sertifikat kenaikan sabuk atau sertifikat UKT dari dojang.</p>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 bg-[#F8FAFC] flex flex-col items-center gap-3">
                  {editCertDocUrl ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      {editCertDocUrl.startsWith("data:image") ? (
                        <img
                          src={editCertDocUrl}
                          alt="Sertifikat"
                          className="max-h-28 rounded-xl object-contain border border-slate-100"
                        />
                      ) : (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-3 rounded-xl w-full">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs font-bold text-green-700">Dokumen Tersimpan</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditCertDocUrl(null)}
                        className="text-[10px] text-red-400 hover:text-red-600 font-bold"
                      >
                        Hapus Dokumen
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <label className="bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        Pilih Dokumen Sertifikat
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadToServer(file, file.name);
                            if (url) setEditCertDocUrl(url);
                          }}
                        />
                      </label>
                      <span className="text-[9px] text-gray-400">JPG, PNG, atau PDF · Maks 5MB</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowEditProfileModal(false)}
                  className="w-full bg-slate-100 text-gray-500 py-3 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSavingProfile}
                  className="w-full bg-[#E10600] text-white py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Achievement Modal */}
      {showAchievementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-[#E10600] px-6 py-4 flex items-center justify-between">
              <h3 className="font-display font-black text-white text-lg">Tambah Prestasi</h3>
              <button onClick={() => setShowAchievementModal(false)} className="text-white/80 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAchievement} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Kategori / Medali</label>
                <select 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none transition-all"
                  value={achRank} onChange={e => setAchRank(e.target.value)} required
                >
                  <option value="Emas">Emas (Juara 1)</option>
                  <option value="Perak">Perak (Juara 2)</option>
                  <option value="Perunggu">Perunggu (Juara 3)</option>
                  <option value="Peserta">Peserta</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Nama Kejuaraan</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Kejurda DKI Jakarta 2024"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none transition-all"
                  value={achEventName} onChange={e => setAchEventName(e.target.value)} required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Kategori Lomba (Judul)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Kyorugi Putra U-45"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none transition-all"
                  value={achTitle} onChange={e => setAchTitle(e.target.value)} required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Tanggal Kejuaraan</label>
                <input 
                  type="date" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none transition-all"
                  value={achDate} onChange={e => setAchDate(e.target.value)} required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Unggah Bukti Piagam / Sertifikat</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 bg-[#F8FAFC] flex flex-col items-center gap-3">
                  {achCertificateUrl ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      {achCertificateUrl.startsWith("data:image") || achCertificateUrl.endsWith(".jpg") || achCertificateUrl.endsWith(".png") ? (
                        <img
                          src={achCertificateUrl}
                          alt="Piagam"
                          className="max-h-28 rounded-xl object-contain border border-slate-100"
                        />
                      ) : (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-3 rounded-xl w-full">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs font-bold text-green-700">Dokumen Tersimpan</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setAchCertificateUrl(null)}
                        className="text-[10px] text-red-400 hover:text-red-600 font-bold cursor-pointer"
                      >
                        Hapus Dokumen
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <label className="bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        Pilih Piagam
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadToServer(file, file.name);
                            if (url) setAchCertificateUrl(url);
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAchievementModal(false)}
                  className="w-full bg-slate-100 text-gray-500 py-3 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSavingAchievement}
                  className="w-full bg-[#E10600] text-white py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 hover:bg-red-700"
                >
                  {isSavingAchievement ? "Menyimpan..." : "Kirim Pengajuan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
