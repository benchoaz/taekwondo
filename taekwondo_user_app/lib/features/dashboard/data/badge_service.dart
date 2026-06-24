import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../domain/badge_model.dart';

final badgesProvider = FutureProvider.family<List<BadgeModel>, String>((ref, memberId) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/badges', queryParameters: {'memberId': memberId});

  if (response.statusCode == 200) {
    if (response.data['success'] == true) {
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((json) => BadgeModel.fromJson(json)).toList();
    }
  }
  throw Exception('Failed to load badges');
});
