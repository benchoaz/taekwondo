import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:video_compress/video_compress.dart';

import 'package:file_picker/file_picker.dart' as fp;
import 'package:youtube_player_iframe/youtube_player_iframe.dart';
import 'web_iframe_helper.dart';
import '../../../core/network/firebase_messaging_service.dart';
import '../../../core/widgets/dynamic_asset_widget.dart';

import '../../auth/domain/user_model.dart';
import '../../auth/data/auth_provider.dart';
import '../../spp/presentation/spp_screen.dart';
import '../../ukt/presentation/ukt_screen.dart';
import '../../../core/network/dio_client.dart';
import '../data/member_attendance_service.dart';
import '../data/quest_service.dart';
import '../../profile/data/profile_service.dart';
import '../../profile/presentation/profile_screen.dart';
import '../data/shop_service.dart';
import '../../schedule/presentation/schedule_screen.dart';
import '../data/notification_service.dart';
import 'notification_screen.dart';
import '../data/event_service.dart';
import '../data/article_service.dart';

// Refined Athletic White-Dominant Palette
const Color darkBg = Color(0xFFF8FAFC); // Canvas background (Slate 50)
const Color cardBg = Colors.white; // Pure white card surface
const Color borderSlate = Color(0xFFE2E8F0); // Subtle Slate-200 border
const Color brandRed = Color(0xFFDC2626); // Refined athletic red
const Color goldAccent = Color(0xFFD97706); // Refined amber-600
const Color textWhite = Color(0xFF0F172A); // High-contrast Slate-900
const Color textGray = Color(0xFF64748B); // Slate-500 secondary
const Color textPrimary = Color(0xFF0F172A); // Slate-900
const Color textSecondary = Color(0xFF475569); // Slate-600
const Color textMuted = Color(0xFF94A3B8); // Slate-400

class MemberDashboardScreen extends ConsumerStatefulWidget {
  final UserModel user;
  const MemberDashboardScreen({super.key, required this.user});

  @override
  ConsumerState<MemberDashboardScreen> createState() => _MemberDashboardScreenState();
}

// Helper regex untuk mengekstrak Video ID YouTube secara aman di Web & Mobile tanpa load WebView class
String? _getYoutubeId(String url) {
  final regExp = RegExp(
    r'^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*',
    caseSensitive: false,
    multiLine: false,
  );
  final match = regExp.firstMatch(url);
  if (match != null && match.groupCount >= 2) {
    return match.group(2);
  }
  return null;
}

class _MemberDashboardScreenState extends ConsumerState<MemberDashboardScreen> {
  int _currentTab = 0; // 0: Lobby, 1: Toko, 2: Misi, 3: SPP, 4: Atlet
  bool _isAbsenLoading = false;
  bool _isAbsenSuccess = false;
  String? _absenSuccessDetail;

  // States for expandable daily quests
  String? _expandedQuestId;
  final Map<String, bool> _watchedQuests = {};
  String? _selectedQuizOption;
  final TextEditingController _quizTextController = TextEditingController();
  bool _isQuestSubmitting = false;
  bool _isUploadingVideo = false;
  final Map<String, dynamic> _ytControllers = {};

  @override
  void initState() {
    super.initState();
    // Inisialisasi FCM token perangkat saat aplikasi dibuka agar server selalu memiliki token terbaru
    WidgetsBinding.instance.addPostFrameCallback((_) {
      try {
        final fcmService = FirebaseMessagingService(ref.read(dioProvider));
        fcmService.initNotifications(widget.user);
      } catch (e) {
        debugPrint("FCM Init failed on dashboard startup: $e");
      }
      _checkTodayAttendanceStatus();
    });
  }

  @override
  void dispose() {
    _quizTextController.dispose();
    // Bersihkan controller mobile YouTube
    for (var controller in _ytControllers.values) {
      if (controller is YoutubePlayerController) {
        controller.close();
      }
    }
    // Bersihkan callback web iframe agar tidak memory leak
    for (final id in _ytControllers.keys) {
      unregisterYoutubeIframe(id);
    }
    // Juga bersihkan callback dari quest yang pernah di-watch di Web
    for (final id in _watchedQuests.keys) {
      unregisterYoutubeIframe(id);
    }
    super.dispose();
  }

