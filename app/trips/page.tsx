// Trips Page - With search, filtering, and sorting functionality
'use client'

import React, { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { useAuth, useTrips } from '@/lib/hooks/api'
import { TripCard } from '@/components/trips/TripCard'
import { TripFilters } from '@/components/trips/TripFilters'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Pagination } from '@/components/shared/Pagination'
import { AssignmentDialog } from '@/components/shared/AssignmentDialog'
import { MessagingInterface } from '@/components/shared/MessagingInterface'
import Link from 'next/link'
import { Plus, Search, SortAsc, SortDesc } from 'lucide-react'
import { FaFilter } from 'react-icons/fa6'

// Types
type TripSortBy = 'title' | 'createdAt' | 'updatedAt' | 'departureDate' | 'arrivalDate' | 'pricePerKg'
type SortOrder = 'asc' | 'desc'

// Trip filter interface - must match the component expectations
interface TripFiltersState {
  title?: string
  status?: string
  transportMode?: string
  priceMin?: number
  priceMax?: number
  dateFrom?: string
  dateTo?: string
  destination?: string
}

// API Query parameters interface
interface TripQueryParams {
  page?: number
  limit?: number
  sortBy?: TripSortBy
  sortOrder?: SortOrder
  search?: string
  title?: string
  status?: string
  transportMode?: string
  priceMin?: number
  priceMax?: string
  dateFrom?: string
  dateTo?: string
  destination?: string
}

export default function TripsPage() {
  const { getCurrentUser } = useAuth()
  const { data: user } = getCurrentUser

  // Trip state with proper types
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPageState] = useState<number>(1)
  const [sortBy, setSortBy] = useState<TripSortBy>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState<boolean>(false)
  const [filters, setFilters] = useState<TripFiltersState>({
    title: undefined,
    status: undefined,
    priceMin: undefined,
    priceMax: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    destination: undefined
  })

  // Custom page setter with scroll functionality
  const setCurrentPage = (page: number) => {
    setCurrentPageState(page)
    
    // Scroll to top when page changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Dialog state
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState<boolean>(false)
  const [selectedChatTrip, setSelectedChatTrip] = useState<any>(null)
  const [isMessagingOpen, setIsMessagingOpen] = useState<boolean>(false)

  const limit: number = 12

  const tripsQuery = useTrips({
    sortBy,
    sortOrder,
    search: searchQuery,
    ...filters
  } as TripQueryParams)

  // Client-side pagination logic
  const getPaginatedData = () => {
    if (!tripsQuery.data) return { data: [], pagination: null }
    
    const allItems = tripsQuery.data.data
    const startIndex = (currentPage - 1) * limit
    const endIndex = startIndex + limit
    const paginatedItems = allItems.slice(startIndex, endIndex)
    
    const totalPages = Math.ceil(allItems.length / limit)
    
    return {
      data: paginatedItems,
      pagination: {
        total: allItems.length,
        totalPages,
        currentPage,
        limit
      }
    }
  }

  const paginatedResult = getPaginatedData()


  const handleAddPackage = async (tripData: any) => {
    if (!user?.id) {
      alert('Please log in to add packages to trips')
      return
    }

    setSelectedTrip(tripData)
    setIsAssignmentDialogOpen(true)
  }

  const handleTripMessage = (tripData: any) => {
    if (!user?.id) {
      alert('Please log in to send messages')
      return
    }

    setSelectedChatTrip(tripData)
    setIsMessagingOpen(true)
  }

  const handleAssign = async (targetId: string, confirmations: any) => {
    try {
      // Handle assignment creation logic here
      console.log('Assignment:', { targetId, confirmations })

      setIsAssignmentDialogOpen(false)
      setSelectedTrip(null)

      // Refresh the data
      tripsQuery.refetch()
    } catch (error) {
      console.error('Assignment creation failed:', error)
      alert('Failed to create assignment. Please try again.')
    }
  }

  const handleSendMessage = async (content: string, type?: string) => {
    try {
      // Handle message sending logic here
      console.log('Sending message:', { content, type })
    } catch (error) {
      console.error('Message sending failed:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
              <p className="text-gray-600 mt-1">
                Discover travelers who can carry your packages
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Link href="/trips/create">
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Trip</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search, Filter, and Sort Controls */}
          <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search trips..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex items-center space-x-3">
              {/* Filter Button */}
              <Button
                variant="outline"
                onClick={() => setIsFilterDialogOpen(true)}
                className="flex items-center space-x-2"
              >
                <FaFilter className="w-4 h-4" />
                <span>Filter</span>
              </Button>

              {/* Sort Controls */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as TripSortBy)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="updatedAt">Last Updated</option>
                  <option value="title">Title</option>
                  <option value="pricePerKg">Price per Kg</option>
                  <option value="departureDate">Departure Date</option>
                  <option value="arrivalDate">Arrival Date</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3"
                >
                  {sortOrder === 'asc' ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          {paginatedResult.pagination && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, paginatedResult.pagination.total)} of {paginatedResult.pagination.total} trips
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {tripsQuery.isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : !tripsQuery.data || tripsQuery.data.length === 0 ? (
          <EmptyState
            title="No trips found"
            description="There are no trips available at the moment. Create a trip to start carrying packages!"
            actionLabel="Create Trip"
          />
        ) : (
          <>
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedResult.data?.map((trip: any) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onAddPackage={handleAddPackage}
                  onSendMessage={handleTripMessage}
                  currentUserId={user?.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {paginatedResult.pagination && paginatedResult.pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={paginatedResult.pagination.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Trip Filter Dialog */}
      {isFilterDialogOpen && (
        <TripFilters
          isOpen={isFilterDialogOpen}
          onClose={() => setIsFilterDialogOpen(false)}
          filters={filters}
          onFiltersChange={(filters: TripFiltersState) => setFilters(filters)}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(sortBy: string, sortOrder: string) => {
            setSortBy(sortBy as TripSortBy)
            setSortOrder(sortOrder as SortOrder)
          }}
        />
      )}

      {/* Assignment Dialog */}
      {isAssignmentDialogOpen && selectedTrip && (
        <AssignmentDialog
          isOpen={isAssignmentDialogOpen}
          onClose={() => {
            setIsAssignmentDialogOpen(false)
            setSelectedTrip(null)
          }}
          type="package-to-trip"
          currentItem={selectedTrip}
          availableItems={[]}
          onAssign={handleAssign}
        />
      )}

      {/* Messaging Interface */}
      {isMessagingOpen && selectedChatTrip && (
        <MessagingInterface
          isOpen={isMessagingOpen}
          onClose={() => {
            setIsMessagingOpen(false)
            setSelectedChatTrip(null)
          }}
          chat={null}
          currentUserId={user?.id || ''}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  )
}
