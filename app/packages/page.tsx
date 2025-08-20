// Fakomame Platform - Packages & Trips Listing Page
'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Button, Input } from '@/components/ui'
import { useAuth, usePackages, useTrips } from '@/lib/hooks/api'
import Link from 'next/link'
import { PackageFilters } from '@/components/packages/PackageFilters'
import { TripFilters } from '@/components/trips/TripFilters'
import { PackageCard } from '@/components/packages/PackageCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Pagination } from '@/components/shared/Pagination'
import { TripCard } from '@/components/trips/TripCard'
import { AssignmentDialog } from '@/components/shared/AssignmentDialog'
import { MessagingInterface } from '@/components/shared/MessagingInterface'
import { FaFilter } from 'react-icons/fa6'
import { useRouter } from 'next/navigation'

type ActiveTab = 'packages' | 'trips'
type PackageSortBy = 'title' | 'createdAt' | 'updatedAt' | 'offeredPrice' | 'pickupDate'
type TripSortBy = 'title' | 'createdAt' | 'updatedAt' | 'departureDate' | 'arrivalDate' | 'pricePerKg'
type SortOrder = 'asc' | 'desc'

// Get query parameters from URL



export default function PackagesPage() {
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    const tabFromQuery = searchParams.get('tab') as ActiveTab | null
    const { getCurrentUser } = useAuth()
    const { data: user } = getCurrentUser

    const router = useRouter()
    const [activeTab, setActiveTab] = useState<ActiveTab>('packages')

    // Initialize active tab from query parameter
    useEffect(() => {
        if (tabFromQuery && (tabFromQuery === 'packages' || tabFromQuery === 'trips')) {
            setActiveTab(tabFromQuery)
        }
    }, [tabFromQuery])

    // Package-specific state
    const [packageSearchQuery, setPackageSearchQuery] = useState('')
    const [packageCurrentPage, setPackageCurrentPage] = useState(1)
    const [packageSortBy, setPackageSortBy] = useState<PackageSortBy>('createdAt')
    const [packageSortOrder, setPackageSortOrder] = useState<SortOrder>('desc')
    const [isPackageFilterDialogOpen, setIsPackageFilterDialogOpen] = useState(false)
    const [packageFilters, setPackageFilters] = useState({
        title: '',
        status: '',
        category: '',
        priceMin: '',
        priceMax: '',
        pickupDateFrom: '',
        pickupDateTo: ''
    })

    // Trip-specific state
    const [tripSearchQuery, setTripSearchQuery] = useState('')
    const [tripCurrentPage, setTripCurrentPage] = useState(1)
    const [tripSortBy, setTripSortBy] = useState<TripSortBy>('createdAt')
    const [tripSortOrder, setTripSortOrder] = useState<SortOrder>('desc')
    const [isTripFilterDialogOpen, setIsTripFilterDialogOpen] = useState(false)
    const [tripFilters, setTripFilters] = useState({
        title: '',
        status: '',
        transportMode: '',
        priceMin: '',
        priceMax: '',
        dateFrom: '',
        dateTo: '',
        destination: ''
    })

    // Assignment and messaging state
    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [assignmentType, setAssignmentType] = useState<'package' | 'trip'>('package')
    const [isMessagingOpen, setIsMessagingOpen] = useState(false)
    const [currentChat, setCurrentChat] = useState<any>(null)

    // Get the current user ID
    const currentUserId = user.id

    const limit = 12

    // Package query parameters
    const packageQueryParams = useMemo(() => {
        const params: any = {
            page: packageCurrentPage,
            limit,
            sortBy: packageSortBy,
            sortOrder: packageSortOrder,
            ...packageFilters
        }

        if (packageSearchQuery) {
            params.title = packageSearchQuery
            params.description = packageSearchQuery
            params.deliveryDate = packageSearchQuery
            params.description = packageSearchQuery
            params.offeredPrice = Number(packageSearchQuery)
        }

        // Remove empty filters
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null || params[key] === undefined) {
                delete params[key]
            }
        })

        return params
    }, [packageCurrentPage, limit, packageSortBy, packageSortOrder, packageFilters, packageSearchQuery])

    // Trip query parameters
    const tripQueryParams = useMemo(() => {
        const params: any = {
            page: tripCurrentPage,
            limit,
            sortBy: tripSortBy,
            sortOrder: tripSortOrder,
            ...tripFilters
        }

        if (tripSearchQuery) {
            params.title = tripSearchQuery
        }

        // Remove empty filters
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null || params[key] === undefined) {
                delete params[key]
            }
        })

        return params
    }, [tripCurrentPage, limit, tripSortBy, tripSortOrder, tripFilters, tripSearchQuery])

    // Fetch data
    const packagesQuery = usePackages(packageQueryParams)
    const tripsQuery = useTrips(tripQueryParams)

    // Loading states
    const isLoading = activeTab === 'packages' ? packagesQuery.isLoading : tripsQuery.isLoading
    const isError = activeTab === 'packages' ? packagesQuery.isError : tripsQuery.isError

    // Package data processing
    const processedPackages = useMemo(() => {
        let filtered = packagesQuery.data || []

        // Apply search filter
        if (packageSearchQuery) {
            const query = packageSearchQuery.toLowerCase()
            filtered = filtered.filter((item: any) => {
                const title = (item.title || '').toLowerCase()
                const description = (item.description || '').toLowerCase()
                return title.includes(query) || description.includes(query)
            })
        }

        // Apply status filter
        if (packageFilters.status) {
            filtered = filtered.filter((item: any) => item.status === packageFilters.status)
        }

        // Apply category filter
        if (packageFilters.category) {
            filtered = filtered.filter((item: any) => item.category === packageFilters.category)
        }

        // Apply price range filters
        if (packageFilters.priceMin) {
            const minPrice = parseFloat(packageFilters.priceMin)
            filtered = filtered.filter((item: any) => (item.offeredPrice || 0) >= minPrice)
        }

        if (packageFilters.priceMax) {
            const maxPrice = parseFloat(packageFilters.priceMax)
            filtered = filtered.filter((item: any) => (item.offeredPrice || 0) <= maxPrice)
        }

        // Apply date range filters
        if (packageFilters.pickupDateFrom) {
            const fromDate = new Date(packageFilters.pickupDateFrom)
            filtered = filtered.filter((item: any) => {
                const itemDate = new Date(item.pickupDate || item.createdAt)
                return itemDate >= fromDate
            })
        }

        if (packageFilters.pickupDateTo) {
            const toDate = new Date(packageFilters.pickupDateTo)
            filtered = filtered.filter((item: any) => {
                const itemDate = new Date(item.pickupDate || item.createdAt)
                return itemDate <= toDate
            })
        }

        return filtered
    }, [packagesQuery.data, packageSearchQuery, packageFilters])

    // Trip data processing
    const processedTrips = useMemo(() => {
        let filtered = tripsQuery.data || []

        // Apply search filter
        if (tripSearchQuery) {
            const query = tripSearchQuery.toLowerCase()
            filtered = filtered.filter((item: any) => {
                const title = (item.title || '').toLowerCase()
                const destination = (item.destination || '').toLowerCase()
                return title.includes(query) || destination.includes(query)
            })
        }

        // Apply status filter
        if (tripFilters.status) {
            filtered = filtered.filter((item: any) => item.status === tripFilters.status)
        }

        // Apply transport mode filter
        if (tripFilters.transportMode) {
            filtered = filtered.filter((item: any) => item.transportMode === tripFilters.transportMode)
        }

        // Apply destination filter
        if (tripFilters.destination) {
            const destination = tripFilters.destination.toLowerCase()
            filtered = filtered.filter((item: any) =>
                (item.destination || '').toLowerCase().includes(destination) ||
                (item.title || '').toLowerCase().includes(destination)
            )
        }

        // Apply price range filters
        if (tripFilters.priceMin) {
            const minPrice = parseFloat(tripFilters.priceMin)
            filtered = filtered.filter((item: any) => (item.pricePerKg || 0) >= minPrice)
        }

        if (tripFilters.priceMax) {
            const maxPrice = parseFloat(tripFilters.priceMax)
            filtered = filtered.filter((item: any) => (item.pricePerKg || 0) <= maxPrice)
        }

        // Apply date range filters
        if (tripFilters.dateFrom) {
            const fromDate = new Date(tripFilters.dateFrom)
            filtered = filtered.filter((item: any) => {
                const itemDate = new Date(item.departureDate || item.createdAt)
                return itemDate >= fromDate
            })
        }

        if (tripFilters.dateTo) {
            const toDate = new Date(tripFilters.dateTo)
            filtered = filtered.filter((item: any) => {
                const itemDate = new Date(item.departureDate || item.createdAt)
                return itemDate <= toDate
            })
        }

        return filtered
    }, [tripsQuery.data, tripSearchQuery, tripFilters])

    // Current data and pagination based on active tab
    const currentData = activeTab === 'packages' ? processedPackages : processedTrips
    const currentPage = activeTab === 'packages' ? packageCurrentPage : tripCurrentPage
    const setCurrentPage = activeTab === 'packages' ? setPackageCurrentPage : setTripCurrentPage

    // Pagination logic
    const startIndex = (currentPage - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = currentData.slice(startIndex, endIndex)

    // Pagination info
    const totalPages = Math.max(1, Math.ceil(currentData.length / limit))
    const totalItems = currentData.length

    // Check if filters are active
    const packageHasActiveFilters = Object.values(packageFilters).some(value => value !== '')
    const tripHasActiveFilters = Object.values(tripFilters).some(value => value !== '')
    const hasActiveFilters = activeTab === 'packages' ? packageHasActiveFilters : tripHasActiveFilters

    //filtered data
    const myPackagesQuery = packagesQuery.data?.filter((pkg: { sender: { id: string } }) => pkg.sender.id === currentUserId) || []
    const myTripsQuery = tripsQuery.data?.filter((trip: { traveler: { id: string } }) => trip.traveler.id === currentUserId) || []

    // Handler functions
    const handlePackageSearch = (query: string) => {
        setPackageSearchQuery(query)
        setPackageCurrentPage(1)
    }

    const handleTripSearch = (query: string) => {
        setTripSearchQuery(query)
        setTripCurrentPage(1)
    }

    const handlePackageFilterChange = (newFilters: any) => {
        setPackageFilters(newFilters)
        setPackageCurrentPage(1)
    }

    const handleTripFilterChange = (newFilters: any) => {
        setTripFilters(newFilters)
        setTripCurrentPage(1)
    }

    const handlePackageSort = (newSortBy: string, newSortOrder: string) => {
        setPackageSortBy(newSortBy as PackageSortBy)
        setPackageSortOrder(newSortOrder as SortOrder)
        setPackageCurrentPage(1)
    }

    const handleTripSort = (newSortBy: string, newSortOrder: string) => {
        setTripSortBy(newSortBy as TripSortBy)
        setTripSortOrder(newSortOrder as SortOrder)
        setTripCurrentPage(1)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Assignment and messaging handlers
    const handleAddToLuggage = (pkg: any) => {
        setSelectedItem(pkg)
        setAssignmentType('package')
        setIsAssignmentDialogOpen(true)
    }

    const handleAddPackage = (trip: any) => {
        setSelectedItem(trip)
        setAssignmentType('trip')
        setIsAssignmentDialogOpen(true)
    }

    const handleSendMessage = async (item: any) => {
        try {
            // Create or find existing chat
            const response = await fetch('/api/chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    participantId: activeTab === 'packages' ? item.sender.id : item.traveler.id,
                    itemType: activeTab === 'packages' ? 'package' : 'trip',
                    itemId: item.id,
                }),
            })

            if (response.ok) {
                const chat = await response.json()
                setCurrentChat(chat)
                setIsMessagingOpen(true)
            }
        } catch (error) {
            console.error('Error creating chat:', error)
        }
    }

    const handleAssignmentComplete = () => {
        setIsAssignmentDialogOpen(false)
        setSelectedItem(null)
        // Refresh data
        if (activeTab === 'packages') {
            packagesQuery.refetch()
        } else {
            tripsQuery.refetch()
        }
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Data</h1>
                        <p className="text-gray-600 mb-6">Failed to load packages and trips. Please try again.</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">Packages & Trips</h1>
                        </div>
                        <div className="mt-4 sm:mt-0 flex space-x-3">
                            <Link href="/packages/create">
                                <Button>
                                    Create Package
                                </Button>
                            </Link>
                            <Link href="/trips/create">
                                <Button variant="outline">
                                    Post Trip
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6 w-full">
                    <div className="flex flex-col gap-4 lg:flex-row justify-between border-b border-gray-200 w-full">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => {
                                    setActiveTab('packages')
                                    router.push('/packages?tab=packages')
                                }}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'packages'
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Packages
                                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                                    {processedPackages.length}
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('trips')
                                    router.push('/packages?tab=trips')
                                }}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'trips'
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Trips
                                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                                    {processedTrips.length}
                                </span>
                            </button>
                        </nav>
                        {/* Search and Filter Bar */}
                        <div className="w-full max-w-2xl">
                            <div className="flex items-center gap-4">
                                {/* Search */}
                                <div className="flex-1 max-w-2xl">
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder={activeTab === 'packages' ? 'Search packages...' : 'Search trips...'}
                                            value={activeTab === 'packages' ? packageSearchQuery : tripSearchQuery}
                                            onChange={(e) =>
                                                activeTab === 'packages'
                                                    ? handlePackageSearch(e.target.value)
                                                    : handleTripSearch(e.target.value)
                                            }
                                            className="pl-10"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Filter Button */}
                                <Button
                                    variant='outline'
                                    size='lg'
                                    onClick={() =>
                                        activeTab === 'packages'
                                            ? setIsPackageFilterDialogOpen(true)
                                            : setIsTripFilterDialogOpen(true)
                                    }
                                    title='Sort & Filter Options'
                                    className={`${hasActiveFilters ? 'border-teal-500 text-teal-600' : ''}`}
                                >
                                    <FaFilter className="text-gray-400 size-4" />
                                    {hasActiveFilters && (
                                        <span className="ml-1 text-xs">•</span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Tab Content */}
                {isLoading ? (
                    <LoadingSpinner className="py-12" />
                ) : currentData.length === 0 ? (
                    <EmptyState
                        title={`No ${activeTab} found`}
                        description="Try adjusting your search criteria or filters to find what you're looking for."
                        actionLabel="Clear Filters"
                        onAction={() => {
                            if (activeTab === 'packages') {
                                setPackageSearchQuery('')
                                setPackageFilters({
                                    title: '',
                                    status: '',
                                    category: '',
                                    priceMin: '',
                                    priceMax: '',
                                    pickupDateFrom: '',
                                    pickupDateTo: ''
                                })
                            } else {
                                setTripSearchQuery('')
                                setTripFilters({
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
                        }}
                    />
                ) : (
                    <>
                        {/* Results Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {paginatedData.map((item: any) => (
                                <div key={item.id}>
                                    {activeTab === 'packages' ? (
                                        <PackageCard
                                            package={item}
                                            onAddToLuggage={handleAddToLuggage}
                                            onSendMessage={handleSendMessage}
                                            currentUserId={currentUserId}
                                        />
                                    ) : (
                                        <TripCard
                                            trip={item}
                                            onAddPackage={handleAddPackage}
                                            onSendMessage={handleSendMessage}
                                            currentUserId={currentUserId}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            showInfo={{
                                start: (currentPage - 1) * limit + 1,
                                end: Math.min(currentPage * limit, totalItems),
                                total: totalItems
                            }}
                        />
                    </>
                )}

                {/* Package Filters Dialog */}
                <PackageFilters
                    filters={packageFilters}
                    onFiltersChange={handlePackageFilterChange}
                    isOpen={isPackageFilterDialogOpen}
                    onClose={() => setIsPackageFilterDialogOpen(false)}
                    sortBy={packageSortBy}
                    sortOrder={packageSortOrder}
                    onSortChange={handlePackageSort}
                />

                {/* Trip Filters Dialog */}
                <TripFilters
                    filters={tripFilters}
                    onFiltersChange={handleTripFilterChange}
                    isOpen={isTripFilterDialogOpen}
                    onClose={() => setIsTripFilterDialogOpen(false)}
                    sortBy={tripSortBy}
                    sortOrder={tripSortOrder}
                    onSortChange={handleTripSort}
                />

                {/* Assignment Dialog */}
                <AssignmentDialog
                    isOpen={isAssignmentDialogOpen}
                    onClose={() => setIsAssignmentDialogOpen(false)}
                    type={assignmentType === 'package' ? 'package-to-trip' : 'trip-to-package'}
                    currentItem={selectedItem}
                    availableItems={assignmentType === 'package' ? (myTripsQuery || []) : (myPackagesQuery || [])}
                    onAssign={async (targetId: string, confirmations: any) => {
                        try {
                            const response = await fetch('/api/assignments', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    packageId: assignmentType === 'package' ? selectedItem?.id : targetId,
                                    tripId: assignmentType === 'package' ? targetId : selectedItem?.id,
                                    safetyConfirmations: confirmations,
                                }),
                            })

                            if (response.ok) {
                                handleAssignmentComplete()
                            }
                        } catch (error) {
                            console.error('Error creating assignment:', error)
                        }
                    }}
                />

                {/* Messaging Interface */}
                {isMessagingOpen && currentChat && (
                    <MessagingInterface
                        chat={currentChat}
                        currentUserId={currentUserId}
                        isOpen={isMessagingOpen}
                        onClose={() => {
                            setIsMessagingOpen(false)
                            setCurrentChat(null)
                        }}
                        onSendMessage={async (content: string, type?: string) => {
                            try {
                                const response = await fetch('/api/chats/messages', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        chatId: currentChat.id,
                                        content,
                                        messageType: type || 'text',
                                    }),
                                })

                                if (response.ok) {
                                    // Refresh chat data or update local state
                                    const updatedMessage = await response.json()
                                    setCurrentChat((prev: any) => ({
                                        ...prev,
                                        messages: [...(prev.messages || []), updatedMessage]
                                    }))
                                }
                            } catch (error) {
                                console.error('Error sending message:', error)
                            }
                        }}
                    />
                )}
            </div>
        </div>
    )
}
