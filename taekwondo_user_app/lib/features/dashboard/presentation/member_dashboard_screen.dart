import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../auth/domain/user_model.dart';
import '../../spp/presentation/spp_screen.dart';
import '../../../core/network/dio_client.dart';
import '../data/member_attendance_service.dart';
import '../../curriculum/presentation/curriculum_screen.dart';
import '../data/quest_service.dart';
import '../domain/quest_model.dart';
import '../../schedule/presentation/schedule_screen.dart';
import '../data/notification_service.dart';
import '../../../core/widgets/sporty_icons.dart';

// M3 Palette Extracted from HTML
const Color m3Background = Color(0xFFF8F9FA);
const Color m3Surface = Color(0xFFF8F9FA);
const Color m3OnSurface = Color(0xFF191C1D);
const Color m3OnSurfaceVariant = Color(0xFF424655);
const Color m3Primary = Color(0xFF0052DC);
const Color m3PrimaryContainer = Color(0xFF2B6BFF);
const Color m3Secondary = Color(0xFFBC000A);
const Color m3TertiaryContainer = Color(0xFFD0A600);
const Color m3OutlineVariant = Color(0xFFC3C6D8);

class MemberDashboardScreen extends ConsumerStatefulWidget {
  final UserModel user;
  const MemberDashboardScreen({super.key, required this.user});

  @override
  ConsumerState<MemberDashboardScreen> createState() => _MemberDashboardScreenState();
}

class _MemberDashboardScreenState extends ConsumerState<MemberDashboardScreen> {
  bool _isAbsenLoading = false;
  bool _isAbsenSuccess = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: m3Background,
      body: Stack(
        children: [
          // Main Scrollable Content
          SingleChildScrollView(
            padding: const EdgeInsets.only(left: 20, right: 20, top: 112, bottom: 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeroAttendance(),
                const SizedBox(height: 16),
                _buildBentoGrid(),
                const SizedBox(height: 24),
                _buildEventsSection(),
                const SizedBox(height: 24),
                _buildQuickActions(),
                const SizedBox(height: 24),
                _buildDailyQuests(),
              ],
            ),
          ),
          
          // Fixed Top App Bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: _buildTopAppBar(),
          ),

          // Bottom Nav Bar
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

