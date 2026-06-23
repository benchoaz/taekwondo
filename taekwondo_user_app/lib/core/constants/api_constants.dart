import 'package:flutter/foundation.dart';

class ApiConstants {
  // Semua request sekarang akan dilempar ke tunnel Cloudflare agar aman dari blokir CORS Localhost
  static const String baseUrl = 'https://whitetigertkd.my.id/api';
  
  static const String settingsEndpoint = '/settings';
}
