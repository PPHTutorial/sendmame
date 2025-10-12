import 'user.dart';
import 'package.dart';
import 'trip.dart';
import 'message.dart';

class Chat {
  final String id;
  final String type;
  final String? packageId;
  final String? tripId;
  final DateTime? lastMessageAt;
  final List<ChatParticipant> participants;
  final List<Message> messages;
  final Package? package;
  final Trip? trip;

  Chat({
    required this.id,
    required this.type,
    this.packageId,
    this.tripId,
    this.lastMessageAt,
    required this.participants,
    required this.messages,
    this.package,
    this.trip,
  });

  factory Chat.fromJson(Map<String, dynamic> json) {
    return Chat(
      id: json['id'],
      type: json['type'],
      packageId: json['packageId'],
      tripId: json['tripId'],
      lastMessageAt: json['lastMessageAt'] != null ? DateTime.parse(json['lastMessageAt']) : null,
      participants: (json['participants'] as List).map((p) => ChatParticipant.fromJson(p)).toList(),
      messages: (json['messages'] as List).map((m) => Message.fromJson(m)).toList(),
      package: json['package'] != null ? Package.fromJson(json['package']) : null,
      trip: json['trip'] != null ? Trip.fromJson(json['trip']) : null,
    );
  }

  Chat copyWith({
    String? id,
    String? type,
    String? packageId,
    String? tripId,
    DateTime? lastMessageAt,
    List<ChatParticipant>? participants,
    List<Message>? messages,
    Package? package,
    Trip? trip,
    Message? lastMessage,
    int? unreadCount,
    DateTime? updatedAt,
  }) {
    return Chat(
      id: id ?? this.id,
      type: type ?? this.type,
      packageId: packageId ?? this.packageId,
      tripId: tripId ?? this.tripId,
      lastMessageAt: lastMessageAt ?? this.lastMessageAt,
      participants: participants ?? this.participants,
      messages: messages ?? this.messages,
      package: package ?? this.package,
      trip: trip ?? this.trip,
    );
  }
}

class ChatParticipant {
  final String id;
  final String userId;
  final User user;
  final DateTime joinedAt;

  ChatParticipant({
    required this.id,
    required this.userId,
    required this.user,
    required this.joinedAt,
  });

  factory ChatParticipant.fromJson(Map<String, dynamic> json) {
    return ChatParticipant(
      id: json['id'],
      userId: json['userId'],
      user: User.fromJson(json['user']),
      joinedAt: DateTime.parse(json['joinedAt']),
    );
  }
}