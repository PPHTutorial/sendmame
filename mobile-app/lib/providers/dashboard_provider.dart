import 'package:flutter/foundation.dart';
import '../models/dashboard_metrics.dart';
import '../services/api_service.dart';

class DashboardProvider extends ChangeNotifier {
  final ApiService _api;

  DashboardMetrics? _metrics;
  List<RecentActivity> _recentActivity = [];
  bool _isLoading = false;
  String? _error;

  DashboardProvider(this._api);

  DashboardMetrics? get metrics => _metrics;
  List<RecentActivity> get recentActivity => _recentActivity;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadDashboardData() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('DashboardProvider: Loading dashboard data...');
      final [metricsResponse, activityResponse] = await Future.wait([
        _api.get('/dashboard/metrics'),
        _api.get('/dashboard/activity'),
      ]);

      _metrics = DashboardMetrics.fromJson(metricsResponse.data);
      _recentActivity = (activityResponse.data as List)
          .map((item) => RecentActivity.fromJson(item))
          .toList();

      print('DashboardProvider: Successfully loaded dashboard data');
    } catch (e) {
      print('DashboardProvider: Error loading dashboard data: $e');
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshData() async {
    await loadDashboardData();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}