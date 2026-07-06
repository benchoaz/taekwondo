import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

class QuestLog {
  final String id;
  final bool completed;
  final QuestLibrary quest;

  QuestLog({required this.id, required this.completed, required this.quest});

  factory QuestLog.fromJson(Map<String, dynamic> json) {
    return QuestLog(
      id: json['id'],
      completed: json['completed'] ?? false,
      quest: QuestLibrary.fromJson(json['quest']),
    );
  }
}

class QuestLibrary {
  final String title;
  final String description;
  final String category;
  final int baseXp;

  QuestLibrary({
    required this.title,
    required this.description,
    required this.category,
    required this.baseXp,
  });

  factory QuestLibrary.fromJson(Map<String, dynamic> json) {
    return QuestLibrary(
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'GENERAL',
      baseXp: json['baseXp'] ?? 0,
    );
  }
}

/// Mengambil daftar daily quest hari ini dari backend.
/// Menggunakan [dioProvider] sehingga JWT token otomatis di-inject via interceptor.
final questProvider = FutureProvider.autoDispose<List<QuestLog>>((ref) async {
  final dio = ref.watch(dioProvider);
  final response = await dio.get('/quests');

  if (response.statusCode == 200 && response.data['success'] == true) {
    final list = response.data['data'] as List;
    return list.map((e) => QuestLog.fromJson(e)).toList();
  } else {
    throw Exception('Gagal memuat misi harian');
  }
});

