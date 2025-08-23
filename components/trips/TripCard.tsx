/* eslint-disable @next/next/no-img-element */
// Trip Card Component - Minimalistic Design
import React from 'react'
import { Button } from '@/components/ui'
import { Calendar, Star, MessageCircle, Plane, ArrowDownUp, Package, Weight, Car, Bus, Train, Sailboat, Ship, Truck } from 'lucide-react'
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
      case 'ACTIVE': return 'bg-teal-100 text-teal-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTransportIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'flight':
      case 'plane':
        return <Plane className="w-5 h-5 text-teal-600" />
      case 'car':
      case 'drive':
        return <Car className="w-5 h-5 text-teal-600" />
      case 'train':
        return <Train className="w-5 h-5 text-teal-600" />
      case 'bus':
        return <Bus className="w-5 h-5 text-teal-600" />
      case 'ship':
      case 'boat':
        return <Ship className="w-5 h-5 text-teal-600" />
        return <Truck className="w-5 h-5 text-teal-600" />
      default:
        return <Truck className="w-5 h-5 text-teal-600" />
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

    if (address?.city && address?.country) {
      return ` ${address.country}, ${address.street}, ${address.city}`
    }
    if (address?.city) {
      return address.city
    }
    if (address?.country) {
      return address.country
    }
    return 'Location not specified'
  }

  const handleTripDetails = () => {
    router.push(`/trips/${trip.id}`)
  }
  const handleTripEdit = () => {
    router.push(`/trips/${trip.id}/edit`)
  }

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSendMessage) {
      onSendMessage(trip)
    }
  }

  const handleAddPackage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAddPackage) {
      onAddPackage(trip)
    }
  }

  return (
    <div
      className="group bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-lg hover:scale-[1.05] transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={handleTripDetails}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
              {trip.title}
            </h3>
            {/* <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
              {trip.status.replace('_', ' ')}
            </div> */}
          </div>
          <div className="text-right ml-4">
            <div className="flex items-center space-x-2">
              {getTransportIcon(trip.transportMode)}
              <span className="text-sm font-medium text-gray-600 capitalize">
                {trip.transportMode} trip
              </span>
            </div>
          </div>
        </div>

        {/* Location Route */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex flex-col  justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex items-center space-x-2">
                <Plane className="w-3 h-3 text-teal-500" />
                <span className="text-sm font-medium text-gray-700">From</span>
              </div>
              <span className="text-sm text-gray-900 font-medium truncate">
                {formatLocation(trip.originAddress)}
              </span>
            </div>
            <ArrowDownUp className="w-4 h-4 text-gray-400 mx-4 rotate-90 place-self-center" />
            <div className="flex items-center space-x-3 flex-1 ">
              <div className="flex items-center space-x-2">
                <Plane className="w-3 h-3 text-red-500 rotate-45" />
                <span className="text-sm font-medium text-gray-700">To</span>
              </div>
              <span className="text-sm text-gray-900 font-medium truncate">
                {formatLocation(trip.destinationAddress)}
              </span>
            </div>
          </div>
        </div>


        {/* Pricing and Trip Details */}
        {(trip.pricePerKg || trip.minimumPrice) && (

          <div className="flex gap-4 items-center bg-teal-50 rounded-lg p-3 mb-4">
            <div className="w-1/3 flex flex-col items-center justify-center rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Weight className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700 uppercase tracking-wide text-center">Weight</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {trip.maxWeight} kg
              </span>
            </div>
            <div className="w-1/3 text-center">
              {trip.pricePerKg && (
                <div>
                  <span className="text-lg font-bold text-teal-600">
                    ${trip.pricePerKg}/kg
                  </span>
                  <span className="text-xs text-gray-500 block">Per kilogram</span>
                </div>
              )}
              {trip.minimumPrice && trip.maximumPrice && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">
                    ${trip.minimumPrice} - ${trip.maximumPrice} {trip.currency}
                  </span>
                </div>
              )}
            </div>
            <div className="w-1/3 flex flex-col items-center justify-center rounded-lg ">
              <div className="flex justify-center items-center space-x-2 mb-1">
                <Package className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Dimmension</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 text-center">
                {trip.maxDimensions?.length || 0} × {trip.maxDimensions?.width || 0} × {trip.maxDimensions?.height || 0} cm
              </span>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>
              <span className="font-medium">Departure:</span> {formatDate(trip.departureDate)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>
              <span className="font-medium">Arrival:</span> {formatDate(trip.arrivalDate)}
            </span>
          </div>
        </div>

        {/* Traveler Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            {trip.traveler.avatar ? (
              <img
                src={trip.traveler.avatar}
                alt={`${trip.traveler.firstName} ${trip.traveler.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-teal-600 font-semibold text-sm">
                {trip.traveler.firstName[0]}{trip.traveler.lastName[0]}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {trip.traveler.firstName} {trip.traveler.lastName}
            </p>
            {trip.traveler.profile && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span>{trip.traveler.profile.travelerRating.toFixed(1)}</span>
                <span>•</span>
                <span>{trip.traveler.profile.totalTrips} trips</span>
              </div>
            )}
          </div>
          {trip._count && trip._count.packages > 0 && (
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {trip._count.packages} packages
            </div>
          )}
        </div>

        {/* Package Types & Restrictions */}
        {(trip.packageTypes && trip.packageTypes.length > 0) && (
          <div className="mb-4">
            <span className="text-xs font-medium text-gray-700 uppercase tracking-wide block mb-2">
              Accepted Package Types
            </span>
            <div className="flex flex-wrap gap-1">
              {trip.packageTypes.map((type, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}

        <div className="flex space-x-3 pt-4 border-t border-gray-100">
          {currentUserId !== trip.traveler.id ? (
            <>
              <Button
                onClick={handleChatClick}
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
                {trip._count && trip._count.chats > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                    {trip._count.chats}
                  </span>
                )}
              </Button>
              <Button
                onClick={handleAddPackage}
                size="sm"
                className="flex-1 flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700"
              >
                <Package className="w-4 h-4" />
                <span>Add Package</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleTripDetails}
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <span>View Details</span>
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleTripEdit()
                }}
                size="sm"
                className="flex-1 flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700"
              >
                <span>Edit Trip</span>
              </Button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
