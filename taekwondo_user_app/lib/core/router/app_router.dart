import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/dashboard/presentation/member_dashboard_screen.dart';
import '../../features/spp/presentation/spp_screen.dart';
import '../../features/dashboard/presentation/daily_quest_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/auth/domain/user_model.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => MemberDashboardScreen(user: UserModel(id: '1', email: 'test@example.com', name: 'Budi Satria', role: 'MEMBER')),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/spp',
        builder: (context, state) => SppScreen(user: UserModel(id: '1', email: 'test@example.com', name: 'Budi Satria', role: 'MEMBER')),
      ),
      GoRoute(
        path: '/quest',
        builder: (context, state) => DailyQuestScreen(user: UserModel(id: '1', email: 'test@example.com', name: 'Budi Satria', role: 'MEMBER')),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
    ],
  );
});
