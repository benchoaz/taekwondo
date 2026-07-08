import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

class ArticleModel {
  final String id;
  final String title;
  final String content;
  final String author;
  final String? imageUrl;
  final DateTime createdAt;

  ArticleModel({
    required this.id,
    required this.title,
    required this.content,
    required this.author,
    this.imageUrl,
    required this.createdAt,
  });

  factory ArticleModel.fromJson(Map<String, dynamic> json) {
    return ArticleModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      author: json['author'] ?? '',
      imageUrl: json['imageUrl'] ?? json['image_url'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}

final articleProvider = FutureProvider.autoDispose<List<ArticleModel>>((ref) async {
  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get('/articles');
    if (response.data != null && response.data['success'] == true) {
      final List data = response.data['data'];
      return data.map((e) => ArticleModel.fromJson(e)).toList();
    }
    return [];
  } catch (e) {
    throw Exception('Gagal memuat artikel');
  }
});
