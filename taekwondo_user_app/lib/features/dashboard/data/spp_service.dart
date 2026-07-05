import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';
import '../../auth/data/auth_provider.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SppInvoice {
  final int month;
  final int year;
  final int amount;
  final String status;

  SppInvoice({required this.month, required this.year, required this.amount, required this.status});

  factory SppInvoice.fromJson(Map<String, dynamic> json) {
    return SppInvoice(
      month: json['month'] ?? 1,
      year: json['year'] ?? 2026,
      amount: json['amount'] ?? 250000,
      status: json['status'] ?? 'PENDING',
    );
  }
}

final sppProvider = FutureProvider.autoDispose<SppInvoice?>((ref) async {
  final authState = ref.watch(authProvider);
  final user = authState.value;
  if (user == null) return null;

  final dio = Dio(BaseOptions(baseUrl: ApiConstants.baseUrl));
  const storage = FlutterSecureStorage();
  final token = await storage.read(key: 'auth_token');

  if (token != null) {
    dio.options.headers['Authorization'] = 'Bearer $token';
  }

  try {
    final response = await dio.get('/api/spp?userId=${user.id}');
    if (response.statusCode == 200) {
      final List data = response.data;
      if (data.isNotEmpty) {
        // Return the latest invoice
        return SppInvoice.fromJson(data.first);
      }
    }
  } catch (e) {
    print("Error fetching SPP: $e");
  }
  return null;
});
