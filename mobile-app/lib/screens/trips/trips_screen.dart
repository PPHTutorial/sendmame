import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/trip_provider.dart';
import '../../widgets/common/loading_indicator.dart';

class TripsScreen extends StatefulWidget {
  const TripsScreen({Key? key}) : super(key: key);

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  @override
  void initState() {
    super.initState();
    _loadTrips();
  }

  Future<void> _loadTrips() async {
    final tripProvider = Provider.of<TripProvider>(context, listen: false);
    print('Loading user trips...');
    await tripProvider.fetchUserTrips();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Trips'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Navigate to create trip screen
            },
          ),
        ],
      ),
      body: Consumer<TripProvider>(
        builder: (context, tripProvider, child) {
          print('trips: ${tripProvider.toString()}');

          if (tripProvider.isLoading) {
            return const Center(child: LoadingIndicator());
          }

          if (tripProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Error: ${tripProvider.error}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loadTrips,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (tripProvider.trips.isEmpty) {
            return const Center(
              child: Text('No trips found'),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              final tripProvider = Provider.of<TripProvider>(context, listen: false);
              await tripProvider.fetchUserTrips();
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: tripProvider.trips.length,
              itemBuilder: (context, index) {
                final trip = tripProvider.trips[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  child: ListTile(
                    title: Text(
                        '${trip.originAddress.city} → ${trip.destinationAddress.city}'),
                    subtitle: Text('Status: ${trip.status}'),
                    trailing: Text('\$${trip.minimumPrice.toStringAsFixed(0)}'),
                    onTap: () {
                      // TODO: Navigate to trip details
                    },
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
