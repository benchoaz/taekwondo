import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../auth/data/auth_provider.dart';
import '../../auth/presentation/login_screen.dart';
import 'member_dashboard_screen.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return authState.when(
      data: (user) {
        if (user == null) {
          return Scaffold(
            backgroundColor: const Color(0xFF0F172A),
            body: Center(
              child: Text('Sesi habis, silakan login ulang.',
                  style: GoogleFonts.inter(color: Colors.white)),
            ),
          );
        }

        final role = user.role.toUpperCase();

        // Daftar layar berdasarkan bottom nav
        final List<Widget> screens = [
          // Tab Beranda — sesuai role
          if (role == 'MEMBER')
            MemberDashboardScreen(user: user)
          else if (role == 'COACH')
            _buildCoachDashboard(user)
          else
            _buildAdminDashboard(user),

          // Tab Riwayat (placeholder)
          Scaffold(
            backgroundColor: const Color(0xFF0F172A),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.history, color: Colors.white.withValues(alpha: 0.3), size: 64),
                  const SizedBox(height: 16),
                  Text('Riwayat Aktivitas',
                      style: GoogleFonts.inter(color: Colors.white54, fontSize: 16)),
                  Text('Segera hadir',
                      style: GoogleFonts.inter(color: Colors.white30, fontSize: 12)),
                ],
              ),
            ),
          ),

          // Tab Profil + Logout
          Scaffold(
            backgroundColor: const Color(0xFF0F172A),
            body: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),
                    // Avatar
                    Center(
                      child: Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(
                            colors: [Color(0xFFE50914), Color(0xFF99050C)],
                          ),
                        ),
                        child: Center(
                          child: Text(
                            (user.name ?? user.email).substring(0, 2).toUpperCase(),
                            style: GoogleFonts.inter(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Center(
                      child: Text(
                        user.name ?? 'Pengguna',
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Center(
                      child: Text(
                        user.email,
                        style: GoogleFonts.inter(color: Colors.white54, fontSize: 13),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE50914).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          role,
                          style: GoogleFonts.inter(
                            color: const Color(0xFFE50914),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),
                    // Info
                    if (user.memberNumber != null) ...[
                      _buildProfileRow(Icons.badge_outlined, 'Nomor Member', user.memberNumber!),
                      const SizedBox(height: 12),
                    ],
                    if (user.currentBelt != null) ...[
                      _buildProfileRow(Icons.shield_outlined, 'Sabuk', user.currentBelt!),
                      const SizedBox(height: 12),
                    ],
                    const Spacer(),
                    // Logout Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () async {
                          await ref.read(authProvider.notifier).logout();
                          if (context.mounted) {
                            Navigator.of(context).pushReplacement(
                              MaterialPageRoute(builder: (_) => const LoginScreen()),
                            );
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red.shade800,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        icon: const Icon(Icons.logout, color: Colors.white),
                        label: Text(
                          'Keluar (Logout)',
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),
        ];

        return Scaffold(
          body: screens[_currentIndex],
          bottomNavigationBar: Theme(
            data: ThemeData(
              splashColor: Colors.transparent,
              highlightColor: Colors.transparent,
            ),
            child: BottomNavigationBar(
              backgroundColor: const Color(0xFF1E293B),
              selectedItemColor: const Color(0xFFE50914),
              unselectedItemColor: Colors.grey,
              currentIndex: _currentIndex,
              type: BottomNavigationBarType.fixed,
              elevation: 20,
              onTap: (index) => setState(() => _currentIndex = index),
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.home_filled),
                  label: 'Beranda',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.history),
                  label: 'Riwayat',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.person),
                  label: 'Profil',
                ),
              ],
            ),
          ),
        );
      },
      loading: () => const Scaffold(
        backgroundColor: Color(0xFF0F172A),
        body: Center(child: CircularProgressIndicator(color: Color(0xFFE50914))),
      ),
      error: (err, stack) => Scaffold(
        backgroundColor: const Color(0xFF0F172A),
        body: Center(child: Text('Error: $err', style: const TextStyle(color: Colors.white))),
      ),
    );
  }

  Widget _buildProfileRow(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFFE50914), size: 20),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: GoogleFonts.inter(color: Colors.white54, fontSize: 11)),
              Text(value,
                  style: GoogleFonts.inter(
                      color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  // Dashboard Pelatih (Coach)
  Widget _buildCoachDashboard(user) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              Text('Selamat Datang,',
                  style: GoogleFonts.inter(color: Colors.white70, fontSize: 14)),
              Text(user.name ?? 'Pelatih',
                  style: GoogleFonts.inter(
                      color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.blue.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('PELATIH',
                    style: GoogleFonts.inter(
                        color: Colors.blue, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 32),
              // Info Cards
              Row(
                children: [
                  _buildInfoCard(Icons.people, 'Member Aktif', '-', Colors.green),
                  const SizedBox(width: 12),
                  _buildInfoCard(Icons.calendar_today, 'Jadwal Hari Ini', '-', Colors.blue),
                ],
              ),
              const SizedBox(height: 24),
              Text('Fitur Pelatih',
                  style: GoogleFonts.inter(
                      color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              _buildFeatureTile(Icons.assignment_turned_in, 'Absensi Latihan', 'Catat kehadiran member'),
              const SizedBox(height: 8),
              _buildFeatureTile(Icons.emoji_events, 'Penilaian UKT', 'Input nilai ujian kenaikan tingkat'),
              const SizedBox(height: 8),
              _buildFeatureTile(Icons.schedule, 'Jadwal Latihan', 'Lihat jadwal kelas yang diampu'),
            ],
          ),
        ),
      ),
    );
  }

  // Dashboard Admin (Web-only, tampilan info)
  Widget _buildAdminDashboard(user) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.admin_panel_settings, size: 80, color: Color(0xFFE50914)),
              const SizedBox(height: 24),
              Text('Panel Admin',
                  style: GoogleFonts.inter(
                      color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Text(
                'Untuk fitur administrasi lengkap,\ngunakan Web Admin di browser.',
                style: GoogleFonts.inter(color: Colors.white54, fontSize: 13),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'https://whitetigertkd.my.id',
                style: GoogleFonts.inter(
                    color: const Color(0xFFE50914), fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard(IconData icon, String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(label, style: GoogleFonts.inter(color: Colors.white54, fontSize: 11)),
            Text(value,
                style: GoogleFonts.inter(
                    color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureTile(IconData icon, String title, String subtitle) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFFE50914).withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: const Color(0xFFE50914), size: 20),
        ),
        title: Text(title,
            style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle, style: GoogleFonts.inter(color: Colors.white54, fontSize: 12)),
        trailing: const Icon(Icons.chevron_right, color: Colors.white30),
      ),
    );
  }
}
