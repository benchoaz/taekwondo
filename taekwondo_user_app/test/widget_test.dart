// Widget test untuk TaekwondoUserApp
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:taekwondo_user_app/main.dart';

void main() {
  testWidgets('App launches smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      const ProviderScope(
        child: TaekwondoUserApp(),
      ),
    );

    // Verify the app starts without crashing
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
