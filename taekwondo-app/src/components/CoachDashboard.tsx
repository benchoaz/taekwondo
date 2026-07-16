"use client";

import React, { useState, useEffect } from "react";
import { 
  Award, 
  Calendar, 
  FileCheck, 
  Plus, 
  Users, 
  TrendingUp, 
  Check, 
  AlertCircle,
  FileText,
  Clock,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Save,
  Send,
  ChevronRight,
  Shield,
  Star,
  MapPin,
  UserCheck,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  QrCode,
  FileBadge,
  Activity,
  Eye,
  EyeOff,
  DollarSign
} from "lucide-react";

export default function CoachDashboard({ 
  userEmail,
  onBack 
}: { 
  userEmail?: string;
  onBack: () => void 
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");

  // States for Quest monitoring
  const [questLogs, setQuestLogs] = useState<any[]>([]);
  const [isLoadingQuests, setIsLoadingQuests] = useState(false);
  const [questFilterCompleted, setQuestFilterCompleted] = useState("false");

  // States for Add Member form modal
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberUsername, setNewMemberUsername] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("password123");
  const [newMemberBirthDate, setNewMemberBirthDate] = useState("");
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  // States for Coach Profile Edit
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // States for Announcement form
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceMessage, setAnnounceMessage] = useState("");
  const [announceSendWA, setAnnounceSendWA] = useState(false);
  const [isSubmittingAnnounce, setIsSubmittingAnnounce] = useState(false);

  // Belt order for sorting
  const beltOrder = [
    "Sabuk Putih", "Sabuk Kuning", "Kuning Strip Hijau",
    "Sabuk Hijau", "Hijau Strip Biru", "Sabuk Biru",
    "Biru Strip Merah", "Sabuk Merah", "Merah Strip Hitam 1",
    "Merah Strip Hitam 2", "Sabuk Hitam"
  ];

  const getBeltColor = (belt: string) => {
    const b = belt?.toLowerCase() || "";
    if (b.includes("hitam")) return { bg: "bg-zinc-900", text: "text-white", dot: "bg-zinc-800" };
    if (b.includes("merah strip hitam") || b.includes("merah strip")) return { bg: "bg-red-900", text: "text-white", dot: "bg-red-800" };
    if (b.includes("merah")) return { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-400" };
    if (b.includes("biru strip") || b.includes("biru strip merah")) return { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400" };
    if (b.includes("biru")) return { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400" };
    if (b.includes("hijau strip") || b.includes("hijau strip biru")) return { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-400" };
    if (b.includes("hijau")) return { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-400" };
    if (b.includes("kuning strip") || b.includes("kuning strip hijau")) return { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-400" };
    if (b.includes("kuning")) return { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-400" };
    return { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" };
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const me = coaches.find((c: any) => c.user?.email.toLowerCase() === userEmail?.toLowerCase());
    if (!me || !me.userId) return;

    if (editPassword && editPassword !== editConfirmPassword) {
      alert("Konfirmasi password baru tidak cocok.");
      return;
    }
    if (editPassword && editPassword.length < 8) {
      alert("Password minimal harus 8 karakter.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${me.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          ...(editPassword && { password: editPassword }),
          role: "COACH",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCoaches(prev => prev.map((c: any) => c.id === me.id ? {
          ...c,
          fullName: editName,
          user: { ...c.user, email: editEmail }
        } : c));
        setShowEditProfileModal(false);
        alert("Profil pelatih berhasil diperbarui!");
      } else {
        alert(data.error || "Gagal memperbarui profil");
      }
    } catch (err: any) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch UKT candidates
      const resCandidates = await fetch("/api/ukt/candidates");
      if (resCandidates.ok) {
        const data = await resCandidates.json();
        const formatted = data.map((cand: any) => ({
          dbId: cand.id,
          id: cand.member?.memberNumber || cand.id,
          name: cand.member?.fullName || "Anggota",
          currentBelt: cand.member?.currentBelt || "Sabuk Putih (10 Geup)",
          targetBelt: cand.targetBelt,
          status: cand.status,
          poomsae: cand.poomsaeScore || 0,
          kyorugi: cand.kyorugiScore || 0,
          basics: cand.basicTechScore || 0,
          physical: cand.physicalScore || 0,
          theory: cand.theoryScore || 0,
          finalScore: cand.finalScore || 0
        }));
        setCandidates(formatted);
        if (formatted.length > 0) setSelectedCandidate(formatted[0]);
      }

      // Fetch all members
      const resMembers = await fetch("/api/users");
      if (resMembers.ok) {
        const users = await resMembers.json();
        setAllMembers(users.filter((u: any) => u.role === "MEMBER" || u.memberId));
      }

      // Fetch schedules
      const resSchedules = await fetch("/api/schedules");
      if (resSchedules.ok) {
        const schData = await resSchedules.json();
        setSchedules(Array.isArray(schData) ? schData : []);
      }

      // Fetch payments
      const resPayments = await fetch("/api/payments");
      if (resPayments.ok) {
        const payData = await resPayments.json();
        setPayments(Array.isArray(payData) ? payData : []);
      }

      // Fetch coaches
      const resCoaches = await fetch("/api/coaches");
      if (resCoaches.ok) {
        const coachData = await resCoaches.json();
        setCoaches(Array.isArray(coachData) ? coachData : []);
      }
    } catch (err) {
      console.error("Error fetching coach data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestLogs = async () => {
    setIsLoadingQuests(true);
    try {
      const url = `/api/coach/quest-logs?completed=${questFilterCompleted}`;
      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setQuestLogs(result.data || []);
      }
    } catch (e) {
      console.error("Error fetching quest logs:", e);
    } finally {
      setIsLoadingQuests(false);
    }
  };

  const handleQuestApproval = async (logId: string, action: "APPROVE" | "REJECT") => {
    const notes = prompt(action === "APPROVE" ? "Catatan persetujuan (opsional):" : "Masukkan alasan penolakan (wajib):");
    if (action === "REJECT" && notes === null) return;
    if (action === "REJECT" && !notes?.trim()) {
      alert("Alasan penolakan wajib diisi.");
      return;
    }

    try {
      const res = await fetch("/api/coach/quest-logs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId, action, notes })
      });
      const result = await res.json();
      if (res.ok) {
        alert(action === "APPROVE" ? "✅ Misi disetujui, reward telah dikirim ke siswa!" : "❌ Misi ditolak.");
        fetchQuestLogs();
      } else {
        alert(result.error || "Gagal memproses approval.");
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menghubungi server.");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (activeTab === "quests") {
      fetchQuestLogs();
    }
  }, [activeTab, questFilterCompleted]);

  const handleScoreChange = (field: string, val: number) => {
    setSelectedCandidate((prev: any) => ({ ...prev, [field]: val }));
  };

  const calculatedScore = selectedCandidate
    ? (selectedCandidate.poomsae * 0.3) +
      (selectedCandidate.kyorugi * 0.3) +
      (selectedCandidate.basics * 0.2) +
      (selectedCandidate.physical * 0.1) +
      (selectedCandidate.theory * 0.1)
    : 0;

  const handleSelectCandidate = (cand: any) => {
    setSelectedCandidate({ ...cand, poomsae: cand.poomsae || 0, kyorugi: cand.kyorugi || 0, basics: cand.basics || 0, physical: cand.physical || 0, theory: cand.theory || 0 });
  };

  const handleSubmitGrading = async (status: "APPROVED" | "FAILED") => {
    if (!selectedCandidate) return;
    try {
      const finalScore = (selectedCandidate.poomsae * 0.3) + (selectedCandidate.kyorugi * 0.3) + (selectedCandidate.basics * 0.2) + (selectedCandidate.physical * 0.1) + (selectedCandidate.theory * 0.1);
      const res = await fetch("/api/ukt/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCandidate.dbId,
          status,
          poomsaeScore: selectedCandidate.poomsae,
          kyorugiScore: selectedCandidate.kyorugi,
          basicTechScore: selectedCandidate.basics,
          physicalScore: selectedCandidate.physical,
          theoryScore: selectedCandidate.theory,
          finalScore,
        }),
      });
      if (res.ok) {
        alert(status === "APPROVED" ? "✅ Selamat! Peserta LULUS dan sabuk otomatis diperbarui!" : "Evaluasi disimpan. Peserta perlu remedial.");
        fetchAllData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Gagal menyimpan penilaian.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ══════════════ PRINT CERTIFICATE FUNCTION ══════════════
  const printCertificate = async (cand: any) => {
    // Fetch dojang name from settings
    let dojangName = "Taekwondo Academy";
    let dojangShort = "TKD";
    try {
      const sRes = await fetch("/api/settings");
      if (sRes.ok) {
        const s = await sRes.json();
        if (s.dojangName) {
          dojangName = s.dojangName;
          // Create short abbreviation from first letters of each word
          dojangShort = s.dojangName.split(" ").filter((w: string) => w.length > 2).map((w: string) => w[0]).join("").substring(0, 4).toUpperCase();
        }
      }
    } catch (e) { console.error(e); }

    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const numPart = cand.id.replace(/[^0-9]/g, "").slice(-4).padStart(4, "0");
    const certNo = `CERT-${dojangShort}-${now.getFullYear()}-${numPart}`;
    const qrData = encodeURIComponent(`${window.location.origin}/verify/${certNo}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;

    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Sertifikat UKT — ${cand.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 297mm; height: 210mm; }
    body {
      font-family: 'Inter', sans-serif;
      background: #fff;
      display: flex; align-items: center; justify-content: center;
    }
    .cert {
      width: 285mm; height: 200mm;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
      border: 6px solid #ca8a04;
      border-radius: 4mm;
      position: relative;
      overflow: hidden;
      padding: 12mm 14mm;
      display: flex; flex-direction: column; justify-content: space-between;
      box-shadow: inset 0 0 60px rgba(202,138,4,0.08);
    }
    /* Outer decorative frame */
    .cert::before {
      content: '';
      position: absolute; inset: 3mm;
      border: 1.5px solid rgba(202,138,4,0.35);
      border-radius: 2.5mm;
      pointer-events: none;
    }
    /* Watermark background */
    .watermark {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      font-family: 'Cinzel', serif;
      font-size: 72pt;
      font-weight: 700;
      color: rgba(202,138,4,0.04);
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
      letter-spacing: 8px;
    }
    /* Corner ornaments */
    .corner {
      position: absolute;
      width: 18mm; height: 18mm;
      border-color: #ca8a04;
      border-style: solid;
      opacity: 0.5;
    }
    .corner-tl { top: 5mm; left: 5mm; border-width: 2px 0 0 2px; border-radius: 1mm 0 0 0; }
    .corner-tr { top: 5mm; right: 5mm; border-width: 2px 2px 0 0; border-radius: 0 1mm 0 0; }
    .corner-bl { bottom: 5mm; left: 5mm; border-width: 0 0 2px 2px; border-radius: 0 0 0 1mm; }
    .corner-br { bottom: 5mm; right: 5mm; border-width: 0 2px 2px 0; border-radius: 0 0 1mm 0; }

    .content { position: relative; z-index: 1; }

    /* HEADER */
    .header {
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid rgba(202,138,4,0.3);
      padding-bottom: 5mm; margin-bottom: 5mm;
    }
    .org-left { display: flex; align-items: center; gap: 4mm; }
    .logo-circle {
      width: 16mm; height: 16mm;
      background: linear-gradient(135deg, #e10600, #ca8a04);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Cinzel', serif;
      font-weight: 700; font-size: 7pt; color: white; text-align: center;
      letter-spacing: 0.5px; line-height: 1.1;
      flex-shrink: 0;
    }
    .org-name {
      font-family: 'Cinzel', serif;
      font-size: 8pt; font-weight: 700;
      color: #ca8a04; letter-spacing: 1px;
      text-transform: uppercase;
    }
    .org-sub { font-size: 6.5pt; color: rgba(255,255,255,0.5); margin-top: 1mm; font-weight: 400; }
    .cert-type-badge {
      background: linear-gradient(135deg, #e10600, #9f0500);
      color: white; padding: 2mm 5mm;
      border-radius: 1mm;
      font-size: 6.5pt; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase;
      text-align: center;
    }
    .cert-type-badge span { display: block; font-size: 5pt; opacity: 0.8; margin-top: 0.5mm; font-weight: 400; }

    /* BODY */
    .body { display: flex; gap: 8mm; align-items: flex-start; }
    .body-main { flex: 1; }
    .body-side { width: 46mm; flex-shrink: 0; }

    .awarded-to {
      font-size: 6pt; color: rgba(255,255,255,0.45);
      letter-spacing: 3px; text-transform: uppercase;
      margin-bottom: 1.5mm;
    }
    .recipient-name {
      font-family: 'Cinzel', serif;
      font-size: 22pt; font-weight: 700;
      color: white;
      letter-spacing: 1px;
      line-height: 1.1;
      margin-bottom: 3mm;
    }
    .description {
      font-size: 7pt; color: rgba(255,255,255,0.6);
      line-height: 1.7; max-width: 140mm;
      margin-bottom: 4mm;
    }
    .description strong { color: #fbbf24; font-weight: 600; }

    .gold-divider {
      width: 30mm; height: 1px;
      background: linear-gradient(to right, #ca8a04, transparent);
      margin-bottom: 4mm;
    }

    /* Details grid */
    .details-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      gap: 3mm 5mm;
    }
    .detail-item {}
    .detail-label {
      font-size: 5.5pt; color: rgba(255,255,255,0.35);
      text-transform: uppercase; letter-spacing: 1px;
      display: block; margin-bottom: 0.5mm;
    }
    .detail-value {
      font-size: 7.5pt; color: rgba(255,255,255,0.85);
      font-weight: 600;
    }
    .detail-value.gold { color: #fbbf24; }
    .detail-value.green { color: #4ade80; font-size: 9pt; }

    /* SIDE PANEL */
    .belt-badge {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(202,138,4,0.2);
      border-radius: 2mm;
      padding: 4mm;
      text-align: center;
      margin-bottom: 3mm;
    }
    .belt-rank-label {
      font-size: 5.5pt; color: rgba(202,138,4,0.7);
      text-transform: uppercase; letter-spacing: 1.5px;
      display: block; margin-bottom: 2mm;
    }
    .belt-rank-value {
      font-family: 'Cinzel', serif;
      font-size: 10pt; font-weight: 700; color: #ca8a04;
      line-height: 1.2;
    }
    .belt-rank-sub {
      font-size: 6pt; color: rgba(255,255,255,0.4);
      display: block; margin-top: 1mm;
    }
    .score-circle {
      width: 18mm; height: 18mm;
      border: 2px solid rgba(74,222,128,0.4);
      border-radius: 50%;
      margin: 0 auto 2mm;
      display: flex; align-items: center; justify-content: center;
      flex-direction: column;
    }
    .score-val { font-size: 9pt; font-weight: 700; color: #4ade80; }
    .score-lbl { font-size: 4.5pt; color: rgba(255,255,255,0.35); text-transform: uppercase; }
    .qr-box {
      background: white;
      border-radius: 1.5mm;
      padding: 2mm;
      display: inline-block;
      margin-bottom: 1.5mm;
    }
    .qr-label { font-size: 5pt; color: rgba(255,255,255,0.3); text-align: center; display: block; }

    /* FOOTER */
    .footer {
      border-top: 1px solid rgba(202,138,4,0.2);
      padding-top: 4mm;
      display: flex; justify-content: space-between; align-items: flex-end;
    }
    .sig-block { text-align: center; min-width: 40mm; }
    .sig-line {
      width: 35mm; height: 1px;
      background: rgba(255,255,255,0.2);
      margin: 6mm auto 1.5mm;
    }
    .sig-name { font-size: 7pt; color: white; font-weight: 600; }
    .sig-title { font-size: 5.5pt; color: rgba(255,255,255,0.4); margin-top: 0.5mm; }
    .cert-number {
      font-size: 5.5pt; font-family: 'Courier New', monospace;
      color: rgba(202,138,4,0.5);
      letter-spacing: 0.5px;
    }
    .validity {
      font-size: 5pt; color: rgba(255,255,255,0.25);
      text-align: center; margin-top: 1mm;
    }

    @media print {
      @page { size: A4 landscape; margin: 0; }
      html, body { width: 297mm; height: 210mm; }
      .cert { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="cert">
    <div class="watermark">TAEKWONDO</div>
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <!-- HEADER -->
    <div class="content header">
      <div class="org-left">
        <div class="logo-circle">${dojangShort}</div>
        <div>
          <div class="org-name">${dojangName}</div>
          <div class="org-sub">Dojang Pusat &middot; Terdaftar di bawah PBTI / World Taekwondo</div>
        </div>
      </div>
      <div class="cert-type-badge">
        Sertifikat Ujian Kenaikan Tingkat
        <span>Certificate of Rank Promotion · Geup Examination</span>
      </div>
    </div>

    <!-- BODY -->
    <div class="content body">
      <div class="body-main">
        <div class="awarded-to">Diberikan Kepada &nbsp;/&nbsp; Awarded To</div>
        <div class="recipient-name">${cand.name}</div>
        <div class="gold-divider"></div>
        <p class="description">
          Telah berhasil mengikuti dan dinyatakan <strong>LULUS</strong> dalam
          Ujian Kenaikan Tingkat (UKT) sesuai standar <strong>Kukkiwon / PBTI</strong>
          dengan nilai memenuhi batas kelulusan minimum.
        </p>
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">No. Anggota</span>
            <span class="detail-value">${cand.id}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Dojang</span>
            <span class="detail-value">${dojangName}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tanggal Ujian</span>
            <span class="detail-value">${dateStr}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Dari Tingkatan</span>
            <span class="detail-value">${cand.currentBelt?.split(" (")[0] || "—"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tingkat yang Diraih</span>
            <span class="detail-value gold">${cand.targetBelt?.split(" (")[0] || "—"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Nilai Akhir</span>
            <span class="detail-value green">${cand.finalScore?.toFixed(1)} / 100</span>
          </div>
        </div>
      </div>

      <!-- SIDE -->
      <div class="body-side" style="text-align:center;">
        <div class="belt-badge">
          <span class="belt-rank-label">Tingkat yang Dicapai</span>
          <div class="score-circle">
            <span class="score-val">${cand.finalScore?.toFixed(1)}</span>
            <span class="score-lbl">Nilai</span>
          </div>
          <div class="belt-rank-value">${cand.targetBelt?.split(" (")[0] || ""}</div>
          <span class="belt-rank-sub">LULUS · PASSED</span>
        </div>
        <div style="text-align:center;">
          <div class="qr-box">
            <img src="${qrUrl}" width="80" height="80" alt="QR Verifikasi" />
          </div>
          <span class="qr-label">Scan untuk verifikasi keaslian</span>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="content footer">
      <div>
        <div class="cert-number">No. Sertifikat: ${certNo}</div>
        <div class="validity">Sertifikat ini diterbitkan secara resmi oleh ${dojangName}</div>
        <div class="validity">dan dapat diverifikasi melalui sistem database dojang.</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Master Ahmad</div>
        <div class="sig-title">Penguji Utama · 6th Dan (Kukkiwon)</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Ketua Pengurus Dojang</div>
        <div class="sig-title">${dojangName}</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Saksi / Sekretaris</div>
        <div class="sig-title">Ujian Kenaikan Tingkat</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 600);
    };
  <\/script>
</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=1120,height=800");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      alert("Pop-up diblokir browser. Izinkan pop-up untuk mencetak sertifikat.");
    }
  };

  // QR verification popup
  const showQRVerification = (cand: any) => {
    const certNo = `CERT-ETA-${new Date().getFullYear()}-${cand.id.replace(/[^0-9]/g, "").slice(-4).padStart(4, "0")}`;
    const qrData = encodeURIComponent(`${window.location.origin}/verify/${certNo}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
    const w = window.open("", "_blank", "width=360,height=480");
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><title>QR Verifikasi</title><style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:white;gap:12px;padding:24px}h3{font-size:14px;color:#fbbf24;text-align:center}p{font-size:11px;color:rgba(255,255,255,0.5);text-align:center}code{font-size:10px;color:#94a3b8;word-break:break-all;text-align:center}</style></head><body><h3>QR Verifikasi Sertifikat</h3><img src='${qrUrl}' width='200' height='200' style='border-radius:8px;background:white;padding:8px'/><p>${cand.name}<br/><b style='color:#4ade80'>${cand.targetBelt}</b></p><p>No. Sertifikat:</p><code>${certNo}</code><p style='font-size:10px'>Scan QR ini untuk memverifikasi<br/>keaslian sertifikat secara online.</p></body></html>`);
      w.document.close();
    }
  };

  // --- Derived Stats ---
  const totalMembers = allMembers.length;
  const approvedCount = candidates.filter(c => c.status === "APPROVED").length;
  const pendingCount = candidates.filter(c => c.status === "PENDING").length;
  const failedCount = candidates.filter(c => c.status === "FAILED").length;
  const pendingPayments = payments.filter(p => p.status === "PENDING");
  const completedPayments = payments.filter(p => p.status === "COMPLETED");
  const beltDistribution = beltOrder.map(belt => ({
    belt,
    count: allMembers.filter(m => (m.currentBelt || "").startsWith(belt.split(" (")[0])).length
  })).filter(b => b.count > 0);

  // Sidebar nav items
  const navItems = [
    { id: "dashboard", label: "Ringkasan", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "members", label: "Data Siswa", icon: <Users className="w-4 h-4" /> },
    { id: "grading", label: "Penilaian UKT", icon: <Calendar className="w-4 h-4" /> },
    { id: "history", label: "Progres Sabuk", icon: <Award className="w-4 h-4" /> },
    { id: "quests", label: "Misi Atlet", icon: <Activity className="w-4 h-4" /> },
    { id: "quest_builder", label: "Kelola Quest", icon: <Award className="w-4 h-4" /> },
    { id: "curriculum_builder", label: "Kurikulum Builder", icon: <FileText className="w-4 h-4" /> },
    { id: "finance", label: "Keuangan & SPP", icon: <DollarSign className="w-4 h-4" /> },
    { id: "schedule", label: "Jadwal Latihan", icon: <Clock className="w-4 h-4" /> },
    { id: "certificates", label: "Sertifikat", icon: <FileText className="w-4 h-4" /> },
    { id: "announcements", label: "Buat Pengumuman", icon: <Send className="w-4 h-4" /> },
  ];

  const dayOrder = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];
  const sortedSchedules = [...schedules].sort((a,b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-[#0F172A]/5 p-6 flex flex-col justify-between shrink-0">
          <div className="flex flex-col gap-8">
            {/* Coach Identity */}
            {(() => {
              const currentCoach = coaches.find((c: any) => c.user?.email.toLowerCase() === userEmail?.toLowerCase());
              const displayName = currentCoach ? currentCoach.fullName : "Master Ahmad S.B.";
              const displayRank = currentCoach ? currentCoach.danRank : "6th Dan · Sabeum Nim";
              const displayPhoto = currentCoach?.photoUrl || "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=150&q=80";

              return (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#E10600] shrink-0">
                    <img src={displayPhoto} alt={displayName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#0F172A] leading-none">{displayName}</h3>
                    <span className="text-[10px] text-[#E10600] font-bold block mt-1 uppercase tracking-wider">{displayRank}</span>
                  </div>
                </div>
              );
            })()}

            {/* Nav */}
            <div className="flex flex-col gap-1.5">
              {navItems.map((tab) => (
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
              onClick={() => { setActiveTab("grading"); }}
              className="w-full bg-[#E10600] hover:bg-[#C00500] text-white py-3.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 text-center mb-4 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Mulai Penilaian UKT
            </button>
            <button 
              onClick={() => {
                const me = coaches.find((c: any) => c.user?.email.toLowerCase() === userEmail?.toLowerCase());
                if (me) {
                  setEditName(me.fullName);
                  setEditEmail(me.user?.email || "");
                  setEditPassword("");
                  setEditConfirmPassword("");
                  setShowEditProfileModal(true);
                } else {
                  alert("Data pelatih tidak ditemukan!");
                }
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:text-[#0F172A] font-bold text-xs text-left cursor-pointer transition-all hover:bg-slate-50 rounded-xl"
             >
               <Settings className="w-4 h-4" /> Edit Profil
             </button>
            <button onClick={onBack} className="flex items-center gap-3 px-4 py-2.5 text-[#E10600] hover:bg-red-50 font-bold text-xs text-left rounded-xl transition-all">
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-6 sm:p-10 w-full">
          
          {/* ══════════════ TAB: DASHBOARD ══════════════ */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-8">
              <div>
                <span className="text-[#E10600] font-bold text-xs uppercase tracking-wider">Selamat Datang</span>
                <h2 className="text-3xl font-black text-[#0F172A] mt-1">Ringkasan Dojang</h2>
                <p className="text-gray-400 text-xs mt-1">Pantau kondisi seluruh siswa dan aktivitas latihan hari ini.</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Siswa Aktif", value: totalMembers, icon: <Users className="w-5 h-5" />, color: "blue", sub: "terdaftar di sistem" },
                  { label: "Antrian UKT", value: pendingCount, icon: <AlertCircle className="w-5 h-5" />, color: "amber", sub: "menunggu penilaian" },
                  { label: "Lulus UKT", value: approvedCount, icon: <CheckCircle className="w-5 h-5" />, color: "green", sub: "bulan ini" },
                  { label: "Tagihan Pending", value: pendingPayments.length, icon: <AlertTriangle className="w-5 h-5" />, color: "red", sub: "belum diverifikasi" },
                ].map((card, idx) => (
                  <div key={idx} className="bg-white border border-[#0F172A]/5 rounded-2xl p-5 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      card.color === "blue" ? "bg-blue-50 text-blue-600" :
                      card.color === "amber" ? "bg-amber-50 text-amber-600" :
                      card.color === "green" ? "bg-green-50 text-green-600" : "bg-red-50 text-[#E10600]"
                    }`}>
                      {card.icon}
                    </div>
                    <span className="text-2xl font-black text-[#0F172A] block">{isLoading ? "—" : card.value}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">{card.label}</span>
                    <span className="text-[9px] text-gray-300 block mt-1">{card.sub}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Belt Distribution */}
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-black text-sm text-[#0F172A]">Distribusi Tingkatan Sabuk</h3>
                    <Shield className="w-4 h-4 text-[#E10600]" />
                  </div>
                  {isLoading ? (
                    <div className="text-center text-gray-400 text-xs py-6">Memuat data...</div>
                  ) : beltDistribution.length === 0 ? (
                    <div className="text-center text-gray-400 text-xs py-6">Belum ada data siswa.</div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {beltDistribution.map((item, idx) => {
                        const pct = totalMembers > 0 ? (item.count / totalMembers) * 100 : 0;
                        const colors = getBeltColor(item.belt);
                        return (
                          <div key={idx}>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="font-bold text-[#0F172A]">{item.belt.split(" (")[0]}</span>
                              <span className="font-bold text-gray-400">{item.count} siswa</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${colors.dot}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* UKT Status Summary */}
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-black text-sm text-[#0F172A]">Status Ujian UKT Aktif</h3>
                    <button onClick={() => setActiveTab("grading")} className="text-[#E10600] font-bold text-[10px] hover:underline flex items-center gap-1">
                      Detail <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: "Pending", value: pendingCount, color: "bg-amber-50 border-amber-100 text-amber-600" },
                      { label: "Lulus", value: approvedCount, color: "bg-green-50 border-green-100 text-green-600" },
                      { label: "Remedial", value: failedCount, color: "bg-red-50 border-red-100 text-[#E10600]" },
                    ].map((s, i) => (
                      <div key={i} className={`rounded-2xl border p-4 text-center ${s.color}`}>
                        <span className="text-2xl font-black block">{s.value}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider">{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {candidates.slice(0, 3).map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-gray-600 font-bold flex items-center justify-center text-[9px]">{c.name.charAt(0)}</div>
                          <span className="font-bold text-[#0F172A]">{c.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                          c.status === "APPROVED" ? "bg-green-50 text-green-600" : c.status === "FAILED" ? "bg-red-50 text-[#E10600]" : "bg-amber-50 text-amber-600"
                        }`}>
                          {c.status === "APPROVED" ? "LULUS" : c.status === "FAILED" ? "REMEDIAL" : "PENDING"}
                        </span>
                      </div>
                    ))}
                    {candidates.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Belum ada peserta UKT terdaftar.</p>}
                  </div>
                </div>

                {/* Pending Payments Alert */}
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-6 shadow-sm lg:col-span-2 flex flex-col gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-sm text-[#0F172A]">⚠️ Verifikasi Pembayaran SPP (Manual)</h3>
                      <span className="text-[10px] text-gray-400 font-bold">{pendingPayments.length} pending</span>
                    </div>
                    {pendingPayments.length === 0 ? (
                      <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 text-center">
                        <p className="text-green-700 font-bold text-xs">✅ Semua administrasi keuangan bersih. Hebat!</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-400 font-bold uppercase border-b border-slate-100">
                              <th className="pb-2 text-left">Siswa</th>
                              <th className="pb-2 text-left">Jenis Tagihan</th>
                              <th className="pb-2 text-left">Nominal</th>
                              <th className="pb-2 text-left">Status</th>
                              <th className="pb-2 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingPayments.slice(0, 5).map((p, idx) => (
                              <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                                <td className="py-2.5 font-bold text-[#0F172A]">{p.member?.fullName || "—"}</td>
                                <td className="py-2.5 text-gray-500">{p.purpose}</td>
                                <td className="py-2.5 font-bold text-[#0F172A]">Rp {(p.amount || 0).toLocaleString("id-ID")}</td>
                                <td className="py-2.5">
                                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-black text-[9px] uppercase">Menunggu</span>
                                </td>
                                <td className="py-2.5 text-right">
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Apakah Anda yakin ingin memvalidasi pembayaran SPP untuk ${p.member?.fullName || "murid"} sebesar Rp ${(p.amount || 0).toLocaleString("id-ID")} secara manual? Tindakan ini akan dicatat atas nama Anda.`)) {
                                        try {
                                          const res = await fetch(`/api/payments/${p.id}/validate`, {
                                            method: "POST"
                                          });
                                          if (res.ok) {
                                            alert("Pembayaran berhasil diverifikasi secara manual!");
                                            fetchAllData();
                                          } else {
                                            const errData = await res.json();
                                            alert(`Gagal memverifikasi: ${errData.error || "Kesalahan tidak dikenal"}`);
                                          }
                                        } catch (e) {
                                          alert(`Gagal menghubungi server: ${e}`);
                                        }
                                      }
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-[9px] uppercase px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-sm shadow-green-600/10 cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" /> Tandai Lunas
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Digital Audit Trace / Validation History */}
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="font-black text-xs text-[#0F172A] mb-4">📝 Jejak Digital Riwayat Validasi Pelatih</h4>
                    {completedPayments.length === 0 ? (
                      <p className="text-[11px] text-gray-400">Belum ada riwayat validasi manual.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-gray-500">
                          <thead>
                            <tr className="font-bold text-gray-400 border-b border-slate-100">
                              <th className="pb-2 text-left">Siswa</th>
                              <th className="pb-2 text-left">Jenis Tagihan</th>
                              <th className="pb-2 text-left">Tanggal Bayar</th>
                              <th className="pb-2 text-right">Divalidasi Oleh</th>
                            </tr>
                          </thead>
                          <tbody>
                            {completedPayments.slice(0, 5).map((p, idx) => (
                              <tr key={idx} className="border-b border-slate-50">
                                <td className="py-2 font-bold text-[#0F172A]">{p.member?.fullName || "—"}</td>
                                <td className="py-2">{p.purpose}</td>
                                <td className="py-2">{p.paidAt ? new Date(p.paidAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "—"}</td>
                                <td className="py-2 text-right font-semibold text-green-700">
                                  {p.receiver?.name || "Sistem / QRIS"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB: MEMBERS (DATA SISWA) ══════════════ */}
          {activeTab === "members" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A]">Data Siswa</h2>
                  <p className="text-gray-400 text-xs mt-1">Pantau perkembangan, sabuk, dan administrasi seluruh siswa dojang.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari nama atau nomor anggota..."
                      value={memberSearchTerm}
                      onChange={(e) => setMemberSearchTerm(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#E10600] w-64"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                  </div>
                  <button
                    onClick={() => setIsAddMemberOpen(true)}
                    className="bg-[#E10600] hover:bg-[#C00500] text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Tambah Siswa
                  </button>
                </div>
              </div>

              {/* Belt-level summary pills */}
              <div className="flex flex-wrap gap-2">
                {beltDistribution.map((b, idx) => {
                  const colors = getBeltColor(b.belt);
                  return (
                    <span key={idx} className={`px-3 py-1.5 rounded-xl text-[10px] font-black border ${colors.bg} ${colors.text}`}>
                      {b.belt.split(" (")[0]}: {b.count}
                    </span>
                  );
                })}
              </div>

              {isLoading ? (
                <div className="text-center text-gray-400 text-xs py-12">Memuat data siswa...</div>
              ) : (
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-gray-500 font-bold uppercase border-b border-[#0F172A]/5">
                        <th className="p-4">Siswa</th>
                        <th className="p-4">Tingkatan Sabuk</th>
                        <th className="p-4">No. Anggota</th>
                        <th className="p-4">Progres</th>
                        <th className="p-4 text-center">Administrasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allMembers
                        .filter(m =>
                          (m.name || "").toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
                          (m.memberNumber || "").toLowerCase().includes(memberSearchTerm.toLowerCase())
                        )
                        .map((member, idx) => {
                          const colors = getBeltColor(member.currentBelt || "");
                          const memberPayments = payments.filter(p => p.memberId === member.memberId);
                          const hasPending = memberPayments.some(p => p.status === "PENDING");
                          const hasOverdue = memberPayments.some(p => p.status === "OVERDUE");
                          const progress = member.progress || 0;
                          return (
                            <tr key={idx} className="border-b border-[#0F172A]/5 hover:bg-slate-50/50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-red-50 border-2 border-[#E10600]/20 flex items-center justify-center font-black text-[#E10600] text-xs shrink-0 overflow-hidden">
                                    {member.selfieUrl ? <img src={member.selfieUrl} alt="" className="w-full h-full object-cover" /> : (member.name || "?").substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#0F172A] block">{member.name || "—"}</span>
                                    <span className="text-[9px] text-gray-400">{member.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${colors.bg} ${colors.text}`}>
                                  {(member.currentBelt || "Sabuk Putih").split(" (")[0]}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-gray-400 text-[10px]">{member.memberNumber || "—"}</td>
                              <td className="p-4 w-36">
                                <div className="flex items-center gap-2">
                                  <div className="flex-grow bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-[#E10600] h-full rounded-full" style={{ width: `${progress}%` }} />
                                  </div>
                                  <span className="text-[9px] font-bold text-gray-400 shrink-0">{progress}%</span>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                {hasOverdue ? (
                                  <span className="px-2 py-1 bg-red-100 text-[#E10600] rounded-full text-[9px] font-black uppercase animate-pulse">OVERDUE</span>
                                ) : hasPending ? (
                                  <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase">Pending</span>
                                ) : (
                                  <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase">Lunas</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      {allMembers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-400">Belum ada data siswa terdaftar.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══════════════ TAB: GRADING / UKT ══════════════ */}
          {activeTab === "grading" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A]">Penilaian UKT</h2>
                  <p className="text-gray-400 text-xs mt-1">Berikan penilaian objektif sesuai standar Kukkiwon/PBTI untuk setiap peserta ujian.</p>
                </div>
                <button onClick={fetchAllData} className="bg-white border border-slate-200 text-[#0F172A] px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Peserta", value: candidates.length, icon: <Users className="w-5 h-5" />, color: "text-blue-600 bg-blue-50" },
                  { label: "Menunggu Penilaian", value: pendingCount, icon: <Clock className="w-5 h-5" />, color: "text-amber-600 bg-amber-50" },
                  { label: "Telah Dinilai", value: approvedCount + failedCount, icon: <Check className="w-5 h-5" />, color: "text-green-600 bg-green-50" },
                ].map((m, idx) => (
                  <div key={idx} className="bg-white border border-[#0F172A]/5 rounded-2xl p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${m.color}`}>{m.icon}</div>
                    <div>
                      <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider block">{m.label}</span>
                      <span className="text-2xl font-black text-[#0F172A] block leading-none mt-0.5">{m.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Candidate List */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-base text-[#0F172A]">Daftar Peserta</h3>
                    <div className="relative">
                      <input type="text" placeholder="Cari peserta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white border border-[#0F172A]/5 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#E10600]" />
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>
                  {isLoading ? (
                    <div className="text-center text-gray-400 py-8 text-xs">Memuat...</div>
                  ) : candidates.length === 0 ? (
                    <div className="bg-white border border-[#0F172A]/5 rounded-2xl p-8 text-center text-gray-400 text-xs">
                      Belum ada peserta UKT yang mendaftar.
                    </div>
                  ) : (
                    candidates.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase())).map((cand, idx) => (
                      <div key={idx} onClick={() => handleSelectCandidate(cand)}
                        className={`bg-white border rounded-2xl p-5 flex items-center justify-between gap-4 cursor-pointer hover:shadow-sm transition-all ${selectedCandidate?.dbId === cand.dbId ? "border-[#E10600] ring-1 ring-[#E10600]/10" : "border-[#0F172A]/5"}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-gray-400 text-xs shrink-0">
                            {cand.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#0F172A]">{cand.name}</h4>
                            <span className="text-[9px] text-gray-400 font-mono">ID: {cand.id}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <span className="text-[9px] text-gray-400 uppercase font-bold block">Target</span>
                            <span className="text-[10px] font-bold text-[#E10600]">{cand.targetBelt?.split(" (")[0]}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-gray-400 uppercase font-bold block">Skor</span>
                            <span className="font-black text-sm text-[#0F172A]">{cand.finalScore > 0 ? cand.finalScore.toFixed(1) : "—"}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-wider ${
                            cand.status === "APPROVED" ? "bg-green-50 text-green-600 border border-green-100" :
                            cand.status === "FAILED" ? "bg-red-50 text-[#E10600] border border-red-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {cand.status === "APPROVED" ? "LULUS" : cand.status === "FAILED" ? "REMEDIAL" : "PENDING"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Score Form */}
                <div className="lg:col-span-5 bg-white border border-[#0F172A]/5 rounded-[24px] p-7 shadow-sm self-start">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-extrabold text-sm text-[#0F172A]">Form Penilaian</h3>
                    <span className="px-2.5 py-1 bg-green-50 text-green-600 border border-green-100 rounded text-[9px] font-bold">Standar Kukkiwon</span>
                  </div>
                  {selectedCandidate ? (
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                        <div className="w-9 h-9 rounded-full bg-[#E10600]/10 border border-[#E10600]/20 flex items-center justify-center font-bold text-[#E10600] text-xs shrink-0">
                          {selectedCandidate.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-[#0F172A]">{selectedCandidate.name}</h4>
                          <span className="text-[9px] text-gray-400">Target: {selectedCandidate.targetBelt}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        {[
                          { field: "poomsae", title: "POOMSAE (30%)", sub: "Taegeuk / Koryo", hint: "Keakuratan gerakan, kuda-kuda, ritme" },
                          { field: "kyorugi", title: "KYORUGI (30%)", sub: "Pertarungan Bebas", hint: "Refleks, taktik, variasi tendangan" },
                          { field: "basics", title: "TEKNIK DASAR (20%)", sub: "Kibon Dongjak", hint: "Ketepatan, kekuatan, kelenturan" },
                          { field: "physical", title: "FISIK (10%)", sub: "Push-up, Sit-up, Fleksibilitas", hint: "Stamina dan kondisi fisik umum" },
                          { field: "theory", title: "TEORI (10%)", sub: "Terminologi & Etika", hint: "Hafalan, kosakata, sikap hormat" },
                        ].map((item) => (
                          <div key={item.field} className="border border-slate-100 rounded-xl p-3.5 flex items-center justify-between gap-3">
                            <div className="flex-grow">
                              <span className="block font-bold text-[9px] text-slate-700 uppercase tracking-wide">{item.title}</span>
                              <span className="text-[8px] text-gray-400 block">{item.sub}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <input
                                type="number" min="0" max="100"
                                value={selectedCandidate[item.field]}
                                onChange={(e) => handleScoreChange(item.field, Number(e.target.value))}
                                className="bg-white border border-[#0F172A]/10 rounded-lg px-2 py-1.5 text-xs font-bold text-[#0F172A] w-14 text-center outline-none focus:ring-2 focus:ring-[#E10600]"
                              />
                              <span className="text-[9px] text-gray-400">/100</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-slate-100 text-center">
                        <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Nilai Akhir (Berbobot)</span>
                        <span className={`font-black text-4xl block my-2 ${calculatedScore >= 70 ? "text-green-600" : calculatedScore >= 50 ? "text-amber-600" : "text-[#E10600]"}`}>
                          {calculatedScore.toFixed(1)}
                        </span>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1">
                          <div className={`h-full rounded-full transition-all ${calculatedScore >= 70 ? "bg-green-500" : calculatedScore >= 50 ? "bg-amber-500" : "bg-[#E10600]"}`} style={{ width: `${calculatedScore}%` }} />
                        </div>
                        <p className="text-[9px] text-gray-400 mb-5">Nilai kelulusan minimum: 70.0</p>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => handleSubmitGrading("FAILED")} className="bg-slate-100 hover:bg-slate-200 text-gray-600 py-3 rounded-xl font-bold text-xs transition-all">
                            Remedial / Gagal
                          </button>
                          <button onClick={() => handleSubmitGrading("APPROVED")} className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-xs transition-all shadow-md shadow-green-500/20">
                            ✓ Nyatakan Lulus
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 text-xs">Pilih peserta dari daftar untuk mulai menilai.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB: BELT PROGRESS ══════════════ */}
          {activeTab === "history" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A]">Progres Sabuk Siswa</h2>
                <p className="text-gray-400 text-xs mt-1">Analisis kesiapan setiap siswa untuk naik ke tingkatan berikutnya berdasarkan data kurikulum.</p>
              </div>

              {/* Readiness Analysis */}
              <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#E10600]/10 rounded-xl"><Zap className="w-5 h-5 text-[#E10600]" /></div>
                  <div>
                    <h3 className="font-black text-sm text-[#0F172A]">Analisis Kesiapan Promosi Sabuk</h3>
                    <p className="text-[10px] text-gray-400">Siswa dengan progres ≥ 80% dinilai siap mengikuti UKT.</p>
                  </div>
                </div>
                {isLoading ? (
                  <div className="text-center text-gray-400 text-xs py-6">Memuat...</div>
                ) : allMembers.length === 0 ? (
                  <div className="text-center text-gray-400 text-xs py-6">Belum ada data siswa.</div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {allMembers.map((member, idx) => {
                      const progress = member.progress || 0;
                      const isReady = progress >= 80;
                      const colors = getBeltColor(member.currentBelt || "");
                      return (
                        <div key={idx} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border ${isReady ? "border-green-100 bg-green-50/30" : "border-slate-100 bg-white"}`}>
                          <div className="flex items-center gap-3 flex-grow">
                            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-gray-400 text-xs shrink-0 overflow-hidden">
                              {member.selfieUrl ? <img src={member.selfieUrl} alt="" className="w-full h-full object-cover" /> : (member.name || "?").charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-[#0F172A]">{member.name}</h4>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${colors.bg} ${colors.text}`}>
                                {(member.currentBelt || "Sabuk Putih").split(" (")[0]}
                              </span>
                            </div>
                          </div>
                          <div className="flex-grow max-w-xs">
                            <div className="flex justify-between text-[9px] font-bold mb-1">
                              <span className="text-gray-400">Progres Kurikulum</span>
                              <span className={isReady ? "text-green-600" : "text-[#E10600]"}>{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${isReady ? "bg-green-500" : "bg-[#E10600]"}`} style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                          <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shrink-0 ${isReady ? "bg-green-100 text-green-700" : "bg-slate-100 text-gray-500"}`}>
                            {isReady ? "✓ Siap UKT" : `Butuh ${80 - progress}% lagi`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Belt Sequence Reference */}
              <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-6 shadow-sm">
                <h3 className="font-black text-sm text-[#0F172A] mb-5">Urutan Sabuk Resmi (Kukkiwon)</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "10 Geup", label: "Sabuk Putih", bg: "bg-slate-50 border-slate-200 text-slate-600" },
                    { name: "9 Geup", label: "Sabuk Kuning", bg: "bg-yellow-50 border-yellow-200 text-yellow-700" },
                    { name: "8 Geup", label: "Kuning Strip Hijau", bg: "bg-yellow-50 border-green-200 text-green-700" },
                    { name: "7 Geup", label: "Sabuk Hijau", bg: "bg-green-50 border-green-200 text-green-700" },
                    { name: "6 Geup", label: "Hijau Strip Biru", bg: "bg-green-50 border-blue-200 text-blue-700" },
                    { name: "5 Geup", label: "Sabuk Biru", bg: "bg-blue-50 border-blue-200 text-blue-700" },
                    { name: "4 Geup", label: "Biru Strip Merah", bg: "bg-blue-50 border-red-200 text-red-700" },
                    { name: "3 Geup", label: "Sabuk Merah", bg: "bg-red-50 border-red-200 text-red-700" },
                    { name: "2 Geup", label: "Merah Strip Hitam 1", bg: "bg-red-50 border-zinc-300 text-zinc-700" },
                    { name: "1 Geup", label: "Merah Strip Hitam 2", bg: "bg-red-50 border-zinc-400 text-zinc-800" },
                    { name: "1 Dan", label: "Sabuk Hitam", bg: "bg-zinc-900 border-zinc-700 text-white" },
                  ].map((b, idx) => (
                    <div key={idx} className={`flex flex-col items-center border rounded-xl px-3 py-2 ${b.bg}`}>
                      <span className="text-[8px] font-black uppercase">{b.name}</span>
                      <span className="text-[9px] font-bold">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB: JADWAL LATIHAN (KELOLA) ══════════════ */}
          {activeTab === "schedule" && (
            <div className="flex flex-col gap-6 animate-fade-in pb-12 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A]">Kelola Jadwal Latihan</h2>
                  <p className="text-gray-400 text-xs mt-1">Konfigurasi jadwal kelas rutin dojang, edit waktu/lokasi latihan, dan tugaskan pelatih pengampu.</p>
                </div>
                <button 
                  onClick={() => {
                    const day = prompt("Masukkan Hari (e.g. Senin):", "Senin");
                    if (!day) return;
                    const startTime = prompt("Jam Mulai (e.g. 16:00):", "16:00");
                    if (!startTime) return;
                    const endTime = prompt("Jam Selesai (e.g. 18:00):", "18:00");
                    if (!endTime) return;
                    const className = prompt("Nama Kelas (e.g. Kelas Pemula):", "Kelas Pemula");
                    if (!className) return;
                    const location = prompt("Lokasi (e.g. Dojang Pusat):", "Dojang Pusat");
                    if (!location) return;

                    const activeCoach = coaches.find(c => c.user?.email.toLowerCase() === userEmail?.toLowerCase());
                    const coachId = activeCoach?.id;
                    if (!coachId) {
                      alert("Profil pelatih Anda tidak ditemukan. Harap hubungi admin.");
                      return;
                    }

                    fetch("/api/schedules", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        dayOfWeek: day,
                        startTime,
                        endTime,
                        className,
                        location,
                        coachId
                      })
                    }).then(res => {
                      if (res.ok) {
                        alert("Jadwal latihan berhasil ditambahkan!");
                        fetchAllData();
                      } else {
                        alert("Gagal menambahkan jadwal.");
                      }
                    });
                  }}
                  className="bg-[#E10600] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#E10600]/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Jadwal
                </button>
              </div>

              {isLoading ? (
                <div className="text-center text-gray-400 text-xs py-12">Memuat jadwal...</div>
              ) : sortedSchedules.length === 0 ? (
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-12 text-center shadow-sm">
                  <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="font-bold text-gray-400 text-sm">Belum Ada Jadwal Latihan</p>
                  <p className="text-gray-400 text-xs mt-2">Klik tombol "Tambah Jadwal" di atas untuk membuat kelas perdana.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-100 text-gray-500 uppercase font-black">
                        <tr>
                          <th className="px-6 py-4">Hari & Waktu</th>
                          <th className="px-6 py-4">Kelas</th>
                          <th className="px-6 py-4">Pelatih</th>
                          <th className="px-6 py-4">Lokasi</th>
                          <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {sortedSchedules.map((schedule) => (
                          <tr key={schedule.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-[#0F172A]">
                              {schedule.dayOfWeek}
                              <span className="text-[10px] text-gray-400 block font-normal mt-0.5">{schedule.startTime} - {schedule.endTime}</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-[#0F172A]">{schedule.className}</td>
                            <td className="px-6 py-4 font-semibold text-gray-500">{schedule.coach?.fullName || "—"}</td>
                            <td className="px-6 py-4 text-gray-400">{schedule.location}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    const newClass = prompt("Edit Nama Kelas:", schedule.className);
                                    if (newClass === null) return;
                                    const newLoc = prompt("Edit Lokasi:", schedule.location);
                                    if (newLoc === null) return;
                                    const newDay = prompt("Edit Hari:", schedule.dayOfWeek);
                                    if (newDay === null) return;
                                    const newStart = prompt("Edit Jam Mulai:", schedule.startTime);
                                    if (newStart === null) return;
                                    const newEnd = prompt("Edit Jam Selesai:", schedule.endTime);
                                    if (newEnd === null) return;

                                    fetch(`/api/schedules/${schedule.id}`, {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        dayOfWeek: newDay,
                                        startTime: newStart,
                                        endTime: newEnd,
                                        className: newClass,
                                        location: newLoc,
                                        coachId: schedule.coachId
                                      })
                                    }).then(res => {
                                      if (res.ok) {
                                        alert("Jadwal latihan diperbarui!");
                                        fetchAllData();
                                      }
                                    });
                                  }}
                                  className="bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg font-bold text-[10px] cursor-pointer hover:bg-blue-100"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (!confirm("Hapus jadwal latihan ini?")) return;
                                    fetch(`/api/schedules/${schedule.id}`, { method: "DELETE" })
                                      .then(res => {
                                        if (res.ok) {
                                          alert("Jadwal berhasil dihapus!");
                                          fetchAllData();
                                        }
                                      });
                                  }}
                                  className="bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg font-bold text-[10px] cursor-pointer hover:bg-red-100"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════ TAB: SERTIFIKAT ══════════════ */}
          {activeTab === "certificates" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A]">Manajemen Sertifikat</h2>
                <p className="text-gray-400 text-xs mt-1">Pantau sertifikat kelulusan UKT yang telah diterbitkan untuk para siswa.</p>
              </div>

              {/* Qualified members (approved UKT) */}
              <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-sm text-[#0F172A]">Siswa Berhak Sertifikat (Lulus UKT)</h3>
                  <span className="text-[10px] text-gray-400 font-bold">{candidates.filter(c => c.status === "APPROVED").length} sertifikat</span>
                </div>

                {candidates.filter(c => c.status === "APPROVED").length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <FileBadge className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold">Belum Ada Siswa yang Lulus UKT</p>
                    <p className="text-xs mt-1">Sertifikat otomatis tersedia setelah pelatih menyatakan siswa Lulus dari tab Penilaian UKT.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {candidates.filter(c => c.status === "APPROVED").map((cand, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-[#0F172A] to-slate-800 text-white rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/5 blur-xl" />
                        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-[#E10600]/10 blur-xl" />
                        <div className="relative z-10 flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[8px] font-black tracking-widest text-[#E10600] uppercase block">SERTIFIKAT LULUS UKT</span>
                              <h4 className="font-extrabold text-sm mt-1">{cand.name}</h4>
                            </div>
                            <FileBadge className="w-7 h-7 text-amber-400 shrink-0" />
                          </div>
                          <div className="flex flex-col gap-1.5 text-[10px] text-slate-300">
                            <div className="flex justify-between">
                              <span>ID Anggota:</span>
                              <span className="font-mono font-bold text-white">{cand.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tingkat Kelulusan:</span>
                              <span className="font-bold text-[#E10600]">{cand.targetBelt}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Nilai Akhir:</span>
                              <span className="font-black text-green-400">{cand.finalScore?.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-white/10">
                            <button
                              onClick={() => printCertificate(cand)}
                              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" /> Cetak PDF
                            </button>
                            <button
                              onClick={() => showQRVerification(cand)}
                              className="flex-1 bg-[#E10600]/20 hover:bg-[#E10600]/30 text-[#E10600] py-2.5 rounded-xl font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" /> QR Verifikasi
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Panel */}
              <div className="bg-blue-50 border border-blue-100 rounded-[24px] p-6">
                <h3 className="font-black text-sm text-blue-900 mb-2">📋 Panduan Penerbitan Sertifikat</h3>
                <ul className="text-xs text-blue-700 flex flex-col gap-1.5">
                  <li>✓ Sertifikat diterbitkan otomatis setelah pelatih menyatakan siswa LULUS pada tab Penilaian UKT.</li>
                  <li>✓ Setiap sertifikat memiliki nomor unik dan kode QR untuk verifikasi keaslian online.</li>
                  <li>✓ Siswa dapat mengunduh sertifikat digital dari Dashboard Member mereka masing-masing.</li>
                  <li>✓ Sertifikat fisik dapat dicetak dari fitur "Cetak PDF" dan diserahkan langsung oleh pelatih.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ══════════════ TAB: ANNOUNCEMENTS (BUAT PENGUMUMAN) ══════════════ */}
          {activeTab === "announcements" && (
            <div className="flex flex-col gap-8 max-w-2xl">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A]">Buat Pengumuman</h2>
                <p className="text-gray-400 text-xs mt-1">Kirim informasi penting secara serentak ke seluruh murid melalui Notifikasi Aplikasi dan WhatsApp.</p>
              </div>

              <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-6 shadow-sm flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-xs text-[#0F172A]">Judul Pengumuman</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ujian Kenaikan Tingkat (UKT) Periode Juli 2026"
                    value={announceTitle}
                    onChange={(e) => setAnnounceTitle(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600] w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-xs text-[#0F172A]">Isi Pengumuman / Pesan</label>
                  <textarea
                    rows={6}
                    placeholder="Tulis pesan lengkap di sini..."
                    value={announceMessage}
                    onChange={(e) => setAnnounceMessage(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#E10600] w-full resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <input
                    type="checkbox"
                    id="sendWhatsApp"
                    checked={announceSendWA}
                    onChange={(e) => setAnnounceSendWA(e.target.checked)}
                    className="w-4 h-4 text-[#E10600] border-slate-300 rounded focus:ring-[#E10600]"
                  />
                  <label htmlFor="sendWhatsApp" className="flex flex-col cursor-pointer">
                    <span className="font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                      💬 Kirim juga via WhatsApp Broadcast
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Mengirim pesan siaran otomatis ke seluruh nomor telepon murid terdaftar.</span>
                  </label>
                </div>

                <button
                  onClick={async () => {
                    if (!announceTitle || !announceMessage) {
                      alert("Judul dan pesan wajib diisi!");
                      return;
                    }
                    setIsSubmittingAnnounce(true);
                    try {
                      const res = await fetch("/api/announcements", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: announceTitle,
                          message: announceMessage,
                          sendWhatsApp: announceSendWA
                        })
                      });
                      if (res.ok) {
                        alert("Pengumuman berhasil disebarkan!");
                        setAnnounceTitle("");
                        setAnnounceMessage("");
                        setAnnounceSendWA(false);
                      } else {
                        const err = await res.json();
                        alert(`Gagal mengirim pengumuman: ${err.message || "Kesalahan internal"}`);
                      }
                    } catch (e) {
                      alert(`Gagal menghubungi server: ${e}`);
                    } finally {
                      setIsSubmittingAnnounce(false);
                    }
                  }}
                  disabled={isSubmittingAnnounce}
                  className="bg-[#E10600] hover:bg-[#C00500] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400"
                >
                  {isSubmittingAnnounce ? (
                    <span>Mengirim...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Sebarkan Pengumuman
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          {/* ══════════════ TAB: QUESTS (MONITORING & APPROVAL) ══════════════ */}
          {activeTab === "quests" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-[#0F172A]">Verifikasi Misi Atlet</h2>
                  <p className="text-gray-400 text-xs mt-1">Pantau kiriman bukti video teknik taekwondo siswa dan berikan penilaian langsung.</p>
                </div>

                {/* Filter Status */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0">
                  <button
                    onClick={() => setQuestFilterCompleted("false")}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                      questFilterCompleted === "false"
                        ? "bg-[#E10600] text-white shadow-sm"
                        : "text-gray-500 hover:text-[#0F172A]"
                    }`}
                  >
                    Menunggu (Pending)
                  </button>
                  <button
                    onClick={() => setQuestFilterCompleted("true")}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                      questFilterCompleted === "true"
                        ? "bg-[#E10600] text-white shadow-sm"
                        : "text-gray-500 hover:text-[#0F172A]"
                    }`}
                  >
                    Disetujui (Approved)
                  </button>
                </div>
              </div>

              {isLoadingQuests ? (
                <div className="flex items-center justify-center p-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#E10600]" />
                </div>
              ) : questLogs.length === 0 ? (
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] p-12 text-center shadow-sm">
                  <Activity className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-sm text-slate-500">Tidak ada pengiriman misi yang cocok.</p>
                </div>
              ) : (
                <div className="bg-white border border-[#0F172A]/5 rounded-[24px] overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-100">
                        <th className="p-4 font-bold text-[10px] uppercase text-gray-400">Atlet & Sabuk</th>
                        <th className="p-4 font-bold text-[10px] uppercase text-gray-400">Misi & Kategori</th>
                        <th className="p-4 font-bold text-[10px] uppercase text-gray-400">Tanggal Kirim</th>
                        <th className="p-4 font-bold text-[10px] uppercase text-gray-400">Bukti Video</th>
                        <th className="p-4 font-bold text-[10px] uppercase text-gray-400">Catatan</th>
                        <th className="p-4 font-bold text-[10px] uppercase text-gray-400 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questLogs.map((log: any) => (
                        <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-xs text-[#0F172A]">{log.member?.fullName || "Member"}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{log.member?.memberNumber || "-"}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-xs text-[#0F172A]">{log.quest?.title}</div>
                            <span className="inline-block bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 uppercase tracking-wider">
                              {log.quest?.category}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-500">
                            {log.completedAt ? new Date(log.completedAt).toLocaleDateString("id-ID") : new Date(log.assignedAt).toLocaleDateString("id-ID")}
                          </td>
                          <td className="p-4">
                            {log.videoUrl ? (
                              <a
                                href={log.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 bg-[#0052DC]/10 hover:bg-[#0052DC]/20 text-[#0052DC] px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" /> Lihat Video
                              </a>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">Tidak ada video</span>
                            )}
                          </td>
                          <td className="p-4 text-xs text-gray-500 max-w-[200px] truncate" title={log.notes || "-"}>
                            {log.notes || "-"}
                          </td>
                          <td className="p-4 text-right">
                             {!log.completed ? (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleQuestApproval(log.id, "APPROVE")}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" /> Setuju
                                </button>
                                <button
                                  onClick={() => handleQuestApproval(log.id, "REJECT")}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" /> Tolak
                                </button>
                              </div>
                            ) : (
                              <span className="text-green-600 font-bold text-xs inline-flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> Terverifikasi
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══════════════ TAB: QUEST BUILDER ══════════════ */}
          {activeTab === "quest_builder" && (
            <div className="flex flex-col gap-6 animate-fade-in pb-12 h-[80vh] w-full">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A]">Kelola Misi & Kuis</h2>
                <p className="text-gray-400 text-xs mt-1">Buat misi latihan baru, atur pertanyaan kuis materi teori, dan verifikasi batas pencapaian umur/sabuk.</p>
              </div>
              <iframe 
                src="/coach/quests" 
                className="w-full h-full border border-slate-200 rounded-[24px] shadow-sm bg-white"
                title="Daily Quests Builder"
              />
            </div>
          )}

          {/* ══════════════ TAB: CURRICULUM BUILDER ══════════════ */}
          {activeTab === "curriculum_builder" && (
            <div className="flex flex-col gap-6 animate-fade-in pb-12 w-full">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A]">Kurikulum & Sabuk</h2>
                <p className="text-gray-400 text-xs mt-1">Konfigurasi daftar tingkatan sabuk Dojang beserta video panduan jurus/poomsae.</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
                {(() => {
                  const CurriculumBuilder = require("./CurriculumBuilder").default;
                  return <CurriculumBuilder />;
                })()}
              </div>
            </div>
          )}

          {/* ══════════════ TAB: FINANCE (KEUANGAN & SPP) ══════════════ */}
          {activeTab === "finance" && (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-3xl font-black text-[#0F172A]">Keuangan & SPP</h2>
                <p className="text-gray-400 text-xs mt-1">Kelola tagihan bulanan SPP murid, verifikasi pembayaran manual, dan pantau status transaksi.</p>
              </div>

              {/* SPP Management UI Container */}
              <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
                {(() => {
                  const SppManagement = require("./SppManagement").default;
                  return <SppManagement />;
                })()}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Modal: Tambah Siswa Baru */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-[#0F172A] mb-1">Tambah Siswa Baru</h3>
            <p className="text-gray-400 text-[11px] mb-5">Pendaftaran langsung murid baru aktif ke database Dojang.</p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[10px] uppercase text-gray-400">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#E10600] w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[10px] uppercase text-gray-400">Username Akun (Untuk Login HP)</label>
                <input
                  type="text"
                  placeholder="username (tanpa spasi)"
                  value={newMemberUsername}
                  onChange={(e) => setNewMemberUsername(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#E10600] w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[10px] uppercase text-gray-400">Tanggal Lahir</label>
                <input
                  type="date"
                  value={newMemberBirthDate}
                  onChange={(e) => setNewMemberBirthDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#E10600] w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[10px] uppercase text-gray-400">Password Akun</label>
                <input
                  type="text"
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#E10600] w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsAddMemberOpen(false);
                  setNewMemberName("");
                  setNewMemberUsername("");
                  setNewMemberPassword("password123");
                  setNewMemberBirthDate("");
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-600 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer text-center"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  if (!newMemberName || !newMemberUsername || !newMemberPassword || !newMemberBirthDate) {
                    alert("Harap isi semua kolom pendaftaran siswa!");
                    return;
                  }
                  setIsSubmittingMember(true);
                  try {
                    const res = await fetch("/api/admin/users", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: newMemberName,
                        username: newMemberUsername,
                        password: newMemberPassword,
                        birthDate: newMemberBirthDate,
                        role: "MEMBER"
                      })
                    });
                    if (res.ok) {
                      alert(`Siswa ${newMemberName} berhasil ditambahkan!`);
                      setIsAddMemberOpen(false);
                      setNewMemberName("");
                      setNewMemberUsername("");
                      setNewMemberPassword("password123");
                      setNewMemberBirthDate("");
                      fetchAllData();
                    } else {
                      const err = await res.json();
                      alert(`Gagal menambahkan: ${err.error || "Kesalahan internal"}`);
                    }
                  } catch (e) {
                    alert(`Gagal menghubungi server: ${e}`);
                  } finally {
                    setIsSubmittingMember(false);
                  }
                }}
                disabled={isSubmittingMember}
                className="flex-1 bg-[#E10600] hover:bg-[#C00500] text-white py-3 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer disabled:bg-gray-400"
              >
                {isSubmittingMember ? "Menyimpan..." : "Daftarkan Siswa"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] p-8 shadow-xl relative border border-slate-100 flex flex-col gap-5 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowEditProfileModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 cursor-pointer transition-all"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-extrabold text-lg text-[#0F172A]">Edit Profil Anda</h3>
              <p className="text-gray-400 text-xs mt-1">Perbarui informasi nama lengkap, email, dan kata sandi.</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
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
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Password Baru (Kosongkan jika tidak diganti)</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Password Baru" 
                    className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 pr-10 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">Konfirmasi Password Baru</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={editConfirmPassword}
                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                    placeholder="Ulangi Password Baru" 
                    className="w-full bg-[#F8FAFC] border border-[#0F172A]/10 rounded-xl px-4 py-3 pr-10 text-xs outline-none focus:ring-2 focus:ring-[#E10600]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
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
    </div>
  );
}
