// Packages & Trips Page - Simplified for new sidebar navigation
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Button, Input } from '@/components/ui'
import { useAuth, usePackages, useTrips } from '@/lib/hooks/api'
import { PackageCard } from '@/components/packages/PackageCard'
import { TripCard } from '@/components/trips/TripCard'
import { PackageFilters } from '@/components/packages/PackageFilters'
import { TripFilters } from '@/components/trips/TripFilters'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Pagination } from '@/components/shared/Pagination'
import { AssignmentDialog } from '@/components/shared/AssignmentDialog'
import { MessagingInterface } from '@/components/shared/MessagingInterface'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, SortAsc, SortDesc } from 'lucide-react'
import { FaFilter } from 'react-icons/fa6'

// Types
type ActiveTab = 'packages' | 'trips'
type PackageSortBy = 'title' | 'createdAt' | 'updatedAt' | 'offeredPrice' | 'pickupDate'
type TripSortBy = 'title' | 'createdAt' | 'updatedAt' | 'departureDate' | 'arrivalDate' | 'pricePerKg'
type SortOrder = 'asc' | 'desc'

// Package filter interface - must match the component expectations
interface PackageFiltersState {
  title?: string
  status?: string
  category?: string
  priceMin?: number
  priceMax?: number
  pickupDateFrom?: string
  pickupDateTo?: string
}

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
interface PackageQueryParams {
  page: number
  limit: number
  sortBy: PackageSortBy
  sortOrder: SortOrder
  search?: string
  title?: string
  status?: string
  category?: string
  priceMin?: number
  priceMax?: number
  pickupDateFrom?: string
  pickupDateTo?: string
}

interface TripQueryParams {
  page: number
  limit: number
  sortBy: TripSortBy
  sortOrder: SortOrder
  search?: string
  title?: string
  status?: string
  transportMode?: string
  priceMin?: number
  priceMax?: number
  dateFrom?: string
  dateTo?: string
  destination?: string
}

