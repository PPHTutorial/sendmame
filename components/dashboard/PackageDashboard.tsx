// Fakomame Platform - Package Dashboard
'use client'

import { useState } from 'react'
import { Card, Button, Badge, Input } from '@/components/ui'
import { ChatWindow } from '@/components/chat'
import { Plus, MapPin, Calendar, Package, MessageCircle, Search } from 'lucide-react'

interface Package {
    id: string
    title: string
    description: string
    fromAddress: string
    toAddress: string
    weight: number
    dimensions: string
    price: number
    status: 'open' | 'matched' | 'in_transit' | 'delivered'
    createdAt: string
    sender: {
        id: string
        firstName: string
        lastName: string
        rating: number
    }
    matchedTrip?: {
        id: string
        traveler: {
            id: string
            firstName: string
            lastName: string
            rating: number
        }
        departureDate: string
    }
    chatId?: string
}

interface Trip {
    id: string
    fromAddress: string
    toAddress: string
    departureDate: string
    arrivalDate: string
    maxWeight: number
    pricePerKg: number
    status: 'open' | 'matched' | 'in_transit' | 'completed'
    traveler: {
        id: string
        firstName: string
        lastName: string
        rating: number
    }
    matchedPackages: Package[]
}

const mockPackages: Package[] = [
    {
        id: '1',
        title: 'Electronics Package',
        description: 'Laptop and accessories for my brother',
        fromAddress: 'New York, NY',
        toAddress: 'Los Angeles, CA',
        weight: 2.5,
        dimensions: '40x30x10 cm',
        price: 50,
        status: 'matched',
        createdAt: '2024-01-15T10:00:00Z',
        sender: {
            id: 'user1',
            firstName: 'John',
            lastName: 'Doe',
            rating: 4.8
        },
        matchedTrip: {
            id: 'trip1',
            traveler: {
                id: 'user2',
                firstName: 'Jane',
                lastName: 'Smith',
                rating: 4.9
            },
            departureDate: '2024-01-20T08:00:00Z'
        },
        chatId: 'chat1'
    },
    {
        id: '2',
        title: 'Documents Envelope',
        description: 'Important legal documents',
        fromAddress: 'Chicago, IL',
        toAddress: 'Miami, FL',
        weight: 0.5,
        dimensions: '30x20x1 cm',
        price: 25,
        status: 'open',
        createdAt: '2024-01-16T14:30:00Z',
        sender: {
            id: 'user3',
            firstName: 'Bob',
            lastName: 'Wilson',
            rating: 4.6
        }
    }
]

const mockTrips: Trip[] = [
    {
        id: 'trip1',
        fromAddress: 'New York, NY',
        toAddress: 'Los Angeles, CA',
        departureDate: '2024-01-20T08:00:00Z',
        arrivalDate: '2024-01-20T17:00:00Z',
        maxWeight: 10,
        pricePerKg: 20,
        status: 'matched',
        traveler: {
            id: 'user2',
            firstName: 'Jane',
            lastName: 'Smith',
            rating: 4.9
        },
        matchedPackages: [mockPackages[0]]
    },
    {
        id: 'trip2',
        fromAddress: 'Seattle, WA',
        toAddress: 'Boston, MA',
        departureDate: '2024-01-25T10:00:00Z',
        arrivalDate: '2024-01-25T19:00:00Z',
        maxWeight: 15,
        pricePerKg: 18,
        status: 'open',
        traveler: {
            id: 'user4',
            firstName: 'Alice',
            lastName: 'Johnson',
            rating: 4.7
        },
        matchedPackages: []
    }
]


const getStatusColor = (status: string) => {
    switch (status) {
        case 'open': return 'bg-yellow-100 text-yellow-800'
        case 'matched': return 'bg-blue-100 text-blue-800'
        case 'in_transit': return 'bg-orange-100 text-orange-800'
        case 'delivered': return 'bg-green-100 text-green-800'
        case 'completed': return 'bg-green-100 text-green-800'
        default: return 'bg-gray-100 text-gray-800'
    }
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}


