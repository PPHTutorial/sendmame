// Trip Card Component
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { MapPin, Calendar, Package, Star, MessageCircle, Truck, Clock, Shield, Users, Weight, ArrowDownUp, Plane } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TripCardProps {
  trip: {
    id: string
    title: string
    status: string
    departureDate: string
    arrivalDate: string
    originAddress: any
    destinationAddress: any
    maxWeight: number
    maxDimensions: any
    transportMode: string
    pricePerKg?: number
    minimumPrice?: number
    maximumPrice?: number
    currency: string
    packageTypes?: string[]
    restrictions?: string[]
    traveler: {
      id: string
      firstName: string
      lastName: string
      avatar?: string
      profile?: {
        travelerRating: number
        totalTrips: number
      }
    }
    packages?: Array<{
      id: string
      title: string
      status: string
      dimensions: any
    }>
    _count?: {
      packages: number
      chats: number
    }
    createdAt: string
    updatedAt: string
  }
  onAddPackage?: (trip: TripCardProps['trip']) => void
  onSendMessage?: (trip: TripCardProps['trip']) => void
  currentUserId?: string
}

export function TripCard({ trip, onAddPackage, onSendMessage, currentUserId }: TripCardProps) {
  const router = useRouter()
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED': return 'bg-blue-100 text-blue-800'
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTransportIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'flight':
      case 'air':
        return '✈️'
      case 'car':
      case 'drive':
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatLocation = (address: any) => {
    if (typeof address === 'string') {
      try {
        address = JSON.parse(address)
      } catch {
        return address
      }
    }
    return `${address.city}, ${address.state}`
  }
  const formatFullLocation = (address: any) => {
    if (typeof address === 'string') {
      try {
        address = JSON.parse(address)
      } catch {
        return address
      }
    }
    return `${address.country}, ${address.state}, ${address.street}`
  }

  const calculateDuration = () => {
    const departure = new Date(trip.departureDate)
    const arrival = new Date(trip.arrivalDate)
    const diffTime = Math.abs(arrival.getTime() - departure.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays === 1 ? '1 day' : `${diffDays} days`
  }

  const getAvailableSpace = () => {
    if (!trip._count) return trip.maxWeight

    let usedWeight = 0
    if (trip.packages) {
      usedWeight = trip.packages.reduce((total, pkg) => {
        if (pkg.dimensions && typeof pkg.dimensions === 'object') {
          return total + (pkg.dimensions.weight || 0)
        }
        return total
      }, 0)
    }

    return Math.max(0, trip.maxWeight - usedWeight)
  }

  const getPriceDisplay = () => {
    if (trip.pricePerKg) {
      return `$${trip.pricePerKg}/kg`
    }
    if (trip.minimumPrice && trip.maximumPrice) {
      return `$${trip.minimumPrice} - ${trip.maximumPrice}`
    }
    if (trip.minimumPrice) {
      return `From ${trip.currency} ${trip.minimumPrice}`
    }
    return 'Negotiable'
  }

  const handleItemDetails = () => {
    // Handle item details click
    router.push(`/trips/${trip.id}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      onClick={handleItemDetails}>
      {/* Header */}
      <Link href={`/trips/${trip.id}`}>
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {/* <span className="text-2xl">{getTransportIcon(trip.transportMode)}</span> */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {trip.title || `${formatLocation(trip.originAddress)} → ${formatLocation(trip.destinationAddress)}`}
                </h3>
                {/* Capacity */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Plane className="w-3 h-3 text-teal-600" />
                    <p className="text-sm text-gray-500 capitalize">{trip.transportMode} trip</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Weight className="w-3 h-3 text-teal-600" />
                    <p className="text-sm text-gray-500 capitalize">{getAvailableSpace()}kg max</p>
                  </div>
                  <div className="flex items-center gap-1 ">
                    <Package className="w-3 h-3 text-teal-600" />
                    <p className="text-sm text-gray-500 capitalize">
                      {trip.maxDimensions && typeof trip.maxDimensions === 'object' ? (
                        `${trip.maxDimensions.length}×${trip.maxDimensions.width}×${trip.maxDimensions.height}cm`
                      ) : (
                        'Standard size'
                      )}
                    </p>
                  </div>

                </div>
              </div>
            </div>
            {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
            {trip.status.replace('_', ' ')}
          </span> */}
          </div>

          {/* Route */}
          <div className="flex flex-col items-start text-sm mb-4 overflow-hidden bg-teal-50 rounded-lg p-3 text-teal-900 font-semibold border border-teal-200">
            <div className="flex items-center line-clamp-3">
              <svg className="size-6 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="truncate overflow-hidden whitespace-pre-wrap line-clamp-3">
                {formatFullLocation(trip.originAddress)}
              </p>
            </div>
            {/*  <ArrowDownUp className="w-4 h-4 text-gray-400 mx-2 text-center my-2 place-self-center" /> */}
            <hr className="border w-[80%] border-neutral-100 my-2 place-self-center" />
            <span className="flex items-center truncate">
              <svg className="size-6 mr-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="truncate overflow-hidden whitespace-pre-wrap line-clamp-3">
                {formatFullLocation(trip.destinationAddress)}
              </p>
            </span>
          </div>

          {/* Dates */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Departure: {formatDate(trip.departureDate)}</span>
            </div>
            <div className="flex items-center">
              <span>Arrival: {formatDate(trip.arrivalDate)}</span>
            </div>
          </div>

          {/* Package Types */}
          {trip.packageTypes && trip.packageTypes.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Accepted Package Types</div>
              <div className="flex flex-wrap gap-2">
                {trip.packageTypes.slice(0, 3).map((type, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {type.replace('_', ' ')}
                  </span>
                ))}
                {trip.packageTypes.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    +{trip.packageTypes.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Traveler */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              {trip.traveler.avatar ? (
                <span className="text-sm font-medium text-gray-600">
                  {trip.traveler.firstName[0]}{trip.traveler.lastName[0]}
                </span>
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {trip.traveler.firstName[0]}{trip.traveler.lastName[0]}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {trip.traveler.firstName} {trip.traveler.lastName}
              </p>
              {trip.traveler.profile && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>⭐ {trip.traveler.profile.travelerRating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{trip.traveler.profile.totalTrips} trips</span>
                </div>
              )}
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {getPriceDisplay()}
              </div>
              <div className="text-sm text-gray-600">Delivery price</div>
            </div>
          </div>

          {/* Current Packages */}
          {trip._count && trip._count.packages > 0 && (
            <div className="bg-yellow-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-yellow-900">
                  {trip._count.packages} package{trip._count.packages > 1 ? 's' : ''} booked
                </div>
                <div className="text-xs text-yellow-700">
                  {calculateDuration()} journey
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {currentUserId && currentUserId !== trip.traveler.id && (
            <div className="flex space-x-2 mt-4">
              <div className="flex-1">
                <Button
                  size="sm"
                  className={`
                    ${trip._count && trip._count.packages > 0
                      ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                    } 
                    text-white text-xs px-2 py-1 h-7 flex items-center w-full
                  `}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onAddPackage?.(trip)
                  }}
                  disabled={!onAddPackage || (trip._count && trip._count.packages > 0)}
                >
                  <Package className="w-3 h-3 mr-2" />
                  {trip._count && trip._count.packages > 0 ? 'Fully Booked' : 'Add Package'}
                </Button>
              </div>
              <div className="flex-1">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-7 flex items-center w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onSendMessage?.(trip)
                  }}
                  disabled={!onSendMessage}
                >
                  <MessageCircle className="w-3 h-3 mr-2" />
                  Send Message
                  {trip._count && trip._count.chats > 0 && (
                    <span className="ml-1 bg-white text-blue-600 rounded-full text-xs px-1">
                      {trip._count.chats}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