  Widget _buildTopAppBar() {
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12.0, sigmaY: 12.0),
        child: Container(
          color: m3Surface.withOpacity(0.8),
          padding: const EdgeInsets.only(left: 20, right: 20, top: 56, bottom: 16),
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: Color(0x4DC3C6D8))),
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
                      border: Border.all(color: m3Primary, width: 2),
                    ),
                    padding: const EdgeInsets.all(2),
                    child: Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        image: DecorationImage(
                          fit: BoxFit.cover,
                          image: NetworkImage(
                            widget.user.photoUrl ?? 'https://ui-avatars.com/api/?name=${widget.user.name}&background=0052dc&color=fff',
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        (widget.user.currentBelt ?? 'Sabuk Merah').toUpperCase(),
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                          color: m3Secondary,
                        ),
                      ),
                      Text(
                        widget.user.name ?? 'Budi Satria',
                        style: GoogleFonts.hankenGrotesk(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: m3OnSurface,
                          height: 1.1,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFFE7E8E9),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: m3OutlineVariant.withOpacity(0.3)),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    const Icon(Icons.notifications_outlined, color: m3OnSurfaceVariant),
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: m3Secondary,
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFFE7E8E9), width: 2),
                        ),
                      ),
                    )
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeroAttendance() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: m3PrimaryContainer,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: m3PrimaryContainer.withOpacity(0.3),
            blurRadius: 40,
            offset: const Offset(0, 20),
            spreadRadius: -15,
          )
        ],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Blurred background glow circles
          Positioned(
            right: -60,
            top: -60,
            child: Container(
              width: 150,
              height: 150,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
                child: Container(color: Colors.transparent),
              ),
            ),
          ),
          
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ABSENSI HARI INI',
                        style: GoogleFonts.hankenGrotesk(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          fontStyle: FontStyle.italic,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.location_on, color: Colors.white, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            'Dojo Pusat',
                            style: GoogleFonts.hankenGrotesk(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      )
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withOpacity(0.2)),
                    ),
                    child: Text(
                      'READY TO SCAN',
                      style: GoogleFonts.hankenGrotesk(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                      ),
                    ),
                  )
                ],
              ),
              const SizedBox(height: 24),
              GestureDetector(
                onTap: () => _handleSelfAttendance(),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  height: 64,
                  decoration: BoxDecoration(
                    color: _isAbsenSuccess ? Colors.green.shade500 : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 25,
                        offset: const Offset(0, 10),
                      )
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (_isAbsenLoading)
                        const SizedBox(
                          width: 24, height: 24,
                          child: CircularProgressIndicator(color: m3Primary, strokeWidth: 3),
                        )
                      else if (_isAbsenSuccess)
                        const Icon(Icons.check_circle, color: Colors.white, size: 28)
                      else
                        const Icon(Icons.qr_code_scanner, color: m3Primary, size: 28),
                      
                      const SizedBox(width: 12),
                      Text(
                        _isAbsenLoading ? 'MEMPROSES...' : (_isAbsenSuccess ? 'BERHASIL!' : 'ABSEN SEKARANG'),
                        style: GoogleFonts.hankenGrotesk(
                          color: _isAbsenSuccess ? Colors.white : m3Primary,
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.0,
                        ),
                      )
                    ],
                  ),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildBentoGrid() {
    return Row(
      children: [
        // SPP Card
        Expanded(
          flex: 1,
          child: GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (c) => SppScreen(user: widget.user))),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                child: Container(
                  height: 200,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withOpacity(0.5)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.03),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      )
                    ]
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: Colors.red.shade50,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(Icons.payments, color: m3Secondary),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: m3Secondary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  'PENDING',
                                  style: GoogleFonts.hankenGrotesk(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: m3Secondary,
                                    letterSpacing: 1.0,
                                  ),
                                ),
                              )
                            ],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Iuran SPP',
                            style: GoogleFonts.hankenGrotesk(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: m3OnSurface,
                              height: 1.1,
                            ),
                          ),
                          Text(
                            'Bulan ini',
                            style: GoogleFonts.hankenGrotesk(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: m3OnSurfaceVariant.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Rp 250.000',
                            style: GoogleFonts.hankenGrotesk(
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              color: m3Secondary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: m3OnSurface,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'Bayar',
                              style: GoogleFonts.hankenGrotesk(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          )
                        ],
                      )
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        // Column right (Rank & Progress)
        Expanded(
          flex: 1,
          child: SizedBox(
            height: 200,
            child: Column(
              children: [
                // Rank Card
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: m3Secondary,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: m3Secondary.withOpacity(0.3),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        )
                      ]
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white.withOpacity(0.3)),
                              ),
                              child: const Icon(Icons.military_tech, color: Colors.white, size: 16),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'LEVEL 8',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.white.withOpacity(0.9),
                                letterSpacing: 1.5,
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'SABUK MERAH',
                          style: GoogleFonts.hankenGrotesk(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            fontStyle: FontStyle.italic,
                            color: Colors.white,
                            height: 1.0,
                          ),
                        )
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                // Progress Card
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: m3TertiaryContainer,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        )
                      ]
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'PROGRES UKT',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: const Color(0xFF4F3D00).withOpacity(0.8),
                              ),
                            ),
                            Text(
                              '75%',
                              style: GoogleFonts.hankenGrotesk(
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                                color: const Color(0xFF4F3D00),
                              ),
                            )
                          ],
                        ),
                        const SizedBox(height: 12),
                        Container(
                          height: 10,
                          decoration: BoxDecoration(
                            color: const Color(0xFF4F3D00).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          alignment: Alignment.centerLeft,
                          child: FractionallySizedBox(
                            widthFactor: 0.75,
                            child: Container(
                              decoration: BoxDecoration(
                                color: const Color(0xFF4F3D00),
                                borderRadius: BorderRadius.circular(10),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF4F3D00).withOpacity(0.3),
                                    blurRadius: 8,
                                  )
                                ]
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Hampir Siap Ujian!',
                          style: GoogleFonts.hankenGrotesk(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF4F3D00),
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        )
      ],
    );
  }

  Widget _buildEventsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Event & Berita',
              style: GoogleFonts.hankenGrotesk(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: m3OnSurface,
              ),
            ),
            Row(
              children: [
                Text(
                  'Lihat Semua',
                  style: GoogleFonts.hankenGrotesk(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: m3Primary,
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(Icons.arrow_forward, size: 16, color: m3Primary),
              ],
            )
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 220,
          child: ListView(
            scrollDirection: Axis.horizontal,
            clipBehavior: Clip.none,
            physics: const BouncingScrollPhysics(),
            children: [
              _buildEventCard(
                'Jakarta Open 2024',
                'Pendaftaran dibuka hingga 15 Desember. Persiapkan diri Anda!',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBnkdRF8CJpuPVZR1OGRh4k2f3LefzYqblz7egT5BpWSYRgnn3dIyEbUT79V0X6hPGr3fkQQyTziEfLDvmt9wwYOEsNdCE7kBcVsuZ9eAEuKeQ9Q7QNX_b3A25ooIPEjvxskRWi2WOxq-HkdTxTelho8VzID3gePjf87dWxhABxMjaO9IzpFnfB5kM09_fhQVIqNH2HSVmOsLNDEjf8T2Fm_gFPAqYQiIvPlh1JIZoKLEn5AkZhnkcNvpOrZOiUYmoEsy47Ub9n3VQ',
                'Turnamen',
                m3Secondary,
              ),
              const SizedBox(width: 16),
              _buildEventCard(
                'Master Class Poomsae',
                'Pelajari teknik dasar hingga lanjutan bersama Grand Master.',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuAsYpE2T1vuptj44J-upgFHwEwJROitEIymTVGVNac7ojeyt2_cTKaL7lTR6Frm54vCKL5MD1SDRw4wee-xZtGI8UgY8-95sSZvmsgw0sH6rXduXBTdrm8Om3rFKYfXzCxK1e6d0zGdatXdFLb3bEzu4qZbZO4JDUKt7mFqyyhRn7b7rCmehnjNSTF7T0_YBOu61B8vuCMpGHbgsh2bwb7D-uTZz4HV5yJXtwIGvBT3oP4l3o2ugPdxrZT0P1mBem2M52ntr-JI-GI',
                'Seminar',
                m3Primary,
              ),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildEventCard(String title, String desc, String img, String tag, Color tagColor) {
    return Container(
      width: 280,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.7),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withOpacity(0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          )
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 120,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(img, fit: BoxFit.cover),
                    Positioned(
                      top: 16,
                      left: 16,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: tagColor.withOpacity(0.9),
                              border: Border.all(color: Colors.white.withOpacity(0.2)),
                            ),
                            child: Text(
                              tag.toUpperCase(),
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                letterSpacing: 1.5,
                              ),
                            ),
                          ),
                        ),
                      ),
                    )
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.hankenGrotesk(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: m3OnSurface,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      desc,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.hankenGrotesk(
                        fontSize: 12,
                        color: m3OnSurfaceVariant.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (c) => const ScheduleScreen())),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFEDEEEF),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: m3OutlineVariant.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: m3Primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.calendar_month, color: m3Primary),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Jadwal',
                    style: GoogleFonts.hankenGrotesk(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: m3OnSurface,
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: GestureDetector(
            onTap: () {}, // Certificate Screen
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFEDEEEF),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: m3OutlineVariant.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: m3Secondary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.card_membership, color: m3Secondary),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Sertifikat',
                    style: GoogleFonts.hankenGrotesk(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: m3OnSurface,
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDailyQuests() {
    return Consumer(
      builder: (context, ref, child) {
        final questsAsync = ref.watch(dailyQuestsProvider(widget.user.id));
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Misi Harian',
                  style: GoogleFonts.hankenGrotesk(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: m3OnSurface,
                  ),
                ),
                questsAsync.maybeWhen(
                  data: (logs) {
                    final doneCount = logs.where((l) => l.completed).length;
                    return Text(
                      '$doneCount/${logs.length} Selesai',
                      style: GoogleFonts.hankenGrotesk(
                        color: m3Primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    );
                  },
                  orElse: () => const SizedBox(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            questsAsync.when(
              data: (logs) {
                if (logs.isEmpty) {
                  return const Text('Tidak ada misi.');
                }
                return Column(
                  children: logs.map((log) {
                    final isDone = log.completed;
                    final quest = log.quest!;
                    final iconData = quest.category == 'FITNESS' 
                        ? Icons.fitness_center 
                        : quest.category == 'TECHNICAL' 
                            ? Icons.sports_martial_arts 
                            : Icons.self_improvement;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isDone ? const Color(0xFFEDEEEF) : Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: m3OutlineVariant.withOpacity(isDone ? 0.2 : 0.4)),
                        boxShadow: isDone ? [] : [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.02),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          )
                        ]
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: isDone ? Colors.green.shade100 : m3TertiaryContainer.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Icon(
                              isDone ? Icons.check_circle : iconData,
                              color: isDone ? Colors.green.shade700 : const Color(0xFF4F3D00),
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
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: m3OnSurface,
                                    decoration: isDone ? TextDecoration.lineThrough : null,
                                  ),
                                ),
                                Text(
                                  '+${quest.baseXp} XP',
                                  style: GoogleFonts.hankenGrotesk(
                                    fontSize: 12,
                                    color: m3OnSurfaceVariant,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (!isDone)
                            GestureDetector(
                              onTap: () => _showCompleteQuestSheet(context, ref, log),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: m3OnSurface,
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
                  }).toList(),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator(color: m3Primary)),
              error: (e, s) => const Text('Error load quests'),
            )
          ],
        );
      },
    );
  }

  Widget _buildBottomNavBar() {
    return ClipRRect(
      borderRadius: const BorderRadius.only(topLeft: Radius.circular(40), topRight: Radius.circular(40)),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          color: Colors.white.withOpacity(0.8),
          padding: const EdgeInsets.only(left: 20, right: 20, top: 16, bottom: 32),
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: Color(0x4DC3C6D8))),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(Icons.home, 'Beranda', true),
              _buildNavItem(Icons.history, 'Riwayat', false),
              _buildNavItem(Icons.person, 'Profil', false),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, bool isActive) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            color: isActive ? m3Secondary.withOpacity(0.1) : Colors.transparent,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(
            icon,
            color: isActive ? m3Secondary : m3OnSurfaceVariant.withOpacity(0.6),
            size: 26,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label.toUpperCase(),
          style: GoogleFonts.spaceGrotesk(
            fontSize: 10,
            fontWeight: isActive ? FontWeight.w900 : FontWeight.bold,
            letterSpacing: 1.5,
            color: isActive ? m3Secondary : m3OnSurfaceVariant.withOpacity(0.6),
          ),
        )
      ],
    );
  }

  // --- LOGIC AREA ---

  void _handleSelfAttendance() async {
    if (_isAbsenLoading || _isAbsenSuccess) return;

    setState(() { _isAbsenLoading = true; });

    try {
      final success = await AttendanceService(ProviderContainer().read(dioProvider)).checkInWithLocation(widget.user);
      
      if (success) {
        setState(() {
          _isAbsenLoading = false;
          _isAbsenSuccess = true;
        });
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

  void _showCompleteQuestSheet(BuildContext context, WidgetRef ref, DailyQuestLog log) {
    // Basic sheet for claiming quests (similar to original but stylized M3)
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (c) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(topLeft: Radius.circular(32), topRight: Radius.circular(32)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 24),
              Text('Klaim Misi Harian', style: GoogleFonts.hankenGrotesk(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: () async {
                  await ref.read(questLogServiceProvider).logQuest(memberId: widget.user.id, logId: log.id, notes: 'Selesai');
                  if (c.mounted) Navigator.pop(c);
                },
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: m3Primary, borderRadius: BorderRadius.circular(16)),
                  alignment: Alignment.center,
                  child: Text('Selesaikan & Klaim XP', style: GoogleFonts.hankenGrotesk(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
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
