// Packages & Trips Page - Simplified for new sidebar navigation
'use client'

import React, { useState, useEffect } from 'react'
import { Button, Input } from '@/components/ui'
import { useAuth, usePackages, useTrips, useFindOrCreateChat, useSendMessage } from '@/lib/hooks/api'
import { PackageCard } from '@/components/packages/PackageCard'
import { TripCard } from '@/components/trips/TripCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

// Define AttachmentData interface
interface AttachmentData {
  name: string;
  data: string; // base64 data
  type: string;
}
import { Pagination } from '@/components/shared/Pagination'
import { AssignmentDialog } from '@/components/shared/AssignmentDialog'
import { MessagingInterface } from '@/components/shared/MessagingInterface'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { Plus, Search, Menu } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/useDebounce';
import SidebarContent from './SidebarContent';
import { NavSidebarContent } from '@/components/shared/NavSidebarContent';
import { MainNavigation } from '@/components/shared/MainNavigation';
import { Filter } from 'lucide-react';
import { Footer } from '@/components/navigation'

// Types
type ActiveTab = 'packages' | 'trips'
type PackageSortBy = 'title' | 'createdAt' | 'updatedAt' | 'offeredPrice' | 'finalPrice' | 'value' | 'pickupDate' | 'deliveryDate' | 'category' | 'priority'
type TripSortBy = 'title' | 'createdAt' | 'updatedAt' | 'departureDate' | 'arrivalDate' | 'pricePerKg' | 'minimumPrice' | 'maximumPrice' | 'maxWeight' | 'availableSpace' | 'transportMode'
type SortOrder = 'asc' | 'desc'

// Updated Package filter interface - matching Prisma schema
interface PackageFiltersState {
    status?: string
    category?: string
    offeredPriceMin?: number
    offeredPriceMax?: number
    finalPriceMin?: number
    finalPriceMax?: number
    valueMin?: number
    valueMax?: number
    pickupDateFrom?: string
    pickupDateTo?: string
    deliveryDateFrom?: string
    deliveryDateTo?: string
    isFragile?: boolean
    requiresSignature?: boolean
    priority?: string
    pickupCity?: string
    pickupCountry?: string
    deliveryCity?: string
    deliveryCountry?: string
}

// Updated Trip filter interface - matching Prisma schema
interface TripFiltersState {
    status?: string
    transportMode?: string
    pricePerKgMin?: number
    pricePerKgMax?: number
    minimumPriceMin?: number
    minimumPriceMax?: number
    maximumPriceMin?: number
    maximumPriceMax?: number
    departureDateFrom?: string
    departureDateTo?: string
    arrivalDateFrom?: string
    arrivalDateTo?: string
    maxWeightMin?: number
    maxWeightMax?: number
    availableSpaceMin?: number
    availableSpaceMax?: number
    flexibleDates?: boolean
    originCity?: string
    originCountry?: string
    destinationCity?: string
    destinationCountry?: string
}

// API Query parameters interface
interface PackageQueryParams {
    page: number
    limit: number
    sortBy: PackageSortBy
    sortOrder: SortOrder
    search?: string
    [key: string]: any // Allow for dynamic filter keys
}

interface TripQueryParams {
    page: number
    limit: number
    sortBy: TripSortBy
    sortOrder: SortOrder
    search?: string
    [key: string]: any // Allow for dynamic filter keys
}

function PackagesPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const tabFromQuery = searchParams.get('tab') as ActiveTab | null
    const { getCurrentUser } = useAuth()
    const { data: user } = getCurrentUser

    const findOrCreateChat = useFindOrCreateChat()
    const sendMessage = useSendMessage()

    const [activeTab, setActiveTab] = useState<ActiveTab>(tabFromQuery || 'packages')
    const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
    const [isNavSidebarOpen, setIsNavSidebarOpen] = useState(false)

    // Prevent body scroll when a sidebar is open
    useEffect(() => {
        if (isFilterSidebarOpen || isNavSidebarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        // Cleanup function
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [isFilterSidebarOpen, isNavSidebarOpen])

    // Update active tab when URL changes
    useEffect(() => {
        const currentTab = searchParams.get('tab') as ActiveTab | null
        if (currentTab === 'packages' || currentTab === 'trips') {
            setActiveTab(currentTab)
        }
    }, [searchParams])

    // Package-specific state
    const [packageSearchInput, setPackageSearchInput] = useState('')
    const debouncedPackageSearch = useDebounce(packageSearchInput, 500)
    const [packageCurrentPage, setPackageCurrentPage] = useState<number>(1)
    const [packageSortBy, setPackageSortBy] = useState<PackageSortBy>('createdAt')
    const [packageSortOrder, setPackageSortOrder] = useState<SortOrder>('desc')
    const [packageFilters, setPackageFilters] = useState<PackageFiltersState>({
        status: undefined,
        category: undefined,
        offeredPriceMin: undefined,
        offeredPriceMax: undefined,
        pickupDateFrom: undefined,
        pickupDateTo: undefined,
        deliveryDateFrom: undefined,
        deliveryDateTo: undefined,
        isFragile: undefined,
        requiresSignature: undefined,
    })

    // Trip-specific state
    const [tripSearchInput, setTripSearchInput] = useState('')
    const debouncedTripSearch = useDebounce(tripSearchInput, 500)
    const [tripCurrentPage, setTripCurrentPage] = useState<number>(1)
    const [tripSortBy, setTripSortBy] = useState<TripSortBy>('createdAt')
    const [tripSortOrder, setTripSortOrder] = useState<SortOrder>('desc')
    const [tripFilters, setTripFilters] = useState<TripFiltersState>({
        status: undefined,
        transportMode: undefined,
        pricePerKgMin: undefined,
        pricePerKgMax: undefined,
        departureDateFrom: undefined,
        departureDateTo: undefined,
        arrivalDateFrom: undefined,
        arrivalDateTo: undefined,
        maxWeightMin: undefined,
        maxWeightMax: undefined,
        flexibleDates: undefined,
    })

    // Assignment and messaging state
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState<boolean>(false)
    const [selectedChatItem, setSelectedChatItem] = useState<any>(null)
    const [isMessagingOpen, setIsMessagingOpen] = useState<boolean>(false)

    const [resultsPerPage, setResultsPerPage] = useState<number>(12)
    // convenience alias for older variable name used in pagination calculations
    const limit = resultsPerPage
    // Auto-apply filters toggle (when true, filters refetch automatically)
    const [autoApply, setAutoApply] = useState<boolean>(false)

    // API queries with proper parameters
    const packagesQuery = usePackages({
        sortBy: packageSortBy,
        sortOrder: packageSortOrder,
        search: debouncedPackageSearch,
        ...packageFilters
    } as PackageQueryParams)

    const tripsQuery = useTrips({
        sortBy: tripSortBy,
        sortOrder: tripSortOrder,
        search: debouncedTripSearch,
        ...tripFilters
    } as TripQueryParams)

    // Auto-apply effects depend on the query objects; define them after queries below
    // Auto-apply effect for packages (debounced)
    useEffect(() => {
        if (!autoApply || activeTab !== 'packages') return

        const t = setTimeout(() => {
            packagesQuery.refetch()
            setPackageCurrentPage(1)
        }, 350)

        return () => clearTimeout(t)
    }, [packageFilters, debouncedPackageSearch, packageSortBy, packageSortOrder, resultsPerPage, autoApply, activeTab, packagesQuery])

    // Auto-apply effect for trips (debounced)
    useEffect(() => {
        if (!autoApply || activeTab !== 'trips') return

        const t = setTimeout(() => {
            tripsQuery.refetch()
            setTripCurrentPage(1)
        }, 350)

        return () => clearTimeout(t)
    }, [tripFilters, debouncedTripSearch, tripSortBy, tripSortOrder, resultsPerPage, autoApply, activeTab, tripsQuery])

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

    const handleMessage = async (itemData: any) => {
        if (!user?.id) {
            alert('Please log in to send messages')
            return
        }

        const participantId = activeTab === 'packages' ? itemData.senderId : itemData.travelerId;
        if (!participantId) {
            alert('Could not determine the other participant.');
            return;
        }



        findOrCreateChat.mutate({
            participantId: participantId,
            itemType: activeTab === 'packages' ? 'package' : 'trip',
            itemId: itemData.id,
            chatType: 'CHAT'
        }, {
            onSuccess: (chatData) => {
                setSelectedChatItem(chatData);
                setIsMessagingOpen(true);

            }
        });
    }

    const handleCallSender = (packageData: any) => {
        if (packageData?.sender?.phone) {
            window.open(`tel:${packageData.sender.phone}`, '_self')
        } else {
            alert('Phone number not available')
        }
    }

    const handleVideoCallSender = () => {
        alert('Video calling feature will be implemented with a video service integration')
    }

    const handleContactSender = async (packageData: any) => {
        await handleMessage(packageData)
    }

    const handleCallTraveler = (tripData: any) => {
        if (tripData?.traveler?.phone) {
            window.open(`tel:${tripData.traveler.phone}`, '_self')
        } else {
            alert('Phone number not available')
        }
    }

    const handleVideoCallTraveler = () => {
        alert('Video calling feature will be implemented with a video service integration')
    }

    const handleContactTraveler = async (tripData: any) => {
        await handleMessage(tripData)
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

    const handleSendMessage = async (content: string, type?: string, attachments?: AttachmentData[]) => {
        if (!selectedChatItem) return;
        sendMessage.mutate({
            chatId: selectedChatItem.id,
            data: { 
                content, 
                type: type || 'TEXT', 
                chatId: selectedChatItem.id,
                attachments
            }
        }, {
            onSuccess: (data) => {
                console.log('Message sent successfully:', data);
                selectedChatItem.messages.push(data);
                setSelectedChatItem({ ...selectedChatItem });
            },
            onError: (error) => {
                console.error('Failed to send message:', error);
            }
        });
    }

    return (
        <div className="flex flex-col w-full items-center max-w-[96rem] min-h-screen bg-white mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between gap-4 w-full py-4 px-2 bg-white sticky top-0 z-30 ">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        className="!p-0"
                        onClick={() => setIsNavSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900 uppercase hidden sm:block">Amenade</h1>
                </div>

                {/* <div className="hidden lg:flex flex-grow justify-center">
                    <MainNavigation />
                </div> */}


                {/* Search Bar & Filter Toggle */}
                <div className="flex w-full max-w-3xl md:flex-none items-center gap-2 justify-end">
                    <div className="w-full relative flex-1 ">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={activeTab === 'packages' ? packageSearchInput : tripSearchInput}
                            onChange={(e) => {
                                if (activeTab === 'packages') {
                                    setPackageSearchInput(e.target.value)
                                } else {
                                    setTripSearchInput(e.target.value)
                                }
                            }}
                            className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-teal-500"
                        />
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => setIsFilterSidebarOpen(true)}
                        className="lg:hidden p-2"
                    >
                        <Filter className="h-5 w-5" />
                        <span className="sr-only">Filters</span>
                    </Button>
                </div>


                {/* Action Buttons */}
                <div className="hidden md:flex items-center space-x-3">
                    <Link href={`/${activeTab}/create`}>
                        <Button className="flex items-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>Add {activeTab === 'packages' ? 'Package' : 'Trip'}</span>
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Sidebars */}
            <div className="flex items-start w-full h-full px-2 gap-8">
                {/* Mobile Navigation sidebar */}
                {isNavSidebarOpen && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 " onClick={() => setIsNavSidebarOpen(false)}>
                        <div className="fixed inset-y-0 left-0 w-80 bg-white flex flex-col" onClick={(e) => e.stopPropagation()}>
                            <NavSidebarContent user={user} onLinkClick={() => setIsNavSidebarOpen(false)} />
                        </div>
                    </div>
                )}

                {/* Mobile filter sidebar */}
                {isFilterSidebarOpen && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setIsFilterSidebarOpen(false)}>
                        <div className="fixed inset-y-0 right-0 w-80 bg-white p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <SidebarContent
                                activeTab={activeTab}
                                packageFilters={packageFilters}
                                setPackageFilters={setPackageFilters}
                                tripFilters={tripFilters}
                                setTripFilters={setTripFilters}
                                packageSortBy={packageSortBy}
                                setPackageSortBy={setPackageSortBy}
                                packageSortOrder={packageSortOrder}
                                setPackageSortOrder={setPackageSortOrder}
                                tripSortBy={tripSortBy}
                                setTripSortBy={setTripSortBy}
                                tripSortOrder={tripSortOrder}
                                setTripSortOrder={setTripSortOrder}
                                autoApply={autoApply}
                                setAutoApply={setAutoApply}
                                resultsPerPage={resultsPerPage}
                                setResultsPerPage={setResultsPerPage}
                                packagesQuery={packagesQuery}
                                tripsQuery={tripsQuery}
                                setPackageCurrentPage={setPackageCurrentPage}
                                setTripCurrentPage={setTripCurrentPage}
                                setPackageSearchInput={setPackageSearchInput}
                                setTripSearchInput={setTripSearchInput}
                                handleTabChange={handleTabChange}
                            />
                        </div>
                    </div>
                )}

                {/* Desktop filter sidebar */}
                {!currentQuery.isLoading && paginatedResult.data.length > 0 && (
                    <div className="hidden lg:block sticky top-[81px] h-[calc(100vh-81px)] overflow-y-auto p-4 w-90 bg-white border-l border-gray-200">
                        <SidebarContent
                            activeTab={activeTab}
                            packageFilters={packageFilters}
                            setPackageFilters={setPackageFilters}
                            tripFilters={tripFilters}
                            setTripFilters={setTripFilters}
                            packageSortBy={packageSortBy}
                            setPackageSortBy={setPackageSortBy}
                            packageSortOrder={packageSortOrder}
                            setPackageSortOrder={setPackageSortOrder}
                            tripSortBy={tripSortBy}
                            setTripSortBy={setTripSortBy}
                            tripSortOrder={tripSortOrder}
                            setTripSortOrder={setTripSortOrder}
                            autoApply={autoApply}
                            setAutoApply={setAutoApply}
                            resultsPerPage={resultsPerPage}
                            setResultsPerPage={setResultsPerPage}
                            packagesQuery={packagesQuery}
                            tripsQuery={tripsQuery}
                            setPackageCurrentPage={setPackageCurrentPage}
                            setTripCurrentPage={setTripCurrentPage}
                            setPackageSearchInput={setPackageSearchInput}
                            setTripSearchInput={setTripSearchInput}
                            handleTabChange={handleTabChange}
                        />
                    </div>)}

                <div className="flex justify-center items-center h-full m-auto py-8">
                    {/* Content */}
                    <div className="">
                        {currentQuery.isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : !currentQuery.data || currentQuery.data.data.length === 0 ? (
                            <EmptyState
                                title={`No ${activeTab} found`}
                                description={`There are no ${activeTab} available at the moment. Create ${activeTab === 'packages' ? 'a package' : 'a trip'} to get started!`}
                                actionLabel={`Create ${activeTab === 'packages' ? 'Package' : 'Trip'}`}
                                onAction={() => router.push(`/${activeTab}/create`)}
                            />
                        ) : (
                            <>
                                {/* Results Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {paginatedResult.data?.map((item: any) => (
                                        <div key={item.id} className="h-full">
                                            {activeTab === 'packages' ? (
                                                <PackageCard
                                                    package={item}
                                                    onAddToLuggage={handlePackageAction}
                                                    onSendMessage={handleMessage}
                                                    onCallSender={handleCallSender}
                                                    onVideoCallSender={handleVideoCallSender}
                                                    onContactSender={handleContactSender}
                                                    currentUserId={user?.id}
                                                />
                                            ) : (
                                                <TripCard
                                                    trip={item}
                                                    onAddPackage={handleTripAction}
                                                    onSendMessage={handleMessage}
                                                    onCallTraveler={handleCallTraveler}
                                                    onVideoCallTraveler={handleVideoCallTraveler}
                                                    onContactTraveler={handleContactTraveler}
                                                    currentUserId={user?.id}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {paginatedResult.pagination && paginatedResult.pagination.totalPages > 1 && (
                                    <div className="mt-8 flex justify-center">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={paginatedResult.pagination.totalPages}
                                            onPageChange={setCurrentPage}
                                            showInfo={true}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

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
                            availableItems={activeTab === 'packages' ? tripsQuery.data?.data || [] : packagesQuery.data?.data || []}
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
            </div>
        </div>)
}


export default function PackagesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PackagesPageContent />
            <Footer />
        </Suspense>
    )
}