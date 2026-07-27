import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:dio/dio.dart';
import '../../features/auth/domain/user_model.dart';

/// Callback global untuk refresh quest saat push notification diterima.
/// Di-set dari DailyQuestScreen / MemberDashboardScreen.
VoidCallback? onQuestNotificationReceived;

/// NavigatorKey global untuk navigasi dari luar context widget tree.
final GlobalKey<NavigatorState> globalNavigatorKey = GlobalKey<NavigatorState>();

class FirebaseMessagingService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  final Dio _dio;

  static const AndroidNotificationChannel _highImportanceChannel = AndroidNotificationChannel(
    'high_importance_channel',
    'Notifikasi Penting',
    description: 'Channel untuk notifikasi prioritas tinggi & heads-up banner',
    importance: Importance.max,
    playSound: true,
    enableVibration: true,
  );

  FirebaseMessagingService(this._dio);

  Future<void> initNotifications(UserModel user) async {
    // 1. Minta Izin (Permission) dari pengguna
    final NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // 2. Buat Notification Channel di Android OS untuk Heads-Up Notification
    final androidImplementation = _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    if (androidImplementation != null) {
      await androidImplementation.createNotificationChannel(_highImportanceChannel);
    }

    // Inisialisasi Flutter Local Notifications
    const initializationSettings = InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
    );
    await _localNotifications.initialize(
      settings: initializationSettings,
      onDidReceiveNotificationResponse: (response) {
        debugPrint('Notification tapped with payload: ${response.payload}');
      },
    );

    // Set Foreground presentation options untuk iOS
    await _messaging.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('FCM: Permission granted');

      // 3. Ambil FCM Token
      try {
        final String? token = await _messaging.getToken();
        if (token != null) {
          debugPrint('FCM Token: $token');
          await _sendTokenToServer(token, user.id);
        }
      } catch (e) {
        debugPrint('Failed to get FCM token: $e');
      }

      // 4. Refresh token otomatis jika diperbaharui Firebase
      _messaging.onTokenRefresh.listen((newToken) {
        _sendTokenToServer(newToken, user.id);
      });

      // 5. Foreground message handler — tampilkan local heads-up notification + snackbar
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('FCM Foreground: ${message.notification?.title}');
        
        // Tampilkan Heads-Up Notification Lokal via FlutterLocalNotifications
        final notification = message.notification;
        if (notification != null) {
          _localNotifications.show(
            id: notification.hashCode,
            title: notification.title,
            body: notification.body,
            notificationDetails: NotificationDetails(
              android: AndroidNotificationDetails(
                _highImportanceChannel.id,
                _highImportanceChannel.name,
                channelDescription: _highImportanceChannel.description,
                importance: Importance.max,
                priority: Priority.high,
                icon: '@mipmap/ic_launcher',
                playSound: true,
                enableVibration: true,
              ),
            ),
            payload: message.data.toString(),
          );
        }

        _handleIncomingMessage(message);
      });

      // 5. Handle tap notifikasi saat app di background (opened from notification)
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('FCM onMessageOpenedApp: ${message.data}');
        _navigateFromNotification(message);
      });

      // 6. Cek apakah app dibuka dari terminated state via notifikasi
      final RemoteMessage? initialMessage = await _messaging.getInitialMessage();
      if (initialMessage != null) {
        debugPrint('FCM Initial (terminated): ${initialMessage.data}');
        // Tunda navigasi sampai app selesai build
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _navigateFromNotification(initialMessage);
        });
      }
    } else {
      debugPrint('FCM: Permission declined');
    }
  }

  /// Tampilkan SnackBar in-app dan trigger refresh data berdasarkan tipe notifikasi
  void _handleIncomingMessage(RemoteMessage message) {
    final String type = message.data['type'] ?? '';
    final String title = message.notification?.title ?? 'Notifikasi Baru';
    final String body = message.notification?.body ?? '';

    // Tampilkan SnackBar menggunakan globalNavigatorKey
    final context = globalNavigatorKey.currentContext;
    if (context != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF1E293B),
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: Color(0xFF3B82F6), width: 1.5),
          ),
          duration: const Duration(seconds: 5),
          content: Row(
            children: [
              const Icon(Icons.notifications_active, color: Color(0xFF3B82F6), size: 24),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(title,
                        style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 13)),
                    if (body.isNotEmpty)
                      Text(body,
                          style: const TextStyle(
                              color: Color(0xFF94A3B8), fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
          action: type == 'QUEST'
              ? SnackBarAction(
                  label: 'Lihat',
                  textColor: const Color(0xFF3B82F6),
                  onPressed: () {
                    // Navigasi ke layar quest
                    globalNavigatorKey.currentState?.pushNamed('/quest');
                    // Trigger refresh data quest
                    onQuestNotificationReceived?.call();
                  },
                )
              : null,
        ),
      );
    }

    // Trigger refresh quest tanpa navigasi jika tipe QUEST
    if (type == 'QUEST') {
      onQuestNotificationReceived?.call();
    }
  }

  /// Navigasi ke halaman yang sesuai berdasarkan data notifikasi
  void _navigateFromNotification(RemoteMessage message) {
    final String link = message.data['link'] ?? '';
    final String type = message.data['type'] ?? '';

    if (link == '/quest' || type == 'QUEST') {
      globalNavigatorKey.currentState?.pushNamed('/quest');
      onQuestNotificationReceived?.call();
    } else if (link == '/notifications' || type == 'ANNOUNCEMENT') {
      globalNavigatorKey.currentState?.pushNamed('/notifications');
    } else if (link == '/spp' || type == 'SPP') {
      globalNavigatorKey.currentState?.pushNamed('/spp');
    }
  }

  Future<void> _sendTokenToServer(String token, String userId) async {
    try {
      await _dio.post('/users/fcm-token', data: {
        'userId': userId,
        'fcmToken': token,
      });
      debugPrint('FCM token sent to server successfully');
    } catch (e) {
      debugPrint('Error sending FCM token to server: $e');
    }
  }
}

// Handler untuk background message (Harus merupakan fungsi top-level)
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('FCM Background message: ${message.messageId}');
}
