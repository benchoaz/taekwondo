import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
          return const Scaffold(body: Center(child: Text('Tidak ada pengguna masuk')));
        }

        // List of screens based on bottom nav index
        final List<Widget> screens = [
          // Home Tab
          if (user.role.toUpperCase() == 'MEMBER')
            MemberDashboardScreen(user: user)
          else
            _buildGenericDashboard(user),
          // History/Activity Tab (Placeholder)
          const Scaffold(backgroundColor: Color(0xFF0F172A), body: Center(child: Text('Riwayat Aktivitas', style: TextStyle(color: Colors.white)))),
          // Profile Tab (Placeholder)
          Scaffold(
            backgroundColor: const Color(0xFF0F172A),
            body: Center(
              child: ElevatedButton(
                onPressed: () async {
                  await ref.read(authProvider.notifier).logout();
                  if (context.mounted) {
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                child: const Text('Keluar (Logout)', style: TextStyle(color: Colors.white)),
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
              selectedItemColor: const Color(0xFFE50914), // Premium Red
              unselectedItemColor: Colors.grey,
              currentIndex: _currentIndex,
              type: BottomNavigationBarType.fixed,
              elevation: 20,
              onTap: (index) {
                setState(() {
                  _currentIndex = index;
                });
              },
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
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (err, stack) => Scaffold(body: Center(child: Text('Error: $err'))),
    );
  }

  Widget _buildGenericDashboard(user) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF0A2240),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.verified_user, size: 80, color: Colors.green),
            const SizedBox(height: 20),
            const Text(
              'Berhasil Masuk!',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Text('Email: ${user.email}'),
            Text('Role: ${user.role}'),
          ],
        ),
      ),
    );
  }
}
