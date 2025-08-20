// Search Filters Component
import React, { useState } from 'react'
import { Input, Button } from '@/components/ui'

interface SearchFiltersProps {
  filters: {
    status: string
    category: string
    priceMin: string
    priceMax: string
    pickupDateFrom: string
    pickupDateTo: string
  }
  onFiltersChange: (filters: any) => void
  viewType: 'packages' | 'trips' | 'all'
}

export function SearchFilters({ filters, onFiltersChange, viewType }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      status: '',
      category: '',
      priceMin: '',
      priceMax: '',
      pickupDateFrom: '',
      pickupDateTo: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  const packageCategories = [
    'DOCUMENTS',
    'ELECTRONICS',
    'CLOTHING',
    'BOOKS',
    'FOOD',
    'GIFTS',
    'OTHER'
  ]

  const packageStatuses = [
    'DRAFT',
    'POSTED', 
    'MATCHED',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED'
  ]

  const tripStatuses = [
    'POSTED',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-teal-600 hover:text-teal-700"
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600"
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
            <svg 
              className={`ml-1 h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">All Statuses</option>
              {viewType === 'trips' ? (
                tripStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))
              ) : (
                packageStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Category Filter (for packages) */}
          {viewType !== 'trips' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Categories</option>
                {packageCategories.map(category => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Price ($)
            </label>
            <Input
              type="number"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price ($)
            </label>
            <Input
              type="number"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              placeholder="No limit"
              min="0"
              step="0.01"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup From
            </label>
            <Input
              type="date"
              value={filters.pickupDateFrom}
              onChange={(e) => handleFilterChange('pickupDateFrom', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup To
            </label>
            <Input
              type="date"
              value={filters.pickupDateTo}
              onChange={(e) => handleFilterChange('pickupDateTo', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
