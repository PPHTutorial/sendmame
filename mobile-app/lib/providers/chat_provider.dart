import 'package:flutter/foundation.dart';
import '../models/chat.dart';
import '../models/message.dart';
import '../services/api_service.dart';

class ChatProvider with ChangeNotifier {
  final ApiService _apiService;

  ChatProvider(this._apiService);

  List<Chat> _chats = [];
  bool _isLoading = false;
  String? _error;

  List<Chat> get chats => _chats;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadChats() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/chats');
      _chats = (response.data as List)
          .map((json) => Chat.fromJson(json))
          .toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Chat?> getChat(String chatId) async {
    try {
      final response = await _apiService.get('/chats/$chatId');
      return Chat.fromJson(response.data);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<bool> createChat(String recipientId, {String? packageId, String? tripId}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = {
        'recipientId': recipientId,
        if (packageId != null) 'packageId': packageId,
        if (tripId != null) 'tripId': tripId,
      };

      final response = await _apiService.post('/chats', data: data);
      final newChat = Chat.fromJson(response.data);
      _chats.add(newChat);
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

  Future<bool> sendMessage(String chatId, String content, {String? messageType}) async {
    try {
      final data = {
        'content': content,
        if (messageType != null) 'messageType': messageType,
      };

      final response = await _apiService.post('/chats/$chatId/messages', data: data);
      final newMessage = Message.fromJson(response.data);

      // Update the chat with the new message
      final chatIndex = _chats.indexWhere((chat) => chat.id == chatId);
      if (chatIndex != -1) {
        _chats[chatIndex].messages.add(newMessage);
        _chats[chatIndex] = _chats[chatIndex].copyWith(
          lastMessage: newMessage,
          updatedAt: newMessage.createdAt,
        );
        notifyListeners();
      }

      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<List<Message>> loadMessages(String chatId, {int page = 1, int limit = 50}) async {
    try {
      final response = await _apiService.get(
        '/chats/$chatId/messages',
        queryParameters: {'page': page, 'limit': limit},
      );
      return (response.data as List)
          .map((json) => Message.fromJson(json))
          .toList();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return [];
    }
  }

  Future<bool> markChatAsRead(String chatId) async {
    try {
      await _apiService.put('/chats/$chatId/read', data: {});

      // Update local chat
      final chatIndex = _chats.indexWhere((chat) => chat.id == chatId);
      if (chatIndex != -1) {
        _chats[chatIndex] = _chats[chatIndex].copyWith(unreadCount: 0);
        notifyListeners();
      }

      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteChat(String chatId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.delete('/chats/$chatId');
      _chats.removeWhere((chat) => chat.id == chatId);
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