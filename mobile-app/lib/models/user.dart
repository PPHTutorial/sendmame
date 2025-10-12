// Enums matching Prisma schema
enum UserRole {
  SENDER,
  TRAVELER,
  ADMIN,
}

enum VerificationStatus {
  PENDING,
  VERIFIED,
  REJECTED,
}

class User {
  final String id;
  final String email;
  final String? phone;
  final String? password;
  final String firstName;
  final String lastName;
  final String? otherName;
  final String? username;
  final String? avatar;
  final DateTime? dateOfBirth;
  final UserRole role;
  final bool isActive;
  final bool isVerified;
  final bool isPhoneVerified;
  final bool isEmailVerified;
  final bool isIDVerified;
  final bool isFacialVerified;
  final bool isAddressVerified;
  final VerificationStatus verificationStatus;
  final bool twoFactorEnabled;
  final DateTime? lastLoginAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  // Subscription information
  final String? subscriptionTier;
  final String? subscriptionStatus;
  final String? stripeCustomerId;
  final String? subscriptionId;
  final DateTime? lastPaymentDate;

  // Legacy fields for backward compatibility
  final String? bio;
  final double? totalEarnings;

  User({
    required this.id,
    required this.email,
    this.phone,
    this.password,
    required this.firstName,
    required this.lastName,
    this.otherName,
    this.username,
    this.avatar,
    this.dateOfBirth,
    this.role = UserRole.SENDER,
    this.isActive = true,
    this.isVerified = false,
    this.isPhoneVerified = false,
    this.isEmailVerified = false,
    this.isIDVerified = false,
    this.isFacialVerified = false,
    this.isAddressVerified = false,
    this.verificationStatus = VerificationStatus.PENDING,
    this.twoFactorEnabled = false,
    this.lastLoginAt,
    required this.createdAt,
    required this.updatedAt,
    this.subscriptionTier,
    this.subscriptionStatus,
    this.stripeCustomerId,
    this.subscriptionId,
    this.lastPaymentDate,
    // Legacy fields
    this.bio,
    this.totalEarnings,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      password: json['password'],
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      otherName: json['otherName'],
      username: json['username'],
      avatar: json['avatar'],
      dateOfBirth: json['dateOfBirth'] != null ? DateTime.parse(json['dateOfBirth']) : null,
      role: UserRole.values.firstWhere(
        (e) => e.name == json['role'],
        orElse: () => UserRole.SENDER,
      ),
      isActive: json['isActive'] ?? true,
      isVerified: json['isVerified'] ?? false,
      isPhoneVerified: json['isPhoneVerified'] ?? false,
      isEmailVerified: json['isEmailVerified'] ?? false,
      isIDVerified: json['isIDVerified'] ?? false,
      isFacialVerified: json['isFacialVerified'] ?? false,
      isAddressVerified: json['isAddressVerified'] ?? false,
      verificationStatus: VerificationStatus.values.firstWhere(
        (e) => e.name == json['verificationStatus'],
        orElse: () => VerificationStatus.PENDING,
      ),
      twoFactorEnabled: json['twoFactorEnabled'] ?? false,
      lastLoginAt: json['lastLoginAt'] != null ? DateTime.parse(json['lastLoginAt']) : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      subscriptionTier: json['subscriptionTier'],
      subscriptionStatus: json['subscriptionStatus'],
      stripeCustomerId: json['stripeCustomerId'],
      subscriptionId: json['subscriptionId'],
      lastPaymentDate: json['lastPaymentDate'] != null ? DateTime.parse(json['lastPaymentDate']) : null,
      // Legacy fields
      bio: json['bio'],
      totalEarnings: json['totalEarnings']?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'phone': phone,
      'password': password,
      'firstName': firstName,
      'lastName': lastName,
      'otherName': otherName,
      'username': username,
      'avatar': avatar,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'role': role.name,
      'isActive': isActive,
      'isVerified': isVerified,
      'isPhoneVerified': isPhoneVerified,
      'isEmailVerified': isEmailVerified,
      'isIDVerified': isIDVerified,
      'isFacialVerified': isFacialVerified,
      'isAddressVerified': isAddressVerified,
      'verificationStatus': verificationStatus.name,
      'twoFactorEnabled': twoFactorEnabled,
      'lastLoginAt': lastLoginAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'subscriptionTier': subscriptionTier,
      'subscriptionStatus': subscriptionStatus,
      'stripeCustomerId': stripeCustomerId,
      'subscriptionId': subscriptionId,
      'lastPaymentDate': lastPaymentDate?.toIso8601String(),
      // Legacy fields
      'bio': bio,
      'totalEarnings': totalEarnings,
    };
  }

