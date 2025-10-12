import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// A comprehensive utility class for responsive design in Flutter
/// Provides responsive sizing for text, dimensions, and UI elements
/// across different screen sizes and orientations
class ResponsiveUtils {
  // Design reference dimensions (based on iPhone 6/7/8)
  static const double _designWidth = 375.0;
  static const double _designHeight = 667.0;

  // Breakpoints for different device categories
  static const double mobileBreakpoint = 480.0;
  static const double tabletBreakpoint = 768.0;
  static const double desktopBreakpoint = 1024.0;

  // Font size scaling factors
  static const double _minFontScale = 0.8;
  static const double _maxFontScale = 1.2;

  /// Get the current screen size information
  static Size getScreenSize(BuildContext context) {
    return MediaQuery.of(context).size;
  }

  /// Get the current device pixel ratio
  static double getDevicePixelRatio(BuildContext context) {
    return MediaQuery.of(context).devicePixelRatio;
  }

  /// Get the current text scale factor
  static double getTextScaleFactor(BuildContext context) {
    return MediaQuery.of(context).textScaleFactor.clamp(_minFontScale, _maxFontScale);
  }

  /// Get the current orientation
  static Orientation getOrientation(BuildContext context) {
    return MediaQuery.of(context).orientation;
  }

  /// Calculate width scale factor based on design reference
  static double _getWidthScale(BuildContext context) {
    final screenWidth = getScreenSize(context).width;
    return screenWidth / _designWidth;
  }

  /// Calculate height scale factor based on design reference
  static double _getHeightScale(BuildContext context) {
    final screenHeight = getScreenSize(context).height;
    return screenHeight / _designHeight;
  }

  /// Get adaptive scale factor (average of width and height scales)
  static double _getAdaptiveScale(BuildContext context) {
    final widthScale = _getWidthScale(context);
    final heightScale = _getHeightScale(context);
    return (widthScale + heightScale) / 2;
  }

  /// Determine device category based on screen width
  static DeviceCategory getDeviceCategory(BuildContext context) {
    final screenWidth = getScreenSize(context).width;

    if (screenWidth < mobileBreakpoint) {
      return DeviceCategory.mobile;
    } else if (screenWidth < tabletBreakpoint) {
      return DeviceCategory.tablet;
    } else if (screenWidth < desktopBreakpoint) {
      return DeviceCategory.desktop;
    } else {
      return DeviceCategory.largeDesktop;
    }
  }

  /// Check if device is in landscape orientation
  static bool isLandscape(BuildContext context) {
    return getOrientation(context) == Orientation.landscape;
  }

  /// Check if device is in portrait orientation
  static bool isPortrait(BuildContext context) {
    return getOrientation(context) == Orientation.portrait;
  }

  // ===========================================================================
  // RESPONSIVE FONT SIZING
  // ===========================================================================

  /// Get responsive font size based on design reference
  /// [fontSize] is the font size from design (e.g., 16.0)
  static double responsiveFontSize(BuildContext context, double fontSize) {
    final scale = _getAdaptiveScale(context);
    final textScale = getTextScaleFactor(context);

    // Apply adaptive scaling with text scale factor
    double responsiveSize = fontSize * scale * textScale;

    // Ensure minimum readable size
    responsiveSize = responsiveSize.clamp(10.0, 72.0);

    return responsiveSize;
  }

  /// Get responsive font size with category-based adjustments
  static double responsiveFontSizeWithCategory(BuildContext context, double fontSize) {
    final category = getDeviceCategory(context);
    final baseSize = responsiveFontSize(context, fontSize);

    // Adjust based on device category
    switch (category) {
      case DeviceCategory.mobile:
        return baseSize * 1.0;
      case DeviceCategory.tablet:
        return baseSize * 1.1;
      case DeviceCategory.desktop:
        return baseSize * 1.2;
      case DeviceCategory.largeDesktop:
        return baseSize * 1.3;
    }
  }

  /// Get responsive text style
  static TextStyle responsiveTextStyle(
    BuildContext context, {
    double fontSize = 14.0,
    FontWeight fontWeight = FontWeight.normal,
    Color? color,
    double? height,
    double? letterSpacing,
    TextDecoration? decoration,
  }) {
    return TextStyle(
      fontSize: responsiveFontSize(context, fontSize),
      fontWeight: fontWeight,
      color: color,
      height: height,
      letterSpacing: letterSpacing,
      decoration: decoration,
      fontFamily: GoogleFonts.poppins().fontFamily, 
    );
  }

