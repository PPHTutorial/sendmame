import 'package:flutter/foundation.dart';
import '../models/trip.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';

class TripProvider extends ChangeNotifier {
  final ApiService _api;

  List<Trip> _trips = [];
  List<Trip> _userTrips = [];
  bool _isLoading = false;
  String? _error;

  TripProvider(this._api);

  List<Trip> get trips => _trips;
  List<Trip> get userTrips => _userTrips;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchTrips({Map<String, dynamic>? filters}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('TripProvider: Fetching trips...');
      final response = await _api.get(ApiConfig.trips, queryParameters: filters);
      print('TripProvider: Received response: ${response.data}');
      final responseData = response.data as Map<String, dynamic>;
      final tripsData = responseData['data'] as List;
      print('TripProvider: Received response with ${tripsData.length} items');
      _trips = tripsData.map((t) => Trip.fromJson(t)).toList();
      print('TripProvider: Successfully parsed ${_trips.length} trips');
    } catch (e) {
      print('TripProvider: Error fetching trips: $e');
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchUserTrips() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      print('TripProvider: Fetching user trips...');
      final response = await _api.get(ApiConfig.trips, queryParameters: {});
      print('TripProvider: Received response: ${response.data}');
      final responseData = response.data as Map<String, dynamic>;
      final tripsData = responseData['data'] as List;
      print('TripProvider: Received response with ${tripsData.length} items');
      _userTrips = tripsData.map((t) => Trip.fromJson(t)).toList();
      print('TripProvider: Successfully parsed ${_userTrips.length} user trips');
    } catch (e) {
      print('TripProvider: Error fetching user trips: $e');
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadTrips() async {
    await fetchTrips();
  }

  Future<Trip?> createTrip(Map<String, dynamic> tripData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.post(ApiConfig.createTrip, data: tripData);
      final newTrip = Trip.fromJson(response.data);
      
      _userTrips.insert(0, newTrip);
      _error = null;
      _isLoading = false;
      notifyListeners();
      return newTrip;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<bool> updateTrip(String tripId, Map<String, dynamic> tripData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.put('${ApiConfig.trips}/$tripId', data: tripData);
      final updatedTrip = Trip.fromJson(response.data);
      
      // Update in user trips list
      final index = _userTrips.indexWhere((t) => t.id == tripId);
      if (index != -1) {
        _userTrips[index] = updatedTrip;
      }
      
      // Update in general trips list
      final generalIndex = _trips.indexWhere((t) => t.id == tripId);
      if (generalIndex != -1) {
        _trips[generalIndex] = updatedTrip;
      }
      
      _error = null;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteTrip(String tripId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _api.delete('${ApiConfig.trips}/$tripId');
      
      _userTrips.removeWhere((t) => t.id == tripId);
      _trips.removeWhere((t) => t.id == tripId);
      
      _error = null;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}