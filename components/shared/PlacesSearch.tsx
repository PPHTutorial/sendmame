// Places Search Component for finding locations
'use client'

import React, { useState } from 'react'
import { Search, MapPin, Star, Phone, Globe, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { useSearchPlaces, useCurrentLocation } from '@/lib/hooks/useGooglePlaces'
import type { LocationDetails, PlaceLocation } from '@/lib/types/places'

interface PlacesSearchProps {
  onPlaceSelect?: (place: LocationDetails) => void
  placeholder?: string
  className?: string
  showFilters?: boolean
  defaultLocation?: PlaceLocation
  searchTypes?: string[]
}

export function PlacesSearch({
  onPlaceSelect,
  placeholder = 'Search for places, addresses, or points of interest...',
  className = '',
  showFilters = true,
  defaultLocation,
  searchTypes = ['establishment', 'geocode']
}: PlacesSearchProps) {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [radius, setRadius] = useState<number>(5000) // 5km default
  
  const searchMutation = useSearchPlaces()
  const { location: currentLocation, getCurrentLocation, loading: locationLoading } = useCurrentLocation()
  
  const handleSearch = async () => {
    if (!query.trim()) return
    
    const searchLocation = currentLocation || defaultLocation
    
    searchMutation.mutate({
      query: query.trim(),
      ...(searchLocation && { 
        lat: searchLocation.lat, 
        lng: searchLocation.lng 
      }),
      ...(radius && { radius }),
      ...(selectedType && { type: selectedType }),
      language: 'en'
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const isLoading = searchMutation.isPending || locationLoading

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="restaurant">Restaurants</option>
              <option value="lodging">Hotels</option>
              <option value="tourist_attraction">Attractions</option>
              <option value="gas_station">Gas Stations</option>
              <option value="hospital">Hospitals</option>
              <option value="bank">Banks</option>
              <option value="store">Stores</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Radius:</label>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1000}>1 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={25000}>25 km</option>
              <option value={50000}>50 km</option>
            </select>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={locationLoading}
            className="flex items-center space-x-2"
          >
            <MapPin className="h-4 w-4" />
            <span>Use Current Location</span>
          </Button>
        </div>
      )}

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        disabled={!query.trim() || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Search Places
          </>
        )}
      </Button>

      {/* Current Location Info */}
      {currentLocation && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span>
              Using your location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </span>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchMutation.data && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">
            Search Results ({searchMutation.data.length} found)
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {searchMutation.data.map((place) => (
              <PlaceCard
                key={place.place_id}
                place={place}
                onSelect={() => onPlaceSelect?.(place)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {searchMutation.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">
            {searchMutation.error.message || 'Failed to search places'}
          </p>
        </div>
      )}
    </div>
  )
}

// Place Card Component
interface PlaceCardProps {
  place: LocationDetails
  onSelect?: () => void
}

function PlaceCard({ place, onSelect }: PlaceCardProps) {
  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{place.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{place.formatted_address}</p>
          
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
            {place.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span>{place.rating.toFixed(1)}</span>
                {place.user_ratings_total && (
                  <span>({place.user_ratings_total})</span>
                )}
              </div>
            )}
            
            {place.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>{place.phone}</span>
              </div>
            )}
            
            {place.website && (
              <div className="flex items-center space-x-1">
                <Globe className="h-3 w-3" />
                <span>Website</span>
              </div>
            )}
            
            {place.opening_hours && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{place.opening_hours.open_now ? 'Open' : 'Closed'}</span>
              </div>
            )}
          </div>
          
          {place.types && place.types.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {place.types.slice(0, 3).map((type) => (
                <span
                  key={type}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {type.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {place.photos && place.photos.length > 0 && (
          <div className="ml-4 flex-shrink-0">
            <img
              src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=100&photoreference=${place.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
              alt={place.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          </div>
        )}
      </div>
    </div>
  )
}
