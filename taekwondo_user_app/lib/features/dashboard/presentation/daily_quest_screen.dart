import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:go_router/go_router.dart';

import '../../auth/domain/user_model.dart';
import '../data/quest_service.dart';

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
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12).copyWith(top: 56),
      decoration: const BoxDecoration(
        color: nbSurface,
        border: Border(bottom: BorderSide(color: nbBlack, width: 4)),
        boxShadow: [BoxShadow(color: nbPrimary, offset: Offset(4, 4))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: () => context.pop(),
                child: const Icon(Icons.arrow_back, color: nbPrimary),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.menu, color: nbPrimary),
              const SizedBox(width: 12),
              Text(
                'DAILY QUESTS',
                style: GoogleFonts.hankenGrotesk(fontSize: 20, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic, color: nbPrimary),
              ),
            ],
          ),
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: nbSurfaceContainerHighest,
              shape: BoxShape.circle,
              border: Border.all(color: nbPrimary, width: 2),
              boxShadow: const [BoxShadow(color: nbBlack, offset: Offset(4, 4))],
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
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: nbBlack, width: 4),
        boxShadow: const [BoxShadow(color: nbBlack, offset: Offset(4, 4))],
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
                  Text('Level Up!', style: GoogleFonts.hankenGrotesk(fontSize: 24, fontWeight: FontWeight.w900, color: nbBlack)),
                ],
              ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text('250', style: GoogleFonts.hankenGrotesk(fontSize: 24, fontWeight: FontWeight.w900, color: nbPrimary)),
                  Text('/500 XP', style: GoogleFonts.hankenGrotesk(fontSize: 20, fontWeight: FontWeight.bold, color: nbOutline)),
                ],
              )
            ],
          ),
          const SizedBox(height: 12),
          Container(
            height: 32,
            width: double.infinity,
            decoration: BoxDecoration(
              color: nbSurfaceContainerHighest,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: nbBlack, width: 2),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: 0.5,
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(colors: [nbPrimary, nbPrimaryContainer]),
                  border: Border(right: BorderSide(color: nbBlack, width: 2)),
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text('Lakukan 3 misi lagi untuk bonus harian!', style: GoogleFonts.hankenGrotesk(fontSize: 14, color: nbOutline)),
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
                    title: q.quest.title,
                    desc: q.quest.description,
                    xp: '+${q.quest.baseXp} XP',
                    isCompleted: q.completed,
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
    required String title,
    required String desc,
    required String xp,
    required bool isCompleted,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isCompleted ? nbSurfaceContainer : nbSurfaceContainerLowest,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isCompleted ? nbOutlineVariant : nbBlack, width: 4),
        boxShadow: isCompleted ? null : const [BoxShadow(color: nbBlack, offset: Offset(4, 4))],
      ),
      child: Row(
        children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(
              color: iconBgColor,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: isCompleted ? nbOutlineVariant : nbBlack, width: 2),
            ),
            child: Icon(icon, color: iconColor, size: 28),
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
                GestureDetector(
                  onTap: () {},
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: nbPrimary,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: nbBlack, width: 2),
                      boxShadow: const [BoxShadow(color: nbBlack, offset: Offset(2, 2))],
                    ),
                    child: Text('MULAI', style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.0)),
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
