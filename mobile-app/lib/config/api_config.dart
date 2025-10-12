class ApiConfig {
  static const String baseUrl = 'http://192.168.100.20:3000/api';

  // Authentication endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh';
  static const String sendPhoneVerification = '/auth/send-phone-verification';
  static const String verifyPhone = '/auth/verify-phone';

  // User endpoints
  static const String userProfile = '/users/profile';
  static const String updateProfile = '/users/profile';

  // Trip endpoints
  static const String trips = '/trips';
  static const String createTrip = '/trips';
  static const String userTrips = '/trips/my-trips';

  // Package endpoints
  static const String packages = '/packages';
  static const String createPackage = '/packages';
  static const String userPackages = '/packages/my-packages';

  // Chat endpoints
  static const String chats = '/chats';
  static const String messages = '/messages';

  // Notification endpoints
  static const String notifications = '/notifications';

  // Payment endpoints
  static const String paymentMethods = '/payments/methods';
  static const String createPaymentIntent = '/payments/create-intent';

  // Timeout configurations
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}