  void _showSubmissionOptionDialogFromDashboard(dynamic qLog, Color themeColor) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Metode Pengumpulan Bukti',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    _uploadAndCompleteQuestFromDashboard(qLog);
                  },
                  icon: const Icon(Icons.upload_file_rounded, color: Colors.white),
                  label: const Text('Unggah File Video (Otomatis Kompres)'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeColor,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    _showLinkInputDialogFromDashboard(qLog);
                  },
                  icon: const Icon(Icons.link_rounded, color: textPrimary),
                  label: const Text('Tempel Link Video (YouTube / GDrive)'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: textPrimary,
                    side: const BorderSide(color: borderSlate, width: 1.5),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showLinkInputDialogFromDashboard(dynamic qLog) {
    final TextEditingController linkController = TextEditingController();
    bool isSubmitting = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: const BorderSide(color: borderSlate, width: 1),
              ),
              title: Text(
                'Tempel Link Video',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w700,
                  fontSize: 16,
                  color: textPrimary,
                ),
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Pastikan link video (Google Drive / YouTube) dapat diakses publik oleh pelatih.',
                    style: GoogleFonts.inter(fontSize: 12, color: textSecondary),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: linkController,
                    keyboardType: TextInputType.url,
                    style: const TextStyle(color: textPrimary, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'https://youtube.com/watch?v=... atau link Drive',
                      hintStyle: const TextStyle(color: textMuted, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: borderSlate),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: brandRed, width: 1.5),
                      ),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: isSubmitting ? null : () => Navigator.pop(context),
                  child: const Text('Batal', style: TextStyle(color: textMuted)),
                ),
                ElevatedButton(
                  onPressed: isSubmitting
                      ? null
                      : () async {
                          final link = linkController.text.trim();
                          if (link.isEmpty || !link.startsWith('http')) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Masukkan URL link video yang valid.')),
                            );
                            return;
                          }
                          setDialogState(() {
                            isSubmitting = true;
                          });
                          try {
                            final questService = ref.read(questServiceProvider);
                            await questService.completeQuest(qLog.id, videoUrl: link, notes: 'Pengumpulan lewat link: $link');
                            
                            ref.invalidate(questProvider);
                            ref.invalidate(profileProvider);
                            if (context.mounted) {
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Tautan video berhasil dikirim!')),
                              );
                              setState(() {
                                _expandedQuestId = null;
                              });
                            }
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Gagal mengirim link: $e')),
                              );
                            }
                          } finally {
                            setDialogState(() {
                              isSubmitting = false;
                            });
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: Text(isSubmitting ? 'Mengirim...' : 'Kirim'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _uploadAndCompleteQuestFromDashboard(dynamic qLog) async {
    if (_isUploadingVideo) return;
    
    fp.FilePickerResult? result = await fp.FilePicker.platform.pickFiles(
      type: fp.FileType.video,
      withData: true,
    );

    if (result != null && result.files.single.path != null) {
      setState(() {
        _isUploadingVideo = true;
      });

      try {
        final String originalPath = result.files.single.path!;
        final String originalName = result.files.single.name;
        
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

        final String finalFileName = 'compressed_${originalName.split('.').first}.mp4';

        final questService = ref.read(questServiceProvider);
        
        // 2. Upload video stream langsung dari file terkompresi (Memory Safe)
        final videoUrl = await questService.uploadVideoFile(mediaInfo.file!.path, finalFileName);
        
        // 3. Selesaikan misi
        await questService.completeQuest(qLog.id, videoUrl: videoUrl, notes: "Misi disetor lewat dashboard");
        
        await VideoCompress.deleteAllCache();

        ref.invalidate(questProvider);
        ref.invalidate(profileProvider);
        if (mounted) {
          setState(() {
            _expandedQuestId = null;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Misi berhasil diselesaikan!')),
          );
        }
      } catch (e) {
        if (mounted) {
          String errorMessage = 'Gagal mengirim video. Harap coba lagi.';
          final errStr = e.toString().toLowerCase();
          
          if (errStr.contains('timeout')) {
            errorMessage = '⚠️ Waktu unggah habis (Timeout). Koneksi internet Anda tidak stabil atau lambat. Silakan gunakan link video Drive/YouTube saja.';
          } else if (errStr.contains('413') || errStr.contains('too large')) {
            errorMessage = '⚠️ Ukuran file video terlalu besar bagi server. Silakan gunakan link video Drive/YouTube saja.';
          } else if (errStr.contains('connection abort') || errStr.contains('socketexception') || errStr.contains('network_error')) {
            errorMessage = '⚠️ Koneksi internet terputus di tengah jalan. Silakan periksa jaringan internet Anda atau kumpulkan lewat link video.';
          } else {
            errorMessage = '⚠️ Gagal: $e. Coba kumpulkan menggunakan link video.';
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
            _isUploadingVideo = false;
          });
        }
      }
    }
  }

  String _getAbsoluteUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return 'https://www.whitetigerkraksaan.com$cleanPath';
  }

  String _getDisplayName(String? fullName) {
    if (fullName == null || fullName.trim().isEmpty) return 'Member';
    final parts = fullName.trim().split(RegExp(r'\s+'));
    return parts.first;
  }

  @override
  Widget build(BuildContext context) {
    final shopDataAsync = ref.watch(shopDataProvider);
    final profileAsync = ref.watch(profileProvider);
    
    Color themeColor = brandRed;
    String? emblemUrl;
    
    if (shopDataAsync.value != null) {
      final shopData = shopDataAsync.value!;
      final equippedThemeId = shopData.active['themeId'];
      if (equippedThemeId != null) {
        if (equippedThemeId == 'theme-gold') {
          themeColor = const Color(0xFFEAB308);
        } else if (equippedThemeId == 'theme-diamond') {
          themeColor = const Color(0xFF38BDF8);
        } else if (equippedThemeId == 'theme-ruby') {
          themeColor = const Color(0xFFEF4444);
        } else if (equippedThemeId == 'theme-emerald') {
          themeColor = const Color(0xFF10B981);
        } else if (equippedThemeId == 'theme-amethyst') {
          themeColor = const Color(0xFF8B5CF6);
        }
      }
      
      final emblemId = shopData.active['emblemId'];
      if (emblemId != null) {
        final emblemItem = shopData.items.where((i) => i.id == emblemId).firstOrNull;
        emblemUrl = emblemItem?.itemUrl;
      }
    }

    // ✅ UI Fallback Error Handling
    if (profileAsync.hasError) {
      final error = profileAsync.error.toString();
      String message = 'Terjadi kesalahan';
      bool isSessionExpired = false;

      if (error.contains('404')) {
        message = 'Data dashboard belum tersedia';
      } else if (error.contains('401')) {
        message = 'Session expired';
        isSessionExpired = true;
      } else if (error.contains('500')) {
        message = 'Server sedang bermasalah';
      }

      return Scaffold(
        backgroundColor: Colors.transparent,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline_rounded, color: themeColor, size: 70),
                const SizedBox(height: 20),
                Text(
                  message,
                  style: const TextStyle(
                    color: textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  isSessionExpired 
                      ? 'Silakan login kembali untuk memperbarui sesi Anda.' 
                      : 'Pastikan koneksi internet stabil atau hubungi admin.',
                  style: const TextStyle(
                    color: textSecondary,
                    fontSize: 13,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 28),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () {
                        ref.invalidate(profileProvider);
                      },
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('Coba Lagi'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: themeColor,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    OutlinedButton.icon(
                      onPressed: () {
                        ref.read(authProvider.notifier).logout();
                      },
                      icon: const Icon(Icons.logout_rounded, color: textPrimary),
                      label: const Text('Keluar / Login Ulang', style: TextStyle(color: textPrimary)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: borderSlate),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      );
    }

    int coins = widget.user.dojangCoins ?? 0;
    if (shopDataAsync.value != null) {
      coins = shopDataAsync.value!.wallet;
    }

    String belt = widget.user.currentBelt ?? 'Sabuk Putih';
    int progress = widget.user.progress ?? 0;
    if (profileAsync.value != null) {
      belt = profileAsync.value!.currentBelt;
      progress = profileAsync.value!.progress;
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          // Subtle Taekwondo Logo Background (Watermark)
          Positioned.fill(
            child: Center(
              child: Opacity(
                opacity: 0.03,
                child: Image.asset(
                  'assets/images/logo.png',
                  width: MediaQuery.of(context).size.width * 0.75,
                  fit: BoxFit.contain,
                ),
              ),
            ),
          ),

          // Main View Switcher
          SafeArea(
            child: Column(
              children: [
                _buildTopAppBar(coins, belt, shopDataAsync, themeColor, emblemUrl, profileAsync.valueOrNull),
                Expanded(
                  child: IndexedStack(
                    index: _currentTab,
                    children: [
                      _buildLobbyTab(progress, belt, themeColor),
                      _buildTokoTab(shopDataAsync, themeColor),
                      _buildMisiTab(themeColor),
                      _buildSppTab(),
                      _buildAtletTab(),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Fixed Custom Bottom Nav Bar
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _buildBottomNavBar(),
          ),
        ],
      ),
    );
  }

  Widget _buildTopAppBar(int coins, String belt, AsyncValue<ShopData> shopDataAsync, Color themeColor, String? emblemUrl, ProfileData? profile) {
    final shopData = shopDataAsync.valueOrNull;
    
    String? frameUrl;
    String? frameCss;
    String? titleName;
    String? titleUrl;
    
    if (shopData != null) {
      final frameId = shopData.active['frameId'];
      if (frameId != null) {
        final frameItem = shopData.items.where((i) => i.id == frameId).firstOrNull;
        frameUrl = frameItem?.itemUrl;
        frameCss = frameItem?.cssValue;
      }
      
      final titleId = shopData.active['titleId'];
      if (titleId != null) {
        final titleItem = shopData.items.where((i) => i.id == titleId).firstOrNull;
        titleName = titleItem?.name;
        titleUrl = titleItem?.itemUrl;
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: borderSlate, width: 1)),
        boxShadow: [
          BoxShadow(color: Color(0x04000000), blurRadius: 4, offset: Offset(0, 1)),
        ],
      ),
      child: Row(
        children: [
          (() {
            final cssStyles = CssValueParser.parseCss(frameCss);
            final Color? parsedBorderColor = cssStyles['borderColor'];
            final double parsedBorderWidth = cssStyles['borderWidth'] ?? 2.0;
            final Color? parsedGlowColor = cssStyles['glowColor'];
            final double parsedGlowBlurRadius = cssStyles['glowBlurRadius'] ?? 0.0;

            return Stack(
              alignment: Alignment.center,
              children: [
                // 1. Base Profile Picture (Circle)
                Container(
                  width: 44,
                  height: 44,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Color(0xFFF1F5F9),
                  ),
                  child: ClipOval(
                    child: Image(
                      image: profile?.profilePicture != null
                          ? NetworkImage(_getAbsoluteUrl(profile!.profilePicture!))
                          : const NetworkImage('https://api.dicebear.com/7.x/avataaars/png?seed=Taekwondo') as ImageProvider,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                // 2. Frame Overlay (Circle)
                if (frameUrl != null && frameUrl.isNotEmpty)
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      image: DecorationImage(
                        image: NetworkImage(_getAbsoluteUrl(frameUrl)),
                        fit: BoxFit.cover,
                      ),
                      border: parsedBorderColor != null 
                          ? Border.all(color: parsedBorderColor, width: parsedBorderWidth)
                          : null,
                      boxShadow: parsedGlowColor != null && parsedGlowBlurRadius > 0
                          ? [
                              BoxShadow(
                                color: parsedGlowColor,
                                blurRadius: parsedGlowBlurRadius,
                                spreadRadius: 1,
                              )
                            ]
                          : null,
                    ),
                  ),
                // 3. Default border if no frame (Circle)
                if (frameUrl == null || frameUrl.isEmpty)
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                    ),
                  ),
                Positioned(
                  bottom: 1,
                  right: 1,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981), // Emerald online dot
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 1.5),
                    ),
                  ),
                ),
              ],
            );
          })(),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TweenAnimationBuilder<double>(
                      tween: Tween<double>(begin: 0.3, end: 1.0),
                      duration: const Duration(milliseconds: 1000),
                      curve: Curves.easeInOut,
                      builder: (context, opacity, child) {
                        return Opacity(
                          opacity: opacity,
                          child: child,
                        );
                      },
                      child: titleUrl != null && titleUrl.isNotEmpty
                          ? DynamicAssetWidget(
                              url: _getAbsoluteUrl(titleUrl),
                              height: 24,
                              fit: BoxFit.contain,
                              blendMode: BlendMode.screen,
                            )
                          : Text(
                              (titleName ?? 'ATLET MUDA').toUpperCase(),
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.8,
                                color: titleName != null ? goldAccent : themeColor,
                              ),
                            ),
                    ),
                    if (emblemUrl != null && emblemUrl.isNotEmpty) ...[
                      const SizedBox(width: 4),
                      DynamicAssetWidget(
                        url: _getAbsoluteUrl(emblemUrl),
                        width: 14,
                        height: 14,
                        fit: BoxFit.contain,
                      ),
                    ]
                  ],
                ),
                Text(
                  _getDisplayName(widget.user.name),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: textPrimary,
                  ),
                ),
                Text(
                  widget.user.memberNumber ?? '#WTK-2026-0089',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: textMuted,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Coins Pill widget
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFFBEB),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFFDE68A), width: 1),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.monetization_on_rounded, color: goldAccent, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      '$coins',
                      style: GoogleFonts.inter(
                        color: goldAccent,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              // Bell icon inside a clean white circle
              (() {
                final notifsAsync = ref.watch(notificationProvider);
                final hasUnread = notifsAsync.valueOrNull?.any((n) => !n.isRead) ?? false;
                
                return Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                        border: Border.all(color: borderSlate),
                      ),
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        icon: const Icon(Icons.notifications_none_rounded, color: textSecondary, size: 19),
                        onPressed: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationScreen()));
                        },
                      ),
                    ),
                    if (hasUnread)
                      Positioned(
                        top: -1,
                        right: -1,
                        child: Container(
                          width: 9,
                          height: 9,
                          decoration: const BoxDecoration(
                            color: brandRed,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                  ],
                );
              })(),
              const SizedBox(width: 6),
              // Exit/logout icon inside a clean white circle
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                  border: Border.all(color: borderSlate),
                ),
                child: IconButton(
                  padding: EdgeInsets.zero,
                  icon: const Icon(Icons.logout_rounded, color: textSecondary, size: 18),
                  onPressed: () {
                    ref.read(authProvider.notifier).logout();
                  },
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildLobbyTab(int progress, String belt, Color themeColor) {
    final questsAsync = ref.watch(questProvider);
    int completedQuests = 0;
    int totalQuests = 0;
    if (questsAsync.value != null) {
      totalQuests = questsAsync.value!.length;
      completedQuests = questsAsync.value!.where((q) => q.completed).length;
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(profileProvider);
        ref.invalidate(shopDataProvider);
      },
      color: themeColor,
      backgroundColor: cardBg,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Level & XP Bar (RPG Exponential XP Curve)
            Builder(
              builder: (context) {
                final int totalXp = progress; 
                int level = 1;
                int accumulatedXpForCurrentLevel = 0;
                int nextLevelThreshold = 100;

                while (true) {
                  final double multiplier = math.pow(level, 1.5).toDouble();
                  final int currentLevelMaxXp = (100 * multiplier).round();
                  
                  if (totalXp >= accumulatedXpForCurrentLevel + currentLevelMaxXp) {
                    accumulatedXpForCurrentLevel += currentLevelMaxXp;
                    level++;
                  } else {
                    nextLevelThreshold = currentLevelMaxXp;
                    break;
                  }
                }

                final int currentLevelXp = totalXp - accumulatedXpForCurrentLevel;
                final double widthFactor = (currentLevelXp / nextLevelThreshold).clamp(0.0, 1.0);

                return Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: borderSlate),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x05000000),
                        blurRadius: 8,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFFBEB),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFFFDE68A)),
                            ),
                            child: Text(
                              'LV.$level',
                              style: GoogleFonts.inter(
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFFB45309),
                                fontSize: 11,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Chukjae (Novice) • $belt',
                              style: GoogleFonts.inter(
                                color: textPrimary,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                          ),
                          Text(
                            '$currentLevelXp / $nextLevelThreshold XP',
                            style: GoogleFonts.inter(
                              color: textSecondary,
                              fontWeight: FontWeight.w500,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Container(
                        height: 8,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: FractionallySizedBox(
                            widthFactor: widthFactor,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 800),
                              curve: Curves.easeOutQuart,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(6),
                                gradient: const LinearGradient(
                                  colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 14),

            // Elegant Athletic Attendance Card
            GestureDetector(
              onTap: _isAbsenLoading ? null : () => _handleSelfAttendance(),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                decoration: BoxDecoration(
                  color: _isAbsenSuccess ? const Color(0xFFECFDF5) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: _isAbsenSuccess ? const Color(0xFFA7F3D0) : borderSlate,
                    width: 1.2,
                  ),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x06000000),
                      blurRadius: 10,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 46,
                      height: 46,
                      decoration: BoxDecoration(
                        color: _isAbsenSuccess ? Colors.white : const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _isAbsenSuccess ? const Color(0xFFA7F3D0) : const Color(0xFFFECACA),
                        ),
                      ),
                      child: _isAbsenLoading
                          ? const Padding(
                              padding: EdgeInsets.all(12),
                              child: CircularProgressIndicator(color: brandRed, strokeWidth: 2.5),
                            )
                          : Icon(
                              _isAbsenSuccess ? Icons.check_circle_rounded : Icons.fingerprint_rounded,
                              color: _isAbsenSuccess ? const Color(0xFF059669) : brandRed,
                              size: 26,
                            ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isAbsenLoading
                                ? 'Memverifikasi Presensi...'
                                : (_isAbsenSuccess
                                    ? 'Kehadiran Tercatat'
                                    : 'Presensi Latihan Dojang'),
                            style: GoogleFonts.inter(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: _isAbsenSuccess ? const Color(0xFF065F46) : textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _isAbsenLoading
                                ? 'Memeriksa lokasi GPS Anda...'
                                : (_isAbsenSuccess
                                    ? (_absenSuccessDetail != null
                                        ? 'Sesi: $_absenSuccessDetail'
                                        : 'Presensi latihan hari ini berhasil')
                                    : 'Ketuk untuk mencatat kehadiran via GPS'),
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: _isAbsenSuccess ? const Color(0xFF047857) : textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: _isAbsenSuccess ? Colors.white : brandRed,
                        borderRadius: BorderRadius.circular(10),
                        border: _isAbsenSuccess ? Border.all(color: const Color(0xFFA7F3D0)) : null,
                      ),
                      child: Text(
                        _isAbsenSuccess ? 'Hadir ✅' : 'Absen',
                        style: GoogleFonts.inter(
                          color: _isAbsenSuccess ? const Color(0xFF065F46) : Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Daily Quest Card in Lobby (Clean White Card)
            GestureDetector(
              onTap: () => setState(() => _currentTab = 2),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: borderSlate),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x04000000),
                      blurRadius: 8,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: borderSlate),
                      ),
                      child: Image.asset(
                        'assets/images/daily_quest_tiger_transparent.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Misi Harian',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            totalQuests == 0 
                                ? 'Tidak ada misi aktif untuk hari ini.' 
                                : '$completedQuests dari $totalQuests misi telah selesai',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: (completedQuests == totalQuests && totalQuests > 0)
                            ? const Color(0xFFECFDF5)
                            : const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: (completedQuests == totalQuests && totalQuests > 0)
                              ? const Color(0xFFA7F3D0)
                              : const Color(0xFFFECACA),
                        ),
                      ),
                      child: Text(
                        '$completedQuests/$totalQuests Selesai',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: (completedQuests == totalQuests && totalQuests > 0)
                              ? const Color(0xFF059669)
                              : brandRed,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Quick Menu Grid (2x2)
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 2.2,
              children: [
                _buildGridMenuButton(
                  icon: Icons.calendar_today_rounded,
                  color: const Color(0xFF2563EB),
                  bgColor: const Color(0xFFEFF6FF),
                  label: 'Jadwal',
                  subLabel: 'Latihan Dojang',
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const ScheduleScreen()));
                  },
                ),
                _buildGridMenuButton(
                  icon: Icons.emoji_events_rounded,
                  color: const Color(0xFFD97706),
                  bgColor: const Color(0xFFFFFBEB),
                  label: 'Ujian UKT',
                  subLabel: 'Progress Sabuk',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => UktScreen(user: widget.user),
                      ),
                    );
                  },
                ),
                _buildGridMenuButton(
                  icon: Icons.person_outline_rounded,
                  color: const Color(0xFF9333EA),
                  bgColor: const Color(0xFFFAF5FF),
                  label: 'Profil',
                  subLabel: 'Data Atlet',
                  onTap: () => setState(() => _currentTab = 4),
                ),
                _buildGridMenuButton(
                  icon: Icons.credit_card_rounded,
                  color: const Color(0xFF059669),
                  bgColor: const Color(0xFFECFDF5),
                  label: 'SPP',
                  subLabel: 'Riwayat Iuran',
                  onTap: () => setState(() => _currentTab = 3),
                ),
              ],
            ),
            const SizedBox(height: 22),

            // Turnamen & Kejuaraan Section
            Row(
              children: [
                const Icon(Icons.emoji_events_outlined, color: goldAccent, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Turnamen & Kejuaraan',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ref.watch(eventProvider).when(
              data: (events) {
                if (events.isEmpty) {
                  return Text('Belum ada turnamen dalam waktu dekat.', style: GoogleFonts.inter(color: textMuted, fontSize: 13));
                }
                return SizedBox(
                  height: 180,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: events.length,
                    itemBuilder: (context, index) {
                      final event = events[index];
                      final hasPoster = event.posterUrl != null && event.posterUrl!.isNotEmpty;

                      return Container(
                        width: 280,
                        margin: const EdgeInsets.only(right: 14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: borderSlate),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x04000000),
                              blurRadius: 8,
                              offset: Offset(0, 2),
                            ),
                          ],
                          image: hasPoster
                              ? DecorationImage(
                                  image: NetworkImage(event.posterUrl!),
                                  fit: BoxFit.cover,
                                  colorFilter: ColorFilter.mode(
                                    Colors.black.withValues(alpha: 0.6),
                                    BlendMode.srcOver,
                                  ),
                                )
                              : null,
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: hasPoster ? Colors.black.withValues(alpha: 0.5) : const Color(0xFFFEF2F2),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: hasPoster ? Colors.white24 : const Color(0xFFFECACA)),
                                    ),
                                    child: Text(
                                      event.level.toUpperCase(),
                                      style: GoogleFonts.inter(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        color: hasPoster ? Colors.white : brandRed,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: hasPoster ? Colors.black.withValues(alpha: 0.5) : const Color(0xFFFFFBEB),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: hasPoster ? Colors.white24 : const Color(0xFFFDE68A)),
                                    ),
                                    child: Text(
                                      '${event.startDate.day}/${event.startDate.month}',
                                      style: GoogleFonts.inter(
                                        fontSize: 11,
                                        color: goldAccent,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    Text(
                                      event.title,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.inter(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700,
                                        color: hasPoster ? Colors.white : textPrimary,
                                        height: 1.2,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      children: [
                                        const Icon(Icons.location_on_rounded, color: brandRed, size: 14),
                                        const SizedBox(width: 4),
                                        Expanded(
                                          child: Text(
                                            event.location,
                                            style: GoogleFonts.inter(
                                              fontSize: 12,
                                              color: hasPoster ? Colors.white70 : textSecondary,
                                              fontWeight: FontWeight.w500,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator(color: brandRed)),
              error: (e, s) => Text('Gagal memuat event: $e', style: const TextStyle(color: brandRed)),
            ),
            const SizedBox(height: 22),

            // Berita Dojang Section
            Row(
              children: [
                const Icon(Icons.newspaper_rounded, color: Color(0xFF2563EB), size: 20),
                const SizedBox(width: 8),
                Text(
                  'Berita & Pengumuman',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ref.watch(articleProvider).when(
              data: (articles) {
                if (articles.isEmpty) {
                  return Text('Belum ada berita terbaru.', style: GoogleFonts.inter(color: textMuted, fontSize: 13));
                }
                return Column(
                  children: articles.map((article) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _buildArticleCard(
                      title: article.title,
                      content: article.content,
                      author: article.author,
                      date: '${article.createdAt.day}/${article.createdAt.month}',
                    ),
                  )).toList(),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator(color: brandRed)),
              error: (e, s) => Text('Gagal memuat berita: $e', style: const TextStyle(color: brandRed)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGridMenuButton({
    required IconData icon,
    required Color color,
    required Color bgColor,
    required String label,
    required String subLabel,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderSlate),
          boxShadow: const [
            BoxShadow(
              color: Color(0x04000000),
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    label,
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                      color: textMuted,
                    ),
                  ),
                  Text(
                    subLabel,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildArticleCard({
    required String title,
    required String content,
    required String author,
    required String date,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderSlate),
        boxShadow: const [
          BoxShadow(
            color: Color(0x04000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            content,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: textSecondary,
              height: 1.4,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Oleh $author',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: textMuted,
                ),
              ),
              Text(
                date,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: textMuted,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTokoTab(AsyncValue<ShopData> shopDataAsync, Color themeColor) {
    return shopDataAsync.when(
      loading: () => const Center(child: CircularProgressIndicator(color: brandRed)),
      error: (err, stack) => Center(child: Text('Gagal memuat Toko: $err', style: const TextStyle(color: textPrimary))),
      data: (shopData) {
        if (shopData.items.isEmpty) {
          return Center(child: Text('Toko kosong saat ini.', style: GoogleFonts.inter(color: textMuted, fontSize: 14)));
        }
        return GridView.builder(
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 80),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 0.78,
          ),
          itemCount: shopData.items.length,
          itemBuilder: (context, index) {
            final item = shopData.items[index];
            Color rarityColor;
            String rarityText;
            switch (item.rarity.toUpperCase()) {
              case 'LEGENDARY':
                rarityColor = const Color(0xFFD97706); // Refined amber
                rarityText = 'LEGENDARY';
                break;
              case 'RARE':
                rarityColor = const Color(0xFF7C3AED); // Refined violet
                rarityText = 'RARE';
                break;
              case 'COMMON':
              default:
                rarityColor = const Color(0xFF64748B); // Slate
                rarityText = 'COMMON';
                break;
            }

            return Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: item.equipped ? brandRed : borderSlate,
                  width: item.equipped ? 1.5 : 1.0,
                ),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x04000000),
                    blurRadius: 6,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: borderSlate),
                          ),
                          child: item.itemUrl != null && item.itemUrl!.isNotEmpty
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: DynamicAssetWidget(
                                    url: _getAbsoluteUrl(item.itemUrl!),
                                    fit: BoxFit.cover,
                                    placeholder: Icon(Icons.redeem_rounded, color: rarityColor, size: 24),
                                  ),
                                )
                              : Icon(Icons.redeem_rounded, color: rarityColor, size: 24),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          item.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            color: textPrimary,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 3),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: rarityColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: rarityColor.withValues(alpha: 0.25), width: 0.6),
                          ),
                          child: Text(
                            rarityText,
                            style: GoogleFonts.inter(
                              color: rarityColor,
                              fontSize: 8.5,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    children: [
                      const SizedBox(height: 2),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.monetization_on_rounded, color: goldAccent, size: 13),
                          const SizedBox(width: 3),
                          Text(
                            '${item.price} DC',
                            style: GoogleFonts.inter(
                              color: goldAccent,
                              fontWeight: FontWeight.w700,
                              fontSize: 11.5,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: item.equipped 
                              ? const Color(0xFFEF4444)
                              : (item.owned ? const Color(0xFF059669) : themeColor),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          minimumSize: const Size(double.infinity, 30),
                          padding: EdgeInsets.zero,
                        ),
                        onPressed: item.equipped 
                            ? () => _handleUnequipItem(item.id) 
                            : (item.owned 
                                ? () => _handleEquipItem(item.id) 
                                : () => _handleBuyItem(item.id)),
                        child: Text(
                          item.equipped ? 'Lepas' : (item.owned ? 'Pasang' : 'Beli'),
                          style: GoogleFonts.inter(
                            fontSize: 11, 
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  )
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildMisiTab(Color themeColor) {
    return _buildDailyQuests(themeColor);
  }

  Widget _buildSppTab() {
    return SppScreen(user: widget.user);
  }

  Widget _buildAtletTab() {
    return const ProfileScreen();
  }

  Widget _buildQuestExpandedContent(QuestLog log, dynamic quest, Color themeColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          quest.description,
          style: GoogleFonts.inter(fontSize: 13, color: textSecondary, height: 1.4),
        ),
        const SizedBox(height: 16),
        
        // A. JIKA MISI NONTON VIDEO
        if (quest.videoUrl != null && quest.videoUrl!.isNotEmpty && !quest.requireVideo) ...[
          Builder(
            builder: (context) {
              final videoId = _getYoutubeId(quest.videoUrl!);
              const isWeb = identical(0, 0.0);
              
              if (isWeb && videoId != null) {
                registerYoutubeIframe(
                  videoId,
                  onVideoEnded: () {
                    if (mounted && _watchedQuests[log.id] != true) {
                      setState(() {
                        _watchedQuests[log.id] = true;
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          backgroundColor: Color(0xFF059669),
                          content: Text('Video selesai ditonton! Silakan klaim reward Anda.'),
                        ),
                      );
                    }
                  },
                );
              }
              
              if (!isWeb && videoId != null && !_ytControllers.containsKey(log.id)) {
                final controller = YoutubePlayerController.fromVideoId(
                  videoId: videoId,
                  autoPlay: false,
                  params: const YoutubePlayerParams(
                    showControls: true,
                    mute: false,
                    showFullscreenButton: true,
                  ),
                );
                controller.listen((state) {
                  if (state.playerState == PlayerState.ended) {
                    if (mounted && _watchedQuests[log.id] != true) {
                      setState(() {
                        _watchedQuests[log.id] = true;
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          backgroundColor: Color(0xFF059669),
                          content: Text('Video selesai ditonton! Silakan klaim reward Anda.'),
                        ),
                      );
                    }
                  }
                });
                _ytControllers[log.id] = controller;
              }

              final isWatched = _watchedQuests[log.id] == true;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (isWeb && videoId != null) ...[
                    Container(
                      height: 240,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: borderSlate),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(13),
                        child: HtmlElementView(
                          viewType: 'youtube-web-$videoId',
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ]
                  else if (!isWeb && videoId != null && _ytControllers.containsKey(log.id)) ...[
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: borderSlate),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(13),
                        child: YoutubePlayer(
                          controller: _ytControllers[log.id] as YoutubePlayerController,
                          aspectRatio: 16 / 9,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  Row(
                    children: [
                      Icon(
                        isWatched ? Icons.check_circle_rounded : Icons.info_outline_rounded,
                        color: isWatched ? const Color(0xFF059669) : goldAccent,
                        size: 16,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          isWatched 
                              ? 'Video selesai ditonton! Tombol klaim aktif.' 
                              : 'Tonton video tutorial di atas hingga selesai untuk klaim reward.',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: isWatched ? const Color(0xFF059669) : goldAccent,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: (!isWatched || _isQuestSubmitting)
                          ? () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Silakan tonton video tutorial terlebih dahulu!')),
                              );
                            }
                          : () async {
                              setState(() => _isQuestSubmitting = true);
                              try {
                                await ref.read(questServiceProvider).completeQuest(log.id);
                                ref.invalidate(questProvider);
                                ref.invalidate(profileProvider);
                                setState(() {
                                  _expandedQuestId = null;
                                  _isQuestSubmitting = false;
                                });
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Misi berhasil diselesaikan!')),
                                  );
                                }
                              } catch (e) {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Error: $e')),
                                  );
                                }
                                setState(() => _isQuestSubmitting = false);
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isWatched ? themeColor : const Color(0xFFCBD5E1),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: _isQuestSubmitting
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : Text(
                              'Klaim Reward XP',
                              style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
                            ),
                    ),
                  ),
                ],
              );
            }
          ),
        ]
        
        // B. JIKA MISI KUIS
        else if (quest.quizQuestions != null && quest.quizQuestions!.isNotEmpty) ...[
          Builder(
            builder: (context) {
              final quiz = quest.quizQuestions!.first;
              final hasOptions = quiz.options != null && (quiz.options as List).isNotEmpty;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    quiz.question,
                    style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: textPrimary),
                  ),
                  const SizedBox(height: 12),
                  
                  if (hasOptions) ...[
                    ...(quiz.options as List).map((optionItem) {
                      final option = optionItem.toString();
                      final isSelected = _selectedQuizOption == option;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(10),
                          onTap: _isQuestSubmitting ? null : () {
                            setState(() {
                              _selectedQuizOption = option;
                            });
                          },
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFFFEF2F2) : const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isSelected ? brandRed : borderSlate,
                                width: isSelected ? 1.5 : 1.0,
                              ),
                            ),
                            child: Text(
                              option,
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? brandRed : textPrimary,
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
                  ] else ...[
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: borderSlate),
                      ),
                      child: TextField(
                        controller: _quizTextController,
                        style: const TextStyle(color: textPrimary, fontSize: 13),
                        decoration: InputDecoration(
                          hintText: 'Ketik jawaban Anda di sini...',
                          hintStyle: const TextStyle(color: textMuted, fontSize: 12),
                          contentPadding: const EdgeInsets.all(14),
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(color: themeColor, width: 1.5),
                          ),
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: (_isQuestSubmitting || (hasOptions && _selectedQuizOption == null))
                          ? null
                          : () async {
                              final answerStr = hasOptions ? _selectedQuizOption! : _quizTextController.text.trim();
                              if (answerStr.isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Harap masukkan jawaban terlebih dahulu!')),
                                );
                                return;
                              }

                              setState(() => _isQuestSubmitting = true);
                              try {
                                await ref.read(questServiceProvider).submitQuiz(
                                  log.id,
                                  [answerStr],
                                );
                                ref.invalidate(questProvider);
                                ref.invalidate(profileProvider);
                                setState(() {
                                  _expandedQuestId = null;
                                  _isQuestSubmitting = false;
                                  _selectedQuizOption = null;
                                  _quizTextController.clear();
                                });
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      backgroundColor: Color(0xFF059669),
                                      content: Text('Jawaban benar! Misi kuis berhasil diselesaikan.'),
                                    ),
                                  );
                                }
                              } catch (e) {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      backgroundColor: Color(0xFFDC2626),
                                      content: Text('Jawaban salah! Silakan coba lagi.'),
                                    ),
                                  );
                                }
                                setState(() => _isQuestSubmitting = false);
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: themeColor,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: _isQuestSubmitting
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : Text(
                              'Kirim Jawaban',
                              style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
                            ),
                    ),
                  ),
                ],
              );
            }
          ),
        ]
        
        // C. JIKA MISI UPLOAD VIDEO
        else if (quest.requireVideo) ...[
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isUploadingVideo
                  ? null
                  : () => _showSubmissionOptionDialogFromDashboard(log, themeColor),
              icon: Icon(
                _isUploadingVideo ? Icons.hourglass_empty_rounded : Icons.upload_file_rounded,
                color: Colors.white,
              ),
              label: Text(
                _isUploadingVideo ? 'Mengunggah Video...' : 'Pilih & Unggah Video',
                style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: themeColor,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ]
        
        // D. TIPE CHECK-IN/KLAIM LANGSUNG
        else ...[
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isQuestSubmitting
                  ? null
                  : () async {
                      setState(() => _isQuestSubmitting = true);
                      try {
                        await ref.read(questServiceProvider).completeQuest(log.id);
                        ref.invalidate(questProvider);
                        ref.invalidate(profileProvider);
                        if (!mounted) return;
                        setState(() {
                          _expandedQuestId = null;
                          _isQuestSubmitting = false;
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Misi berhasil diselesaikan!')),
                        );
                      } catch (e) {
                        if (!mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Gagal: $e')),
                        );
                        setState(() => _isQuestSubmitting = false);
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: themeColor,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: _isQuestSubmitting
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text(
                      'Klaim Reward',
                      style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
                    ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildDailyQuests(Color themeColor) {
    final questsAsync = ref.watch(questProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Misi Harian',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: textPrimary,
                ),
              ),
              questsAsync.whenOrNull(
                data: (logs) {
                  final done = logs.where((l) => l.completed).length;
                  final total = logs.length;
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: (done == total && total > 0) ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: (done == total && total > 0) ? const Color(0xFFA7F3D0) : const Color(0xFFFECACA),
                      ),
                    ),
                    child: Text(
                      '$done/$total Selesai',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: (done == total && total > 0) ? const Color(0xFF059669) : brandRed,
                      ),
                    ),
                  );
                },
              ) ?? const SizedBox(),
            ],
          ),
        ),
        Expanded(
          child: questsAsync.when(
            data: (logs) {
              if (logs.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.inbox_outlined, color: textMuted.withValues(alpha: 0.5), size: 56),
                      const SizedBox(height: 12),
                      Text('Tidak ada misi aktif untuk hari ini.', style: GoogleFonts.inter(color: textMuted, fontSize: 14)),
                    ],
                  ),
                );
              }
              
              return LayoutBuilder(builder: (context, constraints) {
                final isWide = constraints.maxWidth >= 680;

                // ── WEB LAYOUT ──
                if (isWide) {
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: 320,
                        child: ListView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 0, 8, 100),
                          itemCount: logs.length,
                          itemBuilder: (context, index) {
                            final log = logs[index];
                            final quest = log.quest;
                            final isExpanded = _expandedQuestId == log.id;
                            
                            return GestureDetector(
                              onTap: !log.completed ? () {
                                setState(() {
                                  _expandedQuestId = isExpanded ? null : log.id;
                                  _selectedQuizOption = null;
                                });
                              } : null,
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 10),
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: isExpanded
                                        ? brandRed
                                        : (log.completed ? const Color(0xFFA7F3D0) : borderSlate),
                                    width: isExpanded ? 1.5 : 1,
                                  ),
                                  boxShadow: const [
                                    BoxShadow(
                                      color: Color(0x04000000),
                                      blurRadius: 6,
                                      offset: Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 40,
                                      height: 40,
                                      decoration: BoxDecoration(
                                        color: log.completed ? const Color(0xFFECFDF5) : const Color(0xFFFFFBEB),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Icon(
                                        log.completed ? Icons.check_circle_rounded : Icons.assignment_outlined,
                                        color: log.completed ? const Color(0xFF059669) : goldAccent,
                                        size: 20,
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            quest.title,
                                            style: GoogleFonts.inter(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w600,
                                              color: textPrimary,
                                              decoration: log.completed ? TextDecoration.lineThrough : null,
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Row(
                                            children: [
                                              Text(
                                                '+${quest.baseXp} XP',
                                                style: GoogleFonts.inter(fontSize: 11, color: goldAccent, fontWeight: FontWeight.w600),
                                              ),
                                              if (quest.videoUrl != null && quest.videoUrl!.isNotEmpty && !quest.requireVideo) ...[
                                                const SizedBox(width: 6),
                                                const Text('📹', style: TextStyle(fontSize: 10)),
                                              ]
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    if (log.completed)
                                      const Icon(Icons.check_rounded, color: Color(0xFF059669), size: 16)
                                    else
                                      Icon(
                                        isExpanded ? Icons.keyboard_arrow_down_rounded : Icons.keyboard_arrow_right_rounded,
                                        color: isExpanded ? brandRed : textMuted,
                                        size: 18,
                                      )
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      
                      Container(width: 1, color: borderSlate),
                      
                      Expanded(
                        child: _expandedQuestId == null
                            ? Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.touch_app_outlined, color: textMuted.withValues(alpha: 0.5), size: 44),
                                    const SizedBox(height: 10),
                                    Text(
                                      'Pilih misi di kiri untuk melihat detail',
                                      style: GoogleFonts.inter(color: textMuted, fontSize: 13),
                                    ),
                                  ],
                                ),
                              )
                            : () {
                                final logIdx = logs.indexWhere((l) => l.id == _expandedQuestId);
                                if (logIdx == -1) return const SizedBox();
                                final log = logs[logIdx];
                                return SingleChildScrollView(
                                  padding: const EdgeInsets.symmetric(horizontal: 20),
                                  child: Container(
                                    padding: const EdgeInsets.all(20),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: borderSlate),
                                    ),
                                    child: _buildQuestExpandedContent(log, log.quest, themeColor),
                                  ),
                                );
                              }(),
                      ),
                    ],
                  );
                }

                // ── MOBILE LAYOUT ──
                return RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(questProvider);
                    ref.invalidate(profileProvider);
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                    itemCount: logs.length,
                    itemBuilder: (context, index) {
                      final log = logs[index];
                      final quest = log.quest;
                      final isExpanded = _expandedQuestId == log.id;
                      
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: log.completed 
                                ? const Color(0xFFA7F3D0) 
                                : (isExpanded ? brandRed : borderSlate),
                            width: isExpanded ? 1.5 : 1,
                          ),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x04000000),
                              blurRadius: 6,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: log.completed ? const Color(0xFFECFDF5) : const Color(0xFFFFFBEB),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Icon(
                                    log.completed ? Icons.check_circle_rounded : Icons.assignment_outlined,
                                    color: log.completed ? const Color(0xFF059669) : goldAccent,
                                    size: 22,
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        quest.title,
                                        style: GoogleFonts.inter(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: textPrimary,
                                          decoration: log.completed ? TextDecoration.lineThrough : null,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '+${quest.baseXp} XP',
                                        style: GoogleFonts.inter(
                                          fontSize: 12,
                                          color: goldAccent,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                if (!log.completed)
                                  GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        _expandedQuestId = isExpanded ? null : log.id;
                                        _selectedQuizOption = null;
                                      });
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                                      decoration: BoxDecoration(
                                        color: isExpanded ? const Color(0xFFF1F5F9) : themeColor,
                                        borderRadius: BorderRadius.circular(8),
                                        border: isExpanded ? Border.all(color: borderSlate) : null,
                                      ),
                                      child: Text(
                                        isExpanded ? 'Tutup' : 'Mulai',
                                        style: GoogleFonts.inter(
                                          color: isExpanded ? textPrimary : Colors.white,
                                          fontWeight: FontWeight.w600,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            if (isExpanded && !log.completed) ...[
                              const Padding(
                                padding: EdgeInsets.symmetric(vertical: 12),
                                child: Divider(color: borderSlate, height: 1),
                              ),
                              _buildQuestExpandedContent(log, quest, themeColor),
                            ],
                          ],
                        ),
                      );
                    },
                  ),
                );
              });
            },
            loading: () => const Center(child: CircularProgressIndicator(color: brandRed)),
            error: (e, s) => Center(child: Text('Gagal memuat misi: $e', style: const TextStyle(color: textPrimary))),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomNavBar() {
    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 460),
        padding: const EdgeInsets.only(left: 12, right: 12, top: 6, bottom: 8),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: borderSlate, width: 1)),
          boxShadow: [
            BoxShadow(
              color: Color(0x06000000),
              blurRadius: 8,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(Icons.home_outlined, Icons.home_rounded, 'Lobby', 0),
            _buildNavItem(Icons.shopping_bag_outlined, Icons.shopping_bag_rounded, 'Toko', 1),
            _buildMisiNavItem(2),
            _buildNavItem(Icons.credit_card_outlined, Icons.credit_card_rounded, 'SPP', 3),
            _buildNavItem(Icons.person_outline_rounded, Icons.person_rounded, 'Atlet', 4),
          ],
        ),
      ),
    );
  }

  Widget _buildMisiNavItem(int index) {
    final isActive = _currentTab == index;
    return GestureDetector(
      onTap: () => setState(() => _currentTab = index),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 44,
            height: 28,
            child: Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                Positioned(
                  top: -14,
                  child: Image.asset(
                    'assets/images/daily_quest_tiger_transparent.png',
                    width: 44,
                    height: 44,
                    fit: BoxFit.contain,
                    color: isActive ? null : Colors.black.withValues(alpha: 0.3),
                    colorBlendMode: isActive ? null : BlendMode.srcIn,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 2),
          Text(
            'Misi',
            style: GoogleFonts.inter(
              fontSize: 10.5,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
              color: isActive ? brandRed : textMuted,
            ),
          )
        ],
      ),
    );
  }

  Widget _buildNavItem(IconData unselectedIcon, IconData selectedIcon, String label, int index) {
    final isActive = _currentTab == index;
    return GestureDetector(
      onTap: () => setState(() => _currentTab = index),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isActive ? selectedIcon : unselectedIcon,
            color: isActive ? brandRed : textMuted,
            size: 20,
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 10.5,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
              color: isActive ? brandRed : textMuted,
            ),
          )
        ],
      ),
    );
  }

  void _showGamifiedDialog({
    required String title,
    required String message,
    required bool isSuccess,
    String? coinsReward,
    IconData? customIcon,
    Color? customIconColor,
  }) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        final displayIcon = customIcon ?? (isSuccess ? Icons.workspace_premium : Icons.explore_off);
        final displayColor = customIconColor ?? (isSuccess ? Colors.green : Colors.red);
        
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          backgroundColor: const Color(0xFF1E293B), // cardBg
          child: Container(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Glowing Icon / Illustration
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: displayColor.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: displayColor,
                      width: 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: displayColor.withValues(alpha: 0.2),
                        blurRadius: 16,
                        spreadRadius: 2,
                      )
                    ]
                  ),
                  child: Icon(
                    displayIcon,
                    color: displayColor,
                    size: 40,
                  ),
                ),
                const SizedBox(height: 24),
                // Title
                Text(
                  title,
                  style: GoogleFonts.spaceGrotesk(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                // Message
                Text(
                  message,
                  style: GoogleFonts.hankenGrotesk(
                    color: const Color(0xFF94A3B8), // textGray
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
                if (isSuccess && coinsReward != null) ...[
                  const SizedBox(height: 16),
                  // Coins reward badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFD700).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFFFD700), width: 1.5),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.monetization_on, color: Color(0xFFFFD700), size: 16),
                        const SizedBox(width: 6),
                        Text(
                          '+$coinsReward Koin Dojang!',
                          style: GoogleFonts.spaceGrotesk(
                            color: const Color(0xFFFFD700),
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                // Action Button
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      color: isSuccess ? Colors.green : const Color(0xFFE10600), // brandRed
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: isSuccess ? Colors.green.withValues(alpha: 0.2) : const Color(0xFFE10600).withValues(alpha: 0.2),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        )
                      ]
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      isSuccess ? 'Mantap!' : 'Mengerti',
                      style: GoogleFonts.spaceGrotesk(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _checkTodayAttendanceStatus() async {
    try {
      final status = await AttendanceService(ref.read(dioProvider)).checkTodayStatus(widget.user);
      if (status != null && status['attended'] == true && mounted) {
        final att = status['attendance'];
        String? className = att?['schedule']?['className'];
        setState(() {
          _isAbsenSuccess = true;
          _absenSuccessDetail = className;
        });
      }
    } catch (e) {
      debugPrint('[Attendance] Gagal periksa status hari ini: $e');
    }
  }

  void _handleSelfAttendance() async {
    if (_isAbsenLoading) return;

    if (_isAbsenSuccess) {
      _showGamifiedDialog(
        title: 'Sudah Absen Hari Ini! ✅',
        message: 'Kehadiran Anda hari ini sudah tercatat${_absenSuccessDetail != null ? " di $_absenSuccessDetail" : ""}. Terima kasih sudah disiplin berlatih!',
        isSuccess: true,
      );
      return;
    }

    setState(() { _isAbsenLoading = true; });

    try {
      final result = await AttendanceService(ref.read(dioProvider)).checkInWithLocation(widget.user);
      if (mounted) {
        setState(() {
          _isAbsenLoading = false;
          if (result.success) {
            _isAbsenSuccess = true;
            _absenSuccessDetail = result.scheduleName;
          }
        });

        if (result.success) {
          ref.invalidate(profileProvider); // Refresh koin / XP
          _showGamifiedDialog(
            title: result.title,
            message: result.message,
            isSuccess: true,
            coinsReward: result.coinsGained != null ? '${result.coinsGained}' : '10',
          );
        } else {
          _showGamifiedDialog(
            title: result.title,
            message: result.message,
            isSuccess: false,
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() { _isAbsenLoading = false; });
        _showGamifiedDialog(
          title: 'Gagal Absen ❌',
          message: e.toString().replaceFirst('Exception: ', ''),
          isSuccess: false,
        );
      }
    }
  }

  void _handleBuyItem(String itemId) async {
    try {
      final success = await ref.read(shopServiceProvider).buyItem(itemId);
      if (success) {
        ref.invalidate(shopDataProvider);
        ref.invalidate(profileProvider);
        _showGamifiedDialog(
          title: 'Pembelian Sukses! 🛍️',
          message: 'Item berhasil dibeli dan sekarang terdaftar di koleksi Anda.',
          isSuccess: true,
          customIcon: Icons.shopping_bag,
          customIconColor: const Color(0xFFFFD700), // Gold
        );
      } else {
        _showGamifiedDialog(
          title: 'Koin Kurang! 🪙',
          message: 'Koin Dojang Anda tidak mencukupi untuk membeli item ini. Latih terus misimu!',
          isSuccess: false,
          customIcon: Icons.money_off,
        );
      }
    } catch (e) {
      _showGamifiedDialog(
        title: 'Pembelian Gagal ❌',
        message: 'Gagal membeli item: $e',
        isSuccess: false,
      );
    }
  }

  void _handleEquipItem(String itemId) async {
    try {
      final success = await ref.read(shopServiceProvider).equipItem(itemId);
      if (success) {
        ref.invalidate(shopDataProvider);
        ref.invalidate(profileProvider);
        _showGamifiedDialog(
          title: 'Item Dipasang! ✨',
          message: 'Avatar profil Anda telah diperbarui dengan tampilan baru!',
          isSuccess: true,
          customIcon: Icons.brush,
          customIconColor: Colors.blue,
        );
      } else {
        _showGamifiedDialog(
          title: 'Gagal Memasang ❌',
          message: 'Item gagal dipasang. Silakan coba kembali.',
          isSuccess: false,
        );
      }
    } catch (e) {
      _showGamifiedDialog(
        title: 'Error ❌',
        message: 'Gagal memasang item: $e',
        isSuccess: false,
      );
    }
  }

  void _handleUnequipItem(String itemId) async {
    try {
      final success = await ref.read(shopServiceProvider).unequipItem(itemId);
      if (success) {
        ref.invalidate(shopDataProvider);
        ref.invalidate(profileProvider);
        _showGamifiedDialog(
          title: 'Item Dilepas! 🧹',
          message: 'Item berhasil dilepas dari profil Anda.',
          isSuccess: true,
          customIcon: Icons.layers_clear,
          customIconColor: Colors.grey,
        );
      } else {
        _showGamifiedDialog(
          title: 'Gagal Melepas ❌',
          message: 'Item gagal dilepas. Silakan coba kembali.',
          isSuccess: false,
        );
      }
    } catch (e) {
      _showGamifiedDialog(
        title: 'Error ❌',
        message: 'Gagal melepas item: $e',
        isSuccess: false,
      );
    }
  }


}
