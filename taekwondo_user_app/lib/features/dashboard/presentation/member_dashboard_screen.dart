import 'dart:math' as Math;
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../auth/domain/user_model.dart';
import '../../auth/data/auth_provider.dart';
import '../../spp/presentation/spp_screen.dart';
import '../../../core/network/dio_client.dart';
import '../data/member_attendance_service.dart';
import '../data/quest_service.dart';
import '../../profile/data/profile_service.dart';
import '../../profile/presentation/profile_screen.dart';
import '../data/shop_service.dart';
import '../../schedule/presentation/schedule_screen.dart';
import 'notification_screen.dart';
import '../data/event_service.dart';
import '../data/article_service.dart';

// Premium Gamified Palette (matching the web screenshot)
const Color darkBg = Color(0xFF0F172A); // Dark Slate Blue
const Color cardBg = Color(0xFF1E293B); // Slate Blue Card
const Color brandRed = Color(0xFFE10600); // Bright Red Absen
const Color goldAccent = Color(0xFFEAB308); // Gold coin & LV accent
const Color textWhite = Colors.white;
const Color textGray = Color(0xFF94A3B8);

class MemberDashboardScreen extends ConsumerStatefulWidget {
  final UserModel user;
  const MemberDashboardScreen({super.key, required this.user});

  @override
  ConsumerState<MemberDashboardScreen> createState() => _MemberDashboardScreenState();
}

class _MemberDashboardScreenState extends ConsumerState<MemberDashboardScreen> {
  int _currentTab = 0; // 0: Lobby, 1: Toko, 2: Misi, 3: SPP, 4: Atlet
  bool _isAbsenLoading = false;
  bool _isAbsenSuccess = false;

