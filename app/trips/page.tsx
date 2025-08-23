'use client'

import React, { useState, useMemo } from 'react'
import { Button, Input } from '@/components/ui'
import { useTrips } from '@/lib/hooks/api'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Pagination } from '@/components/shared/Pagination'
import { TripCard } from '@/components/trips/TripCard'
import { TripFilters } from '@/components/trips/TripFilters'
import { Plus } from 'lucide-react'
import { FaFilter } from 'react-icons/fa6'

type SortBy = 'createdAt' | 'updatedAt' | 'departureDate' | 'pricePerKg'
type SortOrder = 'asc' | 'desc'

export default function TripsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortBy>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    title: '',
    status: '',
    transportMode: '',
    priceMin: '',
    priceMax: '',
    dateFrom: '',
    dateTo: '',
    destination: ''
  })

  const limit = 12

  // Modified query parameters to fetch more data for proper pagination
  const buildQueryParams = useMemo(() => {
    const params: any = {
      page: 1, // Always fetch from page 1
      limit: 1000, // Fetch a large number to get all data
      sortBy,
      sortOrder,
      // Don't include filters in API call, we'll filter client-side
    }

    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    return params
  }, [sortBy, sortOrder]) // Removed dependencies that would cause unnecessary refetches

  // Fetch trips data
  const tripsQuery = useTrips(buildQueryParams)

  // Loading states
  const isLoading = tripsQuery.isLoading
  const isError = tripsQuery.isError

  // Comprehensive client-side filtering and searching
  const filteredTrips = useMemo(() => {
    let filtered = tripsQuery.data || []

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((trip: any) => {
        const destination = (trip.destination || '').toLowerCase()
        const origin = (trip.origin || '').toLowerCase()
        const title = (trip.title || '').toLowerCase()
        const transportMode = (trip.transportMode || '').toLowerCase()
        const pricePerKg = (trip.pricePerKg || 0).toString()
        return destination.includes(query) || 
               origin.includes(query) || 
               title.includes(query) ||
               transportMode.includes(query) ||
               pricePerKg.includes(query)
      })
    }

    // Apply filters
    if (filters.title) {
      const titleQuery = filters.title.toLowerCase()
      filtered = filtered.filter((trip: any) => 
        (trip.title || '').toLowerCase().includes(titleQuery)
      )
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((trip: any) => trip.status === filters.status)
    }

    // Apply transport mode filter
    if (filters.transportMode) {
      filtered = filtered.filter((trip: any) => trip.transportMode === filters.transportMode)
    }

    // Apply destination filter
    if (filters.destination) {
      const destination = filters.destination.toLowerCase()
      filtered = filtered.filter((trip: any) => 
        (trip.destination || '').toLowerCase().includes(destination) ||
        (trip.title || '').toLowerCase().includes(destination)
      )
    }

    // Apply price range filters
    if (filters.priceMin) {
      const minPrice = parseFloat(filters.priceMin)
      filtered = filtered.filter((trip: any) => (trip.pricePerKg || 0) >= minPrice)
    }

    if (filters.priceMax) {
      const maxPrice = parseFloat(filters.priceMax)
      filtered = filtered.filter((trip: any) => (trip.pricePerKg || 0) <= maxPrice)
    }

    // Apply date range filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter((trip: any) => {
        const itemDate = new Date(trip.departureDate || trip.createdAt)
        return itemDate >= fromDate
      })
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      filtered = filtered.filter((trip: any) => {
        const itemDate = new Date(trip.departureDate || trip.createdAt)
        return itemDate <= toDate
      })
    }

    return filtered
  }, [tripsQuery.data, searchQuery, filters])

  // Enhanced pagination logic
  const startIndex = (currentPage - 1) * limit
  const endIndex = startIndex + limit
  const paginatedTrips = filteredTrips.slice(startIndex, endIndex)

  // Comprehensive pagination info
  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / limit))
  const totalItems = filteredTrips.length
  const showingStart = Math.min(startIndex + 1, totalItems)
  const showingEnd = Math.min(endIndex, totalItems)

  // Check if filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchQuery !== ''

  // Event handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleSort = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy as SortBy)
    setSortOrder(newSortOrder as SortOrder)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Trips</h1>
            <p className="text-gray-600 mb-6">Failed to load trips. Please try again.</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Travel Trips</h1>
              <p className="mt-2 text-gray-600">
                Browse available trips and delivery services from travelers
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Link href="/trips/create">
                <Button className="inline-flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Trip
                </Button>
              </Link>
              <Link href="/packages">
                <Button variant="outline">
                  View Packages
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats and Search Layout */}
        <div className="mb-6 w-full">
          <div className=" gap-6 w-full">
            {/* Dashboard Stats - Takes 1 column on large screens */}
            {/* <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaPlane className="h-5 w-5 text-blue-500 mr-3" />
                      <span className="text-sm text-gray-600">Total Trips</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{totalItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaCar className="h-5 w-5 text-teal-500 mr-3" />
                      <span className="text-sm text-gray-600">Active Routes</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{trips.filter((t: any) => t.status === 'ACTIVE').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaUsers className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm text-gray-600">Available Seats</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{trips.reduce((total: number, trip: any) => total + (trip.availableSeats || 0), 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaDollarSign className="h-5 w-5 text-orange-500 mr-3" />
                      <span className="text-sm text-gray-600">Avg. Price</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      ${trips.length > 0 ? Math.round(trips.reduce((total: number, trip: any) => total + (trip.pricePerSeat || 0), 0) / trips.length) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
 */}
            {/* Search and Filters - Takes 2 columns on large screens */}
            <div className="">
              <div className="bg-white rounded-lg w-full">
                <div className="flex items-center justify-end gap-4 mb-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative col-span-2">
                      <Input
                        type="text"
                        placeholder="Search trips by route, destination..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="flex gap-2">
                    <div className="relative">
                      <Button 
                        variant='outline' 
                        size='lg'
                        onClick={() => setIsFilterDialogOpen(true)}
                        title='Sort & Filter Options'
                        className={`${hasActiveFilters || sortBy !== 'createdAt' || sortOrder !== 'desc' ? 'border-teal-500 text-teal-600' : ''}`}
                      >
                        <FaFilter className="text-gray-400 size-4" />
                        {(hasActiveFilters || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
                          <span className="ml-1 text-xs">•</span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Filter Summary */}
                {Object.values(filters).some(value => value !== '') && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>Active filters:</span>
                    {filters.status && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Status: {filters.status}</span>}
                    {filters.transportMode && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Transport: {filters.transportMode}</span>}
                    {filters.destination && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Destination: {filters.destination}</span>}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFilters({
                        title: '',
                        status: '',
                        transportMode: '',
                        priceMin: '',
                        priceMax: '',
                        dateFrom: '',
                        dateTo: '',
                        destination: ''
                      })}
                      className="text-red-600 hover:text-red-700"
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trip Filters Dialog */}
        <TripFilters
          filters={filters}
          onFiltersChange={handleFilterChange}
          isOpen={isFilterDialogOpen}
          onClose={() => setIsFilterDialogOpen(false)}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSort}
        />

        {/* Results */}
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : paginatedTrips.length === 0 ? (
          <EmptyState
            title="No trips found"
            description="Try adjusting your search criteria or filters to find what you're looking for."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery('')
              setFilters({
                title: '',
                status: '',
                transportMode: '',
                priceMin: '',
                priceMax: '',
                dateFrom: '',
                dateTo: '',
                destination: ''
              })
            }}
          />
        ) : (
          <>
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedTrips.map((trip: any) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showInfo={{
                start: showingStart,
                end: showingEnd,
                total: totalItems
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
