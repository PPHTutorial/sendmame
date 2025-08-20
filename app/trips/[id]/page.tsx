/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui'
import { useTrip } from '@/lib/hooks/api'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Calendar, Star, MessageCircle, Edit, Package2, Weight, AlertTriangle, Truck, Clock, Route } from 'lucide-react'
import { authApi } from '@/lib/api/client'
import { ImageGallery } from '@/components/shared/ImageGallery'

export default function TripDetailsPage() {
    const params = useParams()
    const tripId = params.id as string
    const [isMyPost, setIsMyPost] = useState(false)

    const { data: tripData, isLoading, error } = useTrip(tripId)

    const trip = tripData

    useEffect(() => {
        const checkIsMyPost = async () => {
            const currentUser = await authApi.getCurrentUser()
            const isMine = (currentUser?.id === trip?.travelerId);
            setIsMyPost(isMine);
        };
        
        if (trip) {
            checkIsMyPost();
        }
    }, [trip]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        )
    }

    if (error || !tripData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h1>
                    <p className="text-gray-600 mb-4">The trip you're looking for doesn't exist or has been removed.</p>
                    <Link href="/trips">
                        <Button>Back to Trips</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const formatLocation = (address: any) => {
        if (typeof address === 'string') {
            try {
                address = JSON.parse(address)
            } catch {
                return address
            }
        }
        return `${address.street || address.formatted_address || ''}, ${address.city}, ${address.state} ${address.postalCode || ''}, ${address.country}`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'POSTED': return 'bg-blue-100 text-blue-800'
            case 'ACTIVE': return 'bg-green-100 text-green-800'
            case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800'
            case 'COMPLETED': return 'bg-gray-100 text-gray-800'
            case 'CANCELLED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getTransportIcon = (mode: string) => {
        switch (mode?.toLowerCase()) {
            case 'plane':
            case 'flight':
                return '✈️'
            case 'car':
                return '🚗'
            case 'train':
                return '🚆'
            case 'bus':
                return '🚌'
            case 'ship':
            case 'boat':
                return '🚢'
            default:
                return '🚗'
        }
    }

    const calculateDuration = () => {
        if (trip.departureDate && trip.arrivalDate) {
            const departure = new Date(trip.departureDate)
            const arrival = new Date(trip.arrivalDate)
            const diffMs = arrival.getTime() - departure.getTime()
            const hours = Math.floor(diffMs / (1000 * 60 * 60))
            const days = Math.floor(hours / 24)
            
            if (days > 0) {
                return `${days} day${days > 1 ? 's' : ''} ${hours % 24}h`
            }
            return `${hours}h`
        }
        return 'Duration not specified'
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center space-x-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {getTransportIcon(trip.transportMode)} {formatLocation(trip.originAddress).split(',')[1]} → {formatLocation(trip.destinationAddress).split(',')[1]}
                                </h1>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                                        {trip.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Posted {new Date(trip.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {isMyPost && (
                                <Link href={`/trips/${trip.id}/edit`}>
                                    <Button variant="outline" className="flex items-center">
                                        <Edit className="w-4 h-4" />
                                        <span className='hidden lg:block ml-2'>Edit Trip</span>
                                    </Button>
                                </Link>
                            )}
                            {!isMyPost && (
                                <Button className="flex items-center">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className='hidden lg:block ml-2'>Contact Traveler</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Trip Images */}
                        {trip.images && trip.images.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Photos</h2>
                                    <ImageGallery images={trip.images} />
                                </div>
                            </div>
                        )}

                        {/* Route Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Route className="w-5 h-5 mr-2 text-teal-600" />
                                    Route Information
                                </h2>

                                <div className="space-y-6">
                                    {/* Origin */}
                                    <div className="flex items-start space-x-4">
                                        <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Origin</h3>
                                            <p className="text-gray-900 font-medium">{formatLocation(trip.originAddress)}</p>
                                            <p className="text-sm text-gray-600 mt-1 flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Departure: {formatDate(trip.departureDate)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Route Line */}
                                    <div className="flex items-center ml-2">
                                        <div className="w-px h-8 bg-gray-300"></div>
                                        <div className="ml-4 text-sm text-gray-500 flex items-center">
                                            <Truck className="w-4 h-4 mr-1" />
                                            {trip.transportMode} • {calculateDuration()}
                                        </div>
                                    </div>

                                    {/* Destination */}
                                    <div className="flex items-start space-x-4">
                                        <div className="w-4 h-4 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Destination</h3>
                                            <p className="text-gray-900 font-medium">{formatLocation(trip.destinationAddress)}</p>
                                            <p className="text-sm text-gray-600 mt-1 flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Arrival: {formatDate(trip.arrivalDate)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Capacity & Restrictions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Package2 className="w-5 h-5 mr-2 text-teal-600" />
                                    Capacity & Restrictions
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Maximum Capacity</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Weight className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-900">{trip.maxWeight} kg maximum weight</span>
                                            </div>
                                            {trip.maxDimensions && (
                                                <div className="flex items-center space-x-2">
                                                    <Package2 className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-900">
                                                        {trip.maxDimensions.length} × {trip.maxDimensions.width} × {trip.maxDimensions.height} cm
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Package Types Accepted</h3>
                                        {trip.packageTypes && trip.packageTypes.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {trip.packageTypes.map((type: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                    >
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-900">All package types accepted</p>
                                        )}
                                    </div>
                                </div>

                                {trip.restrictions && trip.restrictions.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Restrictions</h3>
                                        <div className="space-y-1">
                                            {trip.restrictions.map((restriction: string, index: number) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                                    <span className="text-gray-900 text-sm">{restriction}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Pricing Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
                                
                                <div className="space-y-4">
                                    {trip.pricePerKg && (
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-teal-600">
                                                {trip.currency} {trip.pricePerKg}
                                            </div>
                                            <div className="text-sm text-gray-500">per kg</div>
                                        </div>
                                    )}

                                    {(trip.minimumPrice || trip.maximumPrice) && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="text-sm text-gray-600">Price range:</div>
                                            <div className="flex items-center justify-between mt-1">
                                                {trip.minimumPrice && (
                                                    <span className="text-gray-900">
                                                        Min: {trip.currency} {trip.minimumPrice}
                                                    </span>
                                                )}
                                                {trip.maximumPrice && (
                                                    <span className="text-gray-900">
                                                        Max: {trip.currency} {trip.maximumPrice}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        <Button className="w-full" disabled={isMyPost}>
                                            {isMyPost ? 'Your Trip' : 'Request Delivery'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Traveler Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Traveler</h2>
                                
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                        {trip.traveler?.avatar ? (
                                            <img
                                                src={trip.traveler.avatar}
                                                alt={`${trip.traveler.firstName} ${trip.traveler.lastName}`}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg font-semibold text-gray-600">
                                                {trip.traveler?.firstName?.[0]}{trip.traveler?.lastName?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {trip.traveler?.firstName} {trip.traveler?.lastName}
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="text-sm text-gray-600">
                                                {trip.traveler?.profile?.travelerRating || '5.0'} ({trip.traveler?.profile?.totalTrips || 0} trips)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Member since</span>
                                        <span className="text-gray-900">
                                            {new Date(trip.traveler?.createdAt || trip.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long' 
                                            })}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Active packages</span>
                                        <span className="text-gray-900">{trip._count?.packages || 0}</span>
                                    </div>
                                </div>

                                {!isMyPost && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <Button variant="outline" className="w-full">
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Message Traveler
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trip Stats */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Stats</h2>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Package2 className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">Packages</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {trip._count?.packages || 0} booked
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <MessageCircle className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">Messages</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {trip._count?.chats || 0} conversations
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">Duration</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {calculateDuration()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
