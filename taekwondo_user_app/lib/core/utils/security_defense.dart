import 'dart:io';
import 'package:flutter/services.dart';
import 'package:flutter_jailbreak_detection_plus/flutter_jailbreak_detection_plus.dart';

class SecureInt {
  late int _xorKey;
  late int _maskedValue;

  SecureInt(int realValue) {
    _xorKey = _generateRandomKey();
    _maskedValue = realValue ^ _xorKey;
  }

  int get value => _maskedValue ^ _xorKey;

  set value(int newValue) {
    _xorKey = _generateRandomKey();
    _maskedValue = newValue ^ _xorKey;
  }

  int _generateRandomKey() {
    return DateTime.now().microsecondsSinceEpoch & 0x7FFFFFFF;
  }
}

class SecuritySelfDefense {
  static const MethodChannel _platform = MethodChannel('com.example.taekwondo_user_app/security');

  /// Runs MASVS checks (Jailbreak/Root, Emulator, DevMode, Signature) and quits on failure.
  static Future<void> performRuntimeVerification() async {
    // 1. Skip on Web/Simulator tests if needed, but enforce on Mobile devices
    if (kIsWeb) return;

    bool isTampered = false;

    try {
      // 2. Root / Jailbreak check
      final bool isJailbroken = await FlutterJailbreakDetectionPlus.jailbroken;
      final bool isDeveloperMode = await FlutterJailbreakDetectionPlus.developerMode;

      if (isJailbroken || isDeveloperMode) {
        isTampered = true;
      }
    } catch (_) {
      // Fail-secure: default to true on errors checking jailbreak
      isTampered = true;
    }

    try {
      // 3. Emulator detection from native code
      final bool isEmulator = await _platform.invokeMethod('isEmulator');
      if (isEmulator) {
        isTampered = true;
      }

      // 4. Verify original application signature to prevent repackaging
      final bool isSignatureValid = await _platform.invokeMethod('verifySignature');
      if (!isSignatureValid) {
        isTampered = true;
      }
    } catch (_) {
      isTampered = true;
    }

    if (isTampered) {
      // Force terminate app cleanly
      SystemNavigator.pop();
      exit(0);
    }
  }
}

// Simple fallback helper for kIsWeb flag
const bool kIsWeb = identical(0, 0.0);
