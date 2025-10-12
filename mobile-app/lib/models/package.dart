import 'user.dart';
import 'trip.dart';

class Dimensions {
  final double width;
  final double height;
  final double length;
  final double weight;

  Dimensions({
    required this.width,
    required this.height,
    required this.length,
    required this.weight,
  });

  factory Dimensions.fromJson(Map<String, dynamic> json) {
    return Dimensions(
      width: (json['width'] ?? 0).toDouble(),
      height: (json['height'] ?? 0).toDouble(),
      length: (json['length'] ?? 0).toDouble(),
      weight: (json['weight'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'width': width,
      'height': height,
      'length': length,
      'weight': weight,
    };
  }
}

class Address {
  final String city;
  final String state;
  final String street;
  final String country;
  final String postalCode;
  final double? latitude;
  final double? longitude;

  Address({
    required this.city,
    required this.state,
    required this.street,
    required this.country,
    required this.postalCode,
    this.latitude,
    this.longitude,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      street: json['street'] ?? '',
      country: json['country'] ?? '',
      postalCode: json['postalCode'] ?? '',
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'city': city,
      'state': state,
      'street': street,
      'country': country,
      'postalCode': postalCode,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}

class Package {
  final String id;
  final String userId;
  final String? tripId;
  final String title;
  final String description;
  final String category;
  final double weight;
  final Dimensions dimensions;
  final Address pickupAddress;
  final Address deliveryAddress;
  final DateTime pickupDate;
  final DateTime deliveryDeadline;
  final double value;
  final List<String> images;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final User? user;
  final Trip? trip;

  Package({
    required this.id,
    required this.userId,
    this.tripId,
    required this.title,
    required this.description,
    required this.category,
    required this.weight,
    required this.dimensions,
    required this.pickupAddress,
    required this.deliveryAddress,
    required this.pickupDate,
    required this.deliveryDeadline,
    required this.value,
    required this.images,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.user,
    this.trip,
  });

  factory Package.fromJson(Map<String, dynamic> json) {
    return Package(
      id: json['id'] ?? '',
      userId: json['senderId'] ?? json['userId'] ?? '',
      tripId: json['tripId'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      weight: (json['weight'] ?? json['dimensions']?['weight'] ?? 0).toDouble(),
      dimensions: Dimensions.fromJson(json['dimensions'] ?? {}),
      pickupAddress: Address.fromJson(json['pickupAddress'] ?? {}),
      deliveryAddress: Address.fromJson(json['deliveryAddress'] ?? {}),
      pickupDate: json['pickupDate'] != null ? DateTime.parse(json['pickupDate']) : DateTime.now(),
      deliveryDeadline: json['deliveryDate'] != null ? DateTime.parse(json['deliveryDate']) : DateTime.now(),
      value: (json['value'] ?? 0).toDouble(),
      images: List<String>.from(json['images'] ?? []),
      status: json['status'] ?? 'POSTED',
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : DateTime.now(),
      user: json['sender'] != null ? User.fromJson(json['sender']) : null,
      trip: json['trip'] != null ? Trip.fromJson(json['trip']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'tripId': tripId,
      'title': title,
      'description': description,
      'category': category,
      'weight': weight,
      'dimensions': dimensions.toJson(),
      'pickupAddress': pickupAddress.toJson(),
      'deliveryAddress': deliveryAddress.toJson(),
      'pickupDate': pickupDate.toIso8601String(),
      'deliveryDeadline': deliveryDeadline.toIso8601String(),
      'value': value,
      'images': images,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'user': user?.toJson(),
      'trip': trip?.toJson(),
    };
  }

  Package copyWith({
    String? id,
    String? userId,
    String? tripId,
    String? title,
    String? description,
    String? category,
    double? weight,
    Dimensions? dimensions,
    Address? pickupAddress,
    Address? deliveryAddress,
    DateTime? pickupDate,
    DateTime? deliveryDeadline,
    double? value,
    List<String>? images,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
    User? user,
    Trip? trip,
  }) {
    return Package(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      tripId: tripId ?? this.tripId,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      weight: weight ?? this.weight,
      dimensions: dimensions ?? this.dimensions,
      pickupAddress: pickupAddress ?? this.pickupAddress,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      pickupDate: pickupDate ?? this.pickupDate,
      deliveryDeadline: deliveryDeadline ?? this.deliveryDeadline,
      value: value ?? this.value,
      images: images ?? this.images,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      user: user ?? this.user,
      trip: trip ?? this.trip,
    );
  }
}