  String _getAbsoluteUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return 'https://www.whitetigerkraksaan.com$cleanPath';
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
        if (equippedThemeId == 'theme-gold') themeColor = const Color(0xFFEAB308);
        else if (equippedThemeId == 'theme-diamond') themeColor = const Color(0xFF38BDF8);
        else if (equippedThemeId == 'theme-ruby') themeColor = const Color(0xFFEF4444);
        else if (equippedThemeId == 'theme-emerald') themeColor = const Color(0xFF10B981);
        else if (equippedThemeId == 'theme-amethyst') themeColor = const Color(0xFF8B5CF6);
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
        backgroundColor: darkBg,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, color: themeColor, size: 80),
                const SizedBox(height: 24),
                Text(
                  message,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  isSessionExpired 
                      ? 'Silakan login kembali untuk memperbarui sesi Anda.' 
                      : 'Pastikan koneksi internet stabil atau hubungi admin.',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () {
                        ref.invalidate(profileProvider);
                      },
                      icon: const Icon(Icons.refresh),
                      label: const Text('Coba Lagi'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: themeColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    OutlinedButton.icon(
                      onPressed: () {
                        ref.read(authProvider.notifier).logout();
                      },
                      icon: const Icon(Icons.logout, color: Colors.white),
                      label: const Text('Keluar / Login Ulang', style: TextStyle(color: Colors.white)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.white24),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
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
      backgroundColor: darkBg,
      body: Stack(
        children: [
          // Background glowing orbs
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: brandRed.withOpacity(0.15),
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            left: -100,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF2A303F).withOpacity(0.2),
              ),
            ),
          ),
          // Glassmorphism Blur
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 60, sigmaY: 60),
              child: Container(color: Colors.transparent),
            ),
          ),

          // Taekwondo Logo Background (Watermark)
          Positioned.fill(
            child: Center(
              child: Opacity(
                opacity: 0.07, // Transparan agar tidak mengganggu teks
                child: Image.asset(
                  'assets/images/logo.png',
                  width: MediaQuery.of(context).size.width * 0.8,
                  fit: BoxFit.contain,
                  color: Colors.white, // Membuatnya monokrom elegan jika logonya berwarna
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
    String? titleName;
    
    if (shopData != null) {
      final frameId = shopData.active['frameId'];
      if (frameId != null) {
        final frameItem = shopData.items.where((i) => i.id == frameId).firstOrNull;
        frameUrl = frameItem?.itemUrl;
      }
      
      final titleId = shopData.active['titleId'];
      if (titleId != null) {
        final titleItem = shopData.items.where((i) => i.id == titleId).firstOrNull;
        titleName = titleItem?.name;
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      decoration: BoxDecoration(
        color: darkBg.withOpacity(0.95),
        border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.05), width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Stack(
                alignment: Alignment.center,
                children: [
                  // 1. Base Profile Picture
                  CircleAvatar(
                    radius: 22,
                    backgroundColor: const Color(0xFF1E293B),
                    backgroundImage: profile?.profilePicture != null
                        ? NetworkImage(_getAbsoluteUrl(profile!.profilePicture!))
                        : const NetworkImage('https://api.dicebear.com/7.x/avataaars/png?seed=Taekwondo') as ImageProvider,
                  ),
                  // 2. Frame Overlay
                  if (frameUrl != null && frameUrl.isNotEmpty)
                    Container(
                      width: 54, // Frame is slightly larger than the avatar
                      height: 54,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        image: DecorationImage(
                          image: NetworkImage(_getAbsoluteUrl(frameUrl)),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  // 3. Default border if no frame
                  if (frameUrl == null || frameUrl.isEmpty)
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF3B82F6), width: 2),
                      ),
                    ),
                  Positioned(
                    bottom: 1,
                    right: 1,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: BoxDecoration(
                        color: const Color(0xFF3B82F6), // Blue status dot
                        shape: BoxShape.circle,
                        border: Border.all(color: darkBg, width: 1.5),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        (titleName ?? 'ATLET MUDA').toUpperCase(),
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                          color: titleName != null ? const Color(0xFFFFD700) : themeColor,
                        ),
                      ),
                      if (emblemUrl != null && emblemUrl.isNotEmpty) ...[
                        const SizedBox(width: 4),
                        Image.network(_getAbsoluteUrl(emblemUrl), width: 14, height: 14, fit: BoxFit.contain),
                      ]
                    ],
                  ),
                  Text(
                    widget.user.name ?? 'Beni Setiawan',
                    style: GoogleFonts.hankenGrotesk(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: textWhite,
                    ),
                  ),
                  Text(
                    widget.user.memberNumber ?? '#WTK-2026-0089',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 10,
                      color: textGray,
                    ),
                  ),
                ],
              ),
            ],
          ),
          Row(
            children: [
              // Coins Pill widget (Matches next.js web UI)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: goldAccent, width: 1.5), // Gold outline matching Next.js
                ),
                child: Row(
                  children: [
                    const Icon(Icons.monetization_on, color: goldAccent, size: 16),
                    const SizedBox(width: 6),
                    Text(
                      '$coins',
                      style: GoogleFonts.spaceGrotesk(
                        color: goldAccent,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              // Bell icon inside a premium circle
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF1E293B),
                  border: Border.all(color: Colors.white10),
                ),
                child: IconButton(
                  padding: EdgeInsets.zero,
                  icon: const Icon(Icons.notifications_none, color: textWhite, size: 18),
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationScreen()));
                  },
                ),
              ),
              const SizedBox(width: 8),
              // Exit/logout icon inside a premium circle
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF1E293B),
                  border: Border.all(color: Colors.white10),
                ),
                child: IconButton(
                  padding: EdgeInsets.zero,
                  icon: const Icon(Icons.logout_rounded, color: Colors.white, size: 18),
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

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Level & XP Bar (RPG Exponential XP Curve)
          Builder(
            builder: (context) {
              // totalXp adalah total akumulasi XP milik member
              final int totalXp = progress; 
              
              // Fungsi RPG Leveling: hitung batas XP kumulatif untuk setiap level
              // level 1 butuh 0 XP kumulatif.
              // Batas naik ke level L+1 adalah: Max XP level L = 100 * L^1.5 (dibulatkan).
              int level = 1;
              int accumulatedXpForCurrentLevel = 0;
              int nextLevelThreshold = 100; // batas naik ke level 2

              while (true) {
                // Formula Max XP level saat ini: 100 * (level)^1.5
                final double multiplier = Math.pow(level, 1.5).toDouble();
                final int currentLevelMaxXp = (100 * multiplier).round();
                
                if (totalXp >= accumulatedXpForCurrentLevel + currentLevelMaxXp) {
                  accumulatedXpForCurrentLevel += currentLevelMaxXp;
                  level++;
                } else {
                  // Berhenti jika totalXp berada di dalam rentang level ini
                  nextLevelThreshold = currentLevelMaxXp;
                  break;
                }
              }

              final int currentLevelXp = totalXp - accumulatedXpForCurrentLevel;
              final double widthFactor = (currentLevelXp / nextLevelThreshold).clamp(0.0, 1.0);

              return Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.05), width: 1.5),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: goldAccent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'LV.$level',
                            style: GoogleFonts.spaceGrotesk(
                              fontWeight: FontWeight.w900,
                              color: Colors.black,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'CHUKJAE (NOVICE) • $belt',
                            style: GoogleFonts.hankenGrotesk(
                              color: textWhite,
                              fontWeight: FontWeight.w900,
                              fontSize: 14,
                            ),
                          ),
                        ),
                        Text(
                          '$currentLevelXp / $nextLevelThreshold XP',
                          style: GoogleFonts.spaceGrotesk(
                            color: textWhite,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Container(
                      height: 14,
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white.withOpacity(0.1)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.5),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: FractionallySizedBox(
                          widthFactor: widthFactor,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 800),
                            curve: Curves.easeOutQuart,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              gradient: const LinearGradient(
                                colors: [Color(0xFFEAB308), Color(0xFFF59E0B), Color(0xFFD97706)],
                                stops: [0.0, 0.5, 1.0],
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFEAB308).withOpacity(0.6),
                                  blurRadius: 12,
                                  offset: const Offset(0, 0),
                                ),
                              ],
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
          const SizedBox(height: 16),

          // Big Red Attendance Button (Premium Glow Design)
          GestureDetector(
            onTap: () => _handleSelfAttendance(),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: _isAbsenSuccess 
                      ? [Colors.green.shade500, Colors.green.shade700]
                      : [brandRed, const Color(0xFFB91C1C)], // brandRed to darker red
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: Colors.white.withOpacity(0.2), 
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: (_isAbsenSuccess ? Colors.green : brandRed).withOpacity(0.5),
                    blurRadius: 20,
                    spreadRadius: 2,
                    offset: const Offset(0, 8),
                  ),
                  BoxShadow(
                    color: Colors.white.withOpacity(0.15),
                    blurRadius: 0,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (_isAbsenLoading)
                    const SizedBox(
                      width: 28, height: 28,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                    )
                  else if (_isAbsenSuccess)
                    const Icon(Icons.check_circle_outline, color: Colors.white, size: 28)
                  else
                    const Icon(Icons.fingerprint, color: Colors.white, size: 28),
                  
                  Flexible(
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        _isAbsenLoading 
                            ? 'MEMPROSES ABSEN...' 
                            : (_isAbsenSuccess ? 'ANDA SUDAH ABSEN HARI INI' : 'KLIK UNTUK ABSEN SEKARANG!'),
                        style: GoogleFonts.outfit(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                          shadows: [
                            const Shadow(
                              color: Colors.black45,
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Daily Quest Card (Red Outlined + Tiger Mascot + Count Badge)
          GestureDetector(
            onTap: () => setState(() => _currentTab = 2),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: brandRed.withOpacity(0.8), width: 1.5),
              ),
              child: Row(
                children: [
                  ClipOval(
                    child: Image.asset(
                      'assets/images/daily_quest_tiger_transparent.png',
                      width: 36,
                      height: 36,
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'MISI HARIAN (DAILY QUESTS)',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            color: textWhite,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          totalQuests == 0 
                              ? 'Tidak ada misi aktif untuk hari ini.' 
                              : '$completedQuests/$totalQuests Misi Selesai',
                          style: GoogleFonts.hankenGrotesk(
                            fontSize: 13,
                            color: textGray,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: brandRed.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: brandRed.withOpacity(0.4), width: 1),
                    ),
                    child: Text(
                      '$completedQuests/$totalQuests SELSEAI',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: themeColor,
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
            childAspectRatio: 2.1,
            children: [
              _buildGridMenuButton(
                icon: Icons.calendar_today,
                color: Colors.blueAccent,
                label: 'JADWAL',
                subLabel: 'Latihan',
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const ScheduleScreen()));
                },
              ),
              _buildGridMenuButton(
                icon: Icons.emoji_events,
                color: Colors.amber,
                label: 'UJIAN UKT',
                subLabel: 'Progress',
                onTap: () {},
              ),
              _buildGridMenuButton(
                icon: Icons.stars,
                color: Colors.purpleAccent,
                label: 'PROFIL',
                subLabel: 'Atlet',
                onTap: () => setState(() => _currentTab = 4),
              ),
              _buildGridMenuButton(
                icon: Icons.trending_up,
                color: Colors.teal,
                label: 'RIWAYAT',
                subLabel: 'Pembayaran',
                onTap: () => setState(() => _currentTab = 3),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Turnamen & Kejuaraan Section
          Row(
            children: [
              const Icon(Icons.whatshot, color: Colors.amber, size: 20),
              const SizedBox(width: 8),
              Text(
                'TURNAMEN & KEJUARAAN',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ref.watch(eventProvider).when(
            data: (events) {
              if (events.isEmpty) {
                return const Text('Belum ada turnamen dalam waktu dekat.', style: TextStyle(color: Colors.white54));
              }
              return Column(
                children: events.map((event) => Container(
                  width: double.infinity,
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cardBg.withOpacity(0.6),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(0.03)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: brandRed.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: brandRed.withOpacity(0.2)),
                            ),
                            child: Text(
                              event.level.toUpperCase(),
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 9,
                                fontWeight: FontWeight.w900,
                                color: themeColor,
                              ),
                            ),
                          ),
                          Text(
                            '${event.startDate.day}/${event.startDate.month}',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 10,
                              color: textGray,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        event.title,
                        style: GoogleFonts.hankenGrotesk(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.location_on, color: Colors.white30, size: 14),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              event.location,
                              style: GoogleFonts.hankenGrotesk(
                                fontSize: 11,
                                color: textGray,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                )).toList(),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator(color: Colors.red)),
            error: (e, s) => Text('Gagal memuat event: $e', style: const TextStyle(color: Colors.red)),
          ),
          const SizedBox(height: 24),

          // Berita Dojang Section
          Row(
            children: [
              const Icon(Icons.newspaper, color: Colors.blueAccent, size: 20),
              const SizedBox(width: 8),
              Text(
                'BERITA DOJANG',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ref.watch(articleProvider).when(
            data: (articles) {
              if (articles.isEmpty) {
                return const Text('Belum ada berita terbaru.', style: TextStyle(color: Colors.white54));
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
            loading: () => const Center(child: CircularProgressIndicator(color: Colors.red)),
            error: (e, s) => Text('Gagal memuat berita: $e', style: const TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  Widget _buildGridMenuButton({
    required IconData icon,
    required Color color,
    required String label,
    required String subLabel,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.05), width: 1.5),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: color.withOpacity(0.2)),
              ),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    label,
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                      color: textGray,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Text(
                    subLabel,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.hankenGrotesk(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
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
        color: cardBg.withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.03)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.hankenGrotesk(
              fontSize: 13,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            content,
            style: GoogleFonts.hankenGrotesk(
              fontSize: 11,
              color: textGray,
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
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 9,
                  fontWeight: FontWeight.w900,
                  color: textGray,
                ),
              ),
              Text(
                date,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 9,
                  color: textGray,
                  fontWeight: FontWeight.bold,
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
      loading: () => const Center(child: CircularProgressIndicator(color: Colors.red)),
      error: (err, stack) => Center(child: Text('Gagal memuat Toko: $err', style: const TextStyle(color: Colors.white))),
      data: (shopData) {
        if (shopData.items.isEmpty) {
          return const Center(child: Text('Toko kosong saat ini.', style: TextStyle(color: Colors.white)));
        }
        return GridView.builder(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 0.76,
          ),
          itemCount: shopData.items.length,
          itemBuilder: (context, index) {
            final item = shopData.items[index];
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: item.equipped ? goldAccent : Colors.white10),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: item.itemUrl != null && item.itemUrl!.isNotEmpty
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: Image.network(
                                  _getAbsoluteUrl(item.itemUrl!),
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Icon(Icons.redeem, color: goldAccent, size: 30),
                                ),
                              )
                            : const Icon(Icons.redeem, color: goldAccent, size: 30),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        item.name,
                        style: GoogleFonts.hankenGrotesk(
                          color: textWhite,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.type,
                        style: GoogleFonts.spaceGrotesk(
                          color: textGray,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.monetization_on, color: goldAccent, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            '${item.price} DC',
                            style: GoogleFonts.spaceGrotesk(
                              color: goldAccent,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: item.equipped 
                              ? Colors.red.withValues(alpha: 0.8) // Red for unequip
                              : (item.owned ? Colors.green : themeColor),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          minimumSize: const Size(double.infinity, 36),
                        ),
                        onPressed: item.equipped 
                            ? () => _handleUnequipItem(item.id) 
                            : (item.owned 
                                ? () => _handleEquipItem(item.id) 
                                : () => _handleBuyItem(item.id)),
                        child: Text(
                          item.equipped 
                              ? 'Lepas' 
                              : (item.owned ? 'Pasang' : 'Beli'),
                          style: GoogleFonts.hankenGrotesk(fontSize: 12, fontWeight: FontWeight.bold),
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

  Widget _buildDailyQuests(Color themeColor) {
    final questsAsync = ref.watch(questProvider);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Text(
            'Misi Harian (Daily Quests)',
            style: GoogleFonts.hankenGrotesk(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: textWhite,
            ),
          ),
        ),
        Expanded(
          child: questsAsync.when(
            data: (logs) {
              if (logs.isEmpty) {
                return const Center(child: Text('Tidak ada misi hari ini.', style: TextStyle(color: Colors.white)));
              }
              return ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                itemCount: logs.length,
                itemBuilder: (context, index) {
                  final log = logs[index];
                  final quest = log.quest;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: log.completed ? Colors.white.withOpacity(0.05) : cardBg,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: log.completed ? Colors.green.withOpacity(0.3) : Colors.white10),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: log.completed ? Colors.green.withOpacity(0.15) : goldAccent.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Icon(
                            log.completed ? Icons.check_circle : Icons.assignment,
                            color: log.completed ? Colors.green : goldAccent,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                quest.title,
                                style: GoogleFonts.hankenGrotesk(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: textWhite,
                                  decoration: log.completed ? TextDecoration.lineThrough : null,
                                ),
                              ),
                              Text(
                                '+${quest.baseXp} XP',
                                style: GoogleFonts.hankenGrotesk(
                                  fontSize: 12,
                                  color: textGray,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (!log.completed)
                          GestureDetector(
                            onTap: () => _showCompleteQuestSheet(context, ref, log, themeColor),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: themeColor,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                'Ambil',
                                style: GoogleFonts.hankenGrotesk(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  );
                },
              );
            },
            loading: () => const Center(child: CircularProgressIndicator(color: Colors.red)),
            error: (e, s) => Center(child: Text('Gagal memuat misi: $e', style: const TextStyle(color: Colors.white))),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomNavBar() {
    return Container(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 10, bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF0B1326).withOpacity(0.95), // Deep obsidian
        border: const Border(top: BorderSide(color: Colors.white12, width: 1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(Icons.home_outlined, Icons.home, 'Lobby', 0),
          _buildNavItem(Icons.shopping_bag_outlined, Icons.shopping_bag, 'Toko', 1),
          _buildMisiNavItem(2),
          _buildNavItem(Icons.credit_card_outlined, Icons.credit_card, 'SPP', 3),
          _buildNavItem(Icons.person_outline, Icons.person, 'Atlet', 4),
        ],
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
            width: 96,
            height: 38, // Tinggi dinaikkan sedikit untuk ruang
            child: Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                Positioned(
                  top: -38, // Dinaikkan dari -26 agar melayang keluar dari garis bawah dojang
                  child: Image.asset(
                    'assets/images/daily_quest_tiger_transparent.png',
                    width: 96,
                    height: 96,
                    fit: BoxFit.contain,
                    color: isActive ? null : Colors.white.withOpacity(0.4),
                    colorBlendMode: isActive ? null : BlendMode.modulate,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Misi',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 10,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              color: isActive ? brandRed : textGray,
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
            color: isActive ? brandRed : textGray,
            size: 24,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 10,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              color: isActive ? brandRed : textGray,
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
                    color: displayColor.withOpacity(0.15),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: displayColor,
                      width: 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: displayColor.withOpacity(0.2),
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
                      color: const Color(0xFFFFD700).withOpacity(0.15),
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
                          color: isSuccess ? Colors.green.withOpacity(0.2) : const Color(0xFFE10600).withOpacity(0.2),
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

  void _handleSelfAttendance() async {
    if (_isAbsenLoading || _isAbsenSuccess) return;

    setState(() { _isAbsenLoading = true; });

    try {
      final success = await AttendanceService(ref.read(dioProvider)).checkInWithLocation(widget.user);
      if (success) {
        setState(() {
          _isAbsenLoading = false;
          _isAbsenSuccess = true;
        });
        ref.invalidate(profileProvider); // Refresh to get updated coins / XP
        
        _showGamifiedDialog(
          title: 'Hadir Latihan! 🎉',
          message: 'Absensi Anda berhasil dicatat hari ini. Tetap semangat berlatih!',
          isSuccess: true,
          coinsReward: '10',
        );

        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) {
            setState(() { _isAbsenSuccess = false; });
          }
        });
      } else {
        setState(() { _isAbsenLoading = false; });
        _showGamifiedDialog(
          title: 'Gagal Absen ❌',
          message: 'Gagal mencatat absensi. Silakan coba kembali.',
          isSuccess: false,
        );
      }
    } catch (e) {
      setState(() { _isAbsenLoading = false; });
      String errMsg = e.toString();
      if (errMsg.startsWith('Exception: ')) {
        errMsg = errMsg.substring(11);
      }
      _showGamifiedDialog(
        title: 'Batas Jangkauan! 📍',
        message: errMsg,
        isSuccess: false,
      );
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

  void _showCompleteQuestSheet(BuildContext context, WidgetRef ref, dynamic log, Color themeColor) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (c) {
        bool isSubmitting = false;
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.only(topLeft: Radius.circular(32), topRight: Radius.circular(32)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white30, borderRadius: BorderRadius.circular(2)))),
                  const SizedBox(height: 24),
                  Text(
                    'Klaim Misi Harian', 
                    style: GoogleFonts.hankenGrotesk(fontSize: 20, fontWeight: FontWeight.bold, color: textWhite)
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Apakah kamu ingin menyelesaikan dan mengklaim misi ini?',
                    style: GoogleFonts.hankenGrotesk(fontSize: 14, color: textGray),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  GestureDetector(
                    onTap: isSubmitting ? null : () async {
                      setModalState(() => isSubmitting = true);
                      try {
                        await ref.read(questServiceProvider).completeQuest(log.id);
                        ref.invalidate(questProvider);
                        ref.invalidate(profileProvider); // Refresh dashboard XP/progress
                        if (context.mounted) {
                          Navigator.pop(c);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Misi berhasil diselesaikan!')),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Gagal menyelesaikan misi: $e')),
                          );
                        }
                      } finally {
                        setModalState(() => isSubmitting = false);
                      }
                    },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isSubmitting ? Colors.grey : themeColor, 
                        borderRadius: BorderRadius.circular(16)
                      ),
                      alignment: Alignment.center,
                      child: isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : Text(
                              'Selesaikan & Klaim XP', 
                              style: GoogleFonts.hankenGrotesk(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)
                            ),
                    ),
                  ),
                  SizedBox(height: MediaQuery.of(context).viewInsets.bottom + 24),
                ],
              ),
            );
          }
        );
      }
    );
  }
}
