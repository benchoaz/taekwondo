import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../domain/setting_model.dart';

// ✅ TIDAK lagi mendefinisikan dioProvider di sini (sudah ada di core/network/dio_client.dart)
// settingsProvider menggunakan dioProvider dari dio_client

final settingsProvider = FutureProvider<SettingModel>((ref) async {
  // Buat Dio sederhana untuk settings (tidak butuh auth token)
  final dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  try {
    final response = await dio.get('${ApiConstants.baseUrl}${ApiConstants.settingsEndpoint}');
    
    if (response.statusCode == 200) {
      return SettingModel.fromJson(response.data);
    } else {
      throw Exception('Failed to load settings');
    }
  } catch (e) {
    // Jika backend tidak bisa diakses, kembalikan data default
    return SettingModel(
      dojangName: 'TAEKWONDO ACADEMY',
      motto: 'Disiplin • Integritas • Prestasi',
    );
  }
});
