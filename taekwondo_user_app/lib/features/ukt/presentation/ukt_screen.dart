import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../auth/domain/user_model.dart';
import '../data/ukt_service.dart';
import '../domain/ukt_model.dart';
import 'package:file_picker/file_picker.dart' as fp;
import 'package:http_parser/http_parser.dart';
import 'package:dio/dio.dart';

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
    setState(() => _isRegistering = true);

    final result = await ref.read(uktRegisterProvider).registerWithMessage(
      memberId: widget.user.id,
      uktExamId: exam.id,
      targetBelt: targetBelt,
    );

    setState(() => _isRegistering = false);

    if (mounted) {
      if (result['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Pendaftaran berhasil! Silakan cek tagihan UKT di menu SPP.'),
            backgroundColor: Colors.green,
          ),
        );
        ref.invalidate(uktStatusProvider(widget.user.id));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Gagal melakukan pendaftaran.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  // State untuk melacak berkas yang sedang di-upload
  String? _uploadingDocName;

  Future<void> _pickAndUploadDocument(String docName) async {
    setState(() {
      _uploadingDocName = docName;
    });

    try {
      fp.FilePickerResult? result = await fp.FilePicker.platform.pickFiles(
        type: fp.FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
      );

      if (result != null && result.files.single.path != null) {
        final filePath = result.files.single.path!;
        final fileName = result.files.single.name;
        
        // 1. Upload file ke endpoint /profile/upload untuk mendapatkan URL
        final dio = Dio(BaseOptions(baseUrl: widget.user.token != null ? '' : '')); // dynamic URL
        // We reuse request settings from global dio client
        final uploadDio = Dio();
        // Set authorization token if exists
        if (widget.user.token != null) {
          uploadDio.options.headers['Authorization'] = 'Bearer ${widget.user.token}';
        }
        
        // Local base URL fallback logic
        final base = widget.user.token != null ? 'https://whitetigerkraksaan.com/api' : 'http://10.0.2.2:3030/api'; 
        
        String ext = fileName.split('.').last.toLowerCase();
        String mimeType = ext == 'pdf' ? 'application/pdf' : 'image/jpeg';
        if (ext == 'png') mimeType = 'image/png';

        FormData formData = FormData.fromMap({
          'file': await MultipartFile.fromFile(
            filePath,
            filename: fileName,
            contentType: MediaType.parse(mimeType),
          ),
        });

        final uploadRes = await uploadDio.post(
          '$base/profile/upload',
          data: formData,
          options: Options(
            headers: {'Content-Type': 'multipart/form-data'},
          ),
        );

        if (uploadRes.statusCode == 200 && uploadRes.data['url'] != null) {
          final fileUrl = uploadRes.data['url'].toString();

          // 2. Kirim URL berkas ke API UKT
          final success = await ref.read(uktRegisterProvider).updateUktDocument(
            memberId: widget.user.id,
            docName: docName,
            docUrl: fileUrl,
          );

          if (success && mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('✅ Dokumen "$docName" berhasil diunggah!'), backgroundColor: Colors.green),
            );
          } else if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('❌ Gagal menyimpan data dokumen.'), backgroundColor: Colors.red),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('❌ Terjadi kesalahan: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _uploadingDocName = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final uktStatusAsync = ref.watch(uktStatusProvider(widget.user.id));
    final targetBelt = _getNextBelt(widget.user.currentBelt);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: Text(
          'Ujian Kenaikan Tingkat',
          style: GoogleFonts.spaceGrotesk(
            color: Colors.white,
            fontWeight: FontWeight.w900,
            fontSize: 18,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white54),
            onPressed: () => ref.invalidate(uktStatusProvider(widget.user.id)),
          ),
        ],
      ),
      body: uktStatusAsync.when(
        data: (statusRes) {
          final exam = statusRes.exam;
          final reg = statusRes.registration;
          final eligibility = statusRes.eligibility;

          if (exam == null) return _buildNoExamView();

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(uktStatusProvider(widget.user.id)),
            color: const Color(0xFFE10600),
            backgroundColor: const Color(0xFF1E293B),
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // Status Banner (jika sudah daftar)
                if (reg != null) ...[_buildStatusBanner(reg), const SizedBox(height: 16)],

                // Info Jadwal Ujian
                _buildExamDetailsCard(exam, targetBelt),
                const SizedBox(height: 16),

                // Info Kelayakan Kehadiran (hanya tampil jika belum daftar & ada data eligibility)
                if (reg == null && eligibility != null && eligibility.minAttendancePercent > 0) ...[  
                  _buildEligibilityCard(eligibility),
                  const SizedBox(height: 16),
                ],

                // Form Registrasi / Status
                if (reg == null)
                  _buildRegistrationForm(exam, targetBelt, eligibility)
                else if (reg.status == 'APPROVED' || reg.status == 'GRADED')
                  _buildScoreSheetCard(reg)
                else
                  _buildWaitingApprovalCard(reg),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFE10600))),
        error: (err, stack) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 48),
                const SizedBox(height: 16),
                Text(
                  'Gagal memuat data UKT',
                  style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 8),
                Text(err.toString(), textAlign: TextAlign.center, style: GoogleFonts.inter(color: Colors.white54, fontSize: 12)),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => ref.invalidate(uktStatusProvider(widget.user.id)),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE10600)),
                  child: const Text('Coba Lagi'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────
  // WIDGET: Belum ada jadwal ujian
  // ─────────────────────────────────────────────────────
  Widget _buildNoExamView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 90, height: 90,
              decoration: const BoxDecoration(color: Color(0xFF1E293B), shape: BoxShape.circle),
              child: const Icon(Icons.emoji_events_outlined, size: 48, color: Colors.amber),
            ),
            const SizedBox(height: 24),
            Text('Belum Ada Jadwal UKT',
              style: GoogleFonts.spaceGrotesk(fontSize: 20, color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Text(
              'Pelatih akan mengumumkan jadwal ujian kenaikan tingkat melalui portal dojang.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(color: const Color(0xFF94A3B8), fontSize: 14, height: 1.5),
            ),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────
  // WIDGET: Banner status pendaftaran
  // ─────────────────────────────────────────────────────
  Widget _buildStatusBanner(UktParticipant reg) {
    Color bannerColor;
    String text;
    IconData icon;
    switch (reg.status) {
      case 'APPROVED':
        bannerColor = Colors.green;
        text = '✅ Pendaftaran Disetujui! Siapkan fisik Anda untuk hari ujian.';
        icon = Icons.check_circle_outline;
        break;
      case 'GRADED':
        final isPassed = reg.finalScore >= 70;
        bannerColor = isPassed ? Colors.blue : Colors.orange;
        text = isPassed ? '🏆 Selamat! Anda LULUS ujian kenaikan tingkat.' : '📋 Ujian Selesai. Direkomendasikan REMEDIAL / Latihan Tambahan.';
        icon = isPassed ? Icons.emoji_events : Icons.refresh;
        break;
      case 'FAILED':
        bannerColor = Colors.red;
        text = '❌ Pendaftaran ditolak. Silakan hubungi pelatih untuk informasi lebih lanjut.';
        icon = Icons.cancel_outlined;
        break;
      default:
        bannerColor = Colors.amber.shade800;
        text = '⏳ Menunggu verifikasi dokumen & pembayaran oleh pelatih.';
        icon = Icons.hourglass_top;
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
            child: Text(text, style: GoogleFonts.inter(color: bannerColor, fontWeight: FontWeight.bold, fontSize: 13, height: 1.4)),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────
  // WIDGET: Card detail jadwal ujian
  // ─────────────────────────────────────────────────────
  Widget _buildExamDetailsCard(UktExam exam, String targetBelt) {
    final formattedDate = DateFormat('EEEE, dd MMMM yyyy', 'id_ID').format(exam.date);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.emoji_events, color: Colors.amber, size: 20),
              const SizedBox(width: 8),
              Text('EVENT UKT AKTIF', style: GoogleFonts.spaceGrotesk(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
            ],
          ),
          const SizedBox(height: 10),
          Text(exam.title, style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildInfoRow(Icons.calendar_month, 'Tanggal Ujian', formattedDate),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.location_on, 'Lokasi', exam.location),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.people, 'Peserta Terdaftar', '${exam.participantCount} atlet'),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.military_tech, 'Target Sabuk Anda', targetBelt),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: const Color(0xFF94A3B8), size: 18),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold)),
              const SizedBox(height: 2),
              Text(value, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
            ],
          ),
        )
      ],
    );
  }

  // ─────────────────────────────────────────────────────
  // WIDGET: Kartu kelayakan kehadiran
  // ─────────────────────────────────────────────────────
  Widget _buildEligibilityCard(UktEligibility el) {
    final isOk = el.eligible;
    final color = isOk ? Colors.green : Colors.orange;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(isOk ? Icons.check_circle : Icons.warning_amber, color: color, size: 18),
              const SizedBox(width: 8),
              Text(
                isOk ? 'Syarat Kehadiran Terpenuhi ✅' : 'Peringatan Syarat Kehadiran ⚠️',
                style: GoogleFonts.spaceGrotesk(color: color, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: el.persentaseKehadiran / 100,
              minHeight: 8,
              backgroundColor: Colors.white12,
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Kehadiran ${el.persentaseKehadiran}% dari ${el.totalSesiTerjadwal} sesi (${el.totalHadir} hadir) dalam ${el.periodMonths} bulan terakhir\nMinimum: ${el.minAttendancePercent}% kehadiran',
            style: GoogleFonts.inter(color: Colors.white70, fontSize: 11, height: 1.5),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────
  // WIDGET: Form Registrasi UKT
  // ─────────────────────────────────────────────────────
  Widget _buildRegistrationForm(UktExam exam, String targetBelt, UktEligibility? eligibility) {
    final canRegister = eligibility == null || eligibility.eligible;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Formulir Pendaftaran UKT',
            style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(
            'Dengan mendaftar, Anda menyetujui persyaratan administrasi dan tagihan biaya ujian sabuk akan dibuat secara otomatis.',
            style: GoogleFonts.inter(color: const Color(0xFF94A3B8), fontSize: 13, height: 1.5),
          ),
          const SizedBox(height: 20),
          // Ringkasan pendaftaran
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(12)),
            child: Column(
              children: [
                _buildDetailRow('Sabuk Saat Ini', widget.user.currentBelt ?? 'Sabuk Putih'),
                _buildDetailRow('Target Sabuk', targetBelt),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: (canRegister && !_isRegistering) ? () => _handleRegister(exam, targetBelt) : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: canRegister ? const Color(0xFFE10600) : Colors.grey,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              child: _isRegistering
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text(
                      canRegister ? 'Daftar UKT Sekarang' : 'Kehadiran Belum Memenuhi Syarat',
                      style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────
  // WIDGET: Card menunggu approval & Upload Dokumen
  // ─────────────────────────────────────────────────────
  Widget _buildWaitingApprovalCard(UktParticipant reg) {
    final reqsAsync = ref.watch(uktRequirementsProvider);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Detail Pendaftaran', style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildDetailRow('No. Registrasi', reg.id.split('-').first.toUpperCase()),
          _buildDetailRow('Sabuk Saat Ini', widget.user.currentBelt ?? 'Sabuk Putih'),
          _buildDetailRow('Sabuk Target', reg.targetBelt),
          _buildDetailRow('Status Verifikasi', reg.status),
          const SizedBox(height: 12),
          const Divider(color: Color(0xFF334155)),
          const SizedBox(height: 8),
          
          Text('Dokumen Persyaratan', style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          
          reqsAsync.when(
            data: (reqList) {
              return Column(
                children: reqList.map((docName) {
                  final fileUrl = reg.uploadedDocs[docName];
                  final hasFile = fileUrl != null && fileUrl.isNotEmpty;
                  final isUploadingThis = _uploadingDocName == docName;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: hasFile ? Colors.green.withValues(alpha: 0.2) : Colors.red.withValues(alpha: 0.1)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(docName, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 3),
                              Text(
                                hasFile ? 'Sudah diunggah' : 'Belum diunggah',
                                style: GoogleFonts.inter(color: hasFile ? Colors.green : Colors.red, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                        if (isUploadingThis)
                          const SizedBox(
                            width: 20, height: 20,
                            child: CircularProgressIndicator(color: Color(0xFFE10600), strokeWidth: 2),
                          )
                        else if (hasFile)
                          Row(
                            children: [
                              const Icon(Icons.check_circle, color: Colors.green, size: 16),
                              const SizedBox(width: 8),
                              IconButton(
                                icon: const Icon(Icons.replay, color: Colors.white54, size: 16),
                                onPressed: () => _pickAndUploadDocument(docName),
                                tooltip: 'Unggah Ulang',
                              )
                            ],
                          )
                        else
                          ElevatedButton.icon(
                            onPressed: () => _pickAndUploadDocument(docName),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFE10600),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(Icons.upload, color: Colors.white, size: 12),
                            label: Text('Upload', style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                      ],
                    ),
                  );
                }).toList(),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFE10600))),
            error: (e, s) => Text('Gagal memuat list syarat: $e', style: const TextStyle(color: Colors.red)),
          ),
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
          Text(label, style: GoogleFonts.inter(color: const Color(0xFF94A3B8), fontSize: 13)),
          Flexible(
            child: Text(value,
              textAlign: TextAlign.end,
              style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
          ),
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