export function PackageDashboard() {
    const [activeTab, setActiveTab] = useState<'packages' | 'trips'>('packages')
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
    const [showChat, setShowChat] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredPackages = mockPackages.filter(pkg =>
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.fromAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.toAddress.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredTrips = mockTrips.filter(trip =>
        trip.fromAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.toAddress.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <div className="flex space-x-4">
                    <Button variant="primary" className="flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>New Package</span>
                    </Button>
                    <Button variant="secondary" className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>New Trip</span>
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('packages')}
                    className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'packages'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    My Packages ({mockPackages.length})
                </button>
                <button
                    onClick={() => setActiveTab('trips')}
                    className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'trips'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    My Trips ({mockTrips.length})
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {activeTab === 'packages' ? (
                        <div className="space-y-4">
                            {filteredPackages.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No packages found
                                </div>
                            ) : (
                                filteredPackages.map((pkg) => (
                                    <PackageCard
                                        key={pkg.id}
                                        package={pkg}
                                        onSelect={setSelectedPackage}
                                        onShowChat={() => {
                                            setSelectedPackage(pkg)
                                            setShowChat(true)
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTrips.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No trips found
                                </div>
                            ) : (
                                filteredTrips.map((trip) => (
                                    <TripCard key={trip.id} trip={trip} />
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    {showChat && selectedPackage?.chatId ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Chat</h3>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowChat(false)}
                                    className="text-sm"
                                >
                                    Close
                                </Button>
                            </div>
                            <ChatWindow
                                chatId={selectedPackage.chatId}
                                title={`${selectedPackage.title} - Chat`}
                            />
                        </div>
                    ) : selectedPackage ? (
                        <PackageDetails package={selectedPackage} />
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Select a package or trip to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

interface PackageCardProps {
    package: Package
    onSelect: (pkg: Package) => void
    onShowChat: () => void
}

function PackageCard({ package: pkg, onSelect, onShowChat }: PackageCardProps) {
    return (
        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelect(pkg)}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.title}</h3>
                    <p className="text-gray-600 mb-3">{pkg.description}</p>
                </div>
                <Badge className={getStatusColor(pkg.status)}>
                    {pkg.status.replace('_', ' ')}
                </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{pkg.fromAddress}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{pkg.toAddress}</span>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                        <Package className="w-4 h-4" />
                        <span>{pkg.weight}kg</span>
                    </span>
                    <span>${pkg.price}</span>
                </div>

                <div className="flex space-x-2">
                    {pkg.chatId && (
                        <Button
                            variant="secondary"
                            onClick={(e) => {
                                e.stopPropagation()
                                onShowChat()
                            }}
                            className="flex items-center space-x-1 text-sm"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>Chat</span>
                        </Button>
                    )}
                </div>
            </div>

            {pkg.matchedTrip && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                        <div className="font-medium">
                            Matched with {pkg.matchedTrip.traveler.firstName} {pkg.matchedTrip.traveler.lastName}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>Departure: {formatDate(pkg.matchedTrip.departureDate)}</span>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    )
}

interface TripCardProps {
    trip: Trip
}

function TripCard({ trip }: TripCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-yellow-100 text-yellow-800'
            case 'matched': return 'bg-blue-100 text-blue-800'
            case 'in_transit': return 'bg-orange-100 text-orange-800'
            case 'completed': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {trip.fromAddress} → {trip.toAddress}
                    </h3>
                </div>
                <Badge className={getStatusColor(trip.status)}>
                    {trip.status.replace('_', ' ')}
                </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Departure: {formatDate(trip.departureDate)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Arrival: {formatDate(trip.arrivalDate)}</span>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Max Weight: {trip.maxWeight}kg</span>
                    <span>Price: ${trip.pricePerKg}/kg</span>
                </div>
            </div>

            {trip.matchedPackages.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-800">
                        <div className="font-medium">
                            {trip.matchedPackages.length} package(s) matched
                        </div>
                        {trip.matchedPackages.map((pkg) => (
                            <div key={pkg.id} className="mt-1">
                                • {pkg.title} ({pkg.weight}kg)
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    )
}

interface PackageDetailsProps {
    package: Package
}

function PackageDetails({ package: pkg }: PackageDetailsProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Package Details</h3>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-500">Title</label>
                    <p className="text-gray-900">{pkg.title}</p>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{pkg.description}</p>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-500">Route</label>
                    <p className="text-gray-900">{pkg.fromAddress} → {pkg.toAddress}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">Weight</label>
                        <p className="text-gray-900">{pkg.weight}kg</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Price</label>
                        <p className="text-gray-900">${pkg.price}</p>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-500">Dimensions</label>
                    <p className="text-gray-900">{pkg.dimensions}</p>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-gray-900">{formatDate(pkg.createdAt)}</p>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-500">Sender</label>
                    <p className="text-gray-900">
                        {pkg.sender.firstName} {pkg.sender.lastName}
                        <span className="text-yellow-500 ml-2">★ {pkg.sender.rating}</span>
                    </p>
                </div>

                {pkg.matchedTrip && (
                    <div>
                        <label className="text-sm font-medium text-gray-500">Traveler</label>
                        <p className="text-gray-900">
                            {pkg.matchedTrip.traveler.firstName} {pkg.matchedTrip.traveler.lastName}
                            <span className="text-yellow-500 ml-2">★ {pkg.matchedTrip.traveler.rating}</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            Departure: {formatDate(pkg.matchedTrip.departureDate)}
                        </p>
                    </div>
                )}
            </div>
        </Card>
    )
}

export default PackageDashboard
