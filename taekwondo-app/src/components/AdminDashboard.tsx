// Cache buster: 2026-06-23 v2
"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  Settings as SettingsIcon, 
  LogOut, 
  Plus, 
  Shield, 
  Calendar,
  FileText,
  Search,
  DollarSign,
  AlertCircle,
  Edit,
  Trash2,
  Upload,
  Globe,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  BookOpen,
  CreditCard,
  Check,
  X,
  UserCheck,
  Award,
  Megaphone,
  Bell,
  User,
  Play,
  Book,
  Flag,
  CheckCircle,
  Video,
  HelpCircle,
  Activity,
  Star,
  Eye,
  EyeOff,
  UploadCloud
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import SppManagement from "./SppManagement";
import CurriculumBuilder from "./CurriculumBuilder";
import ExerciseBuilder from "./ExerciseBuilder";
import BeltRequirementBuilder from "./BeltRequirementBuilder";
import AnnouncementPanel from "./AnnouncementPanel";

interface SettingData {
  logoUrl: string | null;
  heroBgUrl: string | null;
  dojangName: string;
  motto: string;
  heroTitle: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  registrationFee: number;
  sppFee: number;
  sessionFee: number;
  uktFee: number;
  uktRequirements?: string[];
  uktFees?: Record<string, number>;
  showIntro?: boolean;
  dojangLat?: number | null;
  dojangLng?: number | null;
  dojangRadius?: number;
}

interface UserData {
  id: string;
  memberId?: string | null;
  coachId?: string | null;
  name: string;
  email: string;
  role: string;
  status: string;
  currentBelt?: string | null;
  memberNumber?: string | null;
  certDocUrl?: string | null;
}

interface ArticleData {
  id: string;
  title: string;
  content: string;
  author: string;
  imageUrl: string | null;
  createdAt: string;
}

interface CoachData {
  id: string;
  fullName: string;
  danRank: string;
  specialty: string;
  experience: string;
  user?: {
    email: string;
  };
}

interface PaymentData {
  id: string;
  memberId: string;
  amount: number;
  purpose: string; // "SPP Bulanan" | "Iuran Pertemuan" | "Pendaftaran UKT"
  status: string; // "PENDING" | "COMPLETED" | "FAILED"
  createdAt: string;
  paymentProofUrl?: string | null;
  dueDate?: string | null;
  member?: {
    fullName: string;
    memberNumber: string;
  };
}

interface ScheduleData {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  className: string;
  location: string;
  coachId: string;
  coach?: {
    id: string;
    fullName: string;
    danRank: string;
  };
}

interface AchievementData {
  id: string;
  memberId: string;
  member?: {
    id: string;
    fullName: string;
    selfieUrl?: string;
    currentBelt: string;
  };
  title: string;
  eventName: string;
  date: string;
  rank?: string;
  photoUrl?: string;
  status?: string;
  certificateUrl?: string | null;
}

interface DashboardStats {
  totalAnggota: number;
  totalPelatih: number;
  passRate: string;
  registrationFee: number;
  chartData: any[];
}

