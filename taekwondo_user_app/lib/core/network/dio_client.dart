import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_constants.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    // ✅ Menggunakan URL yang sama dengan ApiConstants (Production / Cloudflare Tunnel)
    baseUrl: ApiConstants.baseUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
    headers: {
      'Content-Type': 'application/json',
    },
    // ✅ Jangan lempar exception untuk status di bawah 500 (misalnya 401 atau 404)
    validateStatus: (status) => status != null && status < 500,
  ));

  // ✅ Interceptor mengirim JWT token dari SecureStorage ke setiap request
  const storage = FlutterSecureStorage();
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await storage.read(key: 'auth_token');
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
    onError: (DioException e, handler) {
      debugPrint('[DioError] ${e.requestOptions.path}: ${e.message}');
      return handler.next(e);
    },
  ));

  // ✅ Tambahkan Log Interceptor untuk melihat detail request & response
  dio.interceptors.add(LogInterceptor(
    requestBody: true,
    responseBody: true,
    logPrint: (obj) => debugPrint('[DioLog] $obj'),
  ));

  return dio;
});
