import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import '../../auth/domain/user_model.dart';
import 'package:dio/dio.dart';

class CheckInResult {
  final bool success;
  final String title;
  final String message;
  final String? code;
  final int? coinsGained;
  final String? scheduleName;

  CheckInResult({
    required this.success,
    required this.title,
    required this.message,
    this.code,
    this.coinsGained,
    this.scheduleName,
  });
}

class AttendanceService {
  final Dio _dio;

  AttendanceService(this._dio);

  /// Cek apakah member sudah melakukan absensi hari ini
  Future<Map<String, dynamic>?> checkTodayStatus(UserModel user) async {
    try {
      final response = await _dio.get('/attendances/check-in?memberId=${user.id}');
      if (response.statusCode == 200 && response.data is Map) {
        return Map<String, dynamic>.from(response.data);
      }
    } catch (e) {
      debugPrint('[AttendanceService] Cek status absen gagal: $e');
    }
    return null;
  }

  Future<CheckInResult> checkInWithLocation(UserModel user) async {
    bool serviceEnabled;
    LocationPermission permission;

    // 1. Periksa apakah GPS / Location Service aktif di perangkat
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return CheckInResult(
        success: false,
        title: 'GPS Tidak Aktif 🛰️',
        message: 'Layanan lokasi (GPS) pada ponsel Anda tidak aktif. Harap nyalakan GPS di menu notifikasi/pengaturan.',
        code: 'GPS_DISABLED',
      );
    }

    // 2. Periksa izin lokasi
    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return CheckInResult(
          success: false,
          title: 'Izin Lokasi Ditolak 📍',
          message: 'Aplikasi membutuhkan izin lokasi untuk memverifikasi kehadiran Anda di Dojang.',
          code: 'PERMISSION_DENIED',
        );
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      return CheckInResult(
        success: false,
        title: 'Izin Lokasi Dinonaktifkan ⚠️',
        message: 'Izin lokasi ditolak permanen. Buka Pengaturan HP > Aplikasi > White Tiger > Izin > pilih Izinkan Lokasi.',
        code: 'PERMISSION_DENIED_FOREVER',
      );
    } 

    // 3. Dapatkan koordinat GPS dengan fallback aman (Indoor Friendly)
    Position? position;
    try {
      position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
    } catch (_) {
      // Jika akurasi tinggi timeout (karena di dalam gedung), gunakan posisi terakhir yang diketahui
      position = await Geolocator.getLastKnownPosition();
    }

    // Jika masih null, coba lagi dengan akurasi medium
    if (position == null) {
      try {
        position = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.medium,
            timeLimit: Duration(seconds: 8),
          ),
        );
      } catch (_) {}
    }

    if (position == null) {
      return CheckInResult(
        success: false,
        title: 'Sinyal GPS Lemah 📶',
        message: 'Gagal mengunci posisi GPS. Pastikan Anda berada di area terbuka atau dekat pintu/jendela latihan.',
        code: 'GPS_TIMEOUT',
      );
    }

    // 4. Kirim koordinat ke backend
    try {
      final response = await _dio.post('/attendances/check-in', data: {
        'memberId': user.id,
        'latitude': position.latitude,
        'longitude': position.longitude,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        return CheckInResult(
          success: true,
          title: 'Hadir Latihan! 🎉',
          message: data['message'] ?? 'Absensi Anda berhasil dicatat hari ini. Tetap semangat berlatih!',
          coinsGained: data['coinsGained'] ?? 10,
          scheduleName: data['schedule']?['className'],
        );
      }
      
      // Handle status 400 dari backend
      final data = response.data is Map ? response.data : {};
      final code = data['code']?.toString() ?? '';
      final errorStr = data['error']?.toString() ?? 'Gagal mencatat absen.';
      final detailStr = data['detail']?.toString() ?? '';
      final fullMsg = detailStr.isNotEmpty ? detailStr : errorStr;

      String title = 'Gagal Absen ❌';
      if (code == 'OUT_OF_RADIUS') {
        title = 'Di Luar Area Dojang 📍';
      } else if (code == 'NO_SCHEDULE') {
        title = 'Bukan Hari Latihan 📅';
      } else if (code == 'OUT_OF_TIME') {
        title = 'Di Luar Jam Latihan ⏰';
      }

      return CheckInResult(
        success: false,
        title: title,
        message: fullMsg,
        code: code,
      );

    } catch (e) {
      String errorMsg = 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
      if (e is DioException) {
        if (e.response?.data != null && e.response?.data is Map) {
          final data = e.response!.data as Map;
          errorMsg = data['detail'] ?? data['error'] ?? e.message ?? errorMsg;
        } else if (e.message != null) {
          errorMsg = e.message!;
        }
      }

      return CheckInResult(
        success: false,
        title: 'Koneksi Bermasalah 🌐',
        message: errorMsg,
        code: 'NETWORK_ERROR',
      );
    }
  }
}
