import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'core/network/firebase_messaging_service.dart';
import 'package:intl/date_symbol_data_local.dart';

void main() async {
  ErrorWidget.builder = (FlutterErrorDetails details) {
    return Directionality(
      textDirection: TextDirection.ltr,
      child: Material(
        child: Container(
          color: Colors.red.shade900,
          padding: const EdgeInsets.all(20),
          child: SingleChildScrollView(
            child: Text(
              'FATAL ERROR:\n${details.exceptionAsString()}\n\nSTACKTRACE:\n${details.stack?.toString()}',
              style: const TextStyle(color: Colors.white, fontSize: 12),
            ),
          ),
        ),
      ),
    );
  };

  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('id_ID', null);

  try {
    await Firebase.initializeApp(
      // options: DefaultFirebaseOptions.currentPlatform, // Uncomment ini setelah menjalankan `flutterfire configure`
    );
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  } catch (e) {
    debugPrint("Firebase init failed (Please run flutterfire configure): $e");
  }

  debugPrint("FLUTTER APP MAIN STARTED");
  runApp(
    const ProviderScope(
      child: TaekwondoUserApp(),
    ),
  );
}

class TaekwondoUserApp extends ConsumerWidget {
  const TaekwondoUserApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'Taekwondo Academy',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
