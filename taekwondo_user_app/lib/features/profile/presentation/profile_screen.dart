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
  final bool showBottomNav;
  const ProfileScreen({super.key, this.showBottomNav = false});

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
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: profileAsync.when(
          loading: () => Center(child: CircularProgressIndicator(color: themeColor)),
          error: (err, stack) => Center(
            child: Text('Gagal memuat profil: $err', style: const TextStyle(color: Color(0xFF0F172A))),
          ),
          data: (profile) => RefreshIndicator(
            color: themeColor,
            onRefresh: () async => ref.refresh(profileProvider.future),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
              padding: EdgeInsets.fromLTRB(16, 16, 16, widget.showBottomNav ? 30 : 90),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildVIPCard(profile!, ref, themeColor, themeColorLight, emblemUrl),
                  const SizedBox(height: 28),
                  Text(
                    'Perjalanan Tingkatan Sabuk',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildLevelBar(profile, themeColor, themeColorLight),
                  const SizedBox(height: 28),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Data Fisik & Antropometri',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => _showEditBiometricsModal(context, ref, profile, themeColor),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.edit, color: Color(0xFF0F172A), size: 12),
                              const SizedBox(width: 4),
                              Text(
                                'Perbarui',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF0F172A),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildBiometricsPanel(profile),
                  const SizedBox(height: 28),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Prestasi & Medali Turnamen',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                      const Icon(Icons.workspace_premium, color: Color(0xFFD97706), size: 20),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ...profile.achievements.map((ach) => _buildAchievementCard(ach)),
                  if (profile.achievements.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Text(
                          "Belum ada medali turnamen tercatat.",
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 13),
                        ),
                      ),
                    ),
                  const SizedBox(height: 32),
                  _buildLogoutButton(context, ref, themeColor),
                ],
              ),
            ),
          ),
        ),
      ),
      bottomNavigationBar: widget.showBottomNav ? _buildBottomNav(context, themeColor) : null,
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

    final activeThemeUrl = shopData?.active['themeId'] != null
        ? shopData!.items.where((i) => i.id == shopData.active['themeId']).firstOrNull?.itemUrl
        : null;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        image: activeThemeUrl != null && activeThemeUrl.isNotEmpty
            ? DecorationImage(
                image: NetworkImage(_getAbsoluteUrl(activeThemeUrl)),
                fit: BoxFit.cover,
              )
            : null,
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 20,
            offset: Offset(0, 6),
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
                  width: 86,
                  height: 86,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [themeColor, themeColorLight],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: themeColor.withValues(alpha: 0.25),
                        blurRadius: 12,
                        spreadRadius: 1,
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
                      width: 76,
                      height: 76,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFFF1F5F9),
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
                  
                  // 2. Frame Overlay
                  if (frameUrl != null && frameUrl.isNotEmpty)
                    (() {
                      final cssStyles = CssValueParser.parseCss(frameCss);
                      final Color? parsedBorderColor = cssStyles['borderColor'];
                      final double parsedBorderWidth = cssStyles['borderWidth'] ?? 2.0;
                      final Color? parsedGlowColor = cssStyles['glowColor'];
                      final double parsedGlowBlurRadius = (cssStyles['glowBlurRadius'] ?? 0.0) * 1.5;

                      return IgnorePointer(
                        child: Container(
                          width: 86,
                          height: 86,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            image: DecorationImage(
                              image: NetworkImage(_getAbsoluteUrl(frameUrl!)),
                              fit: BoxFit.fill,
                            ),
                            border: parsedBorderColor != null
                                ? Border.all(color: parsedBorderColor, width: parsedBorderWidth * 1.5)
                                : null,
                            boxShadow: [
                              BoxShadow(
                                color: parsedGlowColor ?? const Color(0x20000000),
                                blurRadius: parsedGlowBlurRadius > 0 ? parsedGlowBlurRadius : 10,
                                spreadRadius: 1,
                              )
                            ],
                          ),
                        ),
                      );
                    })(),

                  if (_isUploading)
                    const CircularProgressIndicator(color: Color(0xFFDC2626)),
                  
                  if (!_isUploading)
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: () => _pickAndUploadImage(frameUrl),
                        child: Container(
                          padding: const EdgeInsets.all(5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 1.5),
                          ),
                          child: const Icon(Icons.camera_alt, color: Colors.white, size: 13),
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
                profile.name,
                style: GoogleFonts.inter(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF0F172A),
                  letterSpacing: -0.3,
                ),
              ),
              GestureDetector(
                onTap: () => _showEditNameModal(context, ref, profile, themeColor),
                child: Container(
                  margin: const EdgeInsets.only(left: 8),
                  padding: const EdgeInsets.all(5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: const Icon(Icons.edit_outlined, color: Color(0xFF475569), size: 14),
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
                      height: 34,
                      fit: BoxFit.contain,
                    )
                  : Padding(
                      padding: const EdgeInsets.only(top: 4, bottom: 4),
                      child: Text(
                        titleName.toUpperCase(),
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFFD97706),
                          letterSpacing: 1,
                        ),
                      ),
                    ),
            ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Text(
              profile.memberNumber,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF475569),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildStatColumn('UMUR', '${profile.age} Thn'),
              Container(width: 1, height: 36, color: const Color(0xFFE2E8F0)),
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
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF64748B),
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF0F172A),
          ),
        ),
      ],
    );
  }

  Widget _buildLevelBar(ProfileData profile, Color themeColor, Color themeColorLight) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x04000000),
            blurRadius: 10,
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
              Expanded(
                child: Text(
                  profile.currentBelt,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '${profile.progress.clamp(0, 100)}%',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFFDC2626),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          LayoutBuilder(
            builder: (context, constraints) {
              final double maxProgressWidth = constraints.maxWidth;
              final double clampedProgress = profile.progress.clamp(0, 100).toDouble();
              final double progressWidth = maxProgressWidth * (clampedProgress / 100.0);

              return Stack(
                children: [
                  Container(
                    height: 8,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  Container(
                    height: 8,
                    width: progressWidth,
                    decoration: BoxDecoration(
                      color: const Color(0xFFDC2626),
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 8),
          Text(
            'Lanjutkan kehadiran latihan untuk memenuhi syarat Ujian Kenaikan Tingkat (UKT).',
            style: GoogleFonts.inter(
              fontSize: 12,
              color: const Color(0xFF64748B),
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBiometricsPanel(ProfileData profile) {
    double? bmi;
    String bmiCategory = "-";
    Color bmiColor = const Color(0xFF64748B);

    if (profile.weight != null && profile.height != null && profile.height! > 0) {
      final heightInMeter = profile.height! / 100;
      final currentBmi = profile.weight! / (heightInMeter * heightInMeter);
      bmi = currentBmi;
      
      if (currentBmi < 18.5) {
        bmiCategory = "Kurus";
        bmiColor = const Color(0xFFD97706);
      } else if (currentBmi < 24.9) {
        bmiCategory = "Ideal";
        bmiColor = const Color(0xFF059669);
      } else if (currentBmi < 29.9) {
        bmiCategory = "Berlebih";
        bmiColor = const Color(0xFFD97706);
      } else {
        bmiCategory = "Obesitas";
        bmiColor = const Color(0xFFDC2626);
      }
    }

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x04000000),
            blurRadius: 10,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildMetricBox("Berat", profile.weight != null ? "${profile.weight} kg" : "-"),
              Container(width: 1, height: 32, color: const Color(0xFFE2E8F0)),
              _buildMetricBox("Tinggi", profile.height != null ? "${profile.height} cm" : "-"),
              Container(width: 1, height: 32, color: const Color(0xFFE2E8F0)),
              _buildMetricBox("Perut", profile.waistCircum != null ? "${profile.waistCircum} cm" : "-"),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Indeks Massa Tubuh (BMI)',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: const Color(0xFF475569),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  bmi != null ? "${bmi.toStringAsFixed(1)} ($bmiCategory)" : "Belum ada data",
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
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
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF64748B),
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF0F172A),
          ),
        ),
      ],
    );
  }

  Widget _buildAchievementCard(ProfileAchievement ach) {
    final isGold = ach.rank.toLowerCase() == 'emas';
    final isSilver = ach.rank.toLowerCase() == 'perak';
    final medalColor = isGold
        ? const Color(0xFFD97706)
        : isSilver
            ? const Color(0xFF64748B)
            : const Color(0xFFB45309);
    
    final xpBonus = isGold ? "+1000 XP" : isSilver ? "+750 XP" : "+500 XP";

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
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
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: medalColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.emoji_events, color: medalColor, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  ach.title,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  ach.eventName,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: const Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: medalColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  ach.rank,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: medalColor,
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                xpBonus,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: medalColor,
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
      child: OutlinedButton.icon(
        onPressed: () {
          ref.read(authProvider.notifier).logout();
          context.go('/login');
        },
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 14),
          backgroundColor: Colors.white,
          side: const BorderSide(color: Color(0xFFFECACA)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
        icon: const Icon(Icons.logout, color: Color(0xFFDC2626), size: 18),
        label: Text(
          'Keluar dari Akun',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w600,
            fontSize: 13,
            color: const Color(0xFFDC2626),
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

      if (adjustedImage == null) return;
      
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
      backgroundColor: Colors.white,
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
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Data ini digunakan untuk penentuan kelas UKT dan turnamen.',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: const Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 20),
              _buildInputRow('Berat Badan (kg)', weight?.toString() ?? '', (val) => weight = double.tryParse(val)),
              const SizedBox(height: 14),
              _buildInputRow('Tinggi Badan (cm)', height?.toString() ?? '', (val) => height = double.tryParse(val)),
              const SizedBox(height: 14),
              _buildInputRow('Lingkar Perut (cm)', waist?.toString() ?? '', (val) => waist = double.tryParse(val)),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFDC2626),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
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
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
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

  void _showEditNameModal(BuildContext context, WidgetRef ref, ProfileData profile, Color themeColor) {
    final controller = TextEditingController(text: profile.name);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
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
                'Perbarui Nama Panggilan (Nickname)',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Nama panggilan yang ditampilkan pada kartu profil aplikasi.',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: const Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'NAMA PANGGILAN',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF475569),
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: controller,
                style: GoogleFonts.inter(color: const Color(0xFF0F172A), fontSize: 15),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFDC2626)),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFDC2626),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  onPressed: () async {
                    final newName = controller.text.trim();
                    if (newName.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Nama tidak boleh kosong')),
                      );
                      return;
                    }

                    Navigator.pop(ctx);
                    final success = await ref.read(profileServiceProvider).updateName(newName);
                    if (context.mounted) {
                      if (success) {
                        ref.invalidate(profileProvider);
                        ref.invalidate(authProvider);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Nama berhasil diperbarui!'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Gagal memperbarui nama di server')),
                        );
                      }
                    }
                  },
                  child: Text(
                    'Simpan Nama',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
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
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF334155),
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          initialValue: initialValue,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          style: GoogleFonts.inter(color: const Color(0xFF0F172A), fontSize: 14),
          decoration: InputDecoration(
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFDC2626)),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          ),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildBottomNav(BuildContext context, Color themeColor) {
    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 460),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
        ),
        child: BottomNavigationBar(
          backgroundColor: Colors.white,
          elevation: 0,
          selectedItemColor: const Color(0xFFDC2626),
          unselectedItemColor: const Color(0xFF64748B),
          selectedLabelStyle: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600),
          unselectedLabelStyle: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w500),
          type: BottomNavigationBarType.fixed,
          currentIndex: 3,
          onTap: (index) {
            if (index == 0) context.go('/');
            if (index == 1) context.go('/spp');
            if (index == 2) context.go('/quest');
            if (index == 3) context.go('/profile');
          },
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Beranda'),
            BottomNavigationBarItem(icon: Icon(Icons.payment_outlined), activeIcon: Icon(Icons.payment), label: 'SPP'),
            BottomNavigationBarItem(icon: Icon(Icons.local_fire_department_outlined), activeIcon: Icon(Icons.local_fire_department), label: 'Quest'),
            BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profil'),
          ],
        ),
      ),
    );
  }
}
