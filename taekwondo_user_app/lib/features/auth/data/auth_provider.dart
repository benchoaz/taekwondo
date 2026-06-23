import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/constants/api_constants.dart';
import '../domain/user_model.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<UserModel?>>((ref) {
  return AuthNotifier();
});

class AuthNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final Dio _dio = Dio();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  AuthNotifier() : super(const AsyncValue.data(null)) {
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    state = const AsyncValue.loading();
    try {
      final token = await _storage.read(key: 'auth_token');
      final email = await _storage.read(key: 'auth_email');
      final role = await _storage.read(key: 'auth_role');
      final id = await _storage.read(key: 'auth_id');
      final name = await _storage.read(key: 'auth_name');
      final memberNumber = await _storage.read(key: 'auth_member_number');
      final currentBelt = await _storage.read(key: 'auth_current_belt');
      final progressStr = await _storage.read(key: 'auth_progress');

      if (token != null && email != null && role != null && id != null) {
        state = AsyncValue.data(UserModel(
          id: id,
          email: email,
          role: role,
          token: token,
          name: name,
          memberNumber: memberNumber,
          currentBelt: currentBelt,
          progress: progressStr != null ? int.tryParse(progressStr) : null,
        ));
      } else {
        state = const AsyncValue.data(null);
      }
    } catch (e) {
      state = const AsyncValue.data(null);
    }
  }

  Future<bool> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final response = await _dio.post(
        '${ApiConstants.baseUrl}/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final token = data['token'];
        final userModel = UserModel.fromJson(data['user'], token: token);

        // Save to secure storage
        await _storage.write(key: 'auth_token', value: token);
        await _storage.write(key: 'auth_email', value: userModel.email);
        await _storage.write(key: 'auth_role', value: userModel.role);
        await _storage.write(key: 'auth_id', value: userModel.id);
        
        if (userModel.name != null) await _storage.write(key: 'auth_name', value: userModel.name);
        if (userModel.memberNumber != null) await _storage.write(key: 'auth_member_number', value: userModel.memberNumber);
        if (userModel.currentBelt != null) await _storage.write(key: 'auth_current_belt', value: userModel.currentBelt);
        if (userModel.progress != null) await _storage.write(key: 'auth_progress', value: userModel.progress.toString());

        state = AsyncValue.data(userModel);
        return true;
      } else {
        state = const AsyncValue.data(null);
        return false;
      }
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
      return false;
    }
  }

  Future<void> logout() async {
    state = const AsyncValue.loading();
    await _storage.deleteAll();
    state = const AsyncValue.data(null);
  }
}
