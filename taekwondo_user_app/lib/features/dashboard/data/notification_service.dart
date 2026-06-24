import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../auth/data/auth_provider.dart';
import '../domain/notification_model.dart';

final notificationProvider = FutureProvider.autoDispose<List<NotificationModel>>((ref) async {
  final user = ref.watch(authProvider).value;
  if (user == null) return [];

  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get('/api/notifications', queryParameters: {
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