  // ===========================================================================
  // RESPONSIVE DIMENSION SIZING
  // ===========================================================================

  /// Get responsive width based on screen width percentage
  static double responsiveWidth(BuildContext context, double percentage) {
    final screenWidth = getScreenSize(context).width;
    return screenWidth * (percentage / 100);
  }

  /// Get responsive height based on screen height percentage
  static double responsiveHeight(BuildContext context, double percentage) {
    final screenHeight = getScreenSize(context).height;
    return screenHeight * (percentage / 100);
  }

  /// Get responsive size based on design reference dimension
  static double responsiveSize(BuildContext context, double size) {
    final scale = _getAdaptiveScale(context);
    return size * scale;
  }

  /// Get responsive width based on design reference
  static double responsiveWidthFromDesign(BuildContext context, double designWidth) {
    final widthScale = _getWidthScale(context);
    return designWidth * widthScale;
  }

  /// Get responsive height based on design reference
  static double responsiveHeightFromDesign(BuildContext context, double designHeight) {
    final heightScale = _getHeightScale(context);
    return designHeight * heightScale;
  }

  // ===========================================================================
  // RESPONSIVE SPACING AND PADDING
  // ===========================================================================

  /// Get responsive padding
  static EdgeInsets responsivePadding(
    BuildContext context, {
    double left = 0,
    double top = 0,
    double right = 0,
    double bottom = 0,
  }) {
    return EdgeInsets.only(
      left: responsiveSize(context, left),
      top: responsiveSize(context, top),
      right: responsiveSize(context, right),
      bottom: responsiveSize(context, bottom),
    );
  }

  /// Get responsive symmetric padding
  static EdgeInsets responsiveSymmetricPadding(
    BuildContext context, {
    double horizontal = 0,
    double vertical = 0,
  }) {
    return EdgeInsets.symmetric(
      horizontal: responsiveSize(context, horizontal),
      vertical: responsiveSize(context, vertical),
    );
  }

  /// Get responsive all padding
  static EdgeInsets responsiveAllPadding(BuildContext context, double padding) {
    return EdgeInsets.all(responsiveSize(context, padding));
  }

  /// Get responsive margin
  static EdgeInsets responsiveMargin(
    BuildContext context, {
    double left = 0,
    double top = 0,
    double right = 0,
    double bottom = 0,
  }) {
    return EdgeInsets.only(
      left: responsiveSize(context, left),
      top: responsiveSize(context, top),
      right: responsiveSize(context, right),
      bottom: responsiveSize(context, bottom),
    );
  }

  // ===========================================================================
  // RESPONSIVE BORDER RADIUS
  // ===========================================================================

  /// Get responsive border radius
  static BorderRadius responsiveBorderRadius(BuildContext context, double radius) {
    return BorderRadius.circular(responsiveSize(context, radius));
  }

  /// Get responsive border radius with different corners
  static BorderRadius responsiveBorderRadiusOnly(
    BuildContext context, {
    double topLeft = 0,
    double topRight = 0,
    double bottomLeft = 0,
    double bottomRight = 0,
  }) {
    return BorderRadius.only(
      topLeft: Radius.circular(responsiveSize(context, topLeft)),
      topRight: Radius.circular(responsiveSize(context, topRight)),
      bottomLeft: Radius.circular(responsiveSize(context, bottomLeft)),
      bottomRight: Radius.circular(responsiveSize(context, bottomRight)),
    );
  }

  // ===========================================================================
  // RESPONSIVE BOX SHADOWS
  // ===========================================================================

  /// Get responsive box shadow
  static BoxShadow responsiveBoxShadow(
    BuildContext context, {
    Color color = Colors.black26,
    double blurRadius = 8.0,
    Offset offset = Offset.zero,
    double spreadRadius = 0.0,
  }) {
    return BoxShadow(
      color: color,
      blurRadius: responsiveSize(context, blurRadius),
      offset: Offset(
        responsiveSize(context, offset.dx),
        responsiveSize(context, offset.dy),
      ),
      spreadRadius: responsiveSize(context, spreadRadius),
    );
  }

