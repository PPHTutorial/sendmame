import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: const Color(0xFF008080), 
      scaffoldBackgroundColor: const Color(0xFFF8FAFC),
      fontFamily: GoogleFonts.poppins().fontFamily,
      
      colorScheme: const ColorScheme.light(
        primary: Color(0xFF008080), // Modern teal
        secondary: Color(0xFF006666), // Dark green
        surface: Colors.white,        
        error: Color(0xFFEF4444),
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: Color(0xFF1E3B35),
        onError: Colors.white,
      ),
      
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1E293B),
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: const Color(0xFF1E293B),
        ),
      ),
      
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF06D4A0),
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: TextStyle(
            fontFamily: GoogleFonts.poppins().fontFamily,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: const Color(0xFF92B6BD),
          side: const BorderSide(color: Color(0xFF92B6BD), width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: TextStyle(
            fontFamily: GoogleFonts.poppins().fontFamily,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0), width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0), width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF92B6BD), width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE53E3E), width: 1),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE53E3E), width: 2),
        ),
        labelStyle: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Color(0xFF718096),
        ),
        hintStyle: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: Color(0xFFA0AEC0),
        ),
      ),
      
      cardTheme: const CardThemeData(
        color: Colors.white,
        elevation: 4,
        shadowColor: Color(0xFF000000),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
      ),
      
      textTheme:  TextTheme(
        headlineLarge: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 32,
          fontWeight: FontWeight.w700,
          color: Color(0xFF1E293B),
        ),
        headlineMedium: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: Color(0xFF1E293B),
        ),
        headlineSmall: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: Color(0xFF1E293B),
        ),
        titleLarge: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: Color(0xFF1E293B),
        ),
        titleMedium: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: Color(0xFF1E293B),
        ),
        titleSmall: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Color(0xFF1E293B),
        ),
        bodyLarge: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: Color(0xFF1E293B),
        ),
        bodyMedium: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: Color(0xFF475569),
        ),
        bodySmall: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: Color(0xFF64748B),
        ),
        labelLarge: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Color(0xFF1E293B),
        ),
        labelMedium: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: Color(0xFF64748B),
        ),
        labelSmall: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: Color(0xFF94A3B8),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return lightTheme.copyWith(
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: Color(0xFF92B6BD),
        secondary: Color(0xFF10B981),
        surface: Color(0xFF0F172A),
        error: Color(0xFFEF4444),
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: Color(0xFFF8FAFC),
        onError: Color(0xFF0F172A),
      ),
      
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF0F2A23),
        foregroundColor: Color(0xFFF8FAFC),
        elevation: 0,
        centerTitle: true,
      ),
      
      cardTheme: const CardThemeData(
        color: Color(0xFF0F172A),
        elevation: 4,
        shadowColor: Color(0xFF000000),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
      ),
      
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF1E293B),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF334155), width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF334155), width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF92B6BD), width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFEF4444), width: 2),
        ),
        labelStyle: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Color(0xFF94A3B8),
        ),
        hintStyle: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: Color(0xFF64748B),
        ),
      ),
      
      textTheme:  TextTheme(
        headlineLarge: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 32,
          fontWeight: FontWeight.w700,
          color: Color(0xFFF8FAFC),
        ),
        headlineMedium: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: Color(0xFFF8FAFC),
        ),
        headlineSmall: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: Color(0xFFF8FAFC),
        ),
        titleLarge: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: Color(0xFFF8FAFC),
        ),
        titleMedium: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: Color(0xFFF8FAFC),
        ),
        titleSmall: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Color(0xFFF8FAFC),
        ),
        bodyLarge: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: Color(0xFFF8FAFC),
        ),
        bodyMedium: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: Color(0xFFCBD5E1),
        ),
        bodySmall: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: Color(0xFF94A3B8),
        ),
        labelLarge: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Color(0xFFF8FAFC),
        ),
        labelMedium: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: Color(0xFFCBD5E1),
        ),
        labelSmall: TextStyle(
          fontFamily: GoogleFonts.poppins().fontFamily,
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: Color(0xFF94A3B8),
        ),
      ),
    );
  }
}