import 'package:flutter/material.dart';
import '../utils/responsive_utils.dart';

/// Example widget demonstrating how to use ResponsiveUtils
class ResponsiveExample extends StatelessWidget {
  const ResponsiveExample({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Responsive Design Example',
          style: ResponsiveUtils.responsiveTextStyle(
            context,
            fontSize: 18.0,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: ResponsiveUtils.responsiveAllPadding(context, 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Screen Info Card
            Card(
              margin: ResponsiveUtils.responsiveCardMargin(context),
              child: Padding(
                padding: ResponsiveUtils.responsiveCardPadding(context),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Screen Information',
                      style: ResponsiveUtils.responsiveTextStyle(
                        context,
                        fontSize: 20.0,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildInfoRow(context, 'Device Category',
                        ResponsiveUtils.getDeviceCategory(context).toString()),
                    _buildInfoRow(context, 'Orientation',
                        ResponsiveUtils.isLandscape(context) ? 'Landscape' : 'Portrait'),
                    _buildInfoRow(context, 'Screen Width',
                        '${ResponsiveUtils.getScreenSize(context).width.toStringAsFixed(1)} px'),
                    _buildInfoRow(context, 'Screen Height',
                        '${ResponsiveUtils.getScreenSize(context).height.toStringAsFixed(1)} px'),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Responsive Text Examples
            Text(
              'Responsive Text Examples',
              style: ResponsiveUtils.responsiveTextStyle(
                context,
                fontSize: 22.0,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 16),

            Container(
              padding: ResponsiveUtils.responsiveAllPadding(context, 16.0),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: ResponsiveUtils.responsiveBorderRadius(context, 12.0),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Headline Large (24px design)',
                    style: ResponsiveUtils.responsiveTextStyle(
                      context,
                      fontSize: 24.0,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue.shade800,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Body Text (16px design)',
                    style: ResponsiveUtils.responsiveTextStyle(
                      context,
                      fontSize: 16.0,
                      color: Colors.blue.shade600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Caption (12px design)',
                    style: ResponsiveUtils.responsiveTextStyle(
                      context,
                      fontSize: 12.0,
                      color: Colors.blue.shade500,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Responsive Spacing Examples
            Text(
              'Responsive Spacing Examples',
              style: ResponsiveUtils.responsiveTextStyle(
                context,
                fontSize: 22.0,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(
                  child: Container(
                    height: ResponsiveUtils.responsiveSize(context, 80.0),
                    margin: ResponsiveUtils.responsiveAllPadding(context, 8.0),
                    decoration: BoxDecoration(
                      color: Colors.green.shade100,
                      borderRadius: ResponsiveUtils.responsiveBorderRadius(context, 8.0),
                      boxShadow: ResponsiveUtils.responsiveBoxShadows(context),
                    ),
                    child: Center(
                      child: Text(
                        '80px\nDesign Height',
                        textAlign: TextAlign.center,
                        style: ResponsiveUtils.responsiveTextStyle(
                          context,
                          fontSize: 14.0,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: Container(
                    width: ResponsiveUtils.responsiveSize(context, 120.0),
                    height: ResponsiveUtils.responsiveSize(context, 60.0),
                    margin: ResponsiveUtils.responsiveAllPadding(context, 8.0),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade100,
                      borderRadius: ResponsiveUtils.responsiveBorderRadius(context, 12.0),
                      boxShadow: ResponsiveUtils.responsiveBoxShadows(context),
                    ),
                    child: Center(
                      child: Text(
                        '120x60px\nDesign Size',
                        textAlign: TextAlign.center,
                        style: ResponsiveUtils.responsiveTextStyle(
                          context,
                          fontSize: 12.0,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Responsive Button Examples
            Text(
              'Responsive Button Examples',
              style: ResponsiveUtils.responsiveTextStyle(
                context,
                fontSize: 22.0,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 16),

            ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                minimumSize: Size(
                  double.infinity,
                  ResponsiveUtils.responsiveButtonHeight(context, 48.0),
                ),
                padding: ResponsiveUtils.responsiveButtonPadding(context),
                shape: RoundedRectangleBorder(
                  borderRadius: ResponsiveUtils.responsiveBorderRadius(context, 12.0),
                ),
              ),
              child: Text(
                'Responsive Button (48px height)',
                style: ResponsiveUtils.responsiveTextStyle(
                  context,
                  fontSize: 16.0,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),

            const SizedBox(height: 16),

            OutlinedButton.icon(
              onPressed: () {},
              icon: Icon(
                Icons.star,
                size: ResponsiveUtils.responsiveIconSize(context, 20.0),
              ),
              label: Text(
                'Icon Button',
                style: ResponsiveUtils.responsiveTextStyle(
                  context,
                  fontSize: 14.0,
                  fontWeight: FontWeight.w500,
                ),
              ),
              style: OutlinedButton.styleFrom(
                padding: ResponsiveUtils.responsiveButtonPadding(context,
                    horizontal: 20.0, vertical: 10.0),
                shape: RoundedRectangleBorder(
                  borderRadius: ResponsiveUtils.responsiveBorderRadius(context, 8.0),
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Extension Methods Example
            Text(
              'Extension Methods Example',
              style: ResponsiveUtils.responsiveTextStyle(
                context,
                fontSize: 22.0,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 16),

            Container(
              padding: EdgeInsets.all(16.0.responsiveSize(context)),
              decoration: BoxDecoration(
                color: Colors.purple.shade50,
                borderRadius: BorderRadius.circular(12.0.responsiveSize(context)),
              ),
              child: Text(
                'This container uses extension methods for responsive sizing!',
                style: TextStyle(
                  fontSize: 16.0.responsiveFontSize(context),
                  color: Colors.purple.shade800,
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Usage Instructions
            Card(
              color: Colors.amber.shade50,
              child: Padding(
                padding: ResponsiveUtils.responsiveAllPadding(context, 20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'How to Use ResponsiveUtils',
                      style: ResponsiveUtils.responsiveTextStyle(
                        context,
                        fontSize: 18.0,
                        fontWeight: FontWeight.bold,
                        color: Colors.amber.shade800,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildUsageExample(context, 'Font Size',
                        'ResponsiveUtils.responsiveFontSize(context, 16.0)'),
                    _buildUsageExample(context, 'Element Size',
                        'ResponsiveUtils.responsiveSize(context, 100.0)'),
                    _buildUsageExample(context, 'Padding',
                        'ResponsiveUtils.responsiveAllPadding(context, 16.0)'),
                    _buildUsageExample(context, 'Extension',
                        '16.0.responsiveFontSize(context)'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: ResponsiveUtils.responsiveTextStyle(
              context,
              fontSize: 14.0,
              fontWeight: FontWeight.w500,
              color: Colors.grey.shade700,
            ),
          ),
          Text(
            value,
            style: ResponsiveUtils.responsiveTextStyle(
              context,
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade900,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUsageExample(BuildContext context, String title, String code) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: ResponsiveUtils.responsiveTextStyle(
              context,
              fontSize: 14.0,
              fontWeight: FontWeight.w600,
              color: Colors.amber.shade800,
            ),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.all(8.0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4.0),
              border: Border.all(color: Colors.amber.shade200),
            ),
            child: Text(
              code,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 12.0,
                color: Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }
}