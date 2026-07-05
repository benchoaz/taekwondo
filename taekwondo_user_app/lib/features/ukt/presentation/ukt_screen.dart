import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../auth/domain/user_model.dart';
import '../data/ukt_service.dart';
import '../domain/ukt_model.dart';

class UktScreen extends ConsumerStatefulWidget {
  final UserModel user;

  const UktScreen({super.key, required this.user});

  @override
  ConsumerState<UktScreen> createState() => _UktScreenState();
}

class _UktScreenState extends ConsumerState<UktScreen> {
  bool _isRegistering = false;

  String _getNextBelt(String? currentBelt) {
    if (currentBelt == null) return 'Kuning Strip Hijau';
    final belts = [
      'Putih',
      'Kuning Strip Hijau',
      'Kuning',
      'Hijau Strip Biru',
      'Hijau',
      'Biru Strip Merah',
      'Biru',
      'Merah Strip Hitam 2',
      'Merah Strip Hitam 1',
      'Merah',
      'Hitam Dan 1'
    ];
    final index = belts.indexWhere((b) => currentBelt.toLowerCase().contains(b.toLowerCase()));
    if (index != -1 && index + 1 < belts.length) {
      return belts[index + 1];
    }
    return 'Hitam Dan 1';
  }

  Future<void> _handleRegister(UktExam exam, String targetBelt) async {
    setState(() {
      _isRegistering = true;
    });

    final success = await ref.read(uktRegisterProvider).register(
          memberId: widget.user.id,
          uktExamId: exam.id,
          targetBelt: targetBelt,
        );

    setState(() {
      _isRegistering = false;
    });

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Pendaftaran berhasil! Silakan cek tagihan UKT di menu SPP.'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Gagal melakukan pendaftaran. Silakan coba lagi.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final uktStatusAsync = ref.watch(uktStatusProvider(widget.user.id));
    final targetBelt = _getNextBelt(widget.user.currentBelt);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Ujian Kenaikan Tingkat (UKT)',
          style: GoogleFonts.outfit(
            color: const Color(0xFF0F172A),
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: uktStatusAsync.when(
        data: (statusRes) {
          final exam = statusRes.exam;
          final reg = statusRes.registration;

          if (exam == null) {
            return _buildNoExamView();
          }

          return ListView(
            padding: const EdgeInsets.all(24),
            children: [
              // Status Pendaftaran Banner
              if (reg != null) _buildStatusBanner(reg),
              const SizedBox(height: 20),

              // Jadwal UKT Card
              _buildExamDetailsCard(exam, targetBelt),
              const SizedBox(height: 24),

              // Conditional view based on registration
              if (reg == null)
                _buildRegistrationForm(exam, targetBelt)
              else if (reg.status == 'GRADED')
                _buildScoreSheetCard(reg)
              else
                _buildWaitingApprovalCard(reg),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Gagal memuat data UKT: $err',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(color: Colors.red),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNoExamView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.info_outline, size: 48, color: Colors.amber),
            ),
            const SizedBox(height: 24),
            Text(
              'Belum Ada Jadwal UKT Terdekat',
              style: GoogleFonts.outfit(
                fontSize: 20,
                color: const Color(0xFF0F172A),
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Pelatih akan mengumumkan jadwal ujian kenaikan tingkat jika sudah dikonfigurasi di portal administrasi.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                color: const Color(0xFF64748B),
                fontSize: 14,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBanner(UktParticipant reg) {
    Color bannerColor;
    String text;
    IconData icon;

    switch (reg.status) {
      case 'APPROVED':
        bannerColor = Colors.green;
        text = 'Pendaftaran Disetujui! Siapkan fisik Anda untuk hari ujian.';
        icon = Icons.check_circle_outline;
        break;
      case 'GRADED':
        final isPassed = reg.finalScore >= 70;
        bannerColor = isPassed ? Colors.blue : Colors.red;
        text = isPassed
            ? 'Selamat! Anda dinyatakan LULUS ujian kenaikan tingkat.'
            : 'Ujian Selesai. Anda direkomendasikan untuk REMEDIAL / Latihan Tambahan.';
        icon = isPassed ? Icons.emoji_events : Icons.error_outline;
        break;
      case 'FAILED':
      case 'REMEDIAL':
        bannerColor = Colors.red;
        text = 'Status: Perlu perbaikan / remedial teknik dasar.';
        icon = Icons.assignment_late_outlined;
        break;
      default:
        bannerColor = Colors.amber.shade800;
        text = 'Pendaftaran Anda sedang menunggu verifikasi pembayaran & berkas oleh Admin.';
        icon = Icons.hourglass_empty;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bannerColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: bannerColor.withValues(alpha: 0.3), width: 1.5),
      ),
      child: Row(
        children: [
          Icon(icon, color: bannerColor, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.inter(
                color: bannerColor,
                fontWeight: FontWeight.bold,
                fontSize: 13,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExamDetailsCard(UktExam exam, String targetBelt) {
    final formattedDate = DateFormat('EEEE, dd MMMM yyyy', 'id_ID').format(exam.date);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.04),
            blurRadius: 15,
            offset: const Offset(0, 6),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  exam.title,
                  style: GoogleFonts.outfit(
                    color: const Color(0xFF0F172A),
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.redAccent.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'Target: $targetBelt',
                  style: GoogleFonts.inter(
                    color: Colors.redAccent.shade700,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              )
            ],
          ),
          const SizedBox(height: 16),
          const Divider(color: Color(0xFFF1F5F9), height: 1),
          const SizedBox(height: 16),
          _buildInfoRow(Icons.calendar_month, 'Tanggal Ujian', formattedDate),
          const SizedBox(height: 12),
          _buildInfoRow(Icons.location_on, 'Lokasi', exam.location),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: const Color(0xFF64748B), size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.inter(color: const Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: GoogleFonts.inter(color: const Color(0xFF1E293B), fontSize: 13, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildRegistrationForm(UktExam exam, String targetBelt) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Formulir Registrasi UKT',
            style: GoogleFonts.outfit(
              color: const Color(0xFF0F172A),
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Dengan mendaftar ujian, Anda menyetujui persyaratan administrasi dan akan dikenakan tagihan biaya ujian sabuk secara otomatis.',
            style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 13, height: 1.5),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _isRegistering ? null : () => _handleRegister(exam, targetBelt),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0F172A),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
            child: _isRegistering
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                  )
                : Text(
                    'Daftar UKT Sekarang',
                    style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildWaitingApprovalCard(UktParticipant reg) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Detail Pendaftaran',
            style: GoogleFonts.outfit(
              color: const Color(0xFF0F172A),
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          _buildDetailRow('Nomor Registrasi', reg.id.split('-').first.toUpperCase()),
          _buildDetailRow('Sabuk Saat Ini', widget.user.currentBelt ?? 'Sabuk Putih'),
          _buildDetailRow('Sabuk Target', reg.targetBelt),
          _buildDetailRow('Status Verifikasi', reg.status),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 13)),
          Text(value, style: GoogleFonts.inter(color: const Color(0xFF1E293B), fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildScoreSheetCard(UktParticipant reg) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.04),
            blurRadius: 15,
            offset: const Offset(0, 6),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Lembar Penilaian Transparan 📝',
            style: GoogleFonts.outfit(
              color: const Color(0xFF0F172A),
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Berikut adalah rincian nilai ujian resmi Anda:',
            style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 12),
          ),
          const SizedBox(height: 20),
          _buildScoreItem('Gerakan Dasar (Gibon Yeonseup)', reg.basicTechScore),
          _buildScoreItem('Formulir / Poomsae', reg.poomsaeScore),
          _buildScoreItem('Pertarungan / Kyorugi', reg.kyorugiScore),
          _buildScoreItem('Ketahanan Fisik', reg.physicalScore),
          _buildScoreItem('Ujian Teori Taekwondo', reg.theoryScore),
          const SizedBox(height: 8),
          const Divider(color: Color(0xFFF1F5F9), height: 1),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'NILAI AKHIR',
                style: GoogleFonts.outfit(
                  color: const Color(0xFF0F172A),
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                ),
              ),
              Text(
                reg.finalScore.toStringAsFixed(1),
                style: GoogleFonts.outfit(
                  color: reg.finalScore >= 70 ? Colors.green : Colors.red,
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildScoreItem(String label, double score) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: GoogleFonts.inter(color: const Color(0xFF334155), fontSize: 13, fontWeight: FontWeight.w500)),
              Text(
                score.toStringAsFixed(1),
                style: GoogleFonts.inter(
                  color: score >= 70 ? const Color(0xFF0F172A) : Colors.redAccent,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: score / 100.0,
              minHeight: 5,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor: AlwaysStoppedAnimation<Color>(score >= 70 ? const Color(0xFF0F172A) : Colors.redAccent),
            ),
          )
        ],
      ),
    );
  }
}
