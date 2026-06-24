import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../domain/schedule_model.dart';

final scheduleProvider = FutureProvider<List<ScheduleModel>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/schedules');

  if (response.statusCode == 200) {
    final List<dynamic> data = response.data ?? [];
    return data.map((json) => ScheduleModel.fromJson(json)).toList();
  }
  throw Exception('Failed to load training schedules');
});
