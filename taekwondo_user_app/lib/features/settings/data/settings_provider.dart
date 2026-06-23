import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/api_constants.dart';
import '../domain/setting_model.dart';

final dioProvider = Provider((ref) => Dio());

final settingsProvider = FutureProvider<SettingModel>((ref) async {
  final dio = ref.watch(dioProvider);
  
  try {
    final response = await dio.get('${ApiConstants.baseUrl}${ApiConstants.settingsEndpoint}');
    
    if (response.statusCode == 200) {
      return SettingModel.fromJson(response.data);
    } else {
      throw Exception('Failed to load settings');
    }
  } catch (e) {
    // If backend is unreachable, return a default fallback model
    return SettingModel(
      dojangName: 'DOJO MASTER',
      motto: 'PRECISION & DISCIPLINE',
    );
  }
});
