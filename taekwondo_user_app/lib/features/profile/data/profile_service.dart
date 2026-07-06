import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

class ProfileAchievement {
  final String title;
  final String eventName;
  final String rank;
  final DateTime date;

  ProfileAchievement({
    required this.title,
    required this.eventName,
    required this.rank,
    required this.date,
  });

  factory ProfileAchievement.fromJson(Map<String, dynamic> json) {
    return ProfileAchievement(
      title: json['title'] ?? '',
      eventName: json['eventName'] ?? '',
      rank: json['rank'] ?? '',
      date: json['date'] != null ? DateTime.parse(json['date']) : DateTime.now(),
    );
  }
}

class ProfileData {
  final String name;
  final String memberNumber;
  final String currentBelt;
  final int progress;
  final int age;
  final double? weight;
  final double? height;
  final double? waistCircum;
  final List<ProfileAchievement> achievements;

  ProfileData({
    required this.name,
    required this.memberNumber,
    required this.currentBelt,
    required this.progress,
    required this.age,
    this.weight,
    this.height,
    this.waistCircum,
    required this.achievements,
  });

  factory ProfileData.fromJson(Map<String, dynamic> json) {
    final achievementsList = (json['achievements'] as List?)
            ?.map((e) => ProfileAchievement.fromJson(e))
            .toList() ??
        [];

    return ProfileData(
      name: json['name'] ?? '',
      memberNumber: json['memberNumber'] ?? '',
      currentBelt: json['currentBelt'] ?? '',
      progress: json['progress'] ?? 0,
      age: json['age'] ?? 0,
      weight: json['weight'] != null ? (json['weight'] as num).toDouble() : null,
      height: json['height'] != null ? (json['height'] as num).toDouble() : null,
      waistCircum: json['waistCircum'] != null
          ? (json['waistCircum'] as num).toDouble()
          : null,
      achievements: achievementsList,
    );
  }
}

/// Service untuk operasi profile yang membutuhkan referensi Riverpod.
/// Diakses via [profileServiceProvider].
class ProfileService {
  final Ref _ref;
  ProfileService(this._ref);

  /// Update data biometrik member (berat, tinggi, lingkar perut).
  Future<bool> updateBiometrics(
    double? weight,
    double? height,
    double? waistCircum,
  ) async {
    try {
      final dio = _ref.read(dioProvider);
      final response = await dio.put(
        '/profile/biometrics',
        data: {
          'weight': weight,
          'height': height,
          'waistCircum': waistCircum,
        },
      );
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('[ProfileService] Update biometrics error: $e');
      return false;
    }
  }
}

/// Provider untuk ProfileService (butuh Ref).
final profileServiceProvider = Provider<ProfileService>((ref) {
  return ProfileService(ref);
});

/// Provider untuk mengambil data profil member yang sedang login.
/// Menggunakan [dioProvider] — JWT token di-inject otomatis.
final profileProvider = FutureProvider.autoDispose<ProfileData?>((ref) async {
  final dio = ref.watch(dioProvider);

  final response = await dio.get('/profile');
  if (response.statusCode == 200 && response.data['success'] == true) {
    return ProfileData.fromJson(response.data['data']);
  } else {
    throw Exception('Gagal memuat profil');
  }
});

