import 'package:flutter/material.dart';
import '../../utils/responsive_utils.dart';
import '../../models/enums.dart';

class SearchFilters extends StatefulWidget {
  final ActiveTab activeTab;
  final Function(Map<String, dynamic>) onFiltersChanged;

  const SearchFilters({
    Key? key,
    required this.activeTab,
    required this.onFiltersChanged,
  }) : super(key: key);

  @override
  State<SearchFilters> createState() => _SearchFiltersState();
}

class _SearchFiltersState extends State<SearchFilters> {
  // Filter states
  String? _statusFilter;
  String? _categoryFilter;
  double? _minPrice;
  double? _maxPrice;
  DateTime? _startDate;
  DateTime? _endDate;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: ResponsiveUtils.responsivePadding(context),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Filters',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Theme.of(context).primaryColor,
                ),
              ),
              TextButton(
                onPressed: _clearFilters,
                child: const Text('Clear All'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildFilterRow([
            _buildDropdownFilter(
              'Status',
              _getStatusOptions(),
              _statusFilter,
              (value) => setState(() => _statusFilter = value),
            ),
            if (widget.activeTab == ActiveTab.packages)
              _buildDropdownFilter(
                'Category',
                _getCategoryOptions(),
                _categoryFilter,
                (value) => setState(() => _categoryFilter = value),
              ),
          ]),
          const SizedBox(height: 12),
          _buildPriceRangeFilters(),
          const SizedBox(height: 12),
          _buildDateRangeFilters(),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _applyFilters,
              child: const Text('Apply Filters'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterRow(List<Widget> children) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: children,
    );
  }

  Widget _buildDropdownFilter(
    String label,
    List<String> options,
    String? value,
    Function(String?) onChanged,
  ) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(8),
            ),
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              underline: const SizedBox(),
              hint: Text('Select $label'),
              items: options.map((option) {
                return DropdownMenuItem(
                  value: option,
                  child: Text(option),
                );
              }).toList(),
              onChanged: onChanged,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceRangeFilters() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Price Range',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextField(
                decoration: const InputDecoration(
                  hintText: 'Min',
                  prefixText: '\$',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                onChanged: (value) =>
                    setState(() => _minPrice = double.tryParse(value)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                decoration: const InputDecoration(
                  hintText: 'Max',
                  prefixText: '\$',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                onChanged: (value) =>
                    setState(() => _maxPrice = double.tryParse(value)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDateRangeFilters() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Date Range',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextButton(
                onPressed: () => _selectDate(context, true),
                child: Text(
                  _startDate != null
                      ? '${_startDate!.month}/${_startDate!.day}/${_startDate!.year}'
                      : 'Start Date',
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextButton(
                onPressed: () => _selectDate(context, false),
                child: Text(
                  _endDate != null
                      ? '${_endDate!.month}/${_endDate!.day}/${_endDate!.year}'
                      : 'End Date',
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  List<String> _getStatusOptions() {
    if (widget.activeTab == ActiveTab.packages) {
      return ['DRAFT', 'POSTED', 'MATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
    } else {
      return ['POSTED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
    }
  }

  List<String> _getCategoryOptions() {
    return [
      'Electronics',
      'Clothing',
      'Books',
      'Documents',
      'Food',
      'Medicine',
      'Other'
    ];
  }

  Future<void> _selectDate(BuildContext context, bool isStart) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
        } else {
          _endDate = picked;
        }
      });
    }
  }

  void _clearFilters() {
    setState(() {
      _statusFilter = null;
      _categoryFilter = null;
      _minPrice = null;
      _maxPrice = null;
      _startDate = null;
      _endDate = null;
    });
    widget.onFiltersChanged({});
  }

  void _applyFilters() {
    final filters = <String, dynamic>{};
    if (_statusFilter != null) filters['status'] = _statusFilter;
    if (_categoryFilter != null) filters['category'] = _categoryFilter;
    if (_minPrice != null) filters['minPrice'] = _minPrice;
    if (_maxPrice != null) filters['maxPrice'] = _maxPrice;
    if (_startDate != null) filters['startDate'] = _startDate;
    if (_endDate != null) filters['endDate'] = _endDate;

    widget.onFiltersChanged(filters);
  }
}