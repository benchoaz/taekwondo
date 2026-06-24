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
    try {
      final response = await dio.post('/ukt', data: {
        'memberId': memberId,
        'uktExamId': uktExamId,
        'targetBelt': targetBelt,
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        ref.invalidate(uktStatusProvider(memberId));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
