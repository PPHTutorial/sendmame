import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/constants.dart';

class StorageService {
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  SharedPreferences? _prefs;

  Future<void> _initPrefs() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: AppConstants.tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: AppConstants.tokenKey);
  }

  Future<void> saveRefreshToken(String refreshToken) async {
    await _secureStorage.write(key: AppConstants.refreshTokenKey, value: refreshToken);
  }

  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: AppConstants.refreshTokenKey);
  }

  Future<void> saveUserData(Map<String, dynamic> userData) async {
    await _initPrefs();
    await _prefs!.setString(AppConstants.userDataKey, jsonEncode(userData));
  }

  Future<Map<String, dynamic>?> getUserData() async {
    await _initPrefs();
    final userDataString = _prefs!.getString(AppConstants.userDataKey);
    if (userDataString != null) {
      return jsonDecode(userDataString);
    }
    return null;
  }

  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    await _initPrefs();
    await _prefs!.clear();
  }

  // Additional utility methods
  Future<void> saveString(String key, String value) async {
    await _initPrefs();
    await _prefs!.setString(key, value);
  }

  Future<String?> getString(String key) async {
    await _initPrefs();
    return _prefs!.getString(key);
  }

  Future<void> saveBool(String key, bool value) async {
    await _initPrefs();
    await _prefs!.setBool(key, value);
  }

  Future<bool?> getBool(String key) async {
    await _initPrefs();
    return _prefs!.getBool(key);
  }
}