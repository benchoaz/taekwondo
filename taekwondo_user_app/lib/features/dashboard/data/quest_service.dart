import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';

class QuestLog {
  final String id;
  final bool completed;
  final QuestLibrary quest;
  final String? videoUrl;
  final String? notes;

  QuestLog({
    required this.id, 
    required this.completed, 
    required this.quest,
    this.videoUrl,
    this.notes,
  });

  factory QuestLog.fromJson(Map<String, dynamic> json) {
    return QuestLog(
      id: json['id'],
      completed: json['completed'] ?? false,
      quest: QuestLibrary.fromJson(json['quest']),
      videoUrl: json['videoUrl'] ?? json['video_url'],
      notes: json['notes'],
    );
  }
}

class QuestLibrary {
  final String title;
  final String description;
  final String category;
  final int baseXp;
  final String? videoUrl;
  final bool requireVideo;
  final String? readingContent;

  QuestLibrary({
    required this.title,
    required this.description,
    required this.category,
    required this.baseXp,
    this.videoUrl,
    this.requireVideo = false,
    this.readingContent,
  });

  factory QuestLibrary.fromJson(Map<String, dynamic> json) {
    return QuestLibrary(
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'GENERAL',
      baseXp: json['baseXp'] ?? 0,
      videoUrl: json['videoUrl'] ?? json['video_url'],
      requireVideo: json['requireVideo'] ?? json['require_video'] ?? false,
      readingContent: json['readingContent'] ?? json['reading_content'],
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


final questServiceProvider = Provider.autoDispose((ref) => QuestService(ref.watch(dioProvider)));

class QuestService {
  final dio; // Dio client

  QuestService(this.dio);

  Future<void> completeQuest(String logId, {String? videoUrl, String? notes}) async {
    final response = await dio.post('/quests', data: {
      'logId': logId,
      if (videoUrl != null) 'videoUrl': videoUrl,
      if (notes != null) 'notes': notes,
    });
    if (response.statusCode != 200) {
      throw Exception(response.data['error'] ?? 'Gagal menyelesaikan misi');
    }
  }

  Future<String> uploadVideo(List<int> bytes, String filename) async {

    final formData = FormData.fromMap({
      'type': 'exam', // General type for videos
      'file': MultipartFile.fromBytes(bytes, filename: filename),
    });

    final response = await dio.post(
      '/upload',
      data: formData,
      options: Options(
        headers: {
          'Content-Type': null,
        },
      ),
    );
    if (response.statusCode == 200 && response.data['success'] == true) {
      return response.data['url'];
    }
    throw Exception('Gagal mengunggah video');
  }
}
