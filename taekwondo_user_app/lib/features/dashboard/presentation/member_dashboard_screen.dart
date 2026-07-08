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

  @override
  Widget build(BuildContext context) {
    // Watch shop data to get coin balance & shop items dynamically
    final shopDataAsync = ref.watch(shopDataProvider);
    final profileAsync = ref.watch(profileProvider);

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
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 60, sigmaY: 60),
              child: const SizedBox(),
            ),
          ),

          // Main View Switcher
          SafeArea(
            child: Column(
              children: [
                _buildTopAppBar(coins, belt),
                Expanded(
                  child: IndexedStack(
                    index: _currentTab,
                    children: [
                      _buildLobbyTab(progress, belt),
                      _buildTokoTab(shopDataAsync),
                      _buildMisiTab(),
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

  Widget _buildTopAppBar(int coins, String belt) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      decoration: BoxDecoration(
        color: darkBg.withOpacity(0.85),
        border: const Border(bottom: BorderSide(color: Colors.white10)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.blueAccent, width: 2),
                ),
                padding: const EdgeInsets.all(2),
                child: const CircleAvatar(
                  radius: 20,
                  backgroundColor: Colors.blueAccent,
                  child: Text('B', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'ATLET MUDA',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                      color: brandRed,
                    ),
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
                    widget.user.memberNumber ?? '#TKD-2026-0089',
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
                  color: goldAccent.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: goldAccent.withOpacity(0.5)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.monetization_on, color: goldAccent, size: 16),
                    const SizedBox(width: 4),
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
              const SizedBox(width: 8),
              // Bell icon
              IconButton(
                icon: const Icon(Icons.notifications_none, color: textWhite),
                onPressed: () {},
              ),
              // Exit/logout icon
              IconButton(
                icon: const Icon(Icons.logout_rounded, color: textWhite),
                onPressed: () {
                  ref.read(authProvider.notifier).logout();
                },
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildLobbyTab(int progress, String belt) {
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
          // Level & XP Bar
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white10),
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
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'LV.1',
                        style: GoogleFonts.spaceGrotesk(
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'CHUKJAE (NOVICE) • $belt',
                        style: GoogleFonts.hankenGrotesk(
                          color: textWhite,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    Text(
                      '$progress / 100 XP',
                      style: GoogleFonts.spaceGrotesk(
                        color: textWhite,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    height: 8,
                    color: Colors.white.withOpacity(0.1),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: FractionallySizedBox(
                        widthFactor: (progress / 100).clamp(0.0, 1.0),
                        child: Container(
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              colors: [brandRed, goldAccent],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Big Red Attendance Button
          GestureDetector(
            onTap: () => _handleSelfAttendance(),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [brandRed, Color(0xFF990000)],
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: brandRed.withOpacity(0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  )
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (_isAbsenLoading)
                    const SizedBox(
                      width: 24, height: 24,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                    )
                  else if (_isAbsenSuccess)
                    const Icon(Icons.check_circle, color: Colors.white, size: 24)
                  else
                    const Icon(Icons.group, color: Colors.white, size: 24),
                  const SizedBox(width: 12),
                  Text(
                    _isAbsenLoading 
                        ? 'MEMPROSES...' 
                        : (_isAbsenSuccess ? 'ABSEN BERHASIL!' : 'ABSEN MASUK SEKARANG'),
                    style: GoogleFonts.hankenGrotesk(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Daily Quest Card
          GestureDetector(
            onTap: () => setState(() => _currentTab = 2),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: brandRed.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.bolt, color: goldAccent, size: 32),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'MISI HARIAN (DAILY QUESTS)',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: textWhite,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          totalQuests == 0 
                              ? 'Tidak ada misi aktif untuk hari ini.' 
                              : '$completedQuests/$totalQuests Misi Selesai',
                          style: GoogleFonts.hankenGrotesk(
                            fontSize: 14,
                            color: textGray,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: textWhite),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // SPP Card
          GestureDetector(
            onTap: () => setState(() => _currentTab = 3),
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.credit_card, color: Colors.greenAccent, size: 32),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'SPP',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: textGray,
                          ),
                        ),
                        Text(
                          'Pembayaran Aman',
                          style: GoogleFonts.hankenGrotesk(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: textWhite,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: textWhite),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTokoTab(AsyncValue<ShopData> shopDataAsync) {
    return shopDataAsync.when(
      loading: () => const Center(child: CircularProgressIndicator(color: brandRed)),
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
            childAspectRatio: 0.75,
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
                        child: const Icon(Icons.redeem, color: goldAccent, size: 30),
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
                              ? Colors.grey 
                              : (item.owned ? Colors.green : brandRed),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          minimumSize: const Size(double.infinity, 36),
                        ),
                        onPressed: item.equipped 
                            ? null 
                            : (item.owned 
                                ? () => _handleEquipItem(item.id) 
                                : () => _handleBuyItem(item.id)),
                        child: Text(
                          item.equipped 
                              ? 'Dipakai' 
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

  Widget _buildMisiTab() {
    return _buildDailyQuests();
  }

  Widget _buildSppTab() {
    return SppScreen(user: widget.user);
  }

  Widget _buildAtletTab() {
    return const ProfileScreen();
  }

  Widget _buildDailyQuests() {
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
                            onTap: () => _showCompleteQuestSheet(context, ref, log),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: brandRed,
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
            loading: () => const Center(child: CircularProgressIndicator(color: brandRed)),
            error: (e, s) => Center(child: Text('Gagal memuat misi: $e', style: const TextStyle(color: Colors.white))),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomNavBar() {
    return Container(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 12, bottom: 20),
      decoration: BoxDecoration(
        color: darkBg.withOpacity(0.95),
        border: const Border(top: BorderSide(color: Colors.white10)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildNavItem(Icons.home_outlined, Icons.home, 'Lobby', 0),
          _buildNavItem(Icons.shopping_bag_outlined, Icons.shopping_bag, 'Toko', 1),
          _buildNavItem(Icons.bolt_outlined, Icons.bolt, 'Misi', 2),
          _buildNavItem(Icons.credit_card_outlined, Icons.credit_card, 'SPP', 3),
          _buildNavItem(Icons.person_outline, Icons.person, 'Atlet', 4),
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
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              color: isActive ? brandRed.withOpacity(0.15) : Colors.transparent,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              isActive ? selectedIcon : unselectedIcon,
              color: isActive ? brandRed : textGray,
              size: 24,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 10,
              fontWeight: isActive ? FontWeight.w900 : FontWeight.bold,
              color: isActive ? brandRed : textGray,
            ),
          )
        ],
      ),
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
        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) {
            setState(() { _isAbsenSuccess = false; });
          }
        });
      } else {
        setState(() { _isAbsenLoading = false; });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Gagal mencatat absen.')));
        }
      }
    } catch (e) {
      setState(() { _isAbsenLoading = false; });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Kesalahan: $e')));
      }
    }
  }

  void _handleBuyItem(String itemId) async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    try {
      final success = await ref.read(shopServiceProvider).buyItem(itemId);
      if (success) {
        scaffoldMessenger.showSnackBar(const SnackBar(content: Text('Item berhasil dibeli!')));
        ref.invalidate(shopDataProvider);
        ref.invalidate(profileProvider);
      } else {
        scaffoldMessenger.showSnackBar(const SnackBar(content: Text('Koin tidak cukup atau item tidak tersedia.')));
      }
    } catch (e) {
      scaffoldMessenger.showSnackBar(SnackBar(content: Text('Gagal membeli item: $e')));
    }
  }

  void _handleEquipItem(String itemId) async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    try {
      final success = await ref.read(shopServiceProvider).equipItem(itemId);
      if (success) {
        scaffoldMessenger.showSnackBar(const SnackBar(content: Text('Item berhasil dipasang! ✨')));
        ref.invalidate(shopDataProvider);
        ref.invalidate(profileProvider);
      } else {
        scaffoldMessenger.showSnackBar(const SnackBar(content: Text('Gagal memasang item.')));
      }
    } catch (e) {
      scaffoldMessenger.showSnackBar(SnackBar(content: Text('Gagal memasang item: $e')));
    }
  }

  void _showCompleteQuestSheet(BuildContext context, WidgetRef ref, dynamic log) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (c) {
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
                onTap: () async {
                  // In a real implementation we update quest status via api /quests/claim or similar
                  Navigator.pop(c);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Misi berhasil diselesaikan!')));
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: brandRed, borderRadius: BorderRadius.circular(16)),
                  alignment: Alignment.center,
                  child: Text(
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
}
