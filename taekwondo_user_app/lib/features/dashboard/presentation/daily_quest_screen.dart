import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:video_compress/video_compress.dart';

import 'package:file_picker/file_picker.dart' as fp;
import 'package:url_launcher/url_launcher.dart';
import 'dart:typed_data';
import 'package:go_router/go_router.dart';

import '../../auth/domain/user_model.dart';
import '../data/quest_service.dart';
import '../../profile/data/profile_service.dart';

// Neo-Brutalism Theme Colors
const Color nbSurface = Color(0xFFF8F9FA);
const Color nbSurfaceContainerLowest = Color(0xFFFFFFFF);
const Color nbSurfaceContainer = Color(0xFFEDEEEF);
const Color nbSurfaceContainerHigh = Color(0xFFE7E8E9);
const Color nbSurfaceContainerHighest = Color(0xFFE1E3E4);
const Color nbBlack = Color(0xFF191C1D); // on-surface
const Color nbOutline = Color(0xFF737687);
const Color nbOutlineVariant = Color(0xFFC3C6D8);
const Color nbPrimary = Color(0xFF0052DC);
const Color nbPrimaryContainer = Color(0xFF2B6BFF);
const Color nbPrimaryFixed = Color(0xFFDBE1FF);
const Color nbSecondary = Color(0xFFBC000A);
const Color nbSecondaryContainer = Color(0xFFE2241F);
const Color nbOnSecondaryContainer = Color(0xFFFFFFFF);
const Color nbSecondaryFixed = Color(0xFFFFDAD5);
const Color nbTertiary = Color(0xFF745B00);
const Color nbTertiaryContainer = Color(0xFFD0A600);
const Color nbOnTertiaryContainer = Color(0xFF4F3D00);

class DailyQuestScreen extends ConsumerStatefulWidget {
  final UserModel user;
  const DailyQuestScreen({super.key, required this.user});

  @override
  ConsumerState<DailyQuestScreen> createState() => _DailyQuestScreenState();
}

class _DailyQuestScreenState extends ConsumerState<DailyQuestScreen> {
  bool _isUploading = false;
  String? _uploadingQuestId;
  final Map<String, bool> _watchedQuests = {};

