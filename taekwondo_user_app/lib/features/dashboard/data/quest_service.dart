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

class QuizQuestion {
  final String question;
  final List<String> options;
  final String correctAnswer;
  final String? explanation;

  QuizQuestion({
    required this.question,
    required this.options,
    required this.correctAnswer,
    this.explanation,
  });

  factory QuizQuestion.fromJson(Map<String, dynamic> json) {
    return QuizQuestion(
      question: json['question'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      correctAnswer: json['correctAnswer'] ?? json['correct_answer'] ?? '',
      explanation: json['explanation'],
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
  final List<QuizQuestion>? quizQuestions;

  QuestLibrary({
    required this.title,
    required this.description,
    required this.category,
    required this.baseXp,
    this.videoUrl,
    this.requireVideo = false,
    this.readingContent,
    this.quizQuestions,
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
      quizQuestions: json['quizQuestions'] != null
          ? (json['quizQuestions'] as List).map((e) => QuizQuestion.fromJson(e)).toList()
          : null,
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

  Future<void> submitQuiz(String logId, List<String> answers) async {
    final response = await dio.post('/quests/submit-quiz', data: {
      'logId': logId,
      'answers': answers,
    });
    if (response.statusCode != 200) {
      throw Exception(response.data['error'] ?? 'Jawaban kuis salah atau gagal disimpan.');
    }
  }

  Future<String> uploadVideo(List<int> bytes, String filename) async {

    final formData = FormData.fromMap({
      'type': 'video', // Direct to Cloudinary CDN for auto-compression
      'file': MultipartFile.fromBytes(bytes, filename: filename),
    });

    final cleanDio = Dio(BaseOptions(
      baseUrl: dio.options.baseUrl,
      connectTimeout: dio.options.connectTimeout,
      receiveTimeout: dio.options.receiveTimeout,
    ));
    // Copy Authorization header
    if (dio.options.headers['Authorization'] != null) {
      cleanDio.options.headers['Authorization'] = dio.options.headers['Authorization'];
    }

    final response = await cleanDio.post(
      '/upload',
      data: formData,
    );
    if (response.statusCode == 200 && response.data['success'] == true) {
      return response.data['url'];
    }
    throw Exception('Gagal mengunggah video');
  }
}
