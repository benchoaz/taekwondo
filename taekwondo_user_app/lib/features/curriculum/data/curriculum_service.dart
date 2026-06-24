import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../domain/curriculum_model.dart';

final curriculumProvider = FutureProvider<List<BeltCurriculum>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/curriculum');

  if (response.statusCode == 200) {
    final Map<String, dynamic> responseData = response.data;
    if (responseData['success'] == true) {
      final List<dynamic> data = responseData['data'] ?? [];
      return data.map((json) => BeltCurriculum.fromJson(json)).toList();
    }
  }
  throw Exception('Failed to load curriculum');
});
