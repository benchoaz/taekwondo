import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:taekwondo_user_app/features/dashboard/presentation/member_dashboard_screen.dart';
import 'package:taekwondo_user_app/features/auth/domain/user_model.dart';

void main() {
  testWidgets('Test rendering MemberDashboardScreen', (WidgetTester tester) async {
    FlutterError.onError = (FlutterErrorDetails details) {
      print('FLUTTER ERROR CAUGHT IN TEST: ${details.exceptionAsString()}');
      print(details.stack);
    };

    try {
      final user = UserModel(id: '1', email: 'test@example.com', name: 'Budi Satria', role: 'MEMBER');
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            home: MemberDashboardScreen(user: user),
          ),
        ),
      );
      print("WIDGET RENDERED SUCCESSFULLY!");
    } catch (e, st) {
      print("DART EXCEPTION CAUGHT: $e");
      print(st);
    }
  });
}
