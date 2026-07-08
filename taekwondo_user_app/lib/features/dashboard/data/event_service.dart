import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

class EventModel {
  final String id;
  final String title;
  final String level;
  final String location;
  final DateTime startDate;
  final DateTime endDate;
  final String? posterUrl;
  
  EventModel({
    required this.id,
    required this.title,
    required this.level,
    required this.location,
    required this.startDate,
    required this.endDate,
    this.posterUrl,
  });

  factory EventModel.fromJson(Map<String, dynamic> json) {
    return EventModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      level: json['level'] ?? '',
      location: json['location'] ?? '',
      startDate: json['startDate'] != null ? DateTime.parse(json['startDate']) : DateTime.now(),
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : DateTime.now(),
      posterUrl: json['posterUrl'] ?? json['poster_url'],
    );
  }
}

final eventProvider = FutureProvider.autoDispose<List<EventModel>>((ref) async {
  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get('/events');
    if (response.data != null && response.data['success'] == true) {
      final List data = response.data['data'];
      return data.map((e) => EventModel.fromJson(e)).toList();
    }
    return [];
  } catch (e) {
    throw Exception('Gagal memuat event');
  }
});
