import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../auth/domain/user_model.dart';
import '../../spp/presentation/spp_screen.dart';
import '../../../core/network/dio_client.dart';
import '../data/member_attendance_service.dart';
import '../../curriculum/presentation/curriculum_screen.dart';
import '../data/exercise_service.dart';
import '../domain/exercise_model.dart';
import '../data/badge_service.dart';
import '../domain/badge_model.dart';
import '../../schedule/presentation/schedule_screen.dart';
import '../../../core/widgets/sporty_icons.dart';
import '../data/notification_service.dart';
import '../../../core/widgets/neo_brutal_ui.dart';

class MemberDashboardScreen extends ConsumerWidget {
  final UserModel user;

  const MemberDashboardScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA), // background
      body: Stack(
        children: [
          // Main scrollable content
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.only(left: 20, right: 20, top: 80, bottom: 120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeroRankSection(),
                  const SizedBox(height: 24),
                  _buildStatsGrid(),
                  const SizedBox(height: 24),
                  _buildQuickActions(context),
                  const SizedBox(height: 24),
                  _buildAbsenButton(context, ref),
                  const SizedBox(height: 24),
                  _buildDailyQuests(context, ref),
                  const SizedBox(height: 24),
                  _buildPromoBanner(),
                  const SizedBox(height: 24),
                  _buildRecentActivityList(ref),
                ],
              ),
            ),
          ),
          
          // Fixed Top App Bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: _buildTopAppBar(),
          ),
        ],
      ),
    );
  }

  Widget _buildTopAppBar() {
    return Container(
      color: const Color(0xFFF8F9FA),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: SafeArea(
        bottom: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF191C1D), width: 2),
                    image: const DecorationImage(
                      fit: BoxFit.cover,
                      image: NetworkImage(
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuDSFa4zlBB6Ck4xPBmT5eqQ2-HNA4_z7iM7AgJQWXp0l9Cnfea1UhTEMTj_nYQ8vvUCUtsGZwExmhOD5i6e-HWeAEv9JtmUOFcu3F3_IOnXqcB0yerVaMhdwYrICwiw9SC4k38i_53-Ee6QlV5LDOiiql9F6Ol9nT78fTDZ3mxMuzOdr3_GBlWDgwqvJircC6A8-udoJIi4gWUloV2AIxY-C64WRv6w7t8piW0HhikgvhJZ2MH-PVIebTmtIY9g-DMCw9Gn6u_3tSo',
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      (user.currentBelt ?? 'Red Belt').toUpperCase(),
                      style: GoogleFonts.spaceGrotesk(
                        color: const Color(0xFF424655), // on-surface-variant
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                      ),
                    ),
                    Text(
                      user.name ?? 'Budi Satria',
                      style: GoogleFonts.hankenGrotesk(
                        color: const Color(0xFFBC000A), // secondary
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        height: 1.2,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            NeoBrutalButton(
              onPressed: () {},
              backgroundColor: const Color(0xFFE7E8E9),
              borderRadius: BorderRadius.circular(12),
              child: const SizedBox(
                width: 48,
                height: 48,
                child: Center(
                  child: Icon(Icons.notifications_outlined, color: Color(0xFF191C1D)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroRankSection() {
    return NeoBrutalCard(
      backgroundColor: const Color(0xFFBC000A), // secondary red
      shadowColor: const Color(0xFFBC000A),
      padding: EdgeInsets.zero,
      clipBehavior: Clip.hardEdge,
      child: SizedBox(
        height: 96,
        child: Stack(
          children: [
            // Texture
            Positioned.fill(
              child: CustomPaint(painter: BeltTexturePainter()),
            ),
            Positioned(
              left: 0,
              top: 0,
              bottom: 0,
              width: 48,
              child: Container(color: Colors.white.withOpacity(0.2)),
            ),
            Positioned(
              right: 48,
              top: 0,
              bottom: 0,
              width: 32,
              child: Container(color: const Color(0xFF191C1D)),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        (user.currentBelt ?? 'Sabuk Merah').toUpperCase(),
                        style: GoogleFonts.hankenGrotesk(
                          fontSize: 32,
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontStyle: FontStyle.italic,
                          letterSpacing: -0.5,
                        ),
                      ),
                      Text(
                        'Level 8 • Menuju Sabuk Merah Hitam',
                        style: GoogleFonts.hankenGrotesk(
                          fontSize: 14,
                          color: Colors.white.withOpacity(0.9),
                        ),
                      ),
                    ],
                  ),
                  Transform.rotate(
                    angle: -0.2, // ~ -12 degrees
                    child: Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF191C1D), width: 4),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.2),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          )
                        ],
                      ),
                      child: const Center(
                        child: Icon(Icons.military_tech, color: Color(0xFFBC000A), size: 36),
                      ),
                    ),
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsGrid() {
    return Row(
      children: [
        Expanded(
          child: NeoBrutalCard(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'XP POIN',
                  style: GoogleFonts.spaceGrotesk(
                    color: const Color(0xFF424655),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '12,450',
                  style: GoogleFonts.hankenGrotesk(
                    color: const Color(0xFF0052DC), // primary blue
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  height: 12,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE7E8E9),
                    borderRadius: BorderRadius.circular(100),
                    border: Border.all(color: const Color(0xFF191C1D), width: 1),
                  ),
                  child: FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: 0.75,
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFD0A600), // tertiary-container
                        borderRadius: BorderRadius.circular(100),
                      ),
                    ),
                  ),
                )
              ],
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: NeoBrutalCard(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'KEHADIRAN',
                  style: GoogleFonts.spaceGrotesk(
                    color: const Color(0xFF424655),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '92%',
                  style: GoogleFonts.hankenGrotesk(
                    color: const Color(0xFFBC000A), // secondary red
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Sangat Bagus!',
                  style: GoogleFonts.hankenGrotesk(
                    color: const Color(0xFF424655),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Text(
            'Menu Utama',
            style: GoogleFonts.hankenGrotesk(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF191C1D),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Column(
          children: [
            _buildActionItem(
              context: context,
              title: 'Jadwal Latihan',
              icon: Icons.calendar_month,
              strapColor: const Color(0xFF0052DC),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (c) => const ScheduleScreen())),
            ),
            const SizedBox(height: 12),
            _buildActionItem(
              context: context,
              title: 'Iuran SPP',
              icon: Icons.payments,
              strapColor: const Color(0xFFBC000A),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (c) => SppScreen(user: user))),
            ),
            const SizedBox(height: 12),
            _buildActionItem(
              context: context,
              title: 'Pendaftaran UKT',
              icon: Icons.workspace_premium,
              strapColor: const Color(0xFFF1C100),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (c) => CurriculumScreen(user: user))),
            ),
            const SizedBox(height: 12),
            _buildActionItem(
              context: context,
              title: 'Sertifikat',
              icon: Icons.card_membership,
              strapColor: const Color(0xFF424655),
              onTap: () {},
            ),
          ],
        )
      ],
    );
  }

  Widget _buildActionItem({
    required BuildContext context,
    required String title,
    required IconData icon,
    required Color strapColor,
    required VoidCallback onTap,
  }) {
    return NeoBrutalButton(
      onPressed: onTap,
      child: Row(
        children: [
          Container(
            width: 16,
            height: 72,
            decoration: BoxDecoration(
              color: strapColor,
              border: const Border(right: BorderSide(color: Color(0xFF191C1D), width: 2)),
            ),
            child: CustomPaint(painter: BeltTexturePainter()),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(icon, color: strapColor, size: 32),
                      const SizedBox(width: 24),
                      Text(
                        title,
                        style: GoogleFonts.hankenGrotesk(
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF191C1D),
                        ),
                      ),
                    ],
                  ),
                  const Icon(Icons.chevron_right, color: Color(0xFF424655)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAbsenButton(BuildContext context, WidgetRef ref) {
    return NeoBrutalButton(
      onPressed: () => _handleSelfAttendance(context, ref),
      backgroundColor: const Color(0xFF2B6BFF), // primary container
      shadowColor: const Color(0xFF003DAA), // neo brutal shadow blue
      borderWidth: 4,
      child: SizedBox(
        height: 80,
        width: double.infinity,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.how_to_reg, color: Colors.white, size: 36),
            const SizedBox(width: 24),
            Text(
              'ABSEN SEKARANG',
              style: GoogleFonts.hankenGrotesk(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                letterSpacing: 2.0,
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildDailyQuests(BuildContext context, WidgetRef ref) {
    final questsAsync = ref.watch(dailyQuestsProvider(user.id));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Misi Harian',
                style: GoogleFonts.hankenGrotesk(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF191C1D),
                ),
              ),
              questsAsync.maybeWhen(
                data: (questsRes) {
                  final allExercises = questsRes.programs.expand((p) => p.exercises).toList();
                  final doneCount = allExercises.where((e) => questsRes.logs.any((l) => l.exerciseId == e.id)).length;
                  return Text(
                    '$doneCount/${allExercises.length} Selesai',
                    style: GoogleFonts.hankenGrotesk(
                      color: const Color(0xFF0052DC),
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  );
                },
                orElse: () => const SizedBox(),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        questsAsync.when(
          data: (questsRes) {
            final allExercises = questsRes.programs.expand((p) => p.exercises).toList();
            if (allExercises.isEmpty) {
              return NeoBrutalCard(
                padding: const EdgeInsets.all(24),
                child: Center(
                  child: Text(
                    'Tidak ada misi harian hari ini.',
                    style: GoogleFonts.hankenGrotesk(color: const Color(0xFF424655)),
                  ),
                ),
              );
            }

            return Column(
              children: allExercises.map((exercise) {
                final isDone = questsRes.logs.any((l) => l.exerciseId == exercise.id);
                final subtitle = '${exercise.sets ?? 3} set x ${exercise.reps ?? 10} reps';

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: NeoBrutalButton(
                    onPressed: isDone ? () {} : () => _showCompleteQuestSheet(context, ref, exercise),
                    backgroundColor: isDone ? const Color(0xFFF3F4F5) : Colors.white,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: isDone ? Colors.green.shade100 : const Color(0xFFFFE08B),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFF191C1D), width: 2),
                            ),
                            child: Center(
                              child: Icon(
                                isDone ? Icons.check_circle : Icons.bolt,
                                color: isDone ? Colors.green.shade700 : const Color(0xFF241A00),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  exercise.name,
                                  style: GoogleFonts.hankenGrotesk(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w500,
                                    color: const Color(0xFF191C1D),
                                    decoration: isDone ? TextDecoration.lineThrough : null,
                                  ),
                                ),
                                Text(
                                  '$subtitle • +50 XP',
                                  style: GoogleFonts.hankenGrotesk(
                                    fontSize: 14,
                                    color: const Color(0xFF424655),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (!isDone)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF191C1D),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'Ambil',
                                style: GoogleFonts.hankenGrotesk(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF0052DC))),
          error: (e, s) => Center(child: Text('Gagal memuat misi', style: GoogleFonts.hankenGrotesk(color: Colors.red))),
        ),
      ],
    );
  }

  Widget _buildPromoBanner() {
    return NeoBrutalCard(
      padding: EdgeInsets.zero,
      clipBehavior: Clip.hardEdge,
      child: SizedBox(
        height: 160,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBnkdRF8CJpuPVZR1OGRh4k2f3LefzYqblz7egT5BpWSYRgnn3dIyEbUT79V0X6hPGr3fkQQyTziEfLDvmt9wwYOEsNdCE7kBcVsuZ9eAEuKeQ9Q7QNX_b3A25ooIPEjvxskRWi2WOxq-HkdTxTelho8VzID3gePjf87dWxhABxMjaO9IzpFnfB5kM09_fhQVIqNH2HSVmOsLNDEjf8T2Fm_gFPAqYQiIvPlh1JIZoKLEn5AkZhnkcNvpOrZOiUYmoEsy47Ub9n3VQ',
              fit: BoxFit.cover,
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [const Color(0xFF191C1D).withOpacity(0.8), Colors.transparent],
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                ),
              ),
            ),
            Positioned(
              left: 16,
              bottom: 16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFBC000A),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: const Color(0xFF191C1D), width: 1.5),
                    ),
                    child: Text(
                      'EVENT MENDATANG',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Jakarta Open 2024',
                    style: GoogleFonts.hankenGrotesk(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivityList(WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Text(
            'Aktivitas Terbaru',
            style: GoogleFonts.hankenGrotesk(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF191C1D),
            ),
          ),
        ),
        const SizedBox(height: 12),
        notificationsAsync.when(
          data: (notifications) {
            if (notifications.isEmpty) {
              return NeoBrutalCard(
                padding: const EdgeInsets.all(24),
                child: Center(
                  child: Text(
                    'Tidak ada aktivitas terbaru.',
                    style: GoogleFonts.hankenGrotesk(color: const Color(0xFF424655)),
                  ),
                ),
              );
            }

            return Column(
              children: notifications.map((notif) {
                IconData icon = Icons.notifications_active;
                Color color = const Color(0xFF191C1D);
                
                if (notif.title.toLowerCase().contains('jadwal')) {
                  icon = Icons.calendar_month;
                  color = const Color(0xFF0052DC);
                } else if (notif.title.toLowerCase().contains('event') || notif.title.toLowerCase().contains('pengumuman')) {
                  icon = Icons.campaign;
                  color = const Color(0xFFBC000A);
                }

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: NeoBrutalCard(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: color.withOpacity(0.1),
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF191C1D), width: 1.5),
                          ),
                          child: Icon(icon, color: color),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                notif.title,
                                style: GoogleFonts.hankenGrotesk(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF191C1D),
                                ),
                              ),
                              Text(
                                notif.message,
                                style: GoogleFonts.hankenGrotesk(
                                  fontSize: 14,
                                  color: const Color(0xFF424655),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF0052DC))),
          error: (e, s) => Center(child: Text('Gagal memuat aktivitas', style: GoogleFonts.hankenGrotesk(color: Colors.red))),
        ),
      ],
    );
  }

  void _handleSelfAttendance(BuildContext context, WidgetRef ref) async {
    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (c) => const Center(child: CircularProgressIndicator(color: Color(0xFF0052DC))),
      );

      final success = await AttendanceService(ref.read(dioProvider)).checkInWithLocation(user);
      
      if (context.mounted) Navigator.pop(context);

      if (success) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Absen berhasil dicatat!'),
              backgroundColor: Colors.green.shade600,
            ),
          );
        }
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Gagal mencatat absen. Pastikan lokasi Anda aktif.'),
              backgroundColor: Color(0xFFBC000A),
            ),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Terjadi kesalahan: $e'),
            backgroundColor: const Color(0xFFBC000A),
          ),
        );
      }
    }
  }

  void _showCompleteQuestSheet(BuildContext context, WidgetRef ref, Exercise exercise) {
    final notesController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
          child: NeoBrutalCard(
            backgroundColor: Colors.white,
            borderRadius: const BorderRadius.only(topLeft: Radius.circular(24), topRight: Radius.circular(24)),
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(2))),
                ),
                const SizedBox(height: 20),
                Text(
                  'Selesaikan Misi Latihan 🎯',
                  style: GoogleFonts.spaceGrotesk(fontSize: 20, fontWeight: FontWeight.bold, color: const Color(0xFF191C1D)),
                ),
                const SizedBox(height: 16),
                NeoBrutalCard(
                  backgroundColor: const Color(0xFFF3F4F5),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        exercise.name,
                        style: GoogleFonts.hankenGrotesk(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF191C1D)),
                      ),
                      Text(
                        'Target Latihan: ${exercise.sets ?? 3} set x ${exercise.reps ?? 10} reps',
                        style: GoogleFonts.hankenGrotesk(fontSize: 14, color: const Color(0xFF424655)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Catatan Latihan (Opsional)',
                  style: GoogleFonts.hankenGrotesk(fontSize: 14, fontWeight: FontWeight.bold, color: const Color(0xFF191C1D)),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: notesController,
                  decoration: InputDecoration(
                    hintText: 'Misal: "Selesai 3 set tanpa istirahat"',
                    hintStyle: GoogleFonts.hankenGrotesk(color: const Color(0xFF737687)),
                    filled: true,
                    fillColor: Colors.white,
                    enabledBorder: const OutlineInputBorder(
                      borderSide: BorderSide(color: Color(0xFF191C1D), width: 2),
                    ),
                    focusedBorder: const OutlineInputBorder(
                      borderSide: BorderSide(color: Color(0xFF0052DC), width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                NeoBrutalButton(
                  onPressed: () async {
                    final note = notesController.text.trim();
                    final success = await ref.read(exerciseLogServiceProvider).logExercise(
                          memberId: user.id,
                          exerciseId: exercise.id,
                          notes: note.isNotEmpty ? note : "Selesai dari Dashboard",
                        );
                    if (context.mounted) Navigator.pop(context);
                    if (success && context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('+50 XP Ditambahkan!', style: GoogleFonts.hankenGrotesk(fontWeight: FontWeight.bold)),
                          backgroundColor: const Color(0xFF0052DC),
                        ),
                      );
                    }
                  },
                  backgroundColor: const Color(0xFF0052DC),
                  borderWidth: 3,
                  child: SizedBox(
                    width: double.infinity,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Center(
                        child: Text(
                          'Selesaikan & Klaim XP',
                          style: GoogleFonts.hankenGrotesk(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        );
      },
    );
  }
}