  Future<void> _launchURL(String urlString, String questId) async {
    setState(() {
      _watchedQuests[questId] = true;
    });
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal membuka link video')),
        );
      }
    }
  }

  Future<void> _uploadAndCompleteQuest(QuestLog qLog) async {
    if (_isUploading) return;
    
    fp.FilePickerResult? result = await fp.FilePicker.platform.pickFiles(
      type: fp.FileType.video,
      withData: true,
    );

    if (result != null && result.files.single.path != null) {
      setState(() {
        _isUploading = true;
        _uploadingQuestId = qLog.id;
      });

      try {
        final String originalPath = result.files.single.path!;
        final String originalName = result.files.single.name;
        
        // Tampilkan snackbar info kompresi
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Sedang mengompres video agar lebih ringan, harap tunggu...'),
              duration: Duration(seconds: 3),
            ),
          );
        }

        // 1. Kompresi Video on-device
        final MediaInfo? mediaInfo = await VideoCompress.compressVideo(
          originalPath,
          quality: VideoQuality.MediumQuality,
          deleteOrigin: false,
          includeAudio: true,
        );

        if (mediaInfo == null || mediaInfo.file == null) {
          throw Exception('Gagal mengompres video.');
        }

        final Uint8List compressedBytes = await mediaInfo.file!.readAsBytes();
        final String finalFileName = 'compressed_${originalName.split('.').first}.mp4';

        final questService = ref.read(questServiceProvider);
        
        // 2. Upload video yang sudah dikompres
        final videoUrl = await questService.uploadVideo(compressedBytes, finalFileName);
        
        // 3. Selesaikan misi
        await questService.completeQuest(qLog.id, videoUrl: videoUrl);
        
        // Bersihkan cache file kompresi
        await VideoCompress.deleteAllCache();

        ref.invalidate(questProvider);
        ref.invalidate(profileProvider);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Misi berhasil diselesaikan!')),
          );
        }
      } catch (e) {
        if (mounted) {
          String errorMessage = 'Gagal mengirim video. Harap coba lagi.';
          final errStr = e.toString().toLowerCase();
          
          if (errStr.contains('413') || errStr.contains('too large') || errStr.contains('connection abort') || errStr.contains('socketexception')) {
            errorMessage = '⚠️ Ukuran video terlalu besar atau koneksi terputus. Harap gunakan video dengan durasi lebih pendek (maksimal 30 detik).';
          } else {
            errorMessage = 'Error: $e';
          }

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(errorMessage),
              backgroundColor: const Color(0xFFE2241F),
              duration: const Duration(seconds: 5),
            ),
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isUploading = false;
            _uploadingQuestId = null;
          });
        }
      }
    }
  }

  Future<void> _completeNormalQuest(QuestLog qLog) async {
    if (_isUploading) return;
    
    // Jika tipe kuis (memiliki pertanyaan kuis), tampilkan dialog popup kuis interaktif
    if (qLog.quest.quizQuestions != null && qLog.quest.quizQuestions!.isNotEmpty) {
      _showQuizDialog(qLog);
      return;
    }

    setState(() {
      _isUploading = true;
      _uploadingQuestId = qLog.id;
    });
    try {
      await ref.read(questServiceProvider).completeQuest(qLog.id);
      ref.invalidate(questProvider);
      ref.invalidate(profileProvider); // Update XP & coins setelah misi selesai
    } catch (e) {
       if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')),
          );
       }
    } finally {
      if (mounted) {
        setState(() {
          _isUploading = false;
          _uploadingQuestId = null;
        });
      }
    }
  }

  Future<void> _showQuizDialog(QuestLog qLog) async {
    final quiz = qLog.quest.quizQuestions!.first; // Ambil pertanyaan pertama dari kuis
    String? selectedOption;
    bool isSubmittingQuiz = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: const Color(0xFF1E293B),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
                side: const BorderSide(color: Color(0xFF334155), width: 1.5),
              ),
              title: Text(
                'Kuis Harian',
                style: GoogleFonts.spaceGrotesk(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: Colors.white,
                ),
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      quiz.question,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFFE2E8F0),
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 20),
                    ...quiz.options.map((option) {
                      final isSelected = selectedOption == option;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10.0),
                        child: InkWell(
                          onTap: isSubmittingQuiz ? null : () {
                            setDialogState(() {
                              selectedOption = option;
                            });
                          },
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFFE10600).withValues(alpha: 0.15) : const Color(0xFF0F172A),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isSelected ? const Color(0xFFE10600) : const Color(0xFF334155),
                                width: 1.5,
                              ),
                            ),
                            child: Text(
                              option,
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
              actionsPadding: const EdgeInsets.only(right: 16, bottom: 16),
              actions: [
                TextButton(
                  onPressed: isSubmittingQuiz ? null : () => Navigator.pop(context),
                  child: Text(
                    'Batal',
                    style: GoogleFonts.spaceGrotesk(
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF94A3B8),
                    ),
                  ),
                ),
                ElevatedButton(
                  onPressed: (selectedOption == null || isSubmittingQuiz)
                      ? null
                      : () async {
                          setDialogState(() {
                            isSubmittingQuiz = true;
                          });
                          try {
                            await ref.read(questServiceProvider).submitQuiz(
                              qLog.id,
                              [selectedOption!],
                            );
                            ref.invalidate(questProvider);
                            ref.invalidate(profileProvider); // Update XP & coins setelah kuis selesai
                            if (context.mounted) {
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  backgroundColor: Colors.green,
                                  content: Text('Jawaban benar! Misi kuis berhasil diselesaikan.'),
                                ),
                              );
                            }
                          } catch (e) {
                            setDialogState(() {
                              isSubmittingQuiz = false;
                            });
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  backgroundColor: Colors.red,
                                  content: Text('Jawaban salah! Silakan coba lagi.'),
                                ),
                              );
                            }
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE10600),
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: Colors.grey.withValues(alpha: 0.3),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: isSubmittingQuiz
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : Text(
                          'Kirim',
                          style: GoogleFonts.spaceGrotesk(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: nbSurface,
      body: Stack(
        children: [
          // Background Dotted Pattern
          Positioned.fill(
            child: CustomPaint(painter: GridBackgroundPainter()),
          ),
          
          Column(
            children: [
              _buildTopAppBar(),
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildProgressSection(),
                      const SizedBox(height: 24),
                      _buildQuestList(ref.watch(questProvider)),
                      const SizedBox(height: 24),
                      _buildBonusGrid(),
                      const SizedBox(height: 100), // padding for bottom nav
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Bottom Nav Bar
          Positioned(
            bottom: 0, left: 0, right: 0,
            child: _buildBottomNavBar(),
          ),
        ],
      ),
    );
  }

  Widget _buildTopAppBar() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16).copyWith(top: 24),
      decoration: const BoxDecoration(
        color: nbSurface,
        border: Border(bottom: BorderSide(color: nbBlack, width: 4)),
        boxShadow: [BoxShadow(color: nbBlack, offset: Offset(0, 4))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: () => context.pop(),
                child: const Icon(Icons.arrow_back, color: nbBlack, size: 24),
              ),
              const SizedBox(width: 12),
              Text(
                'DAILY QUESTS',
                style: GoogleFonts.spaceGrotesk(fontSize: 22, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic, color: nbPrimary, letterSpacing: 1.0),
              ),
            ],
          ),
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
              color: nbSurfaceContainerHighest,
              shape: BoxShape.circle,
              border: Border.all(color: nbBlack, width: 3),
              boxShadow: const [BoxShadow(color: nbBlack, offset: Offset(3, 3))],
              image: DecorationImage(
                fit: BoxFit.cover,
                image: NetworkImage('https://ui-avatars.com/api/?name=${widget.user.name}&background=0052dc&color=fff'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressSection() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: nbSurfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: nbBlack, width: 3),
        boxShadow: const [BoxShadow(color: nbBlack, offset: Offset(6, 6))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('PROGRES MISI', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: nbOutline, letterSpacing: 1.5)),
                  const SizedBox(height: 4),
                  Text('Level Up!', style: GoogleFonts.spaceGrotesk(fontSize: 26, fontWeight: FontWeight.w900, color: nbBlack)),
                ],
              ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text('250', style: GoogleFonts.spaceGrotesk(fontSize: 26, fontWeight: FontWeight.w900, color: nbPrimary)),
                  Text('/500 XP', style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.bold, color: nbOutline)),
                ],
              )
            ],
          ),
          const SizedBox(height: 16),
          Container(
            height: 24,
            width: double.infinity,
            decoration: BoxDecoration(
              color: nbSurfaceContainerHighest,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: nbBlack, width: 2.5),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(9),
              child: FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: 0.5,
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(colors: [nbPrimary, nbPrimaryContainer]),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text('Lakukan 3 misi lagi untuk bonus harian!', style: GoogleFonts.hankenGrotesk(fontSize: 14, color: nbOutline, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildQuestList(AsyncValue<List<QuestLog>> questsAsync) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.ads_click, color: nbSecondary),
            const SizedBox(width: 4),
            Text('Misi Hari Ini', style: GoogleFonts.hankenGrotesk(fontSize: 20, fontWeight: FontWeight.bold, color: nbBlack)),
          ],
        ),
        const SizedBox(height: 12),
        questsAsync.when(
          loading: () => const Center(child: Padding(
            padding: EdgeInsets.all(24.0),
            child: CircularProgressIndicator(color: nbPrimary),
          )),
          error: (err, stack) => Center(child: Text('Gagal memuat misi: $err', style: const TextStyle(color: nbSecondary))),
          data: (quests) {
            final List<QuestLog> typedQuests = (quests as List).cast<QuestLog>();
            if (typedQuests.isEmpty) {
              return Text('Tidak ada misi untuk hari ini.', style: GoogleFonts.hankenGrotesk(fontSize: 16, color: nbOutline));
            }
            return Column(
              children: typedQuests.map<Widget>((QuestLog q) {
                // Tentukan Ikon dan Warna berdasarkan Kategori
                IconData icon;
                Color bgColor;
                Color fgColor;

                switch (q.quest.category) {
                  case 'FITNESS':
                    icon = Icons.fitness_center;
                    bgColor = nbPrimaryFixed;
                    fgColor = nbPrimary;
                    break;
                  case 'TECHNICAL':
                    icon = Icons.sports_martial_arts;
                    bgColor = nbSecondaryFixed;
                    fgColor = nbSecondary;
                    break;
                  case 'DISCIPLINE':
                    icon = Icons.self_improvement;
                    bgColor = nbSurfaceContainerHigh;
                    fgColor = nbOutline;
                    break;
                  default:
                    icon = Icons.directions_run;
                    bgColor = nbPrimaryFixed;
                    fgColor = nbPrimary;
                }

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: _buildQuestItem(
                    icon: icon,
                    iconBgColor: bgColor,
                    iconColor: fgColor,
                    questLog: q,
                  ),
                );
              }).toList(),
            );
          }
        ),
      ],
    );
  }

  Widget _buildQuestItem({
    required IconData icon,
    required Color iconBgColor,
    required Color iconColor,
    required QuestLog questLog,
  }) {
    final title = questLog.quest.title;
    final desc = questLog.quest.description;
    final xp = '+${questLog.quest.baseXp} XP';
    final isCompleted = questLog.completed;
    final bool requireVideo = questLog.quest.requireVideo;
    final String? videoUrl = questLog.quest.videoUrl;
    final bool isThisUploading = _isUploading && _uploadingQuestId == questLog.id;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isCompleted ? nbSurfaceContainer : nbSurfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isCompleted ? nbOutlineVariant : nbBlack, width: 3),
        boxShadow: isCompleted ? null : const [BoxShadow(color: nbBlack, offset: Offset(6, 6))],
      ),
      child: Row(
        children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
              color: iconBgColor,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: isCompleted ? nbOutlineVariant : nbBlack, width: 2),
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.hankenGrotesk(fontSize: 20, fontWeight: FontWeight.bold, color: isCompleted ? nbOutline : nbBlack, height: 1.1)),
                const SizedBox(height: 4),
                Text(desc, style: GoogleFonts.hankenGrotesk(fontSize: 14, color: nbOutline)),
              ],
            ),
          ),
          if (isCompleted)
            const Icon(Icons.check_circle, color: nbTertiary, size: 36)
          else
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: nbTertiaryContainer,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: nbBlack, width: 2),
                  ),
                  child: Text(xp, style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: nbOnTertiaryContainer)),
                ),
                const SizedBox(height: 6),
                if (videoUrl != null && videoUrl.isNotEmpty && !isCompleted) ...[
                  GestureDetector(
                    onTap: () => _launchURL(videoUrl, questLog.id),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: _watchedQuests[questLog.id] == true ? Colors.green : nbSecondary,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: nbBlack, width: 2),
                        boxShadow: const [BoxShadow(color: nbBlack, offset: Offset(2, 2))],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _watchedQuests[questLog.id] == true ? Icons.check_circle : Icons.play_circle_fill,
                            color: Colors.white,
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _watchedQuests[questLog.id] == true ? 'SUDAH DITONTON' : 'TONTON',
                            style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.0),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
                GestureDetector(
                  onTap: isThisUploading ? null : () {
                    if (videoUrl != null && videoUrl.isNotEmpty && _watchedQuests[questLog.id] != true) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          backgroundColor: nbSecondary,
                          content: Text('Silakan tonton video tutorial terlebih dahulu untuk mengklaim reward!'),
                        ),
                      );
                      return;
                    }
                    if (requireVideo) {
                      _uploadAndCompleteQuest(questLog);
                    } else {
                      _completeNormalQuest(questLog);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isThisUploading 
                          ? nbOutline 
                          : (videoUrl != null && videoUrl.isNotEmpty && _watchedQuests[questLog.id] != true)
                              ? nbOutline
                              : nbPrimary,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: nbBlack, width: 2),
                      boxShadow: isThisUploading ? null : const [BoxShadow(color: nbBlack, offset: Offset(2, 2))],
                    ),
                    child: isThisUploading 
                      ? const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (requireVideo) const Icon(Icons.upload_file, color: Colors.white, size: 16),
                            if (requireVideo) const SizedBox(width: 4),
                            Text(requireVideo ? 'UPLOAD BUKTI' : 'MULAI', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.0)),
                          ],
                        ),
                  ),
                )
              ],
            )
        ],
      ),
    );
  }

  Widget _buildBonusGrid() {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 128,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: nbTertiaryContainer,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: nbBlack, width: 4),
              boxShadow: const [BoxShadow(color: nbBlack, offset: Offset(4, 4))],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Icon(Icons.military_tech, color: nbOnTertiaryContainer, size: 28),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('STREAK', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: nbOnTertiaryContainer)),
                    Text('5 HARI', style: GoogleFonts.hankenGrotesk(fontSize: 24, fontWeight: FontWeight.w900, color: nbOnTertiaryContainer)),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Container(
            height: 128,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: nbSecondaryContainer,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: nbBlack, width: 4),
              boxShadow: const [BoxShadow(color: nbBlack, offset: Offset(4, 4))],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Icon(Icons.local_fire_department, color: nbOnSecondaryContainer, size: 28),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('RANK', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: nbOnSecondaryContainer)),
                    Text('TOP 10%', style: GoogleFonts.hankenGrotesk(fontSize: 24, fontWeight: FontWeight.w900, color: nbOnSecondaryContainer)),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomNavBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12).copyWith(bottom: 24),
      decoration: const BoxDecoration(
        color: nbSurface,
        border: Border(top: BorderSide(color: nbBlack, width: 4)),
        boxShadow: [BoxShadow(color: nbBlack, offset: Offset(0, -4))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          GestureDetector(
            onTap: () => context.go('/'),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.home_outlined, color: nbOutline),
                Text('Beranda', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: nbOutline)),
              ],
            ),
          ),
          Transform.translate(
            offset: const Offset(0, -4),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(
                color: nbPrimary,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: nbBlack, width: 2),
                boxShadow: const [BoxShadow(color: nbBlack, offset: Offset(4, 4))],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Image.asset('assets/images/daily_quest.png', width: 24, height: 24, color: Colors.white, errorBuilder: (_,__,___) => const Icon(Icons.history, color: Colors.white)),
                  Text('Daily Quest', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                ],
              ),
            ),
          ),
          GestureDetector(
            onTap: () => context.go('/profile'),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.person_outline, color: nbOutline),
                Text('Profil', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: nbOutline)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class GridBackgroundPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = const Color(0xFFC3C6D8);
    const double spacing = 24.0;
    const double radius = 0.5;

    for (double y = 0; y < size.height; y += spacing) {
      for (double x = 0; x < size.width; x += spacing) {
        canvas.drawCircle(Offset(x, y), radius, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
