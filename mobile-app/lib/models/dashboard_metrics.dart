class DashboardMetrics {
  final int totalUsers;
  final int activeUsers;
  final int totalTrips;
  final int activeTrips;
  final int totalPackages;
  final int activePackages;
  final double totalRevenue;
  final double monthlyRevenue;
  final int totalTransactions;
  final int pendingTransactions;
  final int totalMessages;
  final int unreadMessages;
  final int totalReviews;
  final double averageRating;
  final Map<String, dynamic> userGrowth;
  final Map<String, dynamic> revenueGrowth;
  final Map<String, dynamic> tripGrowth;
  final Map<String, dynamic> packageGrowth;

  DashboardMetrics({
    required this.totalUsers,
    required this.activeUsers,
    required this.totalTrips,
    required this.activeTrips,
    required this.totalPackages,
    required this.activePackages,
    required this.totalRevenue,
    required this.monthlyRevenue,
    required this.totalTransactions,
    required this.pendingTransactions,
    required this.totalMessages,
    required this.unreadMessages,
    required this.totalReviews,
    required this.averageRating,
    required this.userGrowth,
    required this.revenueGrowth,
    required this.tripGrowth,
    required this.packageGrowth,
  });

  factory DashboardMetrics.fromJson(Map<String, dynamic> json) {
    return DashboardMetrics(
      totalUsers: json['totalUsers'] ?? 0,
      activeUsers: json['activeUsers'] ?? 0,
      totalTrips: json['totalTrips'] ?? 0,
      activeTrips: json['activeTrips'] ?? 0,
      totalPackages: json['totalPackages'] ?? 0,
      activePackages: json['activePackages'] ?? 0,
      totalRevenue: (json['totalRevenue'] ?? 0).toDouble(),
      monthlyRevenue: (json['monthlyRevenue'] ?? 0).toDouble(),
      totalTransactions: json['totalTransactions'] ?? 0,
      pendingTransactions: json['pendingTransactions'] ?? 0,
      totalMessages: json['totalMessages'] ?? 0,
      unreadMessages: json['unreadMessages'] ?? 0,
      totalReviews: json['totalReviews'] ?? 0,
      averageRating: (json['averageRating'] ?? 0).toDouble(),
      userGrowth: json['userGrowth'] ?? {},
      revenueGrowth: json['revenueGrowth'] ?? {},
      tripGrowth: json['tripGrowth'] ?? {},
      packageGrowth: json['packageGrowth'] ?? {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalUsers': totalUsers,
      'activeUsers': activeUsers,
      'totalTrips': totalTrips,
      'activeTrips': activeTrips,
      'totalPackages': totalPackages,
      'activePackages': activePackages,
      'totalRevenue': totalRevenue,
      'monthlyRevenue': monthlyRevenue,
      'totalTransactions': totalTransactions,
      'pendingTransactions': pendingTransactions,
      'totalMessages': totalMessages,
      'unreadMessages': unreadMessages,
      'totalReviews': totalReviews,
      'averageRating': averageRating,
      'userGrowth': userGrowth,
      'revenueGrowth': revenueGrowth,
      'tripGrowth': tripGrowth,
      'packageGrowth': packageGrowth,
    };
  }
}

class RecentActivity {
  final String id;
  final String type; // 'user', 'package', 'trip', 'transaction'
  final String title;
  final String subtitle;
  final DateTime timestamp;
  final Map<String, dynamic> data;

  RecentActivity({
    required this.id,
    required this.type,
    required this.title,
    required this.subtitle,
    required this.timestamp,
    required this.data,
  });

  factory RecentActivity.fromJson(Map<String, dynamic> json) {
    return RecentActivity(
      id: json['id'],
      type: json['type'],
      title: json['title'],
      subtitle: json['subtitle'],
      timestamp: DateTime.parse(json['timestamp']),
      data: json['data'] ?? {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'title': title,
      'subtitle': subtitle,
      'timestamp': timestamp.toIso8601String(),
      'data': data,
    };
  }
}