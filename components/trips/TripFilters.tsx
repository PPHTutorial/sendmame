'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui'
import { FilterDialog } from '@/components/shared/FilterDialog'

interface TripFiltersProps {
    filters: {
        title?: string
        status?: string
        transportMode?: string
        priceMin?: number
        priceMax?: number
        dateFrom?: string
        dateTo?: string
        destination?: string
    }
    onFiltersChange: (filters: any) => void
    isOpen: boolean
    onClose: () => void
    sortBy: string
    sortOrder: string
    onSortChange: (sortBy: string, sortOrder: string) => void
}

export function TripFilters({ filters, onFiltersChange, isOpen, onClose, sortBy, sortOrder, onSortChange }: TripFiltersProps) {
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
            transportMode: '',
            priceMin: '',
            priceMax: '',
            dateFrom: '',
            dateTo: '',
            destination: ''
        })
    }

    const hasActiveFilters = Object.values(filters).some(value => value !== '')

    const tripStatuses = [
        'POSTED',
        'ACTIVE',
        'COMPLETED',
        'CANCELLED'
    ]

    const transportModes = [
        'car',
        'plane',
        'train',
        'bus',
        'ship',
        'other'
    ]

    // Trip sorting options based on schema.prisma and validation
    const tripSortingOptions = [
        { value: 'title', label: 'Title' },
        { value: 'createdAt', label: 'Date Created' },
        { value: 'updatedAt', label: 'Last Updated' },
        { value: 'departureDate', label: 'Departure Date' },
        { value: 'arrivalDate', label: 'Arrival Date' },
        { value: 'pricePerKg', label: 'Price per Kg' }
    ]

    const sortOrderOptions = [
        { value: 'desc', label: 'Descending (High to Low)' },
        { value: 'asc', label: 'Ascending (Low to High)' }
    ]

    return (
        <FilterDialog
            isOpen={isOpen}
            onClose={onClose}
            title="Sort & Filter Trips"
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
                                {tripSortingOptions.map((option: { value: string; label: string }) => (
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
                        {/* Title/Route Filter */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Route or Title
                            </label>
                            <Input
                                type="text"
                                value={filters.title}
                                onChange={(e) => handleFilterChange('title', e.target.value)}
                                placeholder="Search by route or trip title"
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
                                {tripStatuses.map((status: string) => (
                                    <option key={status} value={status}>
                                        {status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Transport Mode Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Transport Mode
                            </label>
                            <select
                                value={filters.transportMode}
                                onChange={(e) => handleFilterChange('transportMode', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="">All Transport Modes</option>
                                {transportModes.map((mode: string) => (
                                    <option key={mode} value={mode}>
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Destination Filter */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Destination
                            </label>
                            <Input
                                type="text"
                                value={filters.destination}
                                onChange={(e) => handleFilterChange('destination', e.target.value)}
                                placeholder="Search by destination"
                            />
                        </div>

                        {/* Price Range per Kg */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Min Price per Kg ($)
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
                                Max Price per Kg ($)
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

                        {/* Departure Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Departure From
                            </label>
                            <Input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Departure To
                            </label>
                            <Input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </FilterDialog>
    )
}
