import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import '../../auth/data/auth_provider.dart';
import '../data/profile_service.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(profileProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0F1115), // Deep dark premium background
      body: Stack(
        children: [
          // Background Glowing Orbs
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFFE2241F),
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

          // Main Content
          SafeArea(
            child: profileAsync.when(
              loading: () => const Center(
                  child: CircularProgressIndicator(color: Color(0xFFE2241F))),
              error: (err, stack) => Center(
                child: Text('Gagal memuat profil: $err',
                    style: const TextStyle(color: Colors.white)),
              ),
              data: (profile) => RefreshIndicator(
                color: const Color(0xFFE2241F),
                onRefresh: () async => ref.refresh(profileProvider.future),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(
                      parent: BouncingScrollPhysics()),
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header: VIP ID CARD
                      _buildVIPCard(profile!),
                      const SizedBox(height: 32),

                      // Section: Level & XP Glow Bar
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
                      _buildLevelBar(profile!),
                      const SizedBox(height: 32),

                      // Section: Biometrics
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
                            onTap: () => _showEditBiometricsModal(context, ref, profile!),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE10600).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFFE10600).withOpacity(0.3)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.edit, color: Color(0xFFE10600), size: 12),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Perbarui',
                                    style: GoogleFonts.hankenGrotesk(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFFE10600),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      _buildBiometricsPanel(profile!),
                      const SizedBox(height: 32),

                      // Section: Hall of Fame (Medals)
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
                      ...profile!.achievements.map((ach) => _buildAchievementCard(ach)).toList(),
                      if (profile!.achievements.isEmpty)
                        Center(
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Text(
                              "Belum ada medali.\\nBerlatihlah lebih keras!",
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.white.withOpacity(0.5)),
                            ),
                          ),
                        ),

                      const SizedBox(height: 40),
                      // Logout Button
                      _buildLogoutButton(context, ref),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(context),
    );
  }

  Widget _buildVIPCard(ProfileData profile) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 30,
            offset: const Offset(0, 15),
          )
        ],
      ),
      child: Column(
        children: [
          // Avatar with glowing border
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(
                colors: [Color(0xFFE2241F), Color(0xFFFF4B4B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFE2241F).withOpacity(0.5),
                  blurRadius: 20,
                  spreadRadius: 2,
                )
              ],
            ),
            child: const CircleAvatar(
              radius: 45,
              backgroundColor: Color(0xFF1E222D),
              backgroundImage: NetworkImage(
                  'https://api.dicebear.com/7.x/avataaars/png?seed=Taekwondo'),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            profile.name.toUpperCase(),
            style: GoogleFonts.spaceGrotesk(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFE2241F).withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2241F).withOpacity(0.5)),
            ),
            child: Text(
              profile.memberNumber,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: const Color(0xFFFFB4B2),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildStatColumn('UMUR', '${profile.age} THN'),
              Container(width: 1, height: 40, color: Colors.white.withOpacity(0.1)),
              _buildStatColumn('SABUK', profile.currentBelt.split(' ').first),
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

  Widget _buildLevelBar(ProfileData profile) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E222D),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                profile.currentBelt.toUpperCase(),
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              Text(
                '${profile.progress}%',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFFE2241F),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Glow Progress Bar
          Stack(
            children: [
              Container(
                height: 12,
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              Container(
                height: 12,
                width: profile.progress.toDouble() * 3, // Simplistic percentage width
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFE2241F), Color(0xFFFF6B6B)],
                  ),
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFE2241F).withOpacity(0.6),
                      blurRadius: 10,
                      spreadRadius: 1,
                    )
                  ],
                ),
              ),
            ],
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
    // Kalkulasi BMI
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
        border: Border.all(color: Colors.white.withOpacity(0.05)),
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
              color: bmiColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: bmiColor.withOpacity(0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Indeks Massa Tubuh (BMI)',
                  style: GoogleFonts.hankenGrotesk(
                    fontSize: 14,
                    color: Colors.white,
                  ),
                ),
                Text(
                  bmi != null ? "${bmi.toStringAsFixed(1)} ($bmiCategory)" : "Belum ada data",
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 14,
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
            : const Color(0xFFCD7F32); // Bronze
    
    // Massive XP logic
    final xpBonus = isGold ? "+1000 XP" : isSilver ? "+750 XP" : "+500 XP";

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          // Medal Icon with Glow
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: medalColor.withOpacity(0.1),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: medalColor.withOpacity(0.2),
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
                  color: medalColor.withOpacity(0.15),
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
                    Shadow(color: medalColor.withOpacity(0.5), blurRadius: 10),
                  ]
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLogoutButton(BuildContext context, WidgetRef ref) {
    return SizedBox(
      width: double.infinity,
      child: TextButton.icon(
        onPressed: () {
          ref.read(authProvider.notifier).logout();
          context.go('/login');
        },
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          backgroundColor: Colors.white.withOpacity(0.05),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        icon: const Icon(Icons.logout, color: Color(0xFFE2241F)),
        label: Text(
          'KELUAR DARI AKUN',
          style: GoogleFonts.spaceGrotesk(
            fontWeight: FontWeight.bold,
            color: const Color(0xFFE2241F),
            letterSpacing: 1,
          ),
        ),
      ),
    );
  }

  void _showEditBiometricsModal(BuildContext context, WidgetRef ref, ProfileData profile) {
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
                    backgroundColor: const Color(0xFFE10600),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () async {
                    final success = await ProfileService().updateBiometrics(weight, height, waist);
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

  Widget _buildBottomNav(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E222D),
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.05))),
      ),
      child: BottomNavigationBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        selectedItemColor: const Color(0xFFE2241F),
        unselectedItemColor: const Color(0xFF8A93A6),
        type: BottomNavigationBarType.fixed,
        currentIndex: 3, // PROFIL is at index 3
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
