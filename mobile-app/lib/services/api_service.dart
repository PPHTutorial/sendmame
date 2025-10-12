import 'package:dio/dio.dart';
import '../config/api_config.dart';
import 'storage_service.dart';

class ApiService {
  final Dio _dio;
  final StorageService _storage;

  ApiService(this._storage) : _dio = Dio() {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add base URL
        options.baseUrl = ApiConfig.baseUrl;

        // Add authorization header if token exists
        final token = await _storage.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }

        // Add content type
        options.headers['Content-Type'] = 'application/json';

        print('API Request: ${options.method} ${options.baseUrl}${options.path}');
        print('Headers: ${options.headers}');

        return handler.next(options);
      },
      onResponse: (response, handler) {
        print('API Response: ${response.statusCode} ${response.requestOptions.path}');
        return handler.next(response);
      },
      onError: (error, handler) async {
        print('API Error: ${error.response?.statusCode} ${error.requestOptions.path}');
        print('Error details: ${error.message}');
        print('Response data: ${error.response?.data}');

        if (error.response?.statusCode == 401) {
          // Token expired, try to refresh
          final refreshToken = await _storage.getRefreshToken();
          if (refreshToken != null) {
            try {
              final response = await _dio.post(ApiConfig.refreshToken, data: {
                'refreshToken': refreshToken,
              });

              final newToken = response.data['token'];
              await _storage.saveToken(newToken);

              // Retry the original request
              error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
              final retryResponse = await _dio.fetch(error.requestOptions);
              return handler.resolve(retryResponse);
            } catch (e) {
              // Refresh failed, logout user
              await _storage.clearAll();
              // Navigate to login screen
            }
          }
        }
        return handler.next(error);
      },
    ));
  }

  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get(path, queryParameters: queryParameters);
  }

  Future<Response<T>> post<T>(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }

  Future<Response<T>> put<T>(String path, {dynamic data}) {
    return _dio.put(path, data: data);
  }

  Future<Response<T>> delete<T>(String path) {
    return _dio.delete(path);
  }

  Future<Response<T>> patch<T>(String path, {dynamic data}) {
    return _dio.patch(path, data: data);
  }
}