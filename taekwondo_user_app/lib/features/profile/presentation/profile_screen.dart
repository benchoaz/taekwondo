import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';
import '../../auth/data/auth_provider.dart';
import '../data/profile_service.dart';
import '../../dashboard/data/shop_service.dart';
import 'image_adjust_dialog.dart';
import '../../../core/widgets/dynamic_asset_widget.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isUploading = false;

  String _getAbsoluteUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return 'https://www.whitetigerkraksaan.com$cleanPath';
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(profileProvider);
    final shopAsync = ref.watch(shopDataProvider);
    final shopData = shopAsync.valueOrNull;

    Color themeColor = const Color(0xFFE2241F);
    String? emblemUrl;

    if (shopData != null) {
      final themeId = shopData.active['themeId'];
      if (themeId != null) {
        final themeItem = shopData.items.where((i) => i.id == themeId).firstOrNull;
        if (themeItem?.name.toLowerCase().contains('biru') == true) {
          themeColor = const Color(0xFF3B82F6);
        } else if (themeItem?.name.toLowerCase().contains('galaxy') == true) {
          themeColor = const Color(0xFF8B5CF6);
        }
      }

      final emblemId = shopData.active['emblemId'];
      if (emblemId != null) {
        final emblemItem = shopData.items.where((i) => i.id == emblemId).firstOrNull;
        emblemUrl = emblemItem?.itemUrl;
      }
    }

    final Color themeColorLight = HSLColor.fromColor(themeColor).withLightness(0.65).toColor();

    return Scaffold(
      backgroundColor: const Color(0xFF0F1115),
      body: Stack(
        children: [
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: themeColor,
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            left: -100,
            child: Container(
              width: 250,
              height: 250,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFF2A303F),
              ),
            ),
          ),
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
              child: const SizedBox(),
            ),
          ),
          SafeArea(
            child: profileAsync.when(
              loading: () => Center(child: CircularProgressIndicator(color: themeColor)),
              error: (err, stack) => Center(
                child: Text('Gagal memuat profil: $err', style: const TextStyle(color: Colors.white)),
              ),
              data: (profile) => RefreshIndicator(
                color: themeColor,
                onRefresh: () async => ref.refresh(profileProvider.future),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildVIPCard(profile!, ref, themeColor, themeColorLight, emblemUrl),
                      const SizedBox(height: 32),
                      Text(
                        'TAEKWONDO JOURNEY',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 2,
                          color: const Color(0xFF8A93A6),
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildLevelBar(profile, themeColor, themeColorLight),
                      const SizedBox(height: 32),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'ANTROPOMETRI',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 2,
                              color: const Color(0xFF8A93A6),
                            ),
                          ),
                          GestureDetector(
                            onTap: () => _showEditBiometricsModal(context, ref, profile, themeColor),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: themeColor.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: themeColor.withValues(alpha: 0.3)),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.edit, color: themeColor, size: 12),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Perbarui',
                                    style: GoogleFonts.hankenGrotesk(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: themeColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      _buildBiometricsPanel(profile),
                      const SizedBox(height: 32),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'HALL OF FAME',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 2,
                              color: const Color(0xFF8A93A6),
                            ),
                          ),
                          const Icon(Icons.workspace_premium, color: Color(0xFFFFD700)),
                        ],
                      ),
                      const SizedBox(height: 16),
                      ...profile.achievements.map((ach) => _buildAchievementCard(ach)),
                      if (profile.achievements.isEmpty)
                        Center(
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Text(
                              "Belum ada medali.\nBerlatihlah lebih keras!",
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.white.withValues(alpha: 0.5)),
                            ),
                          ),
                        ),
                      const SizedBox(height: 40),
                      _buildLogoutButton(context, ref, themeColor),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(context, themeColor),
    );
  }

  Widget _buildVIPCard(ProfileData profile, WidgetRef ref, Color themeColor, Color themeColorLight, String? emblemUrl) {
    final shopAsync = ref.watch(shopDataProvider);
    final shopData = shopAsync.valueOrNull;
    
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
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 30,
            offset: const Offset(0, 15),
          )
        ],
      ),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              // Base Gradient border if no frame is equipped
              if (frameUrl == null || frameUrl.isEmpty)
                Container(
                  width: 110,
                  height: 110,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [themeColor, themeColorLight],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: themeColor.withValues(alpha: 0.5),
                        blurRadius: 20,
                        spreadRadius: 2,
                      )
                    ],
                  ),
                ),
              // Profile Picture & Frame Stack
              Stack(
                alignment: Alignment.center,
                children: [
                  // 1. Profile Photo
                  GestureDetector(
                    onTap: _isUploading ? null : () => _pickAndUploadImage(frameUrl),
                    child: Container(
                      width: 90,
                      height: 90,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFF1E222D),
                      ),
                      child: ClipOval(
                        child: Image(
                          image: profile.profilePicture != null 
                              ? NetworkImage(_getAbsoluteUrl(profile.profilePicture!))
                              : const NetworkImage('https://api.dicebear.com/7.x/avataaars/png?seed=Taekwondo') as ImageProvider,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  ),
                  
                  // 2. Frame Overlay (matches 90x90 exactly to prevent displacement)
                  if (frameUrl != null && frameUrl.isNotEmpty)
                    (() {
                      final cssStyles = CssValueParser.parseCss(frameCss);
                      final Color? parsedBorderColor = cssStyles['borderColor'];
                      final double parsedBorderWidth = cssStyles['borderWidth'] ?? 2.0;
                      final Color? parsedGlowColor = cssStyles['glowColor'];
                      // Multiply blur radius by 2 for large profile view to scale the effect nicely
                      final double parsedGlowBlurRadius = (cssStyles['glowBlurRadius'] ?? 0.0) * 2;

                      return IgnorePointer(
                        child: Container(
                          width: 104, // Marginally larger than photo to wrap it perfectly
                          height: 104,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            image: DecorationImage(
                              image: NetworkImage(_getAbsoluteUrl(frameUrl!)),
                              fit: BoxFit.fill, // Using fill to stretch round frame perfectly to container boundaries
                            ),
                            border: parsedBorderColor != null
                                ? Border.all(color: parsedBorderColor, width: parsedBorderWidth * 1.5)
                                : null,
                            boxShadow: [
                              BoxShadow(
                                color: parsedGlowColor ?? Colors.white.withValues(alpha: 0.2),
                                blurRadius: parsedGlowBlurRadius > 0 ? parsedGlowBlurRadius : 15,
                                spreadRadius: 2,
                              )
                            ],
                          ),
                        ),
                      );
                    })(),

                  if (_isUploading)
                    const CircularProgressIndicator(color: Colors.white),
                  
                  if (!_isUploading)
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: () => _pickAndUploadImage(frameUrl),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Colors.blueAccent,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.camera_alt, color: Colors.white, size: 14),
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                profile.name.toUpperCase(),
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 1,
                ),
              ),
              if (emblemUrl != null) ...[
                const SizedBox(width: 8),
                DynamicAssetWidget(
                  url: _getAbsoluteUrl(emblemUrl),
                  width: 24,
                  height: 24,
                  fit: BoxFit.contain,
                ),
              ]
            ],
          ),
          if (titleName != null)
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
                      height: 38,
                      fit: BoxFit.contain,
                      blendMode: BlendMode.screen,
                    )
                  : Padding(
                      padding: const EdgeInsets.only(top: 4, bottom: 4),
                      child: Text(
                        titleName.toUpperCase(),
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          color: const Color(0xFFFFD700),
                          letterSpacing: 2,
                        ),
                      ),
                    ),
            ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: themeColor.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: themeColor.withValues(alpha: 0.5)),
            ),
            child: Text(
              profile.memberNumber,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: themeColorLight,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildStatColumn('UMUR', '${profile.age} THN'),
              Container(width: 1, height: 40, color: Colors.white.withValues(alpha: 0.1)),
              _buildStatColumn('SABUK', profile.currentBelt.replaceAll('Sabuk ', '').split(' ').first),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildStatColumn(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: GoogleFonts.hankenGrotesk(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF8A93A6),
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildLevelBar(ProfileData profile, Color themeColor, Color themeColorLight) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E222D),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  profile.currentBelt.toUpperCase(),
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '${profile.progress.clamp(0, 100)}%',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: themeColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          LayoutBuilder(
            builder: (context, constraints) {
              final double maxProgressWidth = constraints.maxWidth;
              final double clampedProgress = profile.progress.clamp(0, 100).toDouble();
              final double progressWidth = maxProgressWidth * (clampedProgress / 100.0);

              return Stack(
                children: [
                  Container(
                    height: 12,
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  Container(
                    height: 12,
                    width: progressWidth,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [themeColor, themeColorLight],
                      ),
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: themeColor.withValues(alpha: 0.6),
                          blurRadius: 10,
                          spreadRadius: 1,
                        )
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 8),
          Text(
            'Lanjutkan berlatih untuk kenaikan sabuk (UKT) berikutnya!',
            style: GoogleFonts.hankenGrotesk(
              fontSize: 12,
              color: const Color(0xFF8A93A6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBiometricsPanel(ProfileData profile) {
    double? bmi;
    String bmiCategory = "-";
    Color bmiColor = const Color(0xFF8A93A6);

    if (profile.weight != null && profile.height != null && profile.height! > 0) {
      final heightInMeter = profile.height! / 100;
      final currentBmi = profile.weight! / (heightInMeter * heightInMeter);
      bmi = currentBmi;
      
      if (currentBmi < 18.5) {
        bmiCategory = "Kurus";
        bmiColor = Colors.orange;
      } else if (currentBmi < 24.9) {
        bmiCategory = "Ideal";
        bmiColor = Colors.greenAccent;
      } else if (currentBmi < 29.9) {
        bmiCategory = "Berlebih";
        bmiColor = Colors.orange;
      } else {
        bmiCategory = "Obesitas";
        bmiColor = Colors.redAccent;
      }
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E222D),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildMetricBox("Berat", profile.weight != null ? "${profile.weight} kg" : "-"),
              _buildMetricBox("Tinggi", profile.height != null ? "${profile.height} cm" : "-"),
              _buildMetricBox("Perut", profile.waistCircum != null ? "${profile.waistCircum} cm" : "-"),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: bmiColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: bmiColor.withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    'Indeks Massa Tubuh (BMI)',
                    style: GoogleFonts.hankenGrotesk(
                      fontSize: 12,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  bmi != null ? "${bmi.toStringAsFixed(1)} ($bmiCategory)" : "Belum ada data",
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: bmiColor,
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildMetricBox(String label, String value) {
    return Column(
      children: [
        Text(
          label.toUpperCase(),
          style: GoogleFonts.hankenGrotesk(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF8A93A6),
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildAchievementCard(ProfileAchievement ach) {
    final isGold = ach.rank.toLowerCase() == 'emas';
    final isSilver = ach.rank.toLowerCase() == 'perak';
    final medalColor = isGold
        ? const Color(0xFFFFD700)
        : isSilver
            ? const Color(0xFFC0C0C0)
            : const Color(0xFFCD7F32);
    
    final xpBonus = isGold ? "+1000 XP" : isSilver ? "+750 XP" : "+500 XP";

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: medalColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: medalColor.withValues(alpha: 0.2),
                  blurRadius: 15,
                )
              ],
            ),
            child: Icon(Icons.emoji_events, color: medalColor, size: 30),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  ach.title,
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  ach.eventName,
                  style: GoogleFonts.hankenGrotesk(
                    fontSize: 13,
                    color: const Color(0xFF8A93A6),
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: medalColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  ach.rank.toUpperCase(),
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: medalColor,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                xpBonus,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  color: medalColor,
                  shadows: [
                    Shadow(color: medalColor.withValues(alpha: 0.5), blurRadius: 10),
                  ]
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLogoutButton(BuildContext context, WidgetRef ref, Color themeColor) {
    return SizedBox(
      width: double.infinity,
      child: TextButton.icon(
        onPressed: () {
          ref.read(authProvider.notifier).logout();
          context.go('/login');
        },
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          backgroundColor: Colors.white.withValues(alpha: 0.05),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        icon: Icon(Icons.logout, color: themeColor),
        label: Text(
          'KELUAR DARI AKUN',
          style: GoogleFonts.spaceGrotesk(
            fontWeight: FontWeight.bold,
            color: themeColor,
            letterSpacing: 1,
          ),
        ),
      ),
    );
  }

  Future<void> _pickAndUploadImage(String? frameUrl) async {
    final ImagePicker picker = ImagePicker();
    try {
      final XFile? rawImage = await picker.pickImage(
        source: ImageSource.gallery, 
        maxWidth: 1200, 
        maxHeight: 1200,
        imageQuality: 80,
      );
      if (rawImage == null) return;

      if (!mounted) return;
      final XFile? adjustedImage = await Navigator.of(context).push<XFile>(
        MaterialPageRoute(
          builder: (context) => ImageAdjustDialog(
            imageFile: rawImage,
            frameUrl: frameUrl,
          ),
        ),
      );

      if (adjustedImage == null) return; // User cancelled / backed out
      
      setState(() => _isUploading = true);
      final success = await ref.read(profileServiceProvider).uploadProfilePicture(adjustedImage);
      
      if (success && mounted) {
        PaintingBinding.instance.imageCache.clear();
        PaintingBinding.instance.imageCache.clearLiveImages();
        ref.invalidate(profileProvider);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Foto profil berhasil diperbarui!')));
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Gagal mengunggah foto')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
  }

  void _showEditBiometricsModal(BuildContext context, WidgetRef ref, ProfileData profile, Color themeColor) {
    double? weight = profile.weight;
    double? height = profile.height;
    double? waist = profile.waistCircum;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E222D),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom,
            left: 24,
            right: 24,
            top: 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Perbarui Data Fisik',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Data ini digunakan untuk penentuan kelas UKT dan Turnamen.',
                style: GoogleFonts.hankenGrotesk(
                  fontSize: 12,
                  color: const Color(0xFF8A93A6),
                ),
              ),
              const SizedBox(height: 24),
              _buildInputRow('Berat Badan (kg)', weight?.toString() ?? '', (val) => weight = double.tryParse(val)),
              const SizedBox(height: 16),
              _buildInputRow('Tinggi Badan (cm)', height?.toString() ?? '', (val) => height = double.tryParse(val)),
              const SizedBox(height: 16),
              _buildInputRow('Lingkar Perut (cm)', waist?.toString() ?? '', (val) => waist = double.tryParse(val)),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeColor,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () async {
                    final success = await ref.read(profileServiceProvider).updateBiometrics(weight, height, waist);
                    if (context.mounted) {
                      Navigator.pop(context);
                      if (success) {
                        ref.invalidate(profileProvider);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Data fisik berhasil diperbarui!')),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Gagal memperbarui data')),
                        );
                      }
                    }
                  },
                  child: Text(
                    'Simpan Perubahan',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }

  Widget _buildInputRow(String label, String initialValue, Function(String) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.hankenGrotesk(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          initialValue: initialValue,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          style: GoogleFonts.spaceGrotesk(color: Colors.white, fontSize: 16),
          decoration: InputDecoration(
            filled: true,
            fillColor: const Color(0xFF2A303F),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildBottomNav(BuildContext context, Color themeColor) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E222D),
        border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.05))),
      ),
      child: BottomNavigationBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        selectedItemColor: themeColor,
        unselectedItemColor: const Color(0xFF8A93A6),
        type: BottomNavigationBarType.fixed,
        currentIndex: 3,
        onTap: (index) {
          if (index == 0) context.go('/');
          if (index == 1) context.go('/spp');
          if (index == 2) context.go('/quest');
          if (index == 3) context.go('/profile');
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'BERANDA'),
          BottomNavigationBarItem(icon: Icon(Icons.payment_outlined), activeIcon: Icon(Icons.payment), label: 'SPP'),
          BottomNavigationBarItem(icon: Icon(Icons.local_fire_department_outlined), activeIcon: Icon(Icons.local_fire_department), label: 'QUEST'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'PROFIL'),
        ],
      ),
    );
  }
}
