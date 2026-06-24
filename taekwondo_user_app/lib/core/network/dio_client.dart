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
      // Log error untuk debugging
      // ignore: avoid_print
      debugPrint('[DioError] ${e.requestOptions.path}: ${e.message}');
      return handler.next(e);
    },
  ));

  return dio;
});
