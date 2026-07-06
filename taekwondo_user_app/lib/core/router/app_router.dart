import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/data/auth_provider.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/coach/presentation/coach_attendance_screen.dart';
import '../../features/coach/presentation/coach_schedule_screen.dart';
import '../../features/curriculum/presentation/curriculum_screen.dart';
import '../../features/dashboard/presentation/daily_quest_screen.dart';
import '../../features/dashboard/presentation/member_dashboard_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/schedule/presentation/schedule_screen.dart';
import '../../features/spp/presentation/spp_screen.dart';
import '../../features/ukt/presentation/ukt_screen.dart';

// ─── Halaman placeholder untuk fitur yang belum punya screen ──────────────────
class _ComingSoonScreen extends StatelessWidget {
  final String title;
  const _ComingSoonScreen({required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        title: Text(title),
        elevation: 0,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.construction_rounded, size: 64, color: Color(0xFFFFD700)),
            const SizedBox(height: 16),
            Text(
              'Segera Hadir',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '$title sedang dalam pengembangan.',
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
// ─────────────────────────────────────────────────────────────────────────────

final appRouterProvider = Provider<GoRouter>((ref) {
  // Observasi authProvider agar router rebuild saat status login berubah
  ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    // Redirect guard: arahkan ke /login jika belum terautentikasi
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final isLoggedIn = authState.value != null;
      final isGoingToLogin = state.matchedLocation == '/login';

      if (!isLoggedIn && !isGoingToLogin) return '/login';
      if (isLoggedIn && isGoingToLogin) return '/';
      return null;
    },
    routes: [
      // ── Autentikasi ────────────────────────────────────────────────────────
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),

      // ── Member Routes ──────────────────────────────────────────────────────
      GoRoute(
        path: '/',
        builder: (context, state) {
          final user = ref.read(authProvider).value!;
          return MemberDashboardScreen(user: user);
        },
      ),
      GoRoute(
        path: '/spp',
        builder: (context, state) {
          final user = ref.read(authProvider).value!;
          return SppScreen(user: user);
        },
      ),
      GoRoute(
        path: '/quest',
        builder: (context, state) {
          final user = ref.read(authProvider).value!;
          return DailyQuestScreen(user: user);
        },
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/schedule',
        builder: (context, state) => const ScheduleScreen(),
      ),
      GoRoute(
        path: '/ukt',
        builder: (context, state) {
          final user = ref.read(authProvider).value!;
          return UktScreen(user: user);
        },
      ),
      GoRoute(
        path: '/curriculum',
        builder: (context, state) {
          final user = ref.read(authProvider).value!;
          return CurriculumScreen(user: user);
        },
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) =>
            const _ComingSoonScreen(title: 'Notifikasi'),
      ),

      // ── Coach Routes ───────────────────────────────────────────────────────
      GoRoute(
        path: '/coach/schedule',
        builder: (context, state) {
          final user = ref.read(authProvider).value!;
          return CoachScheduleScreen(user: user);
        },
      ),
      GoRoute(
        path: '/coach/attendance',
        builder: (context, state) => const CoachAttendanceScreen(),
      ),
    ],
  );
});
