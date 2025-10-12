import 'package:flutter/material.dart';
import '../../utils/responsive_utils.dart';

class PackageCard extends StatelessWidget {
  final dynamic package;
  final VoidCallback? onTap;
  final VoidCallback? onAddToTrip;
  final VoidCallback? onMessage;

  const PackageCard({
    Key? key,
    required this.package,
    this.onTap,
    this.onAddToTrip,
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
                      package.title ?? 'Package',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  _buildStatusChip(package.status),
                ],
              ),
              const SizedBox(height: 8),

              // Description
              Text(
                package.description ?? 'No description',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),

              // Package details
              Row(
                children: [
                  Icon(Icons.category, size: ResponsiveUtils.responsiveSize(context, 16), color: Colors.grey[500]),
                  SizedBox(width: ResponsiveUtils.responsiveSize(context, 4)),
                  Text(
                    package.category ?? 'General',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(Icons.scale, size: 16, color: Colors.grey[500]),
                  const SizedBox(width: 4),
                  Text(
                    '${package.weight ?? 0}kg',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Price
              Text(
                '\$${package.offeredPrice?.toStringAsFixed(2) ?? '0.00'}',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: Theme.of(context).primaryColor,
                ),
              ),
              const SizedBox(height: 12),

              // Addresses
              if (package.pickupAddress != null) ...[
                Row(
                  children: [
                    Icon(Icons.location_on, size: 16, color: Colors.red[400]),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        _formatAddress(package.pickupAddress),
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
                const SizedBox(height: 4),
              ],

              if (package.deliveryAddress != null) ...[
                Row(
                  children: [
                    Icon(Icons.flag, size: 16, color: Colors.green[400]),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        _formatAddress(package.deliveryAddress),
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
                const SizedBox(height: 12),
              ],

              // Action buttons
              Row(
                children: [
                  if (onAddToTrip != null)
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: onAddToTrip,
                        icon: const Icon(Icons.add, size: 16),
                        label: const Text('Add to Trip'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                        ),
                      ),
                    ),
                  if (onAddToTrip != null && onMessage != null)
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
      case 'MATCHED':
        color = Colors.orange;
        break;
      case 'IN_TRANSIT':
        color = Colors.purple;
        break;
      case 'DELIVERED':
        color = Colors.green;
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

  String _formatAddress(dynamic address) {
    if (address == null) return 'Unknown location';

    final city = address['city'] ?? '';
    final country = address['country'] ?? '';

    if (city.isNotEmpty && country.isNotEmpty) {
      return '$city, $country';
    } else if (city.isNotEmpty) {
      return city;
    } else if (country.isNotEmpty) {
      return country;
    }

    return 'Unknown location';
  }
}