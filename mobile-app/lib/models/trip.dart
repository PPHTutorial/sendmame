import 'user.dart';

class Trip {
  final String id;
  final String userId;
  final Address originAddress;
  final Address destinationAddress;
  final DateTime departureDate;
  final DateTime arrivalDate;
  final String transportMode;
  final double maxWeight;
  final Dimensions maxDimensions;
  final List<String> packageTypes;
  final List<String> restrictions;
  final double? pricePerKg;
  final double minimumPrice;
  final double maximumPrice;
  final List<String> images;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final User? user;
  final String? title;
  final String? travelerId;

  Trip({
    required this.id,
    required this.userId,
    required this.originAddress,
    required this.destinationAddress,
    required this.departureDate,
    required this.arrivalDate,
    required this.transportMode,
    required this.maxWeight,
    required this.maxDimensions,
    required this.packageTypes,
    required this.restrictions,
    this.pricePerKg,
    required this.minimumPrice,
    required this.maximumPrice,
    required this.images,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.user,
    this.title,
    this.travelerId,
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    return Trip(
      id: json['id'] ?? '',
      userId: json['userId'] ?? json['travelerId'] ?? '',
      originAddress: Address.fromJson(json['originAddress'] ?? {}),
      destinationAddress: Address.fromJson(json['destinationAddress'] ?? {}),
      departureDate: DateTime.parse(json['departureDate'] ?? DateTime.now().toIso8601String()),
      arrivalDate: DateTime.parse(json['arrivalDate'] ?? DateTime.now().toIso8601String()),
      transportMode: json['transportMode'] ?? 'unknown',
      maxWeight: (json['maxWeight'] ?? 0).toDouble(),
      maxDimensions: Dimensions.fromJson(json['maxDimensions'] ?? {}),
      packageTypes: List<String>.from(json['packageTypes'] ?? []),
      restrictions: List<String>.from(json['restrictions'] ?? []),
      pricePerKg: json['pricePerKg']?.toDouble(),
      minimumPrice: (json['minimumPrice'] ?? 0).toDouble(),
      maximumPrice: (json['maximumPrice'] ?? 0).toDouble(),
      images: List<String>.from(json['images'] ?? []),
      status: json['status'] ?? 'unknown',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? json['createdAt'] ?? DateTime.now().toIso8601String()),
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      title: json['title'],
      travelerId: json['travelerId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'originAddress': originAddress.toJson(),
      'destinationAddress': destinationAddress.toJson(),
      'departureDate': departureDate.toIso8601String(),
      'arrivalDate': arrivalDate.toIso8601String(),
      'transportMode': transportMode,
      'maxWeight': maxWeight,
      'maxDimensions': maxDimensions.toJson(),
      'packageTypes': packageTypes,
      'restrictions': restrictions,
      'pricePerKg': pricePerKg,
      'minimumPrice': minimumPrice,
      'maximumPrice': maximumPrice,
      'images': images,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'user': user?.toJson(),
      'title': title,
      'travelerId': travelerId,
    };
  }
}

class Address {
  final String street;
  final String city;
  final String state;
  final String country;
  final String postalCode;
  final double latitude;
  final double longitude;

  Address({
    required this.street,
    required this.city,
    required this.state,
    required this.country,
    required this.postalCode,
    required this.latitude,
    required this.longitude,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      street: json['street'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      country: json['country'] ?? '',
      postalCode: json['postalCode'] ?? '',
      latitude: (json['latitude'] ?? 0).toDouble(),
      longitude: (json['longitude'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'street': street,
      'city': city,
      'state': state,
      'country': country,
      'postalCode': postalCode,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}

class Dimensions {
  final double length;
  final double width;
  final double height;

  Dimensions({
    required this.length,
    required this.width,
    required this.height,
  });

  factory Dimensions.fromJson(Map<String, dynamic> json) {
    return Dimensions(
      length: (json['length'] ?? 0).toDouble(),
      width: (json['width'] ?? 0).toDouble(),
      height: (json['height'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'length': length,
      'width': width,
      'height': height,
    };
  }
}