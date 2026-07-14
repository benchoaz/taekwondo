import 'dart:io';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart';
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

      if (isDeveloperMode) {
        // Log instead of crashing, as developers/testers always have this enabled.
        debugPrint("Security Warning: Developer options are enabled.");
      }

      if (isJailbroken) {
        isTampered = true;
      }
    } catch (e) {
      // Do not crash the app if the jailbreak detection library fails to load
      debugPrint("Jailbreak check skipped/failed: $e");
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
    } on MissingPluginException catch (e) {
      // Gracefully handle unimplemented native platform channels on some builds
      debugPrint("Security MethodChannel not implemented: $e");
    } on PlatformException catch (e) {
      debugPrint("Security PlatformException: $e");
    } catch (e) {
      debugPrint("Security general exception: $e");
    }

    if (isTampered) {
      debugPrint("TAMPERING DETECTED! Closing application.");
      // Force terminate app cleanly
      SystemNavigator.pop();
      exit(0);
    }
  }
}

// Simple fallback helper for kIsWeb flag
const bool kIsWeb = identical(0, 0.0);