export default function AdminDashboard({ 
  onBack 
}: { 
  onBack: () => void 
}) {
  const [activeTab, setActiveTab] = useState("payments"); // Default to financial menu
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Gallery State
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [currentGalleryItem, setCurrentGalleryItem] = useState<{ id?: string, imageUrl: string, category: string, title: string }>({ imageUrl: "", category: "LATIHAN", title: "" });

  const fetchDashboardStats = async () => {
    setIsStatsLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard-stats");
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);
  const [tournamentName, setTournamentName] = useState("");
  const [tournamentAmount, setTournamentAmount] = useState("");
  const [isSubmittingTournamentBilling, setIsSubmittingTournamentBilling] = useState(false);
  const [selectedBillingMembers, setSelectedBillingMembers] = useState<string[]>([]);

  // SPP Billing form states
  const [sppPeriod, setSppPeriod] = useState("");
  const [sppAmount, setSppAmount] = useState("");
  const [sppDueDate, setSppDueDate] = useState("");
  const [selectedSppMembers, setSelectedSppMembers] = useState<string[]>([]);
  const [isSubmittingSpp, setIsSubmittingSpp] = useState(false);

  // Session Billing form states
  const [sessionDate, setSessionDate] = useState("");
  const [sessionAmount, setSessionAmount] = useState("");
  const [selectedSessionMembers, setSelectedSessionMembers] = useState<string[]>([]);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);

  const resizeImageGlobal = (file: File | Blob, maxWidth: number, maxHeight: number): Promise<File | Blob> => {
    if (!file.type.startsWith('image/')) return Promise.resolve(file);
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return resolve(file);
          if (file instanceof File) {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          } else {
            resolve(blob);
          }
        }, 'image/jpeg', 0.85);
      };
      img.onerror = () => resolve(file);
    });
  };

  const uploadToServer = async (file: File | Blob, filename: string): Promise<string | null> => {
    try {
      const processedFile = await resizeImageGlobal(file, 1600, 1600);
      const formData = new FormData();
      formData.append("file", processedFile, filename);
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
  
  const [settings, setSettings] = useState<SettingData>({
    logoUrl: null,
    heroBgUrl: null,
    dojangName: "WHITE TIGER TAEKWONDO",
    motto: "Disiplin • Integritas • Prestasi",
    heroTitle: "Bentuk Mental Sang Juara. Lahirkan Macan Putih Sejati.",
    description: "Bukan sekadar tempat berlatih, ini adalah rumah bagi para petarung sejati. Temukan potensi terbaikmu dan jadilah juara bersama keluarga besar White Tiger.",
    address: "Pusat Pelatihan White Tiger, Jakarta Selatan",
    email: "halo@whitetiger-tkd.com",
    phone: "+62 811-1234-5678",
    registrationFee: 75000,
    sppFee: 100000,
    sessionFee: 15000,
    uktFee: 150000,
    uktRequirements: ["Surat Izin Orang Tua", "Foto Selfie 3x4"],
    uktFees: {},
    showIntro: true,
    dojangLat: null,
    dojangLng: null,
    dojangRadius: 50
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Users state
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [newUserBirthDate, setNewUserBirthDate] = useState("");
  const [isSubmittingNewUser, setIsSubmittingNewUser] = useState(false);
  const [newUserError, setNewUserError] = useState("");

  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("MEMBER");
  const [editUserBelt, setEditUserBelt] = useState("Sabuk Putih (10 Geup)");
  const [editUserPassword, setEditUserPassword] = useState("");
  const [editCertDocUrl, setEditCertDocUrl] = useState<string | null>(null);

  // Events / News State
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleData | null>(null);
  const [articleTitle, setArticleTitle] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [articleAuthor, setArticleAuthor] = useState("Admin Editorial");
  const [articleImage, setArticleImage] = useState<string | null>(null);

  // Tournaments / Kejuaraan State
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [tournamentTitle, setTournamentTitle] = useState("");
  const [tournamentLevel, setTournamentLevel] = useState("Provinsi");
  const [tournamentLocation, setTournamentLocation] = useState("");
  const [tournamentStartDate, setTournamentStartDate] = useState("");
  const [tournamentEndDate, setTournamentEndDate] = useState("");
  const [tournamentPosterUrl, setTournamentPosterUrl] = useState<string | null>(null);
  const [tournamentProposalUrl, setTournamentProposalUrl] = useState<string | null>(null);
  const [tournamentLink, setTournamentLink] = useState("");
  const [isSavingTournament, setIsSavingTournament] = useState(false);

  // Coach Management State
  const [coaches, setCoaches] = useState<CoachData[]>([]);
  const [isLoadingCoaches, setIsLoadingCoaches] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState<CoachData | null>(null);
  const [coachFullName, setCoachFullName] = useState("");
  const [coachDanRank, setCoachDanRank] = useState("");
  const [coachSpecialty, setCoachSpecialty] = useState("");
  const [coachExperience, setCoachExperience] = useState("");
  const [coachPhotoUrl, setCoachPhotoUrl] = useState<string | null>(null);
  const [coachCertDocUrl, setCoachCertDocUrl] = useState<string | null>(null);
  const [isSavingCoach, setIsSavingCoach] = useState(false);

  // Financial Administration State
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentPurpose, setPaymentPurpose] = useState("SPP Bulanan");
  const [paymentStatus, setPaymentStatus] = useState("COMPLETED");

  // UKT Candidates State (Dynamic Requirements reviewer)
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  // Schedules State
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleData | null>(null);
  const [schedDay, setSchedDay] = useState("Senin");
  const [schedStartTime, setSchedStartTime] = useState("17:00");
  const [schedEndTime, setSchedEndTime] = useState("19:00");
  const [schedClass, setSchedClass] = useState("");
  const [schedLoc, setSchedLoc] = useState("Dojang Pusat");
  const [schedCoachId, setSchedCoachId] = useState("");
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // Achievements State
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementData | null>(null);
  const [achMemberId, setAchMemberId] = useState("");
  const [achTitle, setAchTitle] = useState("");
  const [achEventName, setAchEventName] = useState("");
  const [achDate, setAchDate] = useState("");
  const [achRank, setAchRank] = useState("Emas");
  const [achPhotoUrl, setAchPhotoUrl] = useState<string | null>(null);
  const [isSavingAchievement, setIsSavingAchievement] = useState(false);

  // Hero Slider State
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [isLoadingSlides, setIsLoadingSlides] = useState(false);
  const [slideCaption, setSlideCaption] = useState("");
  const [slideSubtext, setSlideSubtext] = useState("");
  const [slideOrder, setSlideOrder] = useState("0");
  const [slideImageUrl, setSlideImageUrl] = useState<string | null>(null);
  const [isSavingSlide, setIsSavingSlide] = useState(false);

  // Edit Hero Slide State
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editSubtext, setEditSubtext] = useState("");
  const [editOrder, setEditOrder] = useState("0");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [isUpdatingSlide, setIsUpdatingSlide] = useState(false);

  // Dojang Expenses State
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  // WhatsApp Monthly Report State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  // Load essential settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddModal(false);
      }
    };
    if (showAddModal) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddModal]);

  // Lazy load data based on active tab to optimize initial load speed and reduce network load
  useEffect(() => {
    if (activeTab === "dashboard") {
      // Assuming fetchStats exists or is meant to be fetched here. If it doesn't, skip it.
      // But looking at the code, it probably is dashboard data. Let's just restore the if-else chain.
    }
    if (activeTab === "payments") {
      fetchPayments();
      fetchUsers(); // Needed for billing/member selection
    } else if (activeTab === "ukt_candidates") {
      fetchCandidates();
      fetchUsers(); // Needed for member selection
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "coaches") {
      fetchCoaches();
    } else if (activeTab === "schedules") {
      fetchSchedules();
      fetchCoaches(); // Needed for assigning coaches to schedules
    } else if (activeTab === "achievements") {
      fetchAchievements();
    } else if (activeTab === "hero_slides") {
      fetchHeroSlides();
    } else if (activeTab === "settings") {
      fetchSettings();
    } else if (activeTab === "events") {
      fetchArticles();
    } else if (activeTab === "tournaments") {
      fetchTournaments();
    } else if (activeTab === "analytics") {
      fetchPayments();
      fetchExpenses();
      fetchCoaches();
    } else if (activeTab === "gallery") {
      fetchGallery();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSettings(data);
          setSppAmount(data.sppFee?.toString() || "100000");
          setSessionAmount(data.sessionFee?.toString() || "15000");
        }
      }
    } catch (e) {
      console.error("Error fetching settings:", e);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);
      }
    } catch (e) {
      console.error("Error fetching users:", e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchArticles = async () => {
    setIsLoadingArticles(true);
    try {
      const res = await fetch("/api/articles");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setArticles(data);
      }
    } catch (e) {
      console.error("Error fetching articles:", e);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  const fetchTournaments = async () => {
    setIsLoadingTournaments(true);
    try {
      const res = await fetch("/api/events?status=PUBLISHED");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) setTournaments(data.data);
      }
    } catch (e) {
      console.error("Error fetching tournaments:", e);
    } finally {
      setIsLoadingTournaments(false);
    }
  };

  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTournament(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: tournamentTitle,
          level: tournamentLevel,
          location: tournamentLocation,
          startDate: tournamentStartDate,
          endDate: tournamentEndDate,
          posterUrl: tournamentPosterUrl,
          proposalUrl: tournamentProposalUrl,
          link: tournamentLink,
        }),
      });

      if (res.ok) {
        alert("Kejuaraan berhasil ditambahkan!");
        setShowTournamentModal(false);
        setTournamentTitle("");
        setTournamentLocation("");
        setTournamentStartDate("");
        setTournamentEndDate("");
        setTournamentPosterUrl(null);
        setTournamentProposalUrl(null);
        setTournamentLink("");
        fetchTournaments();
      } else {
        const err = await res.json();
        alert("Error: " + (err.error || "Gagal menyimpan kejuaraan"));
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSavingTournament(false);
    }
  };

  const handleDeleteTournament = async (id: string) => {
    if (!confirm("Hapus kejuaraan ini permanen?")) return;
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Kejuaraan berhasil dihapus!");
        fetchTournaments();
      } else {
        const err = await res.json();
        alert("Error: " + (err.error || "Gagal menghapus kejuaraan"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCoaches = async () => {
    setIsLoadingCoaches(true);
    try {
      const res = await fetch("/api/coaches");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCoaches(data);
      }
    } catch (e) {
      console.error("Error fetching coaches:", e);
    } finally {
      setIsLoadingCoaches(false);
    }
  };

  const fetchPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const res = await fetch("/api/payments");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPayments(data);
      }
    } catch (e) {
      console.error("Error fetching payments:", e);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const fetchCandidates = async () => {
    setIsLoadingCandidates(true);
    try {
      const res = await fetch("/api/ukt/candidates");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCandidates(data);
      }
    } catch (e) {
      console.error("Error fetching candidates:", e);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const fetchSchedules = async () => {
    setIsLoadingSchedules(true);
    try {
      const res = await fetch("/api/schedules");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setSchedules(data);
      }
    } catch (e) {
      console.error("Error fetching schedules:", e);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const fetchAchievements = async () => {
    setIsLoadingAchievements(true);
    try {
      const res = await fetch("/api/achievements");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAchievements(data);
      }
    } catch (e) {
      console.error("Error fetching achievements:", e);
    } finally {
      setIsLoadingAchievements(false);
    }
  };

  const fetchHeroSlides = async () => {
    setIsLoadingSlides(true);
    try {
      const res = await fetch("/api/hero-slides");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setHeroSlides(data);
      }
    } catch (e) {
      console.error("Error fetching hero slides:", e);
    } finally {
      setIsLoadingSlides(false);
    }
  };

  const fetchGallery = async () => {
    try {
      const res = await fetch("/api/gallery");
      if (res.ok) {
        const data = await res.json();
        setGalleryItems(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGalleryItem.imageUrl) {
      alert("Harap unggah gambar terlebih dahulu.");
      return;
    }
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentGalleryItem),
      });
      if (res.ok) {
        setIsGalleryModalOpen(false);
        fetchGallery();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto galeri ini?")) return;
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchGallery();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchExpenses = async () => {
    setIsLoadingExpenses(true);
    try {
      const res = await fetch("/api/expenses");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setExpenses(data);
      }
    } catch (e) {
      console.error("Error fetching expenses:", e);
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseDescription) return;
    setIsSavingExpense(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(expenseAmount),
          description: expenseDescription,
          date: expenseDate || undefined,
        }),
      });
      if (res.ok) {
        fetchExpenses();
        setExpenseAmount("");
        setExpenseDescription("");
        setExpenseDate("");
        alert("Pengeluaran berhasil dicatat!");
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan pengeluaran");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Hapus catatan pengeluaran ini?")) return;
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setExpenses(expenses.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideImageUrl) { alert("Harap upload gambar terlebih dahulu."); return; }
    setIsSavingSlide(true);
    try {
      const res = await fetch("/api/hero-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: slideImageUrl, caption: slideCaption, subtext: slideSubtext, order: parseInt(slideOrder) || 0, isActive: true }),
      });
      if (res.ok) {
        fetchHeroSlides();
        setSlideImageUrl(null); setSlideCaption(""); setSlideSubtext(""); setSlideOrder("0");
        alert("Slide berhasil ditambahkan!");
      } else { const err = await res.json(); alert(err.error || "Gagal menyimpan slide"); }
    } catch (err) { console.error(err); } finally { setIsSavingSlide(false); }
  };

  const handleToggleSlide = async (id: string, isActive: boolean) => {
    try {
      await fetch("/api/hero-slides", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isActive: !isActive }) });
      fetchHeroSlides();
    } catch (err) { console.error(err); }
  };

  const handleUpdateSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    if (!editImageUrl) { alert("Harap upload gambar terlebih dahulu."); return; }
    setIsUpdatingSlide(true);
    try {
      const res = await fetch("/api/hero-slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSlide.id,
          imageUrl: editImageUrl,
          caption: editCaption,
          subtext: editSubtext,
          order: parseInt(editOrder) || 0,
        }),
      });
      if (res.ok) {
        fetchHeroSlides();
        setEditingSlide(null);
        alert("Slide berhasil diperbarui!");
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memperbarui slide");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingSlide(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Hapus slide ini dari Hero Slider?")) return;
    try {
      await fetch(`/api/hero-slides?id=${id}`, { method: "DELETE" });
      setHeroSlides(heroSlides.filter(s => s.id !== id));
    } catch (err) { console.error(err); }
  };

  // User Actions
  // User Actions
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewUserError("");

    // Client-side validations
    if (newUserName.length < 3 || newUserName.length > 100) {
      return setNewUserError("Nama lengkap minimal 3 dan maksimal 100 karakter.");
    }
    if (!/^[a-zA-Z\s]+$/.test(newUserName)) {
      return setNewUserError("Nama lengkap hanya boleh mengandung huruf dan spasi.");
    }
    
    if (newUserUsername.length < 4 || newUserUsername.length > 30) {
      return setNewUserError("Username minimal 4 dan maksimal 30 karakter.");
    }
    if (!/^[a-z0-9_.]+$/.test(newUserUsername)) {
      return setNewUserError("Username hanya boleh mengandung huruf kecil, angka, underscore, dan titik tanpa spasi.");
    }

    if (newUserPassword.length < 8 || newUserPassword.length > 50) {
      return setNewUserError("Password minimal 8 dan maksimal 50 karakter.");
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newUserPassword) || /\s/.test(newUserPassword)) {
      return setNewUserError("Password minimal harus mengandung 1 huruf besar, 1 huruf kecil, 1 angka, dan tanpa spasi.");
    }

    const today = new Date();
    const dob = new Date(newUserBirthDate);
    if (dob > today) {
      return setNewUserError("Tanggal lahir tidak boleh di masa depan.");
    }

    setIsSubmittingNewUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName,
          username: newUserUsername,
          password: newUserPassword,
          role: "MEMBER",
          birthDate: newUserBirthDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers([data.user, ...users]);
        setNewUserName("");
        setNewUserUsername("");
        setNewUserPassword("");
        setNewUserBirthDate("");
        setShowAddModal(false);
      } else {
        setNewUserError(data.error || "Gagal menambah user");
      }
    } catch (err) {
      console.error(err);
      setNewUserError("Terjadi kesalahan server.");
    } finally {
      setIsSubmittingNewUser(false);
    }
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role);
    setEditUserBelt(user.currentBelt || "Sabuk Putih (10 Geup)");
    setEditCertDocUrl(user.certDocUrl || null);
    setEditUserPassword("");
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editUserName || !editUserEmail) return;

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editUserName,
          email: editUserEmail,
          role: editUserRole,
          currentBelt: editUserRole === "MEMBER" ? editUserBelt : undefined,
          certDocUrl: editCertDocUrl,
          ...(editUserPassword && { password: editUserPassword }),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(u => u.id === editingUser.id ? { 
          ...u, 
          name: editUserName, 
          email: editUserEmail, 
          role: editUserRole,
          currentBelt: editUserRole === "MEMBER" ? editUserBelt : null,
          certDocUrl: editCertDocUrl,
        } : u));
        setShowEditUserModal(false);
        setEditingUser(null);
        fetchCoaches(); // Refresh coach list
      } else {
        alert(data.error || "Gagal mengupdate user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic UKT Candidate Review actions
  const handleVerifyCandidate = async (id: string, approve: boolean) => {
    const nextStatus = approve ? "APPROVED" : "FAILED";
    try {
      const res = await fetch("/api/ukt/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus })
      });
      if (res.ok) {
        setCandidates(candidates.map(c => c.id === id ? { ...c, status: nextStatus } : c));
        alert(approve ? "Calon peserta UKT disetujui!" : "Pendaftaran calon peserta ditolak.");
        setSelectedCandidate(null);
      } else {
        alert("Gagal memperbarui status pendaftar.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Article (Event/Agenda) Actions
  const handleOpenArticleModal = (article: ArticleData | null = null) => {
    if (article) {
      setEditingArticle(article);
      setArticleTitle(article.title);
      setArticleContent(article.content);
      setArticleAuthor(article.author);
      setArticleImage(article.imageUrl);
    } else {
      setEditingArticle(null);
      setArticleTitle("");
      setArticleContent("");
      setArticleAuthor("Admin Editorial");
      setArticleImage(null);
    }
    setShowArticleModal(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle || !articleContent) return;

    const payload = {
      title: articleTitle,
      content: articleContent,
      author: articleAuthor,
      imageUrl: articleImage,
    };

    try {
      let res;
      if (editingArticle) {
        res = await fetch(`/api/articles/${editingArticle.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        fetchArticles();
        setShowArticleModal(false);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan agenda");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus agenda kegiatan ini?")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles(articles.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Coach Profile Actions
  const handleOpenCoachModal = (coach: CoachData) => {
    setEditingCoach(coach);
    setCoachFullName(coach.fullName);
    setCoachDanRank(coach.danRank);
    setCoachSpecialty(coach.specialty);
    setCoachExperience(coach.experience);
    setCoachPhotoUrl((coach as any).photoUrl || null);
    setCoachCertDocUrl((coach as any).certDocUrl || null);
    setShowCoachModal(true);
  };

  const handleSaveCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoach) return;
    setIsSavingCoach(true);

    try {
      const res = await fetch("/api/coaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCoach.id,
          fullName: coachFullName,
          danRank: coachDanRank,
          specialty: coachSpecialty,
          experience: coachExperience,
          photoUrl: coachPhotoUrl,
          certDocUrl: coachCertDocUrl,
        }),
      });

      if (res.ok) {
        fetchCoaches();
        setShowCoachModal(false);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memperbarui profil pelatih");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCoach(false);
    }
  };

  // Schedule Actions
  const handleOpenScheduleModal = (schedule: ScheduleData | null = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setSchedDay(schedule.dayOfWeek);
      setSchedStartTime(schedule.startTime);
      setSchedEndTime(schedule.endTime);
      setSchedClass(schedule.className);
      setSchedLoc(schedule.location);
      setSchedCoachId(schedule.coachId);
    } else {
      setEditingSchedule(null);
      setSchedDay("Senin");
      setSchedStartTime("17:00");
      setSchedEndTime("19:00");
      setSchedClass("");
      setSchedLoc("Dojang Pusat");
      setSchedCoachId(coaches.length > 0 ? coaches[0].id : "");
    }
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedClass || !schedCoachId) return;
    setIsSavingSchedule(true);

    const payload = {
      dayOfWeek: schedDay,
      startTime: schedStartTime,
      endTime: schedEndTime,
      className: schedClass,
      location: schedLoc,
      coachId: schedCoachId
    };

    try {
      let res;
      if (editingSchedule) {
        res = await fetch(`/api/schedules/${editingSchedule.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        fetchSchedules();
        setShowScheduleModal(false);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan jadwal");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Hapus jadwal latihan ini?")) return;
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSchedules(schedules.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Achievement Actions
  const handleOpenAchievementModal = (ach?: AchievementData) => {
    if (ach) {
      setEditingAchievement(ach);
      setAchMemberId(ach.memberId);
      setAchTitle(ach.title);
      setAchEventName(ach.eventName);
      setAchDate(ach.date ? new Date(ach.date).toISOString().split("T")[0] : "");
      setAchRank(ach.rank || "Emas");
      setAchPhotoUrl(ach.photoUrl || null);
    } else {
      setEditingAchievement(null);
      setAchMemberId("");
      setAchTitle("");
      setAchEventName("");
      setAchDate("");
      setAchRank("Emas");
      setAchPhotoUrl(null);
    }
    setShowAchievementModal(true);
  };

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAchievement(true);
    try {
      const url = editingAchievement ? `/api/achievements/${editingAchievement.id}` : "/api/achievements";
      const method = editingAchievement ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: achMemberId,
          title: achTitle,
          eventName: achEventName,
          date: achDate,
          rank: achRank,
          photoUrl: achPhotoUrl,
          status: "APPROVED"
        })
      });

      if (res.ok) {
        fetchAchievements();
        setShowAchievementModal(false);
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

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm("Hapus data prestasi ini?")) return;
    try {
      const res = await fetch(`/api/achievements/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAchievements(achievements.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAchievementStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/achievements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAchievements();
      } else {
        alert("Gagal mengupdate status prestasi");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Financial (Payment) Actions
  const handleVerifyPayment = async (id: string, approve: boolean) => {
    const nextStatus = approve ? "COMPLETED" : "FAILED";
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: nextStatus,
          action: "update-status"
        })
      });
      if (res.ok) {
        setPayments(payments.map(p => p.id === id ? { ...p, status: nextStatus } : p));
      } else {
        alert("Gagal memperbarui pembayaran");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !paymentAmount || !paymentPurpose) return;

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMemberId,
          amount: paymentAmount,
          purpose: paymentPurpose,
          status: paymentStatus
        })
      });

      if (res.ok) {
        fetchPayments();
        setShowAddPaymentModal(false);
        setSelectedMemberId("");
        setPaymentAmount("");
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mencatat pembayaran");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Settings Actions
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "heroBg") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadToServer(file, file.name);
    if (url) {
      setSettings(prev => ({
        ...prev,
        [type === "logo" ? "logoUrl" : "heroBgUrl"]: url,
      }));
    } else {
      alert("Gagal mengunggah file. Coba lagi.");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert("Pengaturan aplikasi berhasil disimpan!");
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan pengaturan");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Recharts Simulated Data -> Now Real Data
  const analyticsData = dashboardStats?.chartData || [];

  // Calculate dynamic totals from payments list
  const getFinancialTotals = () => {
    let sppTotal = 0;
    let uktTotal = 0;
    let iuranTotal = 0;
    let perlombaanTotal = 0;
    let kasBersih = 0;
    let piutangTotal = 0;
    let pendingCount = 0;
    let pengeluaranTotal = 0;

    payments.forEach(p => {
      if (p.status === "COMPLETED") {
        kasBersih += p.amount;
        if (p.purpose.toLowerCase().includes("spp")) sppTotal += p.amount;
        else if (p.purpose.toLowerCase().includes("ukt")) uktTotal += p.amount;
        else if (p.purpose.toLowerCase().includes("lomba") || p.purpose.toLowerCase().includes("kejuaraan")) perlombaanTotal += p.amount;
        else if (p.purpose.toLowerCase().includes("pertemuan") || p.purpose.toLowerCase().includes("iuran")) iuranTotal += p.amount;
      } else if (p.status === "PENDING") {
        piutangTotal += p.amount;
        pendingCount++;
      }
    });

    expenses.forEach(e => {
      pengeluaranTotal += e.amount;
      kasBersih -= e.amount;
    });

    return { sppTotal, uktTotal, iuranTotal, perlombaanTotal, kasBersih, piutangTotal, pendingCount, pengeluaranTotal };
  };

  const { sppTotal, uktTotal, iuranTotal, perlombaanTotal, kasBersih, piutangTotal, pendingCount, pengeluaranTotal } = getFinancialTotals();

  const handleIssueTournamentBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournamentName || !tournamentAmount) return;
    if (selectedBillingMembers.length === 0) {
      alert("Silakan pilih minimal satu anggota penerima tagihan.");
      return;
    }
    setIsSubmittingTournamentBilling(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mass-billing",
          memberIds: selectedBillingMembers,
          amount: parseFloat(tournamentAmount),
          purpose: `Iuran Perlombaan: ${tournamentName}`,
        }),
      });

      if (res.ok) {
        alert(`Berhasil menerbitkan tagihan perlombaan untuk ${selectedBillingMembers.length} anggota!`);
        setTournamentName("");
        setTournamentAmount("");
        setSelectedBillingMembers([]);
        fetchPayments();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menerbitkan tagihan");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memproses data.");
    } finally {
      setIsSubmittingTournamentBilling(false);
    }
  };

  const handleIssueSppBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sppPeriod || !sppAmount || !sppDueDate) return;
    if (selectedSppMembers.length === 0) {
      alert("Silakan pilih minimal satu anggota penerima tagihan SPP.");
      return;
    }
    setIsSubmittingSpp(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "spp-billing",
          memberIds: selectedSppMembers,
          amount: parseFloat(sppAmount),
          purpose: `SPP Bulan ${sppPeriod}`,
          dueDate: sppDueDate,
        }),
      });

      if (res.ok) {
        alert(`Berhasil menerbitkan tagihan SPP untuk ${selectedSppMembers.length} anggota!`);
        setSppPeriod("");
        setSppDueDate("");
        setSelectedSppMembers([]);
        fetchPayments();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menerbitkan tagihan SPP");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSubmittingSpp(false);
    }
  };

  const handleIssueSessionBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionDate || !sessionAmount) return;
    if (selectedSessionMembers.length === 0) {
      alert("Silakan pilih minimal satu anggota penerima tagihan pertemuan.");
      return;
    }
    setIsSubmittingSession(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "session-billing",
          memberIds: selectedSessionMembers,
          amount: parseFloat(sessionAmount),
          purpose: `Iuran Pertemuan: ${sessionDate}`,
          dueDate: sessionDate,
        }),
      });

      if (res.ok) {
        alert(`Berhasil menerbitkan tagihan pertemuan untuk ${selectedSessionMembers.length} anggota!`);
        setSessionDate("");
        setSelectedSessionMembers([]);
        fetchPayments();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menerbitkan tagihan iuran pertemuan");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSubmittingSession(false);
    }
  };

  const handlePrintFinancialReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const filtered = payments.filter(p => {
      const matchSearch = p.member?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchCat = true;
      if (categoryFilter === "SPP") matchCat = p.purpose.toLowerCase().includes("spp");
      else if (categoryFilter === "PERTANDINGAN") matchCat = p.purpose.toLowerCase().includes("lomba") || p.purpose.toLowerCase().includes("kejuaraan");
      else if (categoryFilter === "UKT") matchCat = p.purpose.toLowerCase().includes("ukt");
      else if (categoryFilter === "PERTEMUAN") matchCat = p.purpose.toLowerCase().includes("pertemuan") || p.purpose.toLowerCase().includes("iuran");

      return matchSearch && matchCat;
    });

    const rows = filtered.map(p => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(p.createdAt).toLocaleDateString("id-ID")}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.member?.fullName} (${p.member?.memberNumber})</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.purpose}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rp ${p.amount.toLocaleString("id-ID")}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${p.status}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Keuangan Buku Kas Taekwondo</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f2f2f2; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
            .totals { margin-top: 30px; text-align: right; font-size: 14px; }
          </style>
        </head>
        <body>
          <h2>Laporan Keuangan & Buku Kas Dojang</h2>
          <p>Tanggal Cetak: ${new Date().toLocaleString("id-ID")}</p>
          <p>Filter Kategori: ${categoryFilter}</p>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Anggota</th>
                <th>Tujuan Iuran</th>
                <th style="text-align: right;">Jumlah</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="5" style="text-align: center; padding: 20px;">Tidak ada data.</td></tr>'}
            </tbody>
          </table>
          <div class="totals">
            <p><strong>Total Kas Masuk (Lunas):</strong> Rp ${filtered.filter(p => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0).toLocaleString("id-ID")}</p>
            <p><strong>Total Piutang (Pending):</strong> Rp ${filtered.filter(p => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0).toLocaleString("id-ID")}</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleAddRequirement = () => {
    const inputEl = document.getElementById("newUktReqInput") as HTMLInputElement;
    const val = inputEl?.value.trim();
    if (val) {
      const updated = [...(settings.uktRequirements || []), val];
      setSettings({ ...settings, uktRequirements: updated });
      inputEl.value = "";
    }
  };

  const handleRemoveRequirement = (idxToRemove: number) => {
    const updated = (settings.uktRequirements || []).filter((_, i) => i !== idxToRemove);
    setSettings({ ...settings, uktRequirements: updated });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-[#0F172A]/5 p-6 flex flex-col justify-between shrink-0">
          <div className="flex flex-col gap-8">
            {/* Admin Profile */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#E10600] flex items-center justify-center bg-red-50 text-[#E10600] font-bold text-lg">
                AD
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#0F172A] leading-none">Admin Panel</h3>
                <span className="text-[10px] text-gray-400 font-bold block mt-1 uppercase tracking-wider">Super Administrator</span>
              </div>
            </div>

            {/* Nav Menu */}
            <div className="flex flex-col gap-1.5">
              {[
                { id: "payments", label: "Administrasi Keuangan", icon: <CreditCard className="w-4 h-4" /> }, 
                { id: "ukt_candidates", label: "Pendaftar Ujian UKT", icon: <UserCheck className="w-4 h-4" /> },
                { id: "analytics", label: "Dashboard Analytics", icon: <TrendingUp className="w-4 h-4" /> },
                { id: "curriculum", label: "Curriculum Builder", icon: <BookOpen className="w-4 h-4" /> },
                { id: "exercises", label: "Daily Quests", icon: <Edit className="w-4 h-4" /> },
                { id: "belt_requirements", label: "Syarat Ujian (Belt Req)", icon: <Check className="w-4 h-4" /> },
                { id: "schedules", label: "Pengaturan Jadwal", icon: <Calendar className="w-4 h-4" /> },
                { id: "spp", label: "Manajemen SPP", icon: <DollarSign className="w-4 h-4" /> },
                { id: "users", label: "Manajemen User", icon: <Users className="w-4 h-4" /> },
                { id: "events", label: "Agenda Kegiatan (Event)", icon: <FileText className="w-4 h-4" /> },
                { id: "coaches", label: "Manajemen Pelatih", icon: <Shield className="w-4 h-4" /> },
                { id: "achievements", label: "Prestasi Member", icon: <Award className="w-4 h-4" /> },
                { id: "announcements", label: "📢 Pengumuman", icon: <Megaphone className="w-4 h-4" /> },
                { id: "hero_slides", label: "Slider Hero (Juara)", icon: <Sparkles className="w-4 h-4" /> },
                { id: "gallery", label: "Galeri Foto", icon: <FileText className="w-4 h-4" /> }
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

          <div className="flex flex-col gap-1 pt-6 border-t border-slate-100 mt-6">
            <button 
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs text-left transition-all ${
                activeTab === "settings"
                  ? "bg-[#0F172A] text-white"
                  : "text-gray-500 hover:text-[#0F172A]"
              }`}
            >
              <SettingsIcon className="w-4 h-4" /> Pengaturan Aplikasi
            </button>
            <button onClick={onBack} className="flex items-center gap-3 px-4 py-2.5 text-[#E10600] hover:bg-red-50 font-bold text-xs text-left rounded-xl transition-all">
              <LogOut className="w-4 h-4" /> Back to SSO
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow p-8 sm:p-12 w-full max-w-7xl">
          {activeTab === "payments" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A] font-display">Administrasi Keuangan</h2>
                  <p className="text-gray-400 text-xs mt-1">Kelola pencatatan SPP bulanan, iuran per pertemuan, pendaftaran UKT, serta verifikasi setoran anggota.</p>
                </div>
                <button 
                  onClick={() => setShowAddPaymentModal(true)}
                  className="bg-[#E10600] hover:bg-[#C00500] text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Catat Iuran Manual
                </button>
              </div>

              {/* Financial Dashboard Counters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {[
                  { label: "Saldo Kas Bersih (Lunas)", val: `Rp ${kasBersih.toLocaleString("id-ID")}`, desc: "Total Penerimaan Riil - Pengeluaran", color: "text-[#0F172A] font-black" },
                  { label: "Piutang Tagihan (Pending)", val: `Rp ${piutangTotal.toLocaleString("id-ID")}`, desc: "Dana Tertunda Verifikasi", color: "text-amber-500 font-extrabold" },
                  { label: "Iuran SPP & Pertemuan", val: `Rp ${(sppTotal + iuranTotal).toLocaleString("id-ID")}`, desc: "Operasional Rutin Lunas", color: "text-blue-600" },
                  { label: "UKT & Perlombaan", val: `Rp ${(uktTotal + perlombaanTotal).toLocaleString("id-ID")}`, desc: "Sertifikasi & Event Lunas", color: "text-green-600" },
                  { label: "Total Pengeluaran", val: `Rp ${pengeluaranTotal.toLocaleString("id-ID")}`, desc: "Pembelian Alat & Operasional", color: "text-[#E10600] font-black" }
                ].map((s, idx) => (
                  <div key={idx} className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">{s.label}</span>
                    <span className={`text-2xl font-black block mt-2 ${s.color}`}>{s.val}</span>
                    <span className="text-gray-400 text-[10px] block mt-1">{s.desc}</span>
                  </div>
                ))}
              </div>

              {/* Laporan & Pengeluaran Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Pencatatan Pengeluaran */}
                <div className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F172A]">Catat Pengeluaran Dojang</h3>
                    <p className="text-gray-400 text-xs mt-1">Pembelian alat latihan, matras, seragam, atau biaya tak terduga lainnya.</p>
                  </div>
                  <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Nominal (Rp)</label>
                      <input type="number" required value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} className="w-full h-12 bg-[#F8FAFC] border-none rounded-xl px-4 text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-[#E10600] outline-none" placeholder="Contoh: 150000" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Keterangan / Tujuan</label>
                      <input type="text" required value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} className="w-full h-12 bg-[#F8FAFC] border-none rounded-xl px-4 text-sm text-[#0F172A] focus:ring-2 focus:ring-[#E10600] outline-none" placeholder="Beli matras 2 pcs..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Tanggal Keluar (Opsional)</label>
                      <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="w-full h-12 bg-[#F8FAFC] border-none rounded-xl px-4 text-sm font-medium text-[#0F172A] focus:ring-2 focus:ring-[#E10600] outline-none" />
                    </div>
                    <button type="submit" disabled={isSavingExpense} className="h-12 bg-[#0F172A] hover:bg-[#E10600] text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center">
                      {isSavingExpense ? "Menyimpan..." : "Simpan Pengeluaran"}
                    </button>
                  </form>
                </div>

                {/* Unduh Laporan Keuangan */}
                <div className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center gap-4">
                  <div className="bg-[#E10600]/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-[#E10600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-[#0F172A]">Laporan Keuangan Bulanan</h3>
                    <p className="text-gray-400 text-sm mt-2 max-w-[250px] mx-auto">
                      Unduh ringkasan kas masuk, kas keluar, dan rekap piutang dalam format CSV (Excel).
                    </p>
                  </div>
                  <button onClick={() => {
                    const csvContent = "LAPORAN KEUANGAN DOJANG TAEKWONDO\\n" +
                      `Periode,${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}\\n\\n` +
                      "KATEGORI,NOMINAL\\n" +
                      `Iuran & SPP Lunas,${sppTotal + iuranTotal}\\n` +
                      `UKT & Event Lunas,${uktTotal + perlombaanTotal}\\n` +
                      `Total Pemasukan,${sppTotal + iuranTotal + uktTotal + perlombaanTotal}\\n\\n` +
                      `Pengeluaran Operasional,${pengeluaranTotal}\\n\\n` +
                      `SALDO KAS SAAT INI,${kasBersih}\\n\\n` +
                      `Piutang Belum Lunas,${piutangTotal}\\n` +
                      `Jumlah Tagihan Pending,${pendingCount}\\n`;

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Laporan_Keuangan_${new Date().toISOString().slice(0,10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }} className="h-12 px-8 mt-4 bg-[#0F172A] hover:bg-[#E10600] text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 w-full md:w-auto">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Download Laporan CSV
                  </button>
                </div>
              </div>

              {/* Riwayat Pengeluaran */}
              <div className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm mt-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F172A]">Riwayat Pengeluaran (Buku Kas Keluar)</h3>
                    <p className="text-gray-400 text-xs mt-1">Daftar semua pengeluaran yang telah dicatat.</p>
                  </div>
                </div>
                {isLoadingExpenses ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#E10600] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : expenses.length === 0 ? (
                  <div className="text-center py-8 bg-[#F8FAFC] rounded-xl border border-[#0F172A]/5">
                    <p className="text-xs text-gray-500 font-medium">Belum ada catatan pengeluaran.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-[#0F172A]/5">
                          <th className="pb-3 font-bold text-[#0F172A] text-xs uppercase">Tanggal</th>
                          <th className="pb-3 font-bold text-[#0F172A] text-xs uppercase">Keterangan</th>
                          <th className="pb-3 font-bold text-[#0F172A] text-xs uppercase text-right">Nominal</th>
                          <th className="pb-3 font-bold text-[#0F172A] text-xs uppercase text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((exp) => (
                          <tr key={exp.id} className="border-b border-[#0F172A]/5 hover:bg-[#F8FAFC]/50 transition-colors">
                            <td className="py-4 text-[#0F172A] font-medium text-xs">
                              {new Date(exp.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>
                            <td className="py-4 text-gray-600 text-xs">{exp.description}</td>
                            <td className="py-4 text-[#E10600] font-bold text-xs text-right">
                              Rp {exp.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => handleDeleteExpense(exp.id)}
                                className="text-gray-400 hover:text-red-600 p-2 transition-colors cursor-pointer"
                                title="Hapus Pengeluaran"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Card Pengaturan Tarif Iuran */}
              <div className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                <div>
                  <h3 className="font-extrabold text-sm text-[#0F172A]">Konfigurasi Tarif Iuran &amp; Biaya UKT per Sabuk</h3>
                  <p className="text-gray-400 text-xs mt-1">Ubah nominal iuran secara dinamis atau tentukan biaya khusus pendaftaran UKT untuk setiap tingkatan sabuk/geup.</p>
                </div>

                <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Pendaftaran Anggota (Rp)</label>
                      <input 
                        type="number" 
                        value={settings.registrationFee ?? ""}
                        onChange={(e) => setSettings({ ...settings, registrationFee: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Biaya SPP Bulanan (Rp)</label>
                      <input 
                        type="number" 
                        value={settings.sppFee ?? ""}
                        onChange={(e) => setSettings({ ...settings, sppFee: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Biaya Iuran Pertemuan (Rp)</label>
                      <input 
                        type="number" 
                        value={settings.sessionFee ?? ""}
                        onChange={(e) => setSettings({ ...settings, sessionFee: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Biaya UKT Standar (Rp)</label>
                      <input 
                        type="number" 
                        value={settings.uktFee ?? ""}
                        onChange={(e) => setSettings({ ...settings, uktFee: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#0F172A]/5 pt-4">
                    <span className="block text-xs font-bold text-[#0F172A] uppercase mb-3">Tarif Khusus UKT per Tingkat Sabuk / Geup</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 border border-[#0F172A]/5 rounded-xl p-4 bg-[#F8FAFC]">
                      {[
                        "Sabuk Putih (10 Geup)",
                        "Sabuk Kuning (9 Geup)",
                        "Kuning Strip Hijau (8 Geup)",
                        "Sabuk Hijau (7 Geup)",
                        "Hijau Strip Biru (6 Geup)",
                        "Sabuk Biru (5 Geup)",
                        "Biru Strip Merah (4 Geup)",
                        "Sabuk Merah (3 Geup)",
                        "Merah Strip Hitam 1 (2 Geup)",
                        "Merah Strip Hitam 2 (1 Geup)",
                        "Sabuk Hitam (1 Dan)"
                      ].map((belt) => {
                        const currentVal = settings.uktFees?.[belt] !== undefined ? settings.uktFees[belt] : "";
                        return (
                          <div key={belt} className="flex items-center justify-between gap-4 bg-white p-3 rounded-lg border border-[#0F172A]/5">
                            <span className="text-xs font-bold text-[#0F172A]">{belt}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400 font-bold">Rp</span>
                              <input 
                                type="number"
                                placeholder={settings.uktFee?.toString() || "150000"}
                                value={currentVal}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? undefined : parseFloat(e.target.value);
                                  const newFees = { ...settings.uktFees };
                                  if (val === undefined || isNaN(val)) {
                                    delete newFees[belt];
                                  } else {
                                    newFees[belt] = val;
                                  }
                                  setSettings({ ...settings, uktFees: newFees });
                                }}
                                className="w-28 bg-[#F8FAFC] border border-[#0F172A]/10 rounded-lg px-2.5 py-1.5 text-xs text-right outline-none focus:ring-1 focus:ring-[#E10600]"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">* Kosongkan kolom input untuk menggunakan Biaya UKT Standar (Rp {(settings.uktFee || 150000).toLocaleString("id-ID")})</p>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSavingSettings}
                      className="bg-[#0F172A] hover:bg-black text-white px-5 py-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingSettings ? "Menyimpan..." : "Simpan Konfigurasi Tarif"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Card Penerbitan Iuran Perlombaan Massal */}
              <div className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                <div>
                  <h3 className="font-extrabold text-sm text-[#0F172A]">Terbitkan Tagihan Iuran Perlombaan / Kejuaraan</h3>
                  <p className="text-gray-400 text-xs mt-1">Buat tagihan iuran baru secara massal untuk seluruh anggota terdaftar yang berpartisipasi dalam event perlombaan.</p>
                </div>

                <form onSubmit={handleIssueTournamentBilling} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Nama Perlombaan / Kejuaraan</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Kejuaraan Jakarta Open II 2026"
                        value={tournamentName}
                        onChange={(e) => setTournamentName(e.target.value)}
                        required
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Biaya Pendaftaran Turnamen (Rp)</label>
                      <input 
                        type="number" 
                        placeholder="Contoh: 250000"
                        value={tournamentAmount}
                        onChange={(e) => setTournamentAmount(e.target.value)}
                        required
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#0F172A]/5 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="block text-xs font-bold text-[#0F172A] uppercase">Pilih Anggota Penerima Tagihan</span>
                      <button
                        type="button"
                        onClick={() => {
                          const allMembers = users.filter(u => u.role === "MEMBER" && u.memberId).map(u => u.memberId as string);
                          if (selectedBillingMembers.length === allMembers.length) {
                            setSelectedBillingMembers([]);
                          } else {
                            setSelectedBillingMembers(allMembers);
                          }
                        }}
                        className="text-[#E10600] font-bold text-[10px] uppercase hover:underline"
                      >
                        {selectedBillingMembers.length === users.filter(u => u.role === "MEMBER" && u.memberId).length ? "Kosongkan Semua" : "Pilih Semua"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 border border-[#0F172A]/5 rounded-xl p-3 bg-[#F8FAFC]">
                      {users.filter(u => u.role === "MEMBER" && u.memberId).map((u) => {
                        const mId = u.memberId as string;
                        const isChecked = selectedBillingMembers.includes(mId);
                        return (
                          <label key={u.id} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-[#0F172A]/5 cursor-pointer select-none hover:bg-slate-50 transition-all">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedBillingMembers(selectedBillingMembers.filter(id => id !== mId));
                                } else {
                                  setSelectedBillingMembers([...selectedBillingMembers, mId]);
                                }
                              }}
                              className="accent-[#E10600] rounded"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-[#0F172A]">{u.name}</span>
                              <span className="text-[10px] text-gray-400">{u.email}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">* {selectedBillingMembers.length} anggota terpilih dari {users.filter(u => u.role === "MEMBER" && u.memberId).length} total anggota.</p>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSubmittingTournamentBilling}
                      className="bg-[#E10600] hover:bg-[#C00500] text-white px-5 py-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingTournamentBilling ? "Menerbitkan..." : "Terbitkan Tagihan Massal"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Card Penerbitan SPP Bulanan Massal */}
              <div className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                <div>
                  <h3 className="font-extrabold text-sm text-[#0F172A]">Terbitkan Tagihan SPP Bulanan (Akun Piutang)</h3>
                  <p className="text-gray-400 text-xs mt-1">Rilis tagihan SPP rutin untuk periode bulan tertentu dengan tanggal jatuh tempo. Tagihan belum dibayar otomatis tercatat sebagai Piutang, dan setelah tanggal jatuh tempo otomatis berubah menjadi Overdue (Tunggakan/Telat).</p>
                </div>

                <form onSubmit={handleIssueSppBilling} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Bulan / Periode SPP</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Juli 2026"
                        value={sppPeriod}
                        onChange={(e) => setSppPeriod(e.target.value)}
                        required
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Nominal SPP (Rp)</label>
                      <input 
                        type="number" 
                        placeholder="Contoh: 100000"
                        value={sppAmount}
                        onChange={(e) => setSppAmount(e.target.value)}
                        required
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Batas Jatuh Tempo Pembayaran</label>
                      <input 
                        type="date" 
                        value={sppDueDate}
                        onChange={(e) => setSppDueDate(e.target.value)}
                        required
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#0F172A]/5 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="block text-xs font-bold text-[#0F172A] uppercase">Pilih Anggota Penerima Tagihan SPP</span>
                      <button
                        type="button"
                        onClick={() => {
                          const allMembers = users.filter(u => u.role === "MEMBER" && u.memberId).map(u => u.memberId as string);
                          if (selectedSppMembers.length === allMembers.length) {
                            setSelectedSppMembers([]);
                          } else {
                            setSelectedSppMembers(allMembers);
                          }
                        }}
                        className="text-[#E10600] font-bold text-[10px] uppercase hover:underline"
                      >
                        {selectedSppMembers.length === users.filter(u => u.role === "MEMBER" && u.memberId).length ? "Kosongkan Semua" : "Pilih Semua"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 border border-[#0F172A]/5 rounded-xl p-3 bg-[#F8FAFC]">
                      {users.filter(u => u.role === "MEMBER" && u.memberId).map((u) => {
                        const mId = u.memberId as string;
                        const isChecked = selectedSppMembers.includes(mId);
                        return (
                          <label key={u.id} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-[#0F172A]/5 cursor-pointer select-none hover:bg-slate-50 transition-all">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedSppMembers(selectedSppMembers.filter(id => id !== mId));
                                } else {
                                  setSelectedSppMembers([...selectedSppMembers, mId]);
                                }
                              }}
                              className="accent-[#E10600] rounded"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-[#0F172A]">{u.name}</span>
                              <span className="text-[10px] text-gray-400">{u.email}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">* {selectedSppMembers.length} anggota terpilih dari {users.filter(u => u.role === "MEMBER" && u.memberId).length} total anggota.</p>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSubmittingSpp}
                      className="bg-[#0F172A] hover:bg-black text-white px-5 py-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingSpp ? "Menerbitkan..." : "Terbitkan SPP Masuk Piutang"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Card Penerbitan Iuran Pertemuan Sabtu/Minggu Massal */}
              <div className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                <div>
                  <h3 className="font-extrabold text-sm text-[#0F172A]">Terbitkan Tagihan Iuran Pertemuan Sabtu / Minggu</h3>
                  <p className="text-gray-400 text-xs mt-1">Rilis tagihan iuran pertemuan rutin Sabtu dan Minggu untuk tanggal latihan yang dipilih. Seluruh anggota aktif tetap ditagih iuran walaupun tidak hadir latihan, yang akan tercatat sebagai kewajiban utang member.</p>
                </div>

                <form onSubmit={handleIssueSessionBilling} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Tanggal Latihan (Sabtu / Minggu)</label>
                      <input 
                        type="date" 
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        required
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Nominal Iuran Pertemuan (Rp)</label>
                      <input 
                        type="number" 
                        placeholder="Contoh: 15000"
                        value={sessionAmount}
                        onChange={(e) => setSessionAmount(e.target.value)}
                        required
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#0F172A]/5 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="block text-xs font-bold text-[#0F172A] uppercase">Pilih Anggota Penerima Tagihan Pertemuan</span>
                      <button
                        type="button"
                        onClick={() => {
                          const allMembers = users.filter(u => u.role === "MEMBER" && u.memberId).map(u => u.memberId as string);
                          if (selectedSessionMembers.length === allMembers.length) {
                            setSelectedSessionMembers([]);
                          } else {
                            setSelectedSessionMembers(allMembers);
                          }
                        }}
                        className="text-[#E10600] font-bold text-[10px] uppercase hover:underline"
                      >
                        {selectedSessionMembers.length === users.filter(u => u.role === "MEMBER" && u.memberId).length ? "Kosongkan Semua" : "Pilih Semua"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 border border-[#0F172A]/5 rounded-xl p-3 bg-[#F8FAFC]">
                      {users.filter(u => u.role === "MEMBER" && u.memberId).map((u) => {
                        const mId = u.memberId as string;
                        const isChecked = selectedSessionMembers.includes(mId);
                        return (
                          <label key={u.id} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-[#0F172A]/5 cursor-pointer select-none hover:bg-slate-50 transition-all">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedSessionMembers(selectedSessionMembers.filter(id => id !== mId));
                                } else {
                                  setSelectedSessionMembers([...selectedSessionMembers, mId]);
                                }
                              }}
                              className="accent-[#E10600] rounded"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-[#0F172A]">{u.name}</span>
                              <span className="text-[10px] text-gray-400">{u.email}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">* {selectedSessionMembers.length} anggota terpilih dari {users.filter(u => u.role === "MEMBER" && u.memberId).length} total anggota.</p>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSubmittingSession}
                      className="bg-[#E10600] hover:bg-[#C00500] text-[#0F172A] px-5 py-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingSession ? "Menerbitkan..." : "Terbitkan Tagihan Pertemuan"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Search filter block */}
              <div className="bg-white border border-[#0F172A]/5 p-4 rounded-xl flex gap-3 flex-wrap">
                <div className="relative flex-grow min-w-[200px]">
                  <input 
                    type="text" 
                    placeholder="Cari berdasarkan nama member atau tujuan iuran..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#0F172A]/5 rounded-lg pl-9 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-[#0F172A]/10 text-[#0F172A] rounded-xl px-3 py-2 text-xs font-extrabold outline-none focus:ring-2 focus:ring-[#E10600]"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="SPP">SPP Bulanan</option>
                  <option value="PERTANDINGAN">Iuran Perlombaan</option>
                  <option value="UKT">Pendaftaran UKT</option>
                  <option value="PERTEMUAN">Iuran Pertemuan</option>
                </select>

                <button
                  type="button"
                  onClick={handlePrintFinancialReport}
                  className="bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  Cetak Buku Kas
                </button>
              </div>

              {/* Transaction Ledger Table */}
              <div className="bg-white border border-[#0F172A]/5 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 font-bold uppercase border-b border-[#0F172A]/5">
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Anggota</th>
                      <th className="p-4">Tujuan Iuran</th>
                      <th className="p-4">Jumlah (Rp)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingPayments ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">Loading riwayat transaksi...</td>
                      </tr>
                    ) : payments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">Belum ada catatan iuran keuangan.</td>
                      </tr>
                    ) : payments
                      .filter(p => {
                        const matchSearch = p.member?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.purpose.toLowerCase().includes(searchTerm.toLowerCase());
                        
                        let matchCat = true;
                        if (categoryFilter === "SPP") matchCat = p.purpose.toLowerCase().includes("spp");
                        else if (categoryFilter === "PERTANDINGAN") matchCat = p.purpose.toLowerCase().includes("lomba") || p.purpose.toLowerCase().includes("kejuaraan");
                        else if (categoryFilter === "UKT") matchCat = p.purpose.toLowerCase().includes("ukt");
                        else if (categoryFilter === "PERTEMUAN") matchCat = p.purpose.toLowerCase().includes("pertemuan") || p.purpose.toLowerCase().includes("iuran");

                        return matchSearch && matchCat;
                      })
                      .map((p, idx) => (
                        <tr key={idx} className="border-b border-[#0F172A]/5 hover:bg-slate-50/50">
                          <td className="p-4 text-gray-400 font-medium">{new Date(p.createdAt).toLocaleDateString("id-ID")}</td>
                          <td className="p-4">
                            <span className="font-extrabold text-[#0F172A] block">{p.member?.fullName}</span>
                            <span className="text-[10px] text-gray-400">{p.member?.memberNumber}</span>
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
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[9px] ${
                              p.status === "COMPLETED" 
                                ? "bg-green-50 text-green-600" 
                                : p.status === "PENDING"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-600"
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                              {p.paymentProofUrl && (
                                <a 
                                  href={p.paymentProofUrl}
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all text-[10px] font-bold inline-flex items-center"
                                  title="Lihat Bukti Pembayaran"
                                >
                                  Lihat Bukti
                                </a>
                              )}
                              {p.status === "PENDING" ? (
                                <div className="flex justify-end gap-1.5">
                                  <button 
                                    onClick={() => handleVerifyPayment(p.id, true)}
                                    className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-all"
                                    title="Approve"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleVerifyPayment(p.id, false)}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-[#E10600] rounded-lg transition-all"
                                    title="Reject"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-[10px] font-bold">Terverifikasi</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "spp" && (
            <SppManagement />
          )}

          {activeTab === "ukt_candidates" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A] font-display">Pendaftar Ujian UKT</h2>
                <p className="text-gray-400 text-xs mt-1">Verifikasi kelayakan pendaftar ujian kenaikan tingkat berdasarkan kelengkapan berkas dokumen dinamis yang mereka unggah.</p>
              </div>

              {/* Candidates Ledger Table */}
              <div className="bg-white border border-[#0F172A]/5 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 font-bold uppercase border-b border-[#0F172A]/5">
                      <th className="p-4">Anggota</th>
                      <th className="p-4">Target Sabuk</th>
                      <th className="p-4">Syarat Dokumen</th>
                      <th className="p-4">Status Kelayakan</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingCandidates ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">Loading daftar pendaftar UKT...</td>
                      </tr>
                    ) : candidates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">Belum ada anggota yang mendaftar UKT.</td>
                      </tr>
                    ) : candidates.map((cand, idx) => {
                      const docs = cand.uploadedDocs || {};
                      const docKeys = Object.keys(docs);
                      
                      return (
                        <tr key={idx} className="border-b border-[#0F172A]/5 hover:bg-slate-50/50">
                          <td className="p-4">
                            <span className="font-extrabold text-[#0F172A] block">{cand.member?.fullName}</span>
                            <span className="text-[10px] text-gray-400">{cand.member?.memberNumber}</span>
                          </td>
                          <td className="p-4 font-bold text-[#E10600]">{cand.targetBelt}</td>
                          <td className="p-4 text-gray-500">
                            {docKeys.length === 0 ? (
                              <span className="text-red-500 font-bold">0 Dokumen Terunggah</span>
                            ) : (
                              <button 
                                onClick={() => setSelectedCandidate(cand)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold transition-all text-[10px]"
                              >
                                Lihat {docKeys.length} Dokumen Syarat
                              </button>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[9px] uppercase ${
                              cand.status === "APPROVED" 
                                ? "bg-green-50 text-green-600" 
                                : cand.status === "PENDING"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-600"
                            }`}>
                              {cand.status === "APPROVED" ? "LAYAK" : cand.status === "PENDING" ? "VERIFIKASI BERKAS" : "DITOLAK"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {cand.status === "PENDING" ? (
                              <div className="flex justify-end gap-1.5">
                                <button 
                                  onClick={() => handleVerifyCandidate(cand.id, true)}
                                  className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-all"
                                  title="Approve Eligibility"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleVerifyCandidate(cand.id, false)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-[#E10600] rounded-lg transition-all"
                                  title="Reject Eligibility"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-[10px] font-bold">Telah Diverifikasi</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A] font-display">Dashboard Analytics</h2>
                <p className="text-gray-400 text-xs mt-1">Pantau perkembangan anggota, pelatih, dan statistik kelulusan ujian dojang.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {isStatsLoading ? (
                  <div className="col-span-4 text-center py-10 text-gray-500 font-bold">Memuat statistik real-time...</div>
                ) : (
                  [
                    { label: "Total Anggota", val: dashboardStats?.totalAnggota.toString() || "0", desc: "Member Aktif", color: "text-[#0F172A]" },
                    { label: "Pelatih Aktif", val: dashboardStats?.totalPelatih.toString() || "0", desc: "Total Coach", color: "text-[#E10600]" },
                    { label: "Tingkat Kelulusan", val: `${dashboardStats?.passRate || 0}%`, desc: "Semua Partisipan UKT", color: "text-green-600" },
                    { label: "Biaya Registrasi", val: `Rp ${(dashboardStats?.registrationFee || 150000).toLocaleString("id-ID")}`, desc: "Pengaturan Aktif", color: "text-[#0F172A]" }
                  ].map((s, idx) => (
                    <div key={idx} className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">{s.label}</span>
                      <span className={`text-3xl font-black block mt-2 ${s.color}`}>{s.val}</span>
                      <span className="text-gray-400 text-[10px] block mt-1">{s.desc}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Charts Panel */}
              <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm">
                <h3 className="font-bold text-sm text-[#0F172A] mb-6">Grafik Pendaftaran &amp; Kelulusan UKT (Semester I)</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="Anggota" fill="#0F172A" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="LulusUKT" fill="#E10600" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A] font-display">Manajemen User &amp; Peran</h2>
                  <p className="text-gray-400 text-xs mt-1">Kelola data otentikasi serta role-based access control (RBAC) dojang.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#E10600] hover:bg-[#C00500] text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Tambah User
                </button>
              </div>

              {/* Search filter block */}
              <div className="bg-white border border-[#0F172A]/5 p-4 rounded-xl flex gap-3">
                <div className="relative flex-grow">
                  <input 
                    type="text" 
                    placeholder="Cari berdasarkan nama atau email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#0F172A]/5 rounded-lg pl-9 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-[#0F172A]/5 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 font-bold uppercase border-b border-[#0F172A]/5">
                      <th className="p-4">ID</th>
                      <th className="p-4">Nama</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Peran (Role)</th>
                      <th className="p-4">Sabuk (Belt)</th>
                      <th className="p-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingUsers ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">Loading data user...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">Tidak ada user ditemukan.</td>
                      </tr>
                    ) : users
                      .filter(u => 
                        u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        u.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((u, idx) => (
                        <tr key={idx} className="border-b border-[#0F172A]/5 hover:bg-slate-50/50">
                          <td className="p-4 font-mono font-bold text-gray-400">{u.id}</td>
                          <td className="p-4 font-bold text-[#0F172A]">{u.name}</td>
                          <td className="p-4 text-gray-600">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-wider ${
                              u.role === "ADMIN" 
                                ? "bg-red-50 text-[#E10600]" 
                                : u.role === "COACH" 
                                ? "bg-blue-50 text-blue-600" 
                                : "bg-slate-100 text-gray-600"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4">
                            {u.role === "MEMBER" ? (
                              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                                {u.currentBelt || "Sabuk Putih (10 Geup)"}
                              </span>
                            ) : (
                              <span className="text-gray-400 font-bold">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleEditUser(u)}
                              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                            >
                              <Edit className="w-3 h-3 text-[#E10600]" />
                              Sesuaikan Sabuk / Edit
                            </button>
                            {u.certDocUrl && (
                              <a href={u.certDocUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors mt-2" title="Lihat Sertifikat">
                                <FileText className="w-4 h-4" />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A] font-display">Agenda Kegiatan &amp; Berita</h2>
                  <p className="text-gray-400 text-xs mt-1">Buat, sunting, dan hapus pengumuman/agenda kegiatan untuk dihalaman utama.</p>
                </div>
                <button 
                  onClick={() => handleOpenArticleModal()}
                  className="bg-[#E10600] hover:bg-[#C00500] text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Tambah Agenda
                </button>
              </div>

              {/* Grid of Articles */}
              {isLoadingArticles ? (
                <div className="text-center py-12 text-gray-400 text-xs">Memuat daftar berita...</div>
              ) : articles.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-gray-400 text-xs">
                  Belum ada agenda kegiatan yang diterbitkan. Klik "Tambah Agenda" di atas.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map((art) => (
                    <div key={art.id} className="bg-white border border-[#0F172A]/5 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                      <div>
                        {art.imageUrl && (
                          <div className="h-44 w-full overflow-hidden">
                            <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold mb-2">
                            <span>Oleh: {art.author}</span>
                            <span>{new Date(art.createdAt).toLocaleDateString("id-ID")}</span>
                          </div>
                          <h3 className="font-extrabold text-base text-[#0F172A] mb-2">{art.title}</h3>
                          <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 whitespace-pre-wrap">{art.content}</p>
                        </div>
                      </div>

                      <div className="p-6 pt-0 border-t border-[#0F172A]/5 flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => handleOpenArticleModal(art)}
                          className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all"
                          title="Sunting"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(art.id)}
                          className="p-2 border border-red-100 rounded-lg text-[#E10600] hover:bg-red-50 transition-all"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "tournaments" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A] font-display">Kalender Kejuaraan</h2>
                  <p className="text-gray-400 text-xs mt-1">Kelola jadwal turnamen dan kejuaraan untuk member.</p>
                </div>
                <button 
                  onClick={() => setShowTournamentModal(true)}
                  className="bg-[#E10600] hover:bg-[#C00500] text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Tambah Kejuaraan
                </button>
              </div>

              {/* Grid of Tournaments */}
              {isLoadingTournaments ? (
                <div className="text-center py-12 text-gray-400 text-xs">Memuat daftar kejuaraan...</div>
              ) : tournaments.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-gray-400 text-xs">
                  Belum ada jadwal kejuaraan yang ditambahkan. Klik "Tambah Kejuaraan" di atas.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tournaments.map((tour) => (
                    <div key={tour.id} className="bg-white border border-[#0F172A]/5 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                      <div>
                        {tour.posterUrl && (
                          <div className="w-full h-40 bg-slate-100 relative">
                            <img src={tour.posterUrl} alt="Poster" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#E10600] bg-red-50 px-2 py-0.5 rounded-full mb-2 inline-block">
                            {tour.level}
                          </span>
                          <h3 className="font-black text-[#0F172A] leading-tight mb-2">{tour.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <MapPin className="w-3.5 h-3.5" /> {tour.location}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                            <Calendar className="w-3.5 h-3.5" /> 
                            {new Date(tour.startDate).toLocaleDateString("id-ID")} - {new Date(tour.endDate).toLocaleDateString("id-ID")}
                          </div>
                          
                          <div className="flex gap-2">
                            {tour.proposalUrl && (
                              <a href={tour.proposalUrl} target="_blank" className="flex-1 bg-slate-100 text-[#0F172A] text-[10px] font-bold text-center py-2 rounded-lg hover:bg-slate-200">
                                Proposal
                              </a>
                            )}
                            {tour.link && (
                              <a href={tour.link} target="_blank" className="flex-1 bg-slate-100 text-[#0F172A] text-[10px] font-bold text-center py-2 rounded-lg hover:bg-slate-200">
                                Info Lain
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-between">
                        <span className="text-[10px] font-bold text-gray-400">
                          Status: <span className="text-green-600">{tour.status}</span>
                        </span>
                        <button 
                          onClick={() => handleDeleteTournament(tour.id)}
                          className="text-[#E10600] hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "coaches" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A] font-display">Manajemen Profil Pelatih</h2>
                <p className="text-gray-400 text-xs mt-1">Lengkapi informasi tingkatan Dan rank, spesialisasi, dan jam terbang pelatih dojang.</p>
              </div>

              {isLoadingCoaches ? (
                <div className="text-center py-12 text-gray-400 text-xs">Memuat data pelatih...</div>
              ) : coaches.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-gray-400 text-xs">
                  Belum ada pelatih yang terdaftar dalam sistem (Tambahkan user dengan peran COACH terlebih dahulu).
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {coaches.map((coach) => (
                    <div key={coach.id} className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        {/* Avatar — foto atau initials */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#0F172A]/5 mb-4 flex-shrink-0">
                          {(coach as any).photoUrl ? (
                            <img
                              src={(coach as any).photoUrl}
                              alt={coach.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">
                              {coach.fullName.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <h3 className="font-extrabold text-base text-[#0F172A]">{coach.fullName}</h3>
                        <span className="text-[10px] text-gray-400 block font-bold mt-1 uppercase tracking-wider">{coach.user?.email}</span>
                        
                        <div className="mt-4 flex flex-col gap-2 border-t border-[#0F172A]/5 pt-4 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Dan Rank:</span>
                            <span className="font-bold text-[#0F172A]">{coach.danRank}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Spesialisasi:</span>
                            <span className="font-bold text-[#0F172A]">{coach.specialty}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Pengalaman:</span>
                            <span className="font-bold text-[#0F172A]">{coach.experience}</span>
                          </div>
                          {/* Badge sertifikat */}
                          {(coach as any).certDocUrl && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                              <span className="text-[10px] text-green-600 font-semibold">Sertifikat Tersedia</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenCoachModal(coach)}
                        className="w-full mt-6 bg-[#0F172A]/5 hover:bg-[#0F172A]/10 text-[#0F172A] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" /> Lengkapi Profil
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "curriculum" && (
            <div className="flex flex-col gap-6 animate-fade-in pb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-[#0F172A] font-display">Curriculum Builder</h1>
                  <p className="text-sm text-gray-500 mt-1">Susun materi dan kategori pembelajaran untuk setiap tingkatan sabuk secara terstruktur.</p>
                </div>
              </div>
              <CurriculumBuilder />
            </div>
          )}

          {activeTab === "exercises" && (
            <div className="flex flex-col gap-6 animate-fade-in pb-12 h-[80vh]">
              <iframe 
                src="/coach/quests" 
                className="w-full h-full border border-slate-200 rounded-2xl shadow-sm bg-white"
                title="Daily Quests Builder"
              />
            </div>
          )}

          {activeTab === "belt_requirements" && (
            <div className="flex flex-col gap-6 animate-fade-in pb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-[#0F172A] font-display">Syarat Ujian (Belt Requirements)</h1>
                  <p className="text-sm text-gray-500 mt-1">Konfigurasi batas minimal kehadiran, nilai teknik, poomsae, dan fisik untuk kenaikan sabuk.</p>
                </div>
              </div>
              <BeltRequirementBuilder />
            </div>
          )}

          {activeTab === "schedules" && (
            <div className="flex flex-col gap-6 animate-fade-in pb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-[#0F172A] font-display">Pengaturan Jadwal Latihan</h1>
                  <p className="text-sm text-gray-500 mt-1">Kelola jadwal kelas latihan yang akan ditampilkan pada sistem.</p>
                </div>
                <button 
                  onClick={() => handleOpenScheduleModal()} 
                  className="bg-[#E10600] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#E10600]/20 flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" /> Tambah Jadwal
                </button>
              </div>

              {isLoadingSchedules ? (
                <div className="text-center py-20 text-gray-500 font-bold text-sm">Memuat data jadwal...</div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#0F172A]/5 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#F8FAFC] border-b border-[#0F172A]/5 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="px-6 py-4 font-extrabold tracking-wider">Hari & Waktu</th>
                          <th className="px-6 py-4 font-extrabold tracking-wider">Kelas</th>
                          <th className="px-6 py-4 font-extrabold tracking-wider">Pelatih</th>
                          <th className="px-6 py-4 font-extrabold tracking-wider">Lokasi</th>
                          <th className="px-6 py-4 font-extrabold tracking-wider text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#0F172A]/5">
                        {schedules.map((schedule) => (
                          <tr key={schedule.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-bold text-[#0F172A] block">{schedule.dayOfWeek}</span>
                              <span className="text-xs text-gray-500">{schedule.startTime} - {schedule.endTime}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-[#0F172A]">{schedule.className}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#E10600]" />
                                <div>
                                  <span className="font-semibold text-[#0F172A] block">{schedule.coach?.fullName}</span>
                                  <span className="text-[10px] text-gray-500">{schedule.coach?.danRank}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-600">{schedule.location}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleOpenScheduleModal(schedule)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteSchedule(schedule.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {schedules.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                              Belum ada jadwal yang ditambahkan.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="flex flex-col gap-6 animate-fade-in pb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-[#0F172A] font-display">Manajemen Prestasi</h1>
                  <p className="text-sm text-gray-500 mt-1">Kelola data prestasi member untuk ditampilkan di Galeri Prestasi (Hall of Fame).</p>
                </div>
                <button 
                  onClick={() => handleOpenAchievementModal()} 
                  className="bg-[#E10600] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#E10600]/20 flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" /> Tambah Prestasi
                </button>
              </div>

              {isLoadingAchievements ? (
                <div className="text-center py-20 text-gray-500 font-bold text-sm">Memuat data prestasi...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((ach) => (
                    <div key={ach.id} className="relative bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-[#0F172A]/20 flex flex-col group transition-all duration-300 hover:shadow-2xl hover:border-yellow-500/30">
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${
                          ach.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          ach.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {ach.status === 'APPROVED' ? 'Disetujui' : ach.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                        </span>
                      </div>

                      {/* Photo/Certificate Area */}
                      <div className="h-48 relative bg-slate-900 w-full overflow-hidden flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent z-10" />
                        {ach.photoUrl || ach.certificateUrl ? (
                          <img 
                            src={ach.photoUrl || ach.certificateUrl || ""} 
                            alt="Prestasi" 
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-30">
                            <Award className="w-16 h-16 text-yellow-500" />
                          </div>
                        )}
                        
                        {/* Member Overlay */}
                        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
                          {ach.member?.selfieUrl ? (
                            <img src={ach.member.selfieUrl} alt="Member" className="w-12 h-12 rounded-full object-cover border-2 border-[#0F172A] shadow-md" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-[#0F172A] flex items-center justify-center shadow-md">
                              <User className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-extrabold text-sm text-white drop-shadow-md">{ach.member?.fullName}</h3>
                            <span className="text-[10px] font-bold text-slate-300 drop-shadow-md">{ach.member?.currentBelt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <h4 className="font-bold text-yellow-400 text-base leading-tight mb-1">{ach.title}</h4>
                            <p className="text-xs text-slate-400">{ach.eventName}</p>
                          </div>
                          {ach.rank === "Emas" && <Award className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] flex-shrink-0" />}
                          {ach.rank === "Perak" && <Award className="w-8 h-8 text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)] flex-shrink-0" />}
                          {ach.rank === "Perunggu" && <Award className="w-8 h-8 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)] flex-shrink-0" />}
                          {ach.rank === "Peserta Terbaik" && <Sparkles className="w-8 h-8 text-yellow-400 flex-shrink-0" />}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 mt-auto mb-5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(ach.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-auto">
                          <div className="flex gap-2">
                            {ach.status === 'PENDING' && (
                              <>
                                <button onClick={() => handleUpdateAchievementStatus(ach.id, 'APPROVED')} className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-xl transition-colors" title="Setujui">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleUpdateAchievementStatus(ach.id, 'REJECTED')} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors" title="Tolak">
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {ach.certificateUrl && (
                              <a href={ach.certificateUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors" title="Lihat Bukti">
                                <FileText className="w-4 h-4" />
                              </a>
                            )}
                            <button onClick={() => handleOpenAchievementModal(ach)} className="p-2 bg-slate-800 text-blue-400 hover:bg-slate-700 rounded-xl transition-colors" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteAchievement(ach.id)} className="p-2 bg-slate-800 text-red-400 hover:bg-slate-700 rounded-xl transition-colors" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {achievements.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
                      <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="font-bold text-slate-600">Belum ada prestasi</h3>
                      <p className="text-sm text-slate-400 mt-1">Data prestasi yang ditambahkan akan muncul di sini.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A] font-display">Pengaturan Aplikasi Dojang</h2>
                <p className="text-gray-400 text-xs mt-1">Ubah metadata dojang, logo, visual background hero, motto, dan biaya pendaftaran.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="flex flex-col gap-8">
                {/* Branding Assets Panel */}
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm flex flex-col gap-6">
                  <h3 className="font-extrabold text-sm text-[#0F172A] border-b border-[#0F172A]/5 pb-3">Aset Visual Landing Page</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Logo upload */}
                    <div className="flex flex-col gap-3">
                      <label className="block text-xs font-bold text-[#0F172A] uppercase">Logo Dojang</label>
                      <div className="border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-4 text-center bg-slate-50/50">
                        {settings.logoUrl ? (
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-100 bg-white flex items-center justify-center">
                            <img src={settings.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-gray-400">
                            No Logo
                          </div>
                        )}
                        <div>
                          <label className="bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-slate-500" /> Unggah Logo
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "logo")} />
                          </label>
                          <p className="text-[10px] text-gray-400 mt-1">Disarankan berformat PNG transparan</p>
                        </div>
                      </div>
                    </div>

                    {/* Hero BG upload */}
                    <div className="flex flex-col gap-3">
                      <label className="block text-xs font-bold text-[#0F172A] uppercase">Background Landing Page Hero</label>
                      <div className="border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-4 text-center bg-slate-50/50">
                        {settings.heroBgUrl ? (
                          <div className="h-20 w-full rounded-xl overflow-hidden border border-slate-100 bg-white">
                            <img src={settings.heroBgUrl} alt="Hero BG Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-20 w-full rounded-xl bg-slate-100 flex items-center justify-center text-gray-400 text-xs">
                            Gambar Latar Belakang Bawaan
                          </div>
                        )}
                        <div>
                          <label className="bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-slate-500" /> Unggah Background
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "heroBg")} />
                          </label>
                          <p className="text-[10px] text-gray-400 mt-1">Disarankan beresolusi tinggi (min 1920x1080)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Website Intro Toggle */}
                  <div className="border-t border-[#0F172A]/5 pt-6 mt-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-[#0F172A] uppercase">Animasi Intro Website</h4>
                      <p className="text-gray-400 text-[10px] mt-0.5">Tampilkan animasi pembuka harimau sinematik saat pertama kali website diakses.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={settings.showIntro !== false} 
                        onChange={(e) => setSettings(prev => ({ ...prev, showIntro: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#E10600]/30 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E10600]"></div>
                    </label>
                  </div>
                </div>

                {/* Geofencing Settings Panel */}
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm flex flex-col gap-6">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F172A] border-b border-[#0F172A]/5 pb-3">Pengaturan Lokasi Latihan (Geofencing)</h3>
                    <p className="text-gray-400 text-xs mt-1">Tentukan titik pusat lokasi latihan (Dojang) dan batas radius absensi siswa. Siswa tidak dapat melakukan absensi jika berada di luar radius ini.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Latitude</label>
                      <input 
                        type="number" 
                        step="any"
                        placeholder="Contoh: -6.2088"
                        value={settings.dojangLat ?? ""}
                        onChange={(e) => setSettings({ ...settings, dojangLat: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Longitude</label>
                      <input 
                        type="number" 
                        step="any"
                        placeholder="Contoh: 106.8456"
                        value={settings.dojangLng ?? ""}
                        onChange={(e) => setSettings({ ...settings, dojangLng: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Radius (Meter)</label>
                      <input 
                        type="number" 
                        placeholder="Contoh: 50"
                        value={settings.dojangRadius ?? 50}
                        onChange={(e) => setSettings({ ...settings, dojangRadius: e.target.value ? parseInt(e.target.value) : 50 })}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-xs text-blue-900 font-medium">Tips Mendapatkan Koordinat:</p>
                      <p className="text-[11px] text-blue-700 mt-0.5">Buka Google Maps, klik kanan pada lokasi Dojang, lalu klik angka koordinat (contoh: -6.2088, 106.8456) untuk menyalinnya. Angka pertama adalah Latitude, kedua adalah Longitude.</p>
                    </div>
                  </div>
                </div>

                {/* UKT Requirements Settings Panel */}
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm flex flex-col gap-6">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F172A] border-b border-[#0F172A]/5 pb-3">Syarat Dokumen UKT (Dinamis)</h3>
                    <p className="text-gray-400 text-xs mt-1">Kelola daftar dokumen yang wajib diunggah oleh anggota saat mendaftar ujian kenaikan tingkat.</p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      {(settings.uktRequirements || ["Surat Izin Orang Tua", "Foto Selfie 3x4"]).map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#F8FAFC] border border-[#0F172A]/5 px-3 py-2 rounded-xl text-xs font-bold text-[#0F172A]">
                          <span>{req}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(idx)}
                            className="text-[#E10600] hover:text-red-700 font-extrabold ml-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Contoh: Akte Kelahiran"
                        id="newUktReqInput"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddRequirement();
                          }
                        }}
                        className="bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                      <button
                        type="button"
                        onClick={handleAddRequirement}
                        className="bg-[#0F172A] hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Tambah Syarat
                      </button>
                    </div>
                  </div>
                </div>

                {/* Text Metadata Panel */}
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm flex flex-col gap-6">
                  <h3 className="font-extrabold text-sm text-[#0F172A] border-b border-[#0F172A]/5 pb-3">Informasi &amp; Teks Landing Page</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Nama Dojang</label>
                      <input 
                        type="text" 
                        value={settings.dojangName}
                        onChange={(e) => setSettings({ ...settings, dojangName: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Motto / Slogan</label>
                      <input 
                        type="text" 
                        value={settings.motto}
                        onChange={(e) => setSettings({ ...settings, motto: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Hero Title (Judul Besar Halaman Utama)</label>
                      <input 
                        type="text" 
                        value={settings.heroTitle}
                        onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Deskripsi Singkat</label>
                      <textarea 
                        value={settings.description}
                        rows={3}
                        onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600] resize-none"
                      />
                    </div>

                    <div className="md:col-span-2 bg-[#F8FAFC] border border-[#0F172A]/5 p-6 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-xs text-[#0F172A] block">Tarif &amp; Biaya Keuangan</span>
                        <span className="text-[10px] text-gray-400">Semua pengaturan iuran bulanan, pendaftaran, dan biaya UKT telah dipindahkan ke menu utama Administrasi Keuangan.</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setActiveTab("payments")}
                        className="bg-[#0F172A] hover:bg-black text-white px-4 py-2 rounded-lg font-bold text-[10px] transition-all cursor-pointer"
                      >
                        Buka Menu Keuangan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contact Info Panel */}
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-8 shadow-sm flex flex-col gap-6">
                  <h3 className="font-extrabold text-sm text-[#0F172A] border-b border-[#0F172A]/5 pb-3">Informasi Kontak &amp; Alamat</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Email Hubungi Kami</label>
                      <input 
                        type="email" 
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Telpon Hubungi Kami</label>
                      <input 
                        type="text" 
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Alamat Dojang Lengkap</label>
                      <input 
                        type="text" 
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                      />
                    </div>
                  </div>
                </div>

                {/* Form submit button */}
                <div className="flex justify-end gap-3">
                  <button 
                    type="submit" 
                    disabled={isSavingSettings}
                    className="bg-[#E10600] hover:bg-[#C00500] disabled:opacity-50 text-white px-8 py-4 rounded-[12px] font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    {isSavingSettings ? "Menyimpan..." : "Simpan Pengaturan Aplikasi"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Dynamic Requirements Review Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-[#E10600] font-bold uppercase tracking-wider block">Inspektur Berkas UKT</span>
                <h3 className="text-xl font-black text-[#0F172A] font-display mt-0.5">{selectedCandidate.member?.fullName}</h3>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Dokumen Syarat Terunggah</span>
              
              <div className="flex flex-col gap-3">
                {Object.keys(selectedCandidate.uploadedDocs || {}).map((docName) => {
                  const fileData = selectedCandidate.uploadedDocs[docName];
                  
                  return (
                    <div key={docName} className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex flex-col gap-2">
                      <span className="font-extrabold text-xs text-[#0F172A]">{docName}</span>
                      
                      {fileData.startsWith("data:image/") ? (
                        <div className="mt-2 w-full max-h-48 rounded-lg overflow-hidden border border-slate-200/50 bg-white flex items-center justify-center">
                          <img src={fileData} alt={docName} className="max-w-full max-h-48 object-contain" />
                        </div>
                      ) : (
                        <a 
                          href={fileData} 
                          download={`${docName}-${selectedCandidate.member?.fullName}`}
                          className="mt-2 text-xs font-bold text-[#E10600] hover:underline flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" /> Unduh Dokumen ({docName})
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedCandidate.status === "PENDING" && (
              <div className="flex gap-3 border-t pt-4 mt-2">
                <button 
                  onClick={() => handleVerifyCandidate(selectedCandidate.id, false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-gray-600 py-3 rounded-xl font-bold text-xs"
                >
                  Tolak Berkas
                </button>
                <button 
                  onClick={() => handleVerifyCandidate(selectedCandidate.id, true)}
                  className="w-full bg-[#E10600] text-white py-3 rounded-xl font-bold text-xs shadow-md"
                >
                  Setujui Kelayakan Ujian
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl border border-slate-100 flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] font-display">Tambah User Baru</h3>
              <p className="text-gray-400 text-xs">Daftarkan akun anggota atau pelatih baru ke sistem dojang.</p>
            </div>

            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              {newUserError && (
                <div className="bg-red-50 text-[#E10600] p-3 rounded-xl text-xs font-semibold border border-red-100 flex items-center gap-2">
                  <Shield size={14} />
                  <span>{newUserError}</span>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Nama Lengkap <span className="text-[#E10600]">*</span></label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    autoFocus
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Masukkan nama lengkap" 
                    className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl pl-10 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Username <span className="text-[#E10600]">*</span></label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">@</div>
                  <input 
                    type="text" 
                    required
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    placeholder="Masukkan username" 
                    className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Password <span className="text-[#E10600]">*</span></label>
                <div className="relative">
                  <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type={showNewUserPassword ? "text" : "password"}
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Masukkan password" 
                    className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl pl-10 pr-10 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A]"
                  >
                    {showNewUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Tanggal Lahir <span className="text-[#E10600]">*</span></label>
                <input 
                  type="date" 
                  required
                  value={newUserBirthDate}
                  onChange={(e) => setNewUserBirthDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmittingNewUser}
                  className="w-full bg-slate-100 text-gray-500 py-3 rounded-xl font-bold text-xs disabled:opacity-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingNewUser}
                  className="w-full bg-[#E10600] text-white py-3 rounded-xl font-bold text-xs shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSubmittingNewUser ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Daftarkan User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl border border-slate-100 flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] font-display">Sesuaikan Detail User / Sabuk</h3>
              <p className="text-gray-400 text-xs">Ubah data anggota, pelatih, atau sesuaikan tingkatan sabuk member.</p>
            </div>

            <form onSubmit={handleUpdateUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  placeholder="Nama Lengkap" 
                  className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Alamat Email</label>
                <input 
                  type="email" 
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  placeholder="Email" 
                  className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Password Baru (Opsional)</label>
                <input 
                  type="password" 
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin diubah" 
                  className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Peran Sistem (Role)</label>
                <select 
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value)}
                  className="w-full bg-white border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                >
                  <option value="MEMBER">Anggota (Member)</option>
                  <option value="COACH">Pelatih (Coach)</option>
                  <option value="ADMIN">Super Admin (Administrator)</option>
                </select>
              </div>

              {editUserRole === "MEMBER" && (
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Tingkatan Sabuk / Geup</label>
                  <select 
                    value={editUserBelt}
                    onChange={(e) => setEditUserBelt(e.target.value)}
                    className="w-full bg-white border border-[#E10600] rounded-xl px-4 py-3 text-xs outline-none font-bold text-[#E10600] focus:ring-2 focus:ring-[#E10600]"
                  >
                    {[
                      "Sabuk Putih (10 Geup)",
                      "Sabuk Kuning (9 Geup)",
                      "Kuning Strip Hijau (8 Geup)",
                      "Sabuk Hijau (7 Geup)",
                      "Hijau Strip Biru (6 Geup)",
                      "Sabuk Biru (5 Geup)",
                      "Biru Strip Merah (4 Geup)",
                      "Sabuk Merah (3 Geup)",
                      "Merah Strip Hitam 1 (2 Geup)",
                      "Merah Strip Hitam 2 (1 Geup)",
                      "Sabuk Hitam (1 Dan)"
                    ].map((belt) => (
                      <option key={belt} value={belt}>{belt}</option>
                    ))}
                    {editUserBelt && ![
                      "Sabuk Putih (10 Geup)",
                      "Sabuk Kuning (9 Geup)",
                      "Kuning Strip Hijau (8 Geup)",
                      "Sabuk Hijau (7 Geup)",
                      "Hijau Strip Biru (6 Geup)",
                      "Sabuk Biru (5 Geup)",
                      "Biru Strip Merah (4 Geup)",
                      "Sabuk Merah (3 Geup)",
                      "Merah Strip Hitam 1 (2 Geup)",
                      "Merah Strip Hitam 2 (1 Geup)",
                      "Sabuk Hitam (1 Dan)"
                    ].includes(editUserBelt) && (
                      <option value={editUserBelt}>{editUserBelt}</option>
                    )}
                  </select>
                </div>
              )}

              {(editUserRole === "MEMBER" || editUserRole === "COACH") && (
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5 flex items-center justify-between">
                    <span>Sertifikat (Opsional/UKT)</span>
                    {editCertDocUrl && (
                      <span className="text-[9px] text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded-md">Terlampir</span>
                    )}
                  </label>
                  
                  {editCertDocUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-slate-200">
                      {editCertDocUrl.startsWith("data:image") ? (
                        <img 
                          src={editCertDocUrl} 
                          alt="Sertifikat" 
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                          <FileText className="w-8 h-8 mb-2" />
                          <span className="text-xs font-bold">Dokumen PDF/Lainnya</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button
                          type="button"
                          onClick={() => setEditCertDocUrl(null)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
                          title="Hapus Dokumen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 border-slate-300 hover:bg-slate-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-6 h-6 mb-2 text-slate-400" />
                          <p className="mb-1 text-xs text-slate-500 font-bold"><span className="font-semibold">Klik untuk upload</span></p>
                          <p className="text-[10px] text-slate-400">SVG, PNG, JPG or PDF</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const url = e.target?.result as string;
                              if (url) setEditCertDocUrl(url);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditUserModal(false);
                    setEditingUser(null);
                  }}
                  className="w-full bg-slate-100 text-gray-500 py-3 rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="w-full bg-[#E10600] text-white py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Catat Pembayaran Manual Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl border border-slate-100 flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] font-display">Catat Pembayaran Manual</h3>
              <p className="text-gray-400 text-xs">Catat iuran tunai SPP, uang pertemuan, atau UKT secara langsung di kasir.</p>
            </div>

            <form onSubmit={handleCreateManualPayment} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Pilih Anggota</label>
                <select 
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                  className="w-full bg-white border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                >
                  <option value="">-- Pilih Anggota --</option>
                  {users.filter(u => u.role === "MEMBER").map(u => (
                    <option key={u.id} value={u.memberId || ""}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Tujuan Pembayaran</label>
                <select 
                  value={paymentPurpose}
                  onChange={(e) => setPaymentPurpose(e.target.value)}
                  className="w-full bg-white border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                >
                  <option value="SPP Bulanan">SPP Bulanan</option>
                  <option value="Iuran Pertemuan">Iuran Pertemuan (Harian)</option>
                  <option value="Pendaftaran UKT">Pendaftaran UKT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Jumlah Pembayaran (Rp)</label>
                <input 
                  type="number" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Contoh: 100000"
                  required
                  className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Status Pembayaran</label>
                <select 
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full bg-white border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                >
                  <option value="COMPLETED">LUNAS (Completed)</option>
                  <option value="PENDING">PENDING (Menunggu Verifikasi)</option>
                </select>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddPaymentModal(false)}
                  className="w-full bg-slate-100 text-gray-500 py-3 rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="w-full bg-[#E10600] text-white py-3 rounded-xl font-bold text-xs shadow-md"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit/Add Article (Event/Agenda) Modal */}
      {showArticleModal && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-8 transition-all">
          <div className="bg-white rounded-[24px] w-full max-w-3xl shadow-2xl shadow-[#E10600]/10 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] p-8 relative flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-white font-display tracking-tight">
                  {editingArticle ? "Sunting Agenda" : "Tambah Agenda Baru"}
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Publikasikan berita, pengumuman, atau dokumentasi kegiatan dojang.
                </p>
              </div>
              <button 
                onClick={() => setShowArticleModal(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto max-h-[75vh]">
              <form onSubmit={handleSaveArticle} className="flex flex-col gap-6">
                <div>
                  <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-widest mb-2">Judul Publikasi</label>
                  <input 
                    type="text" 
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    placeholder="Contoh: Kejuaraan Taekwondo Nasional 2025" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-[#0F172A] placeholder:font-normal outline-none focus:bg-white focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-widest mb-2">Penulis / Sumber</label>
                    <input 
                      type="text" 
                      value={articleAuthor}
                      onChange={(e) => setArticleAuthor(e.target.value)}
                      placeholder="Nama Pelatih / Admin" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-[#0F172A] placeholder:font-normal outline-none focus:bg-white focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-widest mb-2">Foto Sampul Resolusi Tinggi</label>
                    <div className="relative group w-full">
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="article-image-upload"
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await uploadToServer(file, file.name);
                            if (url) setArticleImage(url);
                          }
                        }} 
                      />
                      <label 
                        htmlFor="article-image-upload"
                        className={`w-full flex items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden relative ${
                          articleImage 
                            ? "border-transparent h-[50px] md:h-[50px]" 
                            : "border-slate-300 bg-slate-50 hover:bg-[#E10600]/5 hover:border-[#E10600] h-[50px] md:h-[50px]"
                        }`}
                      >
                        {articleImage ? (
                          <div className="absolute inset-0 flex items-center justify-between px-4 bg-slate-100 border border-slate-200">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <img src={articleImage} alt="Cover" className="w-8 h-8 rounded object-cover shadow-sm" />
                              <span className="text-xs font-bold text-[#0F172A] truncate">Foto Terpilih</span>
                            </div>
                            <div className="bg-white px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-500 shadow-sm whitespace-nowrap">Ganti Foto</div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-500 group-hover:text-[#E10600] transition-colors">
                            <Upload className="w-4 h-4" />
                            <span className="text-xs font-bold">Klik untuk Unggah Gambar</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-[#0F172A] uppercase tracking-widest mb-2">Detail Konten / Berita Lengkap</label>
                  <textarea 
                    value={articleContent}
                    rows={10}
                    onChange={(e) => setArticleContent(e.target.value)}
                    placeholder="Tuliskan detail agenda secara lengkap. Gunakan enter untuk memisahkan paragraf agar mudah dibaca..." 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium text-[#0F172A] placeholder:font-normal outline-none focus:bg-white focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/10 transition-all resize-none leading-relaxed"
                  />
                </div>

                <div className="flex gap-4 mt-2 pt-6 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setShowArticleModal(false)}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-colors"
                  >
                    Batalkan
                  </button>
                  <button 
                    type="submit" 
                    className="w-2/3 bg-gradient-to-r from-[#E10600] to-[#C00500] hover:from-[#C00500] hover:to-[#A00400] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#E10600]/25 transition-all transform hover:-translate-y-0.5"
                  >
                    {editingArticle ? "Simpan Perubahan" : "Terbitkan Agenda Sekarang"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Coach Profile Modal */}
      {showCoachModal && editingCoach && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] font-display">Lengkapi Profil Pelatih</h3>
              <p className="text-gray-400 text-xs">Ubah detail kualifikasi untuk {editingCoach.fullName}.</p>
            </div>

            <form onSubmit={handleSaveCoach} className="flex flex-col gap-5">

              {/* ── Upload Foto Profil ── */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#0F172A] uppercase">Foto Profil Pelatih</label>
                <div className="flex items-center gap-5">
                  {/* Preview */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#0F172A]/10 bg-slate-50 flex items-center justify-center flex-shrink-0">
                    {coachPhotoUrl ? (
                      <img src={coachPhotoUrl} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-slate-300">
                        {editingCoach.fullName.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {/* Upload & Hapus */}
                  <div className="flex flex-col gap-2">
                    <label className="bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      {coachPhotoUrl ? "Ganti Foto" : "Unggah Foto"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadToServer(file, file.name);
                          if (url) setCoachPhotoUrl(url);
                        }}
                      />
                    </label>
                    {coachPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setCoachPhotoUrl(null)}
                        className="text-[10px] text-red-400 hover:text-red-600 font-bold text-left"
                      >
                        Hapus Foto
                      </button>
                    )}
                    <span className="text-[9px] text-gray-400">JPG / PNG, maks 2MB</span>
                  </div>
                </div>
              </div>

              {/* ── Data Kualifikasi ── */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={coachFullName}
                  onChange={(e) => setCoachFullName(e.target.value)}
                  required
                  className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Tingkatan Dan Rank</label>
                <input
                  type="text"
                  value={coachDanRank}
                  onChange={(e) => setCoachDanRank(e.target.value)}
                  placeholder="Contoh: Dan 4 Kukkiwon"
                  required
                  className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Spesialisasi Latihan</label>
                <input
                  type="text"
                  value={coachSpecialty}
                  onChange={(e) => setCoachSpecialty(e.target.value)}
                  placeholder="Contoh: Kyorugi & Poomsae"
                  required
                  className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Pengalaman Mengajar</label>
                <input
                  type="text"
                  value={coachExperience}
                  onChange={(e) => setCoachExperience(e.target.value)}
                  placeholder="Contoh: 10+ Tahun"
                  required
                  className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                />
              </div>

              {/* ── Upload Dokumen Sertifikat ── */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#0F172A] uppercase">Dokumen Sertifikat / Lisensi</label>
                <p className="text-[10px] text-gray-400">Sertifikat Kukkiwon, KTA, atau lisensi pelatih resmi.</p>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 bg-[#F8FAFC] flex flex-col items-center gap-3">
                  {coachCertDocUrl ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      {coachCertDocUrl.startsWith("data:image") ? (
                        <img
                          src={coachCertDocUrl}
                          alt="Sertifikat"
                          className="max-h-32 rounded-xl object-contain border border-slate-100"
                        />
                      ) : (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-3 rounded-xl w-full">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs font-bold text-green-700">Dokumen Tersimpan</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setCoachCertDocUrl(null)}
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
                        Pilih Dokumen
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadToServer(file, file.name);
                            if (url) setCoachCertDocUrl(url);
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
                  onClick={() => setShowCoachModal(false)}
                  className="w-full bg-slate-100 text-gray-500 py-3 rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingCoach}
                  className="w-full bg-[#E10600] text-white py-3 rounded-xl font-bold text-xs shadow-md disabled:opacity-60 transition-all"
                >
                  {isSavingCoach ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-white">
            <div className="p-6 border-b border-[#0F172A]/5 flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="font-extrabold text-[#0F172A] text-lg font-display">
                {editingSchedule ? "Edit Jadwal Latihan" : "Tambah Jadwal Baru"}
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSchedule} className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Hari</label>
                  <select
                    required
                    value={schedDay}
                    onChange={e => setSchedDay(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none bg-[#F8FAFC]"
                  >
                    {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Pelatih</label>
                  <select
                    required
                    value={schedCoachId}
                    onChange={e => setSchedCoachId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none bg-[#F8FAFC]"
                  >
                    <option value="" disabled>Pilih Pelatih</option>
                    {coaches.map(c => (
                      <option key={c.id} value={c.id}>{c.fullName} - {c.danRank}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={schedStartTime}
                    onChange={e => setSchedStartTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none bg-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={schedEndTime}
                    onChange={e => setSchedEndTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none bg-[#F8FAFC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Nama Kelas</label>
                <input
                  type="text"
                  required
                  value={schedClass}
                  onChange={e => setSchedClass(e.target.value)}
                  placeholder="e.g. Kelas Pemula (Kids), Poomsae Lanjutan"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Lokasi</label>
                <input
                  type="text"
                  required
                  value={schedLoc}
                  onChange={e => setSchedLoc(e.target.value)}
                  placeholder="e.g. Dojang Pusat Lt. 1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none bg-[#F8FAFC]"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingSchedule}
                className="w-full bg-[#E10600] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl mt-2 transition-all disabled:opacity-50"
              >
                {isSavingSchedule ? "Menyimpan..." : "Simpan Jadwal"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Achievement Form Modal */}
      {showAchievementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-white">
            <div className="p-6 border-b border-[#0F172A]/5 flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="font-extrabold text-[#0F172A] text-lg font-display">
                {editingAchievement ? "Edit Prestasi Member" : "Tambah Prestasi Baru"}
              </h3>
              <button onClick={() => setShowAchievementModal(false)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAchievement} className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Pilih Member</label>
                <select
                  required
                  value={achMemberId}
                  onChange={e => setAchMemberId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none bg-[#F8FAFC]"
                >
                  <option value="" disabled>Pilih Member Berprestasi</option>
                  {users.filter(u => u.role === "MEMBER" && u.memberId).map((u) => (
                    <option key={u.id} value={u.memberId || ""}>{u.name || u.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Judul Prestasi</label>
                <input
                  type="text"
                  required
                  value={achTitle}
                  onChange={e => setAchTitle(e.target.value)}
                  placeholder="e.g. Juara 1 Kyorugi Putra U-45"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none bg-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Nama Kejuaraan / Event</label>
                <input
                  type="text"
                  required
                  value={achEventName}
                  onChange={e => setAchEventName(e.target.value)}
                  placeholder="e.g. Kejurda DKI Jakarta 2024"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none bg-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Tanggal Prestasi</label>
                  <input
                    type="date"
                    required
                    value={achDate}
                    onChange={e => setAchDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none bg-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Peringkat / Medali</label>
                  <select
                    required
                    value={achRank}
                    onChange={e => setAchRank(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none bg-[#F8FAFC]"
                  >
                    <option value="Emas">🥇 Emas / Juara 1</option>
                    <option value="Perak">🥈 Perak / Juara 2</option>
                    <option value="Perunggu">🥉 Perunggu / Juara 3</option>
                    <option value="Peserta Terbaik">🌟 Peserta Terbaik</option>
                  </select>
                </div>
              </div>

              {/* Upload Foto Medali/Prestasi */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#0F172A] uppercase">Foto Dokumentasi (Opsional)</label>
                <p className="text-[10px] text-gray-400">Pajang foto sang juara dengan medalinya.</p>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 bg-[#F8FAFC] flex flex-col items-center gap-3">
                  {achPhotoUrl ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <img src={achPhotoUrl} alt="Foto Prestasi" className="max-h-32 rounded-xl object-contain border border-slate-100" />
                      <button type="button" onClick={() => setAchPhotoUrl(null)} className="text-[10px] text-red-400 hover:text-red-600 font-bold">
                        Hapus Foto
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Award className="w-8 h-8 text-slate-300" />
                      <label className="bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        Pilih Foto
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadToServer(file, file.name);
                            if (url) setAchPhotoUrl(url);
                          }}
                        />
                      </label>
                      <span className="text-[9px] text-gray-400">JPG atau PNG · Maks 2MB</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingAchievement}
                className="w-full bg-[#E10600] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl mt-2 transition-all disabled:opacity-50"
              >
                {isSavingAchievement ? "Menyimpan..." : "Simpan Prestasi"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB: PENGUMUMAN (ANNOUNCEMENT BROADCAST) ── */}
      {activeTab === "announcements" && (
        <AnnouncementPanel />
      )}

      {/* ── TAB: SLIDER HERO ── */}
      {activeTab === "hero_slides" && (
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-3xl font-black text-[#0F172A] font-display">Slider Hero — Wajah Para Juara</h2>
            <p className="text-gray-400 text-xs mt-1">Kelola foto atlet berprestasi yang tampil di layar perkenalan website (setelah intro animasi).</p>
          </div>

          {/* Upload Form */}
          <div className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-[#0F172A] mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E10600]" /> Tambah Slide Baru
            </h3>
            <form onSubmit={handleAddSlide} className="flex flex-col gap-4">
              {/* Image Upload */}
              <div className="border-2 border-dashed border-[#0F172A]/10 rounded-xl p-4 flex flex-col items-center gap-3 bg-[#F8FAFC]">
                {slideImageUrl ? (
                  <div className="relative w-full">
                    <img src={slideImageUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                    <button type="button" onClick={() => setSlideImageUrl(null)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer w-full py-4">
                    <Upload className="w-8 h-8 text-gray-300" />
                    <span className="text-xs font-bold text-gray-500">Klik untuk upload foto juara</span>
                    <span className="text-[10px] text-gray-400">JPG, PNG · Rekomendasi rasio 3:4 (portrait)</span>
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadToServer(file, file.name);
                      if (url) setSlideImageUrl(url);
                      else alert("Gagal upload gambar");
                    }} />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Nama / Caption</label>
                  <input type="text" value={slideCaption} onChange={e => setSlideCaption(e.target.value)} placeholder="e.g. Juara Nasional Kyorugi Putra" className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Keterangan Prestasi</label>
                  <input type="text" value={slideSubtext} onChange={e => setSlideSubtext(e.target.value)} placeholder="e.g. Medali Emas · Kejurnas 2025" className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Urutan Tampil</label>
                  <input type="number" value={slideOrder} onChange={e => setSlideOrder(e.target.value)} min="0" className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]" />
                </div>
              </div>

              <button type="submit" disabled={isSavingSlide || !slideImageUrl} className="bg-[#E10600] hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                {isSavingSlide ? "Menyimpan..." : "Tambahkan ke Slider"}
              </button>
            </form>
          </div>

          {/* Existing Slides Grid */}
          <div className="bg-white border border-[#0F172A]/5 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-[#0F172A] mb-4">Slide Aktif ({heroSlides.length})</h3>
            {isLoadingSlides ? (
              <div className="text-center py-8 text-gray-400 text-xs">Memuat slides...</div>
            ) : heroSlides.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs border-2 border-dashed rounded-xl">Belum ada slide. Tambahkan foto juara di atas.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {heroSlides.map((slide) => (
                  <div key={slide.id} className="relative rounded-2xl overflow-hidden border border-[#0F172A]/5 shadow-sm group">
                    <img src={slide.imageUrl} alt={slide.caption || ""} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      {slide.caption && <p className="text-white font-bold text-xs leading-tight">{slide.caption}</p>}
                      {slide.subtext && <p className="text-yellow-400 text-[10px] mt-0.5">{slide.subtext}</p>}
                      <p className="text-white/50 text-[9px] mt-1">Urutan: #{slide.order}</p>
                    </div>
                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <button
                        onClick={() => handleToggleSlide(slide.id, slide.isActive)}
                        className={`text-[9px] font-black px-2 py-1 rounded-full transition-all ${slide.isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}
                      >
                        {slide.isActive ? "AKTIF" : "NONAKTIF"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingSlide(slide);
                          setEditCaption(slide.caption || "");
                          setEditSubtext(slide.subtext || "");
                          setEditOrder(String(slide.order || 0));
                          setEditImageUrl(slide.imageUrl);
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-white rounded-full p-1 transition-all"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="bg-red-500 text-white rounded-full p-1 hover:bg-red-700 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Slide Modal */}
          {editingSlide && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="font-extrabold text-lg text-[#0F172A]">Edit Slide Juara</h3>
                  <button 
                    onClick={() => setEditingSlide(null)}
                    className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleUpdateSlide} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Foto Juara (Slide)</label>
                    <div className="relative border-2 border-dashed border-[#0F172A]/10 rounded-xl p-4 flex flex-col items-center justify-center bg-[#F8FAFC]">
                      {editImageUrl ? (
                        <div className="relative w-full">
                          <img src={editImageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                          <button 
                            type="button" 
                            onClick={() => setEditImageUrl(null)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-xs font-bold text-gray-500">Upload Gambar</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const url = await uploadToServer(file, file.name);
                              if (url) setEditImageUrl(url);
                              else alert("Gagal upload gambar");
                            }} 
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Nama / Caption</label>
                    <input 
                      type="text" 
                      value={editCaption} 
                      onChange={e => setEditCaption(e.target.value)} 
                      placeholder="e.g. Juara Nasional Kyorugi Putra" 
                      className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Keterangan Prestasi</label>
                    <input 
                      type="text" 
                      value={editSubtext} 
                      onChange={e => setEditSubtext(e.target.value)} 
                      placeholder="e.g. Medali Emas · Kejurnas 2025" 
                      className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Urutan Tampil</label>
                    <input 
                      type="number" 
                      value={editOrder} 
                      onChange={e => setEditOrder(e.target.value)} 
                      min="0" 
                      className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]" 
                    />
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button 
                      type="button" 
                      onClick={() => setEditingSlide(null)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      disabled={isUpdatingSlide || !editImageUrl}
                      className="flex-1 bg-[#E10600] hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs transition-all disabled:opacity-50"
                    >
                      {isUpdatingSlide ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gallery Panel */}
      {activeTab === "gallery" && (
        <div className="flex-grow p-8 h-full overflow-y-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Manajemen Galeri</h1>
              <p className="text-gray-500 text-sm mt-1">Kelola foto-foto yang tampil di halaman Galeri Aktivitas.</p>
            </div>
            <button 
              onClick={() => {
                setCurrentGalleryItem({ imageUrl: "", category: "LATIHAN", title: "" });
                setIsGalleryModalOpen(true);
              }}
              className="bg-[#E10600] hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Tambah Foto Galeri
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryItems.map((item: any) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group relative">
                <div className="aspect-[4/3] bg-slate-100 relative">
                  <img src={item.imageUrl} alt={item.title || "Gallery Item"} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <button 
                      onClick={() => handleDeleteGallery(item.id)}
                      className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100">
                  <span className="inline-block px-2.5 py-1 bg-slate-100 text-[#0F172A] rounded-md text-[9px] font-black uppercase tracking-wider mb-2">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-[#0F172A] text-sm line-clamp-2">{item.title || "Tanpa Judul"}</h3>
                  <p className="text-[10px] text-gray-400 mt-2">Ditambahkan: {new Date(item.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
              </div>
            ))}
            
            {galleryItems.length === 0 && (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#0F172A]">Belum ada foto galeri</h3>
                <p className="text-sm text-gray-500 mt-1">Klik tombol 'Tambah Foto Galeri' untuk mulai mengunggah.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="font-black text-[#0F172A] text-xl">Tambah Foto Galeri</h3>
                <p className="text-gray-400 text-xs mt-1">Unggah foto aktivitas dojang untuk landing page.</p>
              </div>
              <button onClick={() => setIsGalleryModalOpen(false)} className="text-gray-400 hover:text-[#0F172A] p-2 bg-white rounded-full shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSaveGallery} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Foto Aktivitas <span className="text-red-500">*</span></label>
                  <div className="w-full aspect-[4/3] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
                    {currentGalleryItem.imageUrl ? (
                      <div className="absolute inset-0">
                        <img src={currentGalleryItem.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            type="button" 
                            onClick={() => setCurrentGalleryItem({ ...currentGalleryItem, imageUrl: "" })}
                            className="bg-white/90 text-red-600 rounded-full p-2 shadow-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 hover:bg-slate-100 transition-colors">
                        <Upload className="w-8 h-8 text-gray-300 mb-2" />
                        <span className="text-xs font-bold text-gray-500">Klik untuk unggah foto</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadToServer(file, file.name);
                            if (url) {
                              setCurrentGalleryItem({ ...currentGalleryItem, imageUrl: url });
                            } else {
                              alert("Gagal unggah foto");
                            }
                          }} 
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Kategori <span className="text-red-500">*</span></label>
                  <select 
                    value={currentGalleryItem.category} 
                    onChange={e => setCurrentGalleryItem({ ...currentGalleryItem, category: e.target.value })} 
                    className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600] font-bold text-[#0F172A]"
                    required
                  >
                    <option value="LATIHAN">Latihan</option>
                    <option value="KEJUARAAN">Kejuaraan</option>
                    <option value="UKT">Ujian Kenaikan Tingkat (UKT)</option>
                    <option value="SEMINAR">Seminar / Diklat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Judul / Caption <span className="text-gray-400 font-normal">(Opsional)</span></label>
                  <input 
                    type="text" 
                    value={currentGalleryItem.title} 
                    onChange={e => setCurrentGalleryItem({ ...currentGalleryItem, title: e.target.value })} 
                    placeholder="e.g. Latihan Rutin Kelas Dewasa" 
                    className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600]" 
                  />
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsGalleryModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs transition-all">Batal</button>
                  <button type="submit" disabled={!currentGalleryItem.imageUrl} className="flex-1 bg-[#E10600] hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs transition-all disabled:opacity-50">Simpan Foto</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Tournament Modal */}
      {showTournamentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="font-black text-[#0F172A] text-xl">Tambah Kejuaraan</h3>
                <p className="text-gray-400 text-xs mt-1">Masukkan informasi jadwal dan detail turnamen.</p>
              </div>
              <button onClick={() => setShowTournamentModal(false)} className="text-gray-400 hover:text-[#0F172A] p-2 bg-white rounded-full shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="tournamentForm" onSubmit={handleSaveTournament} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#0F172A] mb-1.5 uppercase tracking-wider">Nama Kejuaraan *</label>
                  <input type="text" value={tournamentTitle} onChange={e => setTournamentTitle(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-[#0F172A] font-medium outline-none focus:ring-2 focus:ring-[#E10600]/20 focus:border-[#E10600] transition-all" placeholder="Contoh: Kejurda Taekwondo Jatim 2026" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#0F172A] mb-1.5 uppercase tracking-wider">Tingkat *</label>
                    <select value={tournamentLevel} onChange={e => setTournamentLevel(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-[#0F172A] font-medium outline-none focus:ring-2 focus:ring-[#E10600]/20 focus:border-[#E10600]">
                      <option value="Lokal">Lokal (Kab/Kota)</option>
                      <option value="Provinsi">Provinsi</option>
                      <option value="Nasional">Nasional</option>
                      <option value="Internasional">Internasional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#0F172A] mb-1.5 uppercase tracking-wider">Lokasi *</label>
                    <input type="text" value={tournamentLocation} onChange={e => setTournamentLocation(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-[#0F172A] font-medium outline-none" placeholder="Contoh: GOR Jayabaya" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#0F172A] mb-1.5 uppercase tracking-wider">Tanggal Mulai *</label>
                    <input type="date" value={tournamentStartDate} onChange={e => setTournamentStartDate(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-[#0F172A] font-medium outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#0F172A] mb-1.5 uppercase tracking-wider">Tanggal Selesai *</label>
                    <input type="date" value={tournamentEndDate} onChange={e => setTournamentEndDate(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-[#0F172A] font-medium outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#0F172A] mb-1.5 uppercase tracking-wider">Poster URL (Opsional)</label>
                  <input type="url" value={tournamentPosterUrl || ""} onChange={e => setTournamentPosterUrl(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-[#0F172A] font-medium outline-none" placeholder="https://.../poster.jpg" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#0F172A] mb-1.5 uppercase tracking-wider">Proposal PDF URL (Opsional)</label>
                    <input type="url" value={tournamentProposalUrl || ""} onChange={e => setTournamentProposalUrl(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-[#0F172A] font-medium outline-none" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#0F172A] mb-1.5 uppercase tracking-wider">Link Info (Opsional)</label>
                    <input type="url" value={tournamentLink} onChange={e => setTournamentLink(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-[#0F172A] font-medium outline-none" placeholder="https://..." />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button 
                type="submit" 
                form="tournamentForm"
                disabled={isSavingTournament}
                className="w-full bg-[#E10600] hover:bg-[#C00500] text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-[#E10600]/25 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSavingTournament ? "Menyimpan..." : "Simpan Kejuaraan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
