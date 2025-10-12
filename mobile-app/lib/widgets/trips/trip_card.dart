import 'package:flutter/material.dart';
import '../../utils/responsive_utils.dart';

class TripCard extends StatelessWidget {
  final dynamic trip;
  final VoidCallback? onTap;
  final VoidCallback? onAddPackage;
  final VoidCallback? onMessage;

  const TripCard({
    Key? key,
    required this.trip,
    this.onTap,
    this.onAddPackage,
    this.onMessage,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: ResponsiveUtils.responsiveCardPadding(context),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with title and status
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      trip.title ?? 'Trip',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  _buildStatusChip(trip.status),
                ],
              ),
              SizedBox(height: ResponsiveUtils.responsiveSize(context, 8)),

              // Traveler info
              Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                    child: Text(
                      trip.user?.firstName?.substring(0, 1).toUpperCase() ?? 'T',
                      style: TextStyle(
                        color: Theme.of(context).primaryColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '${trip.traveler?.firstName ?? ''} ${trip.traveler?.lastName ?? ''}'.trim(),
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[700],
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              SizedBox(height: ResponsiveUtils.responsiveSize(context, 12)),

              // Route
              Row(
                children: [
                  Icon(Icons.flight_takeoff, size: 16, color: Colors.blue[400]),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      _formatAddress(trip.originAddress),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Icon(Icons.arrow_forward, size: 16, color: Colors.grey[400]),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      _formatAddress(trip.destinationAddress),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              SizedBox(height: ResponsiveUtils.responsiveSize(context, 8)),

              // Dates
              Row(
                children: [
                  Icon(Icons.calendar_today, size: 16, color: Colors.orange[400]),
                  const SizedBox(width: 4),
                  Text(
                    _formatDateRange(trip.departureDate, trip.arrivalDate),
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
              SizedBox(height: ResponsiveUtils.responsiveSize(context, 8)),

              // Transport and capacity
              Row(
                children: [
                  _getTransportIcon(trip.transportMode),
                  const SizedBox(width: 4),
                  Text(
                    trip.transportMode ?? 'Unknown',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(Icons.scale, size: 16, color: Colors.grey[500]),
                  const SizedBox(width: 4),
                  Text(
                    '${trip.maxWeight ?? 0}kg max',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Pricing
              if (trip.pricePerKg != null) ...[
                Text(
                  '\$${trip.pricePerKg} per kg',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
                SizedBox(height: ResponsiveUtils.responsiveSize(context, 12)),
              ],

              // Action buttons
              Row(
                children: [
                  if (onAddPackage != null)
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: onAddPackage,
                        icon: const Icon(Icons.add, size: 16),
                        label: const Text('Add Package'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                        ),
                      ),
                    ),
                  if (onAddPackage != null && onMessage != null)
                    const SizedBox(width: 8),
                  if (onMessage != null)
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: onMessage,
                        icon: const Icon(Icons.message, size: 16),
                        label: const Text('Message'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String? status) {
    Color color;
    switch (status?.toUpperCase()) {
      case 'POSTED':
        color = Colors.blue;
        break;
      case 'ACTIVE':
        color = Colors.green;
        break;
      case 'COMPLETED':
        color = Colors.purple;
        break;
      case 'CANCELLED':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        status ?? 'Unknown',
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }

  Widget _getTransportIcon(String? mode) {
    IconData icon;
    switch (mode?.toLowerCase()) {
      case 'flight':
      case 'plane':
        icon = Icons.flight;
        break;
      case 'car':
        icon = Icons.directions_car;
        break;
      case 'bus':
        icon = Icons.directions_bus;
        break;
      case 'train':
        icon = Icons.train;
        break;
      case 'ship':
      case 'boat':
        icon = Icons.directions_boat;
        break;
      case 'truck':
        icon = Icons.local_shipping;
        break;
      default:
        icon = Icons.directions;
    }

    return Icon(icon, size: 16, color: Colors.grey[500]);
  }

  String _formatAddress(dynamic address) {
    if (address == null) return 'Unknown';

    final city = address['city'] ?? '';
    final country = address['country'] ?? '';

    if (city.isNotEmpty && country.isNotEmpty) {
      return '$city, $country';
    } else if (city.isNotEmpty) {
      return city;
    } else if (country.isNotEmpty) {
      return country;
    }

    return 'Unknown';
  }

  String _formatDateRange(String? start, String? end) {
    if (start == null) return 'Date not set';

    try {
      final startDate = DateTime.parse(start);
      final endDate = end != null ? DateTime.parse(end) : null;

      final startStr = '${startDate.month}/${startDate.day}/${startDate.year}';
      if (endDate != null) {
        final endStr = '${endDate.month}/${endDate.day}/${endDate.year}';
        return '$startStr - $endStr';
      }
      return startStr;
    } catch (e) {
      return 'Invalid date';
    }
  }
}