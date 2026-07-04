import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/constants/api_constants.dart';

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

  QuestLibrary({required this.title, required this.description, required this.category, required this.baseXp});

  factory QuestLibrary.fromJson(Map<String, dynamic> json) {
    return QuestLibrary(
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'GENERAL',
      baseXp: json['baseXp'] ?? 0,
    );
  }
}

final questProvider = FutureProvider.autoDispose<List<QuestLog>>((ref) async {
  final storage = const FlutterSecureStorage();
  final token = await storage.read(key: 'auth_token');
  
  final dio = Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    headers: {
      'Authorization': 'Bearer $token',
    },
  ));

  final response = await dio.get('/quests');
  if (response.statusCode == 200 && response.data['success'] == true) {
    final list = response.data['data'] as List;
    return list.map((e) => QuestLog.fromJson(e)).toList();
  } else {
    throw Exception('Gagal memuat misi harian');
  }
});
