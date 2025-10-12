class AppConstants {
  // App Info
  static const String appName = 'Amenade';
  static const String appVersion = '1.0.0';

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';

  // API Response Status
  static const String success = 'success';
  static const String error = 'error';

  // Chat Types
  static const String chatType = 'CHAT';
  static const String notificationType = 'NOTIFICATION';
  static const String supportType = 'SUPPORT';

  // Message Types
  static const String textMessage = 'text';
  static const String imageMessage = 'image';
  static const String fileMessage = 'file';
  static const String locationMessage = 'location';

  // Trip Status
  static const String tripActive = 'ACTIVE';
  static const String tripCompleted = 'COMPLETED';
  static const String tripCancelled = 'CANCELLED';

  // Package Status
  static const String packagePending = 'PENDING';
  static const String packageInTransit = 'IN_TRANSIT';
  static const String packageDelivered = 'DELIVERED';
  static const String packageCancelled = 'CANCELLED';

  // Payment Status
  static const String paymentPending = 'PENDING';
  static const String paymentCompleted = 'COMPLETED';
  static const String paymentFailed = 'FAILED';

  // Validation
  static const int minPasswordLength = 8;
  static const int maxPackageWeight = 30; // kg
  static const double maxPackagePrice = 500.0; // USD

  // UI Constants
  static const double borderRadius = 12.0;
  static const double paddingSmall = 8.0;
  static const double paddingMedium = 16.0;
  static const double paddingLarge = 24.0;
  static const double elevation = 4.0;

  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);
}