  String get fullName => '$firstName $lastName';
  String get name => fullName;

  // Display name with other name if available
  String get displayName {
    if (otherName != null && otherName!.isNotEmpty) {
      return '$firstName $otherName $lastName';
    }
    return fullName;
  }

  // Check if user has completed basic verification
  bool get isBasicVerified => isEmailVerified && isPhoneVerified;

  // Check if user has completed full verification
  bool get isFullyVerified => isBasicVerified && isIDVerified && isFacialVerified && isAddressVerified;

  // Get verification progress (0.0 to 1.0)
  double get verificationProgress {
    int verifiedCount = 0;
    if (isEmailVerified) verifiedCount++;
    if (isPhoneVerified) verifiedCount++;
    if (isIDVerified) verifiedCount++;
    if (isFacialVerified) verifiedCount++;
    if (isAddressVerified) verifiedCount++;
    return verifiedCount / 5.0;
  }

  // Check if user is premium/active subscriber
  bool get isPremium => subscriptionTier != null && subscriptionTier != 'FREE' && subscriptionStatus == 'ACTIVE';

  // Get user initials for avatar fallback
  String get initials {
    final first = firstName.isNotEmpty ? firstName[0].toUpperCase() : '';
    final last = lastName.isNotEmpty ? lastName[0].toUpperCase() : '';
    return '$first$last';
  }

  // Check if user can send packages (based on role and verification)
  bool get canSendPackages => role == UserRole.SENDER || role == UserRole.ADMIN;

  // Check if user can travel with packages (based on role and verification)
  bool get canTravel => role == UserRole.TRAVELER || role == UserRole.ADMIN;

  User copyWith({
    String? id,
    String? email,
    String? phone,
    String? password,
    String? firstName,
    String? lastName,
    String? otherName,
    String? username,
    String? avatar,
    DateTime? dateOfBirth,
    UserRole? role,
    bool? isActive,
    bool? isVerified,
    bool? isPhoneVerified,
    bool? isEmailVerified,
    bool? isIDVerified,
    bool? isFacialVerified,
    bool? isAddressVerified,
    VerificationStatus? verificationStatus,
    bool? twoFactorEnabled,
    DateTime? lastLoginAt,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? subscriptionTier,
    String? subscriptionStatus,
    String? stripeCustomerId,
    String? subscriptionId,
    DateTime? lastPaymentDate,
    // Legacy fields
    String? bio,
    double? totalEarnings,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      password: password ?? this.password,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      otherName: otherName ?? this.otherName,
      username: username ?? this.username,
      avatar: avatar ?? this.avatar,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      role: role ?? this.role,
      isActive: isActive ?? this.isActive,
      isVerified: isVerified ?? this.isVerified,
      isPhoneVerified: isPhoneVerified ?? this.isPhoneVerified,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
      isIDVerified: isIDVerified ?? this.isIDVerified,
      isFacialVerified: isFacialVerified ?? this.isFacialVerified,
      isAddressVerified: isAddressVerified ?? this.isAddressVerified,
      verificationStatus: verificationStatus ?? this.verificationStatus,
      twoFactorEnabled: twoFactorEnabled ?? this.twoFactorEnabled,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      subscriptionTier: subscriptionTier ?? this.subscriptionTier,
      subscriptionStatus: subscriptionStatus ?? this.subscriptionStatus,
      stripeCustomerId: stripeCustomerId ?? this.stripeCustomerId,
      subscriptionId: subscriptionId ?? this.subscriptionId,
      lastPaymentDate: lastPaymentDate ?? this.lastPaymentDate,
      // Legacy fields
      bio: bio ?? this.bio,
      totalEarnings: totalEarnings ?? this.totalEarnings,
    );
  }
}