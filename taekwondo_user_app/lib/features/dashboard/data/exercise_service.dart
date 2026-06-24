import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../domain/exercise_model.dart';

final dailyQuestsProvider = FutureProvider.family<DailyQuestResponse, String>((ref, memberId) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/exercises', queryParameters: {'memberId': memberId});

  if (response.statusCode == 200) {
    if (response.data['success'] == true) {
      return DailyQuestResponse.fromJson(response.data['data']);
    }
  }
  throw Exception('Failed to load daily quests');
});

final exerciseLogServiceProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return ExerciseLogService(dio, ref);
});

class ExerciseLogService {
  final Dio dio;
  final Ref ref;

  ExerciseLogService(this.dio, this.ref);

  Future<bool> logExercise({
    required String memberId,
    required String exerciseId,
    String? notes,
  }) async {
    try {
      final response = await dio.post('/exercises', data: {
        'action': 'LOG_EXERCISE',
        'payload': {
          'memberId': memberId,
          'exerciseId': exerciseId,
          'notes': notes ?? 'Diselesaikan dari Aplikasi Member',
        }
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        ref.invalidate(dailyQuestsProvider(memberId));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
