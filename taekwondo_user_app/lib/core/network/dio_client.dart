import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final dioProvider = Provider<Dio>((ref) {
  // Replace with your actual server IP or domain when running on a physical device.
  // Using 10.0.2.2 for Android Emulator connecting to localhost.
  final dio = Dio(BaseOptions(
    baseUrl: 'http://10.0.2.2:3002/api',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {
      'Content-Type': 'application/json',
    },
  ));

  // Add interceptors for logging and adding tokens
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) {
      // TODO: Get token from secure storage and add to headers
      // final token = await secureStorage.read(key: 'token');
      // if (token != null) {
      //   options.headers['Authorization'] = 'Bearer $token';
      // }
      return handler.next(options);
    },
  ));

  return dio;
});