  /// Get responsive box shadow list
  static List<BoxShadow> responsiveBoxShadows(
    BuildContext context, [
    BoxShadow shadow1 = const BoxShadow(
      color: Colors.black26,
      blurRadius: 8.0,
    ),
    BoxShadow? shadow2,
    BoxShadow? shadow3,
  ]) {
    final shadows = <BoxShadow>[];

    shadows.add(responsiveBoxShadow(
      context,
      color: shadow1.color,
      blurRadius: shadow1.blurRadius,
      offset: shadow1.offset,
      spreadRadius: shadow1.spreadRadius,
    ));

    if (shadow2 != null) {
      shadows.add(responsiveBoxShadow(
        context,
        color: shadow2.color,
        blurRadius: shadow2.blurRadius,
        offset: shadow2.offset,
        spreadRadius: shadow2.spreadRadius,
      ));
    }

    if (shadow3 != null) {
      shadows.add(responsiveBoxShadow(
        context,
        color: shadow3.color,
        blurRadius: shadow3.blurRadius,
        offset: shadow3.offset,
        spreadRadius: shadow3.spreadRadius,
      ));
    }

    return shadows;
  }

  // ===========================================================================
  // RESPONSIVE ICON SIZES
  // ===========================================================================

  /// Get responsive icon size
  static double responsiveIconSize(BuildContext context, double size) {
    return responsiveSize(context, size);
  }

  // ===========================================================================
  // RESPONSIVE BUTTON SIZES
  // ===========================================================================

  /// Get responsive button height
  static double responsiveButtonHeight(BuildContext context, double height) {
    return responsiveSize(context, height);
  }

  /// Get responsive button padding
  static EdgeInsets responsiveButtonPadding(BuildContext context, {
    double horizontal = 24.0,
    double vertical = 12.0,
  }) {
    return EdgeInsets.symmetric(
      horizontal: responsiveSize(context, horizontal),
      vertical: responsiveSize(context, vertical),
    );
  }

  // ===========================================================================
  // RESPONSIVE CARD SIZES
  // ===========================================================================

  /// Get responsive card padding
  static EdgeInsets responsiveCardPadding(BuildContext context, {
    double horizontal = 16.0,
    double vertical = 16.0,
  }) {
    return EdgeInsets.symmetric(
      horizontal: responsiveSize(context, horizontal),
      vertical: responsiveSize(context, vertical),
    );
  }

  /// Get responsive card margin
  static EdgeInsets responsiveCardMargin(BuildContext context, {
    double horizontal = 8.0,
    double vertical = 8.0,
  }) {
    return EdgeInsets.symmetric(
      horizontal: responsiveSize(context, horizontal),
      vertical: responsiveSize(context, vertical),
    );
  }

  // ===========================================================================
  // RESPONSIVE IMAGE SIZES
  // ===========================================================================

  /// Get responsive image width
  static double responsiveImageWidth(BuildContext context, double width) {
    return responsiveWidthFromDesign(context, width);
  }

  /// Get responsive image height
  static double responsiveImageHeight(BuildContext context, double height) {
    return responsiveHeightFromDesign(context, height);
  }

  // ===========================================================================
  // RESPONSIVE LAYOUT HELPERS
  // ===========================================================================

  /// Get responsive max width for content containers
  static double responsiveMaxWidth(BuildContext context, {
    double maxWidth = 600.0,
  }) {
    final screenWidth = getScreenSize(context).width;
    final category = getDeviceCategory(context);

    switch (category) {
      case DeviceCategory.mobile:
        return screenWidth * 0.9;
      case DeviceCategory.tablet:
        return screenWidth * 0.8;
      case DeviceCategory.desktop:
        return maxWidth;
      case DeviceCategory.largeDesktop:
        return maxWidth * 1.2;
    }
  }

  /// Get responsive grid spacing
  static double responsiveGridSpacing(BuildContext context, double spacing) {
    final category = getDeviceCategory(context);

    switch (category) {
      case DeviceCategory.mobile:
        return responsiveSize(context, spacing);
      case DeviceCategory.tablet:
        return responsiveSize(context, spacing * 1.2);
      case DeviceCategory.desktop:
        return responsiveSize(context, spacing * 1.5);
      case DeviceCategory.largeDesktop:
        return responsiveSize(context, spacing * 1.8);
    }
  }

