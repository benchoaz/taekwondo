import 'package:geolocator/geolocator.dart';
import '../../auth/domain/user_model.dart';

import 'package:dio/dio.dart';

class AttendanceService {
  final Dio _dio;

  AttendanceService(this._dio);

  Future<bool> checkInWithLocation(UserModel user) async {
    bool serviceEnabled;
    LocationPermission permission;

    // Test if location services are enabled.
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Layanan lokasi tidak aktif. Harap nyalakan GPS.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Izin lokasi ditolak.');
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      throw Exception('Izin lokasi ditolak permanen. Ubah di pengaturan HP Anda.');
    } 

    // When we reach here, permissions are granted and we can
    // continue accessing the position of the device.
    final position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high
    );

    // Send to backend
    try {
      final response = await _dio.post('/attendances/check-in', data: {
        'memberId': user.id, // Let's fix backend to handle userId or we send it as memberId if they are the same.
        'latitude': position.latitude,
        'longitude': position.longitude,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      }
      return false;
    } catch (e) {
      throw Exception('Gagal menyimpan absensi ke server: $e');
    }
  }
}
