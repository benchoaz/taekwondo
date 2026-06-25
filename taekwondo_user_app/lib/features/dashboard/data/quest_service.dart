import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../domain/quest_model.dart';

final dailyQuestsProvider = FutureProvider.family<List<DailyQuestLog>, String>((ref, memberId) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/member/daily-quests', queryParameters: {'memberId': memberId});

  if (response.statusCode == 200) {
    if (response.data['success'] == true) {
      final list = response.data['data'] as List? ?? [];
      return list.map((e) => DailyQuestLog.fromJson(e)).toList();
    }
  }
  throw Exception('Failed to load daily quests');
});

final questLogServiceProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return QuestLogService(dio, ref);
});

class QuestLogService {
  final Dio dio;
  final Ref ref;

  QuestLogService(this.dio, this.ref);

  Future<bool> logQuest({
    required String memberId,
    required String logId,
    String? notes,
  }) async {
    try {
      final response = await dio.post('/member/daily-quests', data: {
        'logId': logId,
        'notes': notes,
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
