import 'package:amenade_mobile/screens/chat/chat_screen.dart';
import 'package:amenade_mobile/screens/notifications/notification_screen.dart';
import 'package:amenade_mobile/screens/packages/packages_screen.dart';
import 'package:amenade_mobile/screens/profile/profile_screen.dart';
import 'package:amenade_mobile/screens/settings/settings_screen.dart';
import 'package:amenade_mobile/screens/trips/trips_screen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/home/home_screen.dart';
import 'providers/auth_provider.dart';
import 'providers/trip_provider.dart';
import 'providers/package_provider.dart';
import 'providers/chat_provider.dart';
import 'providers/notification_provider.dart';
import 'providers/dashboard_provider.dart';
import 'services/api_service.dart';
import 'services/auth_service.dart';
import 'services/storage_service.dart';
import 'services/notification_service.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Initialize services
  final storage = StorageService();
  final api = ApiService(storage);
  final authService = AuthService(api, storage);
  final notificationService = NotificationService();
  
  // Initialize Firebase Messaging
  await notificationService.initialize();
  
  runApp(MyApp(
    storage: storage,
    api: api,
    authService: authService,
    notificationService: notificationService,
  ));
}

class MyApp extends StatelessWidget {
  final StorageService storage;
  final ApiService api;
  final AuthService authService;
  final NotificationService notificationService;

  const MyApp({
    Key? key,
    required this.storage,
    required this.api,
    required this.authService,
    required this.notificationService,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(authService, storage),
        ),
        ChangeNotifierProvider(
          create: (_) => TripProvider(api),
        ),
        ChangeNotifierProvider(
          create: (_) => PackageProvider(api),
        ),
        ChangeNotifierProvider(
          create: (_) => ChatProvider(api),
        ),
        ChangeNotifierProvider(
          create: (_) => NotificationProvider(api),
        ),
        ChangeNotifierProvider(
          create: (_) => DashboardProvider(api),
        ),
      ],
      child: MaterialApp(
        title: 'Amenade',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,

        home: const AuthWrapper(),
        routes: {
          '/login': (context) => const LoginScreen(),
          '/register': (context) => const RegisterScreen(),
          '/home': (context) => const HomeScreen(),
          '/profile': (context) => const ProfileScreen(),
          '/settings': (context) => const SettingsScreen(),
          '/chat': (context) => const ChatScreen(),
          '/trip': (context) => const TripsScreen(),
          '/package': (context) => const PackagesScreen(),
          '/notifications': (context) => const NotificationScreen(),
          // Add other routes as needed
        },
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        // Show loading while initializing or during auth operations
        if (!auth.isInitialized || auth.isLoading) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }
        
        if (auth.isLoggedIn) {
          return const HomeScreen();
        }
        
        return const LoginScreen();
      },
    );
  }
}