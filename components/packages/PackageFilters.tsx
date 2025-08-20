'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui'
import { FilterDialog } from '@/components/shared/FilterDialog'

interface PackageFiltersProps {
  filters: {
    title: string
    status: string
    category: string
    priceMin: string
    priceMax: string
    pickupDateFrom: string
    pickupDateTo: string
  }
  onFiltersChange: (filters: any) => void
  isOpen: boolean
  onClose: () => void
  sortBy: string
  sortOrder: string
  onSortChange: (sortBy: string, sortOrder: string) => void
}

export function PackageFilters({ filters, onFiltersChange, isOpen, onClose, sortBy, sortOrder, onSortChange }: PackageFiltersProps) {
  const [activeTab, setActiveTab] = useState<'sorting' | 'filtering'>('sorting')

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    onSortChange(newSortBy, newSortOrder)
  }

  const clearFilters = () => {
    onFiltersChange({
      title: '',
      status: '',
      category: '',
      priceMin: '',
      priceMax: '',
      pickupDateFrom: '',
      pickupDateTo: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  const packageStatuses = [
    'DRAFT',
    'POSTED', 
    'MATCHED',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED'
  ]

  const packageCategories = [
    'DOCUMENTS',
    'ELECTRONICS',
    'CLOTHING',
    'BOOKS',
    'FOOD',
    'GIFTS',
    'OTHER'
  ]

  // Package sorting options (based on schema.prisma and validation)
  const packageSortingOptions = [
    { value: 'title', label: 'Title' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'offeredPrice', label: 'Offered Price' },
    { value: 'pickupDate', label: 'Pickup Date' }
  ]

  const getSortingOptions = () => {
    return packageSortingOptions
  }

  const sortOrderOptions = [
    { value: 'desc', label: 'Descending (High to Low)' },
    { value: 'asc', label: 'Ascending (Low to High)' }
  ]

  return (
    <FilterDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Sort & Filter Packages"
      hasActiveFilters={hasActiveFilters}
      onClear={clearFilters}
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('sorting')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sorting'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sorting
          </button>
          <button
            onClick={() => setActiveTab('filtering')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'filtering'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Filtering
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'sorting' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value, sortOrder)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {getSortingOptions().map((option: { value: string; label: string }) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => handleSortChange(sortBy, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {sortOrderOptions.map((option: { value: string; label: string }) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'filtering' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title Filter */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Title
              </label>
              <Input
                type="text"
                value={filters.title}
                onChange={(e) => handleFilterChange('title', e.target.value)}
                placeholder="Search by package title"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Statuses</option>
                {packageStatuses.map((status: string) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Categories</option>
                {packageCategories.map((category: string) => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup From
              </label>
              <Input
                type="date"
                value={filters.pickupDateFrom}
                onChange={(e) => handleFilterChange('pickupDateFrom', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup To
              </label>
              <Input
                type="date"
                value={filters.pickupDateTo}
                onChange={(e) => handleFilterChange('pickupDateTo', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </FilterDialog>
  )
}