function PackagesPageContent() {
    const searchParams = useSearchParams()
    const tabFromQuery = searchParams.get('tab') as ActiveTab | null
    const { getCurrentUser } = useAuth()
    const { data: user } = getCurrentUser
    
    const [activeTab, setActiveTab] = useState<ActiveTab>(tabFromQuery || 'packages')

    // Update active tab when URL changes
    useEffect(() => {
        const currentTab = searchParams.get('tab') as ActiveTab | null
        if (currentTab === 'packages' || currentTab === 'trips') {
            setActiveTab(currentTab)
        }
    }, [searchParams])

    // Package-specific state
    const [packageSearchQuery, setPackageSearchQuery] = useState<string>('')
    const [packageCurrentPage, setPackageCurrentPage] = useState<number>(1)
    const [packageSortBy, setPackageSortBy] = useState<PackageSortBy>('createdAt')
    const [packageSortOrder, setPackageSortOrder] = useState<SortOrder>('desc')
    const [isPackageFilterDialogOpen, setIsPackageFilterDialogOpen] = useState<boolean>(false)
    const [packageFilters, setPackageFilters] = useState<PackageFiltersState>({
        title: '',
        status: '',
        category: '',
        pickupDateFrom: '',
        pickupDateTo: ''
    })

    // Trip-specific state
    const [tripSearchQuery, setTripSearchQuery] = useState<string>('')
    const [tripCurrentPage, setTripCurrentPage] = useState<number>(1)
    const [tripSortBy, setTripSortBy] = useState<TripSortBy>('createdAt')
    const [tripSortOrder, setTripSortOrder] = useState<SortOrder>('desc')
    const [isTripFilterDialogOpen, setIsTripFilterDialogOpen] = useState<boolean>(false)
    const [tripFilters, setTripFilters] = useState<TripFiltersState>({
        title: '',
        status: '',        
        priceMin: undefined,
        priceMax: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        destination: undefined
    })

    // Assignment and messaging state
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState<boolean>(false)
    const [selectedChatItem, setSelectedChatItem] = useState<any>(null)
    const [isMessagingOpen, setIsMessagingOpen] = useState<boolean>(false)

    const limit: number = 12

    // API queries with proper parameters
    const packagesQuery = usePackages({
        sortBy: packageSortBy,
        sortOrder: packageSortOrder,
        search: packageSearchQuery,
        ...packageFilters
    } as PackageQueryParams)

    const tripsQuery = useTrips({
        sortBy: tripSortBy,
        sortOrder: tripSortOrder,
        search: tripSearchQuery,
        ...tripFilters
    } as TripQueryParams)

    const handleTabChange = (tab: ActiveTab) => {
        setActiveTab(tab)
        const url = new URL(window.location.href)
        url.searchParams.set('tab', tab)
        window.history.pushState({}, '', url.toString())
    }

    const handlePackageAction = (packageData: any) => {
        if (!user?.id) {
            alert('Please log in to assign packages to trips')
            return
        }

        setSelectedItem(packageData)
        setIsAssignmentDialogOpen(true)
    }

    const handleTripAction = (tripData: any) => {
        if (!user?.id) {
            alert('Please log in to add packages to trips')
            return
        }

        setSelectedItem(tripData)
        setIsAssignmentDialogOpen(true)
    }

    const handleMessage = (itemData: any) => {
        if (!user?.id) {
            alert('Please log in to send messages')
            return
        }

        // Create a mock chat object for the messaging interface
        const mockChat = {
            id: `${activeTab}-${itemData.id}`,
            participants: [user.id, itemData.creator?.id || itemData.traveler?.id],
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        setSelectedChatItem(mockChat)
        setIsMessagingOpen(true)
    }

        // Helper function to get current query and page based on active tab
    const getCurrentQuery = () => activeTab === 'packages' ? packagesQuery : tripsQuery
    const currentQuery = getCurrentQuery()
    
    const getCurrentPage = () => activeTab === 'packages' ? packageCurrentPage : tripCurrentPage
    const setCurrentPage = (page: number) => {
        if (activeTab === 'packages') {
            setPackageCurrentPage(page)
        } else {
            setTripCurrentPage(page)
        }
        
        // Scroll to top when page changes
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
    const currentPage = getCurrentPage()

    // Client-side pagination logic
    const getPaginatedData = () => {
        if (!currentQuery.data) return { data: [], pagination: null }
        
        const allItems = currentQuery.data.data
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

    const handleAssign = async (_assignmentData: any) => {
        try {
            console.log('Assignment:', { activeTab })
            
            setIsAssignmentDialogOpen(false)
            setSelectedItem(null)
            
            // Refresh the data
            if (activeTab === 'packages') {
                packagesQuery.refetch()
            } else {
                tripsQuery.refetch()
            }
        } catch (error) {
            console.error('Assignment failed:', error)
            alert('Failed to create assignment. Please try again.')
        }
    }

    const handleSendMessage = async (content: string, type?: string) => {
        try {
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
                    {/* Tab Navigation */}
                    <div className="flex items-center space-x-8 mb-4">
                        <button
                            onClick={() => handleTabChange('packages')}
                            className={`pb-2 border-b-2 transition-colors ${
                                activeTab === 'packages'
                                    ? 'border-blue-500 text-blue-600 font-medium'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Packages
                        </button>
                        <button
                            onClick={() => handleTabChange('trips')}
                            className={`pb-2 border-b-2 transition-colors ${
                                activeTab === 'trips'
                                    ? 'border-blue-500 text-blue-600 font-medium'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Trips
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {activeTab === 'packages' ? 'Packages' : 'Trips'}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {activeTab === 'packages' 
                                    ? 'Find packages that need to be delivered'
                                    : 'Discover travelers who can carry your packages'
                                }
                            </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                            <Link href={`/${activeTab}/create`}>
                                <Button className="flex items-center space-x-2">
                                    <Plus className="w-4 h-4" />
                                    <span>Add {activeTab === 'packages' ? 'Package' : 'Trip'}</span>
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
                                    placeholder={`Search ${activeTab}...`}
                                    value={activeTab === 'packages' ? packageSearchQuery : tripSearchQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        if (activeTab === 'packages') {
                                            setPackageSearchQuery(e.target.value)
                                        } else {
                                            setTripSearchQuery(e.target.value)
                                        }
                                    }}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Filter and Sort Controls */}
                        <div className="flex items-center space-x-3">
                            {/* Filter Button */}
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (activeTab === 'packages') {
                                        setIsPackageFilterDialogOpen(true)
                                    } else {
                                        setIsTripFilterDialogOpen(true)
                                    }
                                }}
                                className="flex items-center space-x-2"
                            >
                                <FaFilter className="w-4 h-4" />
                                <span>Filter</span>
                            </Button>

                            {/* Sort Controls */}
                            <div className="flex items-center space-x-2">
                                <select
                                    value={activeTab === 'packages' ? packageSortBy : tripSortBy}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                        if (activeTab === 'packages') {
                                            setPackageSortBy(e.target.value as PackageSortBy)
                                        } else {
                                            setTripSortBy(e.target.value as TripSortBy)
                                        }
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-blue-500"
                                >
                                    <option value="createdAt">Date Created</option>
                                    <option value="updatedAt">Last Updated</option>
                                    {activeTab === 'packages' ? (
                                        <>
                                            <option value="title">Title</option>
                                            <option value="offeredPrice">Price</option>
                                            <option value="pickupDate">Pickup Date</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="title">Title</option>
                                            <option value="pricePerKg">Price per Kg</option>
                                            <option value="departureDate">Departure Date</option>
                                            <option value="arrivalDate">Arrival Date</option>
                                        </>
                                    )}
                                </select>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (activeTab === 'packages') {
                                            setPackageSortOrder(packageSortOrder === 'asc' ? 'desc' : 'asc')
                                        } else {
                                            setTripSortOrder(tripSortOrder === 'asc' ? 'desc' : 'asc')
                                        }
                                    }}
                                    className="px-3"
                                >
                                    {(activeTab === 'packages' ? packageSortOrder : tripSortOrder) === 'asc' ? (
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
                            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, paginatedResult.pagination.total)} of {paginatedResult.pagination.total} {activeTab}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
                {currentQuery.isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : !currentQuery.data || currentQuery.data.length === 0 ? (
                    <EmptyState 
                        title={`No ${activeTab} found`}
                        description={`There are no ${activeTab} available at the moment. Create ${activeTab === 'packages' ? 'a package' : 'a trip'} to get started!`}
                        actionLabel={`Create ${activeTab === 'packages' ? 'Package' : 'Trip'}`}
                    />
                ) : (
                    <>
                        {/* Results Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedResult.data?.map((item: any) => 
                                activeTab === 'packages' ? (
                                    <PackageCard
                                        key={item.id}
                                        package={item}
                                        onAddToLuggage={handlePackageAction}
                                        onSendMessage={handleMessage}
                                        currentUserId={user?.id}
                                    />
                                ) : (
                                    <TripCard
                                        key={item.id}
                                        trip={item}
                                        onAddPackage={handleTripAction}
                                        onSendMessage={handleMessage}
                                        currentUserId={user?.id}
                                    />
                                )
                            )}
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

            {/* Package Filter Dialog */}
            {isPackageFilterDialogOpen && (
                <PackageFilters
                    isOpen={isPackageFilterDialogOpen}
                    onClose={() => setIsPackageFilterDialogOpen(false)}
                    filters={packageFilters}
                    onFiltersChange={(filters: PackageFiltersState) => setPackageFilters(filters)}
                    sortBy={packageSortBy}
                    sortOrder={packageSortOrder}
                    onSortChange={(sortBy: string, sortOrder: string) => {
                        setPackageSortBy(sortBy as PackageSortBy)
                        setPackageSortOrder(sortOrder as SortOrder)
                    }}
                />
            )}

            {/* Trip Filter Dialog */}
            {isTripFilterDialogOpen && (
                <TripFilters
                    isOpen={isTripFilterDialogOpen}
                    onClose={() => setIsTripFilterDialogOpen(false)}
                    filters={tripFilters}
                    onFiltersChange={(filters: TripFiltersState) => setTripFilters(filters)}
                    sortBy={tripSortBy}
                    sortOrder={tripSortOrder}
                    onSortChange={(sortBy: string, sortOrder: string) => {
                        setTripSortBy(sortBy as TripSortBy)
                        setTripSortOrder(sortOrder as SortOrder)
                    }}
                />
            )}

            {/* Assignment Dialog */}
            {isAssignmentDialogOpen && selectedItem && (
                <AssignmentDialog
                    isOpen={isAssignmentDialogOpen}
                    onClose={() => {
                        setIsAssignmentDialogOpen(false)
                        setSelectedItem(null)
                    }}
                    type={activeTab === 'packages' ? 'package-to-trip' : 'trip-to-package'}
                    currentItem={selectedItem}
                    availableItems={[]}
                    onAssign={handleAssign}
                />
            )}

            {/* Messaging Interface */}
            {isMessagingOpen && selectedChatItem && (
                <MessagingInterface
                    isOpen={isMessagingOpen}
                    onClose={() => {
                        setIsMessagingOpen(false)
                        setSelectedChatItem(null)
                    }}
                    chat={selectedChatItem}
                    currentUserId={user?.id || ''}
                    onSendMessage={handleSendMessage}
                />
            )}
        </div>
    )
}

export default function PackagesPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>}>
            <PackagesPageContent />
        </Suspense>
    )
}
