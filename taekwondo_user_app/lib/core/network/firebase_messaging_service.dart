import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../../features/auth/domain/user_model.dart';

class FirebaseMessagingService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final Dio _dio;

  FirebaseMessagingService(this._dio);

  Future<void> initNotifications(UserModel user) async {
    // 1. Minta Izin (Permission) dari pengguna
    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      if (kDebugMode) {
        print('User granted permission for push notifications');
      }
      
      // 2. Ambil FCM Token
      try {
        String? token = await _messaging.getToken();
        if (token != null) {
          if (kDebugMode) {
            print('FCM Token: $token');
          }
          await _sendTokenToServer(token, user.id);
        }
      } catch (e) {
        if (kDebugMode) {
          print('Failed to get FCM token: $e');
        }
      }

      // 3. Dengarkan jika token di-refresh oleh Firebase
      _messaging.onTokenRefresh.listen((newToken) {
        _sendTokenToServer(newToken, user.id);
      });

      // 4. Dengarkan pesan saat aplikasi di Foreground
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        if (kDebugMode) {
          print('Got a message whilst in the foreground!');
          print('Message data: ${message.data}');
          if (message.notification != null) {
            print('Message also contained a notification: ${message.notification}');
          }
        }
        // Di sini Anda bisa memunculkan local notification atau SnackBar jika perlu
      });
    } else {
      if (kDebugMode) {
        print('User declined or has not accepted permission');
      }
    }
  }

  Future<void> _sendTokenToServer(String token, String userId) async {
    try {
      await _dio.post('/users/fcm-token', data: {
        'userId': userId,
        'fcmToken': token,
      });
      if (kDebugMode) {
        print('FCM token sent to server successfully');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error sending FCM token to server: $e');
      }
    }
  }
}

// Handler untuk background message (Harus merupakan fungsi top-level)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // await Firebase.initializeApp(); // Jika perlu menginisialisasi firebase di background
  if (kDebugMode) {
    print("Handling a background message: ${message.messageId}");
  }
}
