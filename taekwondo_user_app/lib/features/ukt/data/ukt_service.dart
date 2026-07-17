import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../domain/ukt_model.dart';

final uktStatusProvider = FutureProvider.family<UktStatusResponse, String>((ref, memberId) async {
  final dio = ref.watch(dioProvider);
  try {
    final response = await dio.get('/ukt', queryParameters: {'memberId': memberId});

    if (response.statusCode == 200) {
      return UktStatusResponse.fromJson(response.data);
    }
  } on DioException catch (e) {
    if (e.response?.statusCode == 404) {
      return UktStatusResponse(exam: null, registration: null);
    }
    rethrow;
  }
  throw Exception('Failed to load UKT status');
});

final uktRegisterProvider = Provider((ref) {
  final dio = ref.watch(dioProvider);
  return UktRegistrationService(dio, ref);
});

class UktRegistrationService {
  final Dio dio;
  final Ref ref;

  UktRegistrationService(this.dio, this.ref);

  Future<bool> register({
    required String memberId,
    required String uktExamId,
    required String targetBelt,
  }) async {
    final result = await registerWithMessage(memberId: memberId, uktExamId: uktExamId, targetBelt: targetBelt);
    return result['success'] == true;
  }

  /// Mendaftar UKT dan mengembalikan Map {success: bool, message: String}
  Future<Map<String, dynamic>> registerWithMessage({
    required String memberId,
    required String uktExamId,
    required String targetBelt,
  }) async {
    try {
      final response = await dio.post('/ukt', data: {
        'memberId': memberId,
        'uktExamId': uktExamId,
        'targetBelt': targetBelt,
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        ref.invalidate(uktStatusProvider(memberId));
        return {'success': true, 'message': 'Pendaftaran berhasil!'};
      }
      return {'success': false, 'message': response.data['error'] ?? 'Gagal melakukan pendaftaran.'};
    } on DioException catch (e) {
      final msg = e.response?.data?['error'] ?? e.response?.data?['message'] ?? 'Gagal melakukan pendaftaran. Coba lagi.';
      return {'success': false, 'message': msg};
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }
}
