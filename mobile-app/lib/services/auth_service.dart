import '../models/user.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../config/api_config.dart';

class AuthService {
  final ApiService _api;
  final StorageService _storage;

  AuthService(this._api, this._storage);

  Future<User?> login(String email, String password) async {
    try {
      final response = await _api.post(ApiConfig.login, data: {
        'email': email,
        'password': password,
      });

      final userData = response.data['data']['user'];
      final token = response.data['data']['accessToken'];
      final refreshToken = response.data['data']['refreshToken'];

      if (userData != null && token != null) {
        final user = User.fromJson(userData);
        await _storage.saveToken(token);
        if (refreshToken != null) {
          await _storage.saveRefreshToken(refreshToken);
        }
        await _storage.saveUserData(userData);
        print("User Data Response: ${user}");
        return user;
      }
    } catch (e) {
      throw Exception('Login failed: ${e.toString()}');
    }
    return null;
  }

  Future<User?> register(Map<String, dynamic> userData) async {
    try {
      final response = await _api.post(ApiConfig.register, data: userData);

      final user = User.fromJson(response.data['user']);
      final token = response.data['token'];
      final refreshToken = response.data['refreshToken'];

      await _storage.saveToken(token);
      if (refreshToken != null) {
        await _storage.saveRefreshToken(refreshToken);
      }
      await _storage.saveUserData(response.data['user']);

      return user;
    } catch (e) {
      throw Exception('Registration failed: ${e.toString()}');
    }
  }

  Future<void> logout() async {
    try {
      await _api.post(ApiConfig.logout);
    } catch (e) {
      // Even if logout fails on server, clear local data
    } finally {
      await _storage.clearAll();
    }
  }

  Future<bool> sendPhoneVerification(String phoneNumber) async {
    try {
      await _api.post(ApiConfig.sendPhoneVerification, data: {
        'phone': phoneNumber,
      });
      return true;
    } catch (e) {
      throw Exception('Failed to send verification code: ${e.toString()}');
    }
  }

  Future<bool> verifyPhone(String phoneNumber, String code) async {
    try {
      final response = await _api.post(ApiConfig.verifyPhone, data: {
        'phone': phoneNumber,
        'code': code,
      });
      return response.data['success'] ?? false;
    } catch (e) {
      throw Exception('Phone verification failed: ${e.toString()}');
    }
  }

  Future<User?> getCurrentUser() async {
    try {
      final userData = await _storage.getUserData();
      if (userData != null) {
        return User.fromJson(userData);
      }

      // If no local data, fetch from server
      final response = await _api.get(ApiConfig.userProfile);
      final user = User.fromJson(response.data);
      await _storage.saveUserData(response.data);
      return user;
    } catch (e) {
      return null;
    }
  }

  Future<bool> isLoggedIn() async {
    final token = await _storage.getToken();
    return token != null;
  }
}
