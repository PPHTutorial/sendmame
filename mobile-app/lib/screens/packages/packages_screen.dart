import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/package_provider.dart';
import '../../providers/trip_provider.dart';
import '../../widgets/common/loading_indicator.dart';
import '../../widgets/packages/package_card.dart';
import '../../widgets/trips/trip_card.dart';
import '../../widgets/shared/empty_state.dart';
import '../../widgets/shared/search_filters.dart';
import '../../utils/responsive_utils.dart';
import '../../models/enums.dart';

// TODO: Implement enhanced filter interfaces matching web app
// class PackageFilters { ... }
// class TripFilters { ... }
// enum SortBy { ... }
// enum SortOrder { asc, desc }

class PackagesScreen extends StatefulWidget {
  const PackagesScreen({Key? key}) : super(key: key);

  @override
  State<PackagesScreen> createState() => _PackagesScreenState();
}

class _PackagesScreenState extends State<PackagesScreen> with TickerProviderStateMixin {
  ActiveTab _activeTab = ActiveTab.packages;
  ViewMode _viewMode = ViewMode.grid;
  final TextEditingController _searchController = TextEditingController();
  bool _showFilters = false;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      setState(() {
        _activeTab = _tabController.index == 0 ? ActiveTab.packages : ActiveTab.trips;
      });
    });
    // Load data after widget is built
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    final packageProvider = Provider.of<PackageProvider>(context, listen: false);
    final tripProvider = Provider.of<TripProvider>(context, listen: false);

    await Future.wait([
      packageProvider.loadPackages(),
      tripProvider.loadTrips(),
    ]);
  }

  void _toggleViewMode() {
    setState(() {
      _viewMode = _viewMode == ViewMode.grid ? ViewMode.list : ViewMode.grid;
    });
  }

  void _toggleFilters() {
    setState(() {
      _showFilters = !_showFilters;
    });
  }

  void _onSearchChanged(String value) {
    // TODO: Implement debounced search
    print('Search changed: $value');
  }

  void _onFiltersChanged(dynamic filters) {
    // TODO: Apply filters to API call
    print('Filters changed: $filters');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Packages & Trips'),
        actions: [
          IconButton(
            icon: Icon(_viewMode == ViewMode.grid ? Icons.list : Icons.grid_view),
            onPressed: _toggleViewMode,
          ),
          IconButton(
            icon: Icon(_showFilters ? Icons.filter_list_off : Icons.filter_list),
            onPressed: _toggleFilters,
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _navigateToCreate(),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Packages'),
            Tab(text: 'Trips'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: ResponsiveUtils.responsivePadding(context),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search ${_activeTab == ActiveTab.packages ? 'packages' : 'trips'}...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Theme.of(context).cardColor,
              ),
              onChanged: _onSearchChanged,
            ),
          ),

          // Filters Panel
          if (_showFilters)
            SearchFilters(
              activeTab: _activeTab,
              onFiltersChanged: _onFiltersChanged,
            ),

          // Content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildPackagesTab(),
                _buildTripsTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPackagesTab() {
    return Consumer<PackageProvider>(
      builder: (context, packageProvider, child) {
        print('Rebuilding Packages Tab with ${packageProvider.packages.length} packages');
        if (packageProvider.isLoading) {
          return const Center(child: LoadingIndicator());
        }

        if (packageProvider.packages.isEmpty) {
          return EmptyState(
            icon: Icons.inventory,
            title: 'No Packages Found',
            subtitle: 'Create your first package to get started',
            actionLabel: 'Create Package',
            onAction: () => _navigateToCreate(),
          );
        }

        return RefreshIndicator(
          onRefresh: () => packageProvider.loadPackages(),
          child: _buildGridView(
            items: packageProvider.packages,
            itemBuilder: (package) => PackageCard(
              package: package,
              onTap: () => _onPackageTap(package),
              onAddToTrip: () => _onAddToTrip(package),
              onMessage: () => _onMessage(package),
            ),
          ),
        );
      },
    );
  }

  Widget _buildTripsTab() {
    return Consumer<TripProvider>(
      builder: (context, tripProvider, child) {
        if (tripProvider.isLoading) {
          return const Center(child: LoadingIndicator());
        }

        if (tripProvider.trips.isEmpty) {
          return EmptyState(
            icon: Icons.flight,
            title: 'No Trips Found',
            subtitle: 'Create your first trip to get started',
            actionLabel: 'Create Trip',
            onAction: () => _navigateToCreate(),
          );
        }

        return RefreshIndicator(
          onRefresh: () => tripProvider.loadTrips(),
          child: _buildGridView(
            items: tripProvider.trips,
            itemBuilder: (trip) => TripCard(
              trip: trip,
              onTap: () => _onTripTap(trip),
              onAddPackage: () => _onAddPackage(trip),
              onMessage: () => _onMessage(trip),
            ),
          ),
        );
      },
    );
  }

  Widget _buildGridView<T>({
    required List<T> items,
    required Widget Function(T) itemBuilder,
  }) {
    if (_viewMode == ViewMode.list) {
      return ListView.builder(
        padding: ResponsiveUtils.responsivePadding(context),
        itemCount: items.length,
        itemBuilder: (context, index) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: itemBuilder(items[index]),
        ),
      );
    }

    return GridView.builder(
      padding: ResponsiveUtils.responsivePadding(context),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: ResponsiveUtils.getGridCrossAxisCount(context),
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.8,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) => itemBuilder(items[index]),
    );
  }

  void _navigateToCreate() {
    final route = _activeTab == ActiveTab.packages
        ? '/packages/create'
        : '/trips/create';
    Navigator.pushNamed(context, route);
  }

  void _onPackageTap(dynamic package) {
    Navigator.pushNamed(context, '/packages/${package.id}');
  }

  void _onTripTap(dynamic trip) {
    Navigator.pushNamed(context, '/trips/${trip.id}');
  }

  void _onAddToTrip(dynamic package) {
    // TODO: Show trip selection dialog
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Add to trip feature coming soon')),
    );
  }

  void _onAddPackage(dynamic trip) {
    // TODO: Show package selection dialog
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Add package feature coming soon')),
    );
  }

  void _onMessage(dynamic item) {
    // TODO: Navigate to messaging
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Messaging feature coming soon')),
    );
  }
}