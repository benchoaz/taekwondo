import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../auth/data/auth_provider.dart';
import '../domain/notification_model.dart';

final notificationProvider = FutureProvider.autoDispose<List<NotificationModel>>((ref) async {
  final user = ref.watch(authProvider).value;
  if (user == null) return [];

  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get('/notifications', queryParameters: {
      'userId': user.id,
    });
    
    if (response.data != null && response.data['success'] == true) {
      final List data = response.data['data'];
      return data.map((e) => NotificationModel.fromJson(e)).toList();
    }
    return [];
  } catch (e) {
    throw Exception('Gagal mengambil aktivitas terbaru: $e');
  }
});

final notificationServiceProvider = Provider.autoDispose((ref) => NotificationService(ref.watch(dioProvider)));

class NotificationService {
  final dio;

  NotificationService(this.dio);

  Future<void> markAsRead(String userId, {List<String>? notificationIds}) async {
    final response = await dio.patch('/notifications', data: {
      'userId': userId,
      if (notificationIds != null) 'notificationIds': notificationIds,
    });
    
    if (response.statusCode != 200) {
      throw Exception('Gagal menandai notifikasi telah dibaca');
    }
  }
}