  /// Get responsive list item height
  static double responsiveListItemHeight(BuildContext context, double height) {
    return responsiveSize(context, height);
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /// Get screen info for debugging
  static Map<String, dynamic> getScreenInfo(BuildContext context) {
    final size = getScreenSize(context);
    final category = getDeviceCategory(context);
    final orientation = getOrientation(context);

    return {
      'width': size.width,
      'height': size.height,
      'aspectRatio': size.aspectRatio,
      'devicePixelRatio': getDevicePixelRatio(context),
      'textScaleFactor': getTextScaleFactor(context),
      'orientation': orientation.toString(),
      'category': category.toString(),
      'widthScale': _getWidthScale(context),
      'heightScale': _getHeightScale(context),
      'adaptiveScale': _getAdaptiveScale(context),
    };
  }

  /// Check if device has small screen
  static bool isSmallScreen(BuildContext context) {
    final size = getScreenSize(context);
    return size.width < mobileBreakpoint || size.height < 600;
  }

  /// Check if device has large screen
  static bool isLargeScreen(BuildContext context) {
    final size = getScreenSize(context);
    return size.width >= tabletBreakpoint;
  }

  /// Get safe area padding
  static EdgeInsets getSafeAreaPadding(BuildContext context) {
    return MediaQuery.of(context).padding;
  }

  /// Get view padding (safe area + system UI)
  static EdgeInsets getViewPadding(BuildContext context) {
    return MediaQuery.of(context).viewPadding;
  }

  /// Get appropriate grid cross axis count based on screen size
  static int getGridCrossAxisCount(BuildContext context) {
    final screenWidth = ResponsiveUtils.getScreenSize(context).width;
    if (screenWidth >= ResponsiveUtils.desktopBreakpoint) {
      return 4;
    } else if (screenWidth >= ResponsiveUtils.tabletBreakpoint) {
      return 3;
    } else if (screenWidth >= ResponsiveUtils.mobileBreakpoint) {
      return 2;
    } else {
      return 1;
    }
  }
}

/// Device categories for responsive design
enum DeviceCategory {
  mobile,
  tablet,
  desktop,
  largeDesktop,
}

/// Extension methods for easier usage
extension ResponsiveExtensions on BuildContext {
  /// Get responsive font size
  double responsiveFontSize(double fontSize) {
    return ResponsiveUtils.responsiveFontSize(this, fontSize);
  }

  /// Get responsive size
  double responsiveSize(double size) {
    return ResponsiveUtils.responsiveSize(this, size);
  }

  /// Get responsive width percentage
  double responsiveWidth(double percentage) {
    return ResponsiveUtils.responsiveWidth(this, percentage);
  }

  /// Get responsive height percentage
  double responsiveHeight(double percentage) {
    return ResponsiveUtils.responsiveHeight(this, percentage);
  }

  /// Get device category
  DeviceCategory get deviceCategory {
    return ResponsiveUtils.getDeviceCategory(this);
  }

  /// Check if landscape
  bool get isLandscape {
    return ResponsiveUtils.isLandscape(this);
  }

  /// Check if portrait
  bool get isPortrait {
    return ResponsiveUtils.isPortrait(this);
  }

  /// Check if small screen
  bool get isSmallScreen {
    return ResponsiveUtils.isSmallScreen(this);
  }

  /// Check if large screen
  bool get isLargeScreen {
    return ResponsiveUtils.isLargeScreen(this);
  }
}

/// Extension for numbers to easily convert to responsive values
extension ResponsiveNumberExtensions on num {
  /// Convert to responsive font size
  double responsiveFontSize(BuildContext context) {
    return ResponsiveUtils.responsiveFontSize(context, toDouble());
  }

  /// Convert to responsive size
  double responsiveSize(BuildContext context) {
    return ResponsiveUtils.responsiveSize(context, toDouble());
  }

  /// Convert to responsive width percentage
  double responsiveWidth(BuildContext context) {
    return ResponsiveUtils.responsiveWidth(context, toDouble());
  }

  /// Convert to responsive height percentage
  double responsiveHeight(BuildContext context) {
    return ResponsiveUtils.responsiveHeight(context, toDouble());
  }
}