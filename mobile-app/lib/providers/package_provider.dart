import 'package:amenade_mobile/config/api_config.dart';
import 'package:flutter/foundation.dart';
import '../models/package.dart';
import '../services/api_service.dart';

class PackageProvider with ChangeNotifier {
  final ApiService _apiService;

  PackageProvider(this._apiService);

  List<Package> _packages = [];
  bool _isLoading = false;
  String? _error;

  List<Package> get packages => _packages;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadPackages() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('PackageProvider: Loading packages...');
      final response = await _apiService.get(ApiConfig.packages);
      print('PackageProvider: Received response: ${response.data}');
      final responseData = response.data as Map<String, dynamic>;

      final packagesData = responseData['data'] as List;
      print('PackageProvider: Received response with ${packagesData.length} items');
      print('PackageProvider: First item: ${packagesData.isNotEmpty ? packagesData.first : 'No items'}');

      try {
        _packages = packagesData
            .map((json) {
              print('PackageProvider: Parsing package: $json');
              return Package.fromJson(json);
            })
            .toList();
        print('PackageProvider: Successfully parsed ${_packages.length} packages');
        print('PackageProvider: First package: ${_packages.isNotEmpty ? _packages.first.title : 'No packages'}');
      } catch (parseError) {
        print('PackageProvider: Parse error: $parseError');
        print('PackageProvider: Failed to parse packages data');
        _error = 'Failed to parse package data: $parseError';
        _packages = [];
      }
    } catch (e) {
      print('PackageProvider: Error loading packages: $e');
      _error = e.toString();
    } finally {
      _isLoading = false;
      print('PackageProvider: Notifying listeners - packages: ${_packages.length}, loading: $_isLoading, error: $_error');
      notifyListeners();
    }
  }

  Future<void> loadUserPackages() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('PackageProvider: Loading user packages...');
      final response = await _apiService.get('/packages');
      print('PackageProvider: Received response: ${response.data}');
      final responseData = response.data as Map<String, dynamic>;
      final packagesData = responseData['data'] as List;
      print('PackageProvider: Received response with ${packagesData.length} items');
      _packages = packagesData.map((json) => Package.fromJson(json)).toList();
      print('PackageProvider: Successfully parsed ${_packages.length} user packages');
    } catch (e) {
      print('PackageProvider: Error loading user packages: $e');
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createPackage(Package package) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post('/packages', data: package.toJson());
      final newPackage = Package.fromJson(response.data);
      _packages.add(newPackage);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
    }
  }

  Future<bool> updatePackage(String packageId, Package updatedPackage) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.put('/packages/$packageId', data: updatedPackage.toJson());
      final updated = Package.fromJson(response.data);

      final index = _packages.indexWhere((p) => p.id == packageId);
      if (index != -1) {
        _packages[index] = updated;
      }

      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
    }
  }

  Future<bool> deletePackage(String packageId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.delete('/packages/$packageId');
      _packages.removeWhere((p) => p.id == packageId);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
    }
  }

  Future<List<Package>> searchPackages({
    String? origin,
    String? destination,
    double? maxWeight,
    double? maxPrice,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (origin != null) queryParams['origin'] = origin;
      if (destination != null) queryParams['destination'] = destination;
      if (maxWeight != null) queryParams['maxWeight'] = maxWeight;
      if (maxPrice != null) queryParams['maxPrice'] = maxPrice;

      final response = await _apiService.get('/packages/search', queryParameters: queryParams);
      return (response.data as List).map((json) => Package.fromJson(json)).toList();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return [];
    }
  }

  Future<bool> assignPackageToTrip(String packageId, String tripId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.post('/packages/$packageId/assign', data: {'tripId': tripId});

      // Update local package status
      final index = _packages.indexWhere((p) => p.id == packageId);
      if (index != -1) {
        _packages[index] = _packages[index].copyWith(status: 'assigned');
      }

      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
