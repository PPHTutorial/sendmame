// Address Input Component with Google Places Autocomplete
'use client'

import React, { useRef, useEffect } from 'react'
import { MapPin, Search, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAddressInput, useCurrentLocation } from '@/lib/hooks/useGooglePlaces'
import type { LocationDetails } from '@/lib/types/places'

interface AddressInputProps {
    value?: string
    onChange?: (location: LocationDetails | null) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    showCurrentLocationButton?: boolean
    types?: string // Filter autocomplete by types (e.g., "address", "establishment")
    components?: string // Restrict to specific countries (e.g., "country:us")
    label?: string
    error?: string
    required?: boolean
}

export function AddressInput({
    value = '',
    onChange,
    placeholder = 'Enter an address or location...',
    className = '',
    disabled = false,
    showCurrentLocationButton = true,
    types,
    components,
    label,
    error,
    required = false
}: AddressInputProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    const {
        inputValue,
        selectedPlace,
        showSuggestions,
        suggestions,
        isLoadingSuggestions,
        isLoadingPlaceDetails,
        handleInputChange,
        handleSuggestionSelect,
        handleClearSelection,
        setShowSuggestions
    } = useAddressInput(value)

    const { getCurrentLocation, loading: locationLoading } = useCurrentLocation()

    // Notify parent component when place is selected
    useEffect(() => {
        onChange?.(selectedPlace)
    }, [selectedPlace])

    // Handle click outside to close suggestions
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }



        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [setShowSuggestions])

    const handleCurrentLocation = async () => {
        try {
            getCurrentLocation()
            // Note: You'd need to implement reverse geocoding here
            // when location is successfully retrieved
        } catch (error) {
            console.error('Failed to get current location:', error)
        }
    }

    const isLoading = isLoadingSuggestions || isLoadingPlaceDetails || locationLoading

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                        ) : (
                            <MapPin className="h-5 w-5 text-gray-400" />
                        )}
                    </div>

                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onFocus={() => inputValue.length > 2 && setShowSuggestions(true)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`
            'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
              block w-full pl-10 pr-12  focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${error ? 'border-red-300 focus:ring-red-500' : ''}
              ${selectedPlace ? 'bg-green-50 border-green-300' : ''}
            `}
                    />

                    <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                        {showCurrentLocationButton && (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={handleCurrentLocation}
                                disabled={disabled || locationLoading}
                                className="p-1 h-6 w-6"
                                title="Use current location"
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                        )}

                        {selectedPlace && (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={handleClearSelection}
                                disabled={disabled}
                                className="p-1 h-6 w-6"
                                title="Clear selection"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Autocomplete Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div
                        ref={suggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion.place_id}
                                type="button"
                                onClick={() => handleSuggestionSelect(suggestion.place_id)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {suggestion.structured_formatting.main_text}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {suggestion.structured_formatting.secondary_text}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}

            {/* Selected Place Info 
      {selectedPlace && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-900">
                {selectedPlace.name}
              </p>
              
              <p className="text-sm text-green-700">
                {selectedPlace.formatted_address}
              </p>
              {selectedPlace.coordinates && (
                <p className="text-xs text-green-600 mt-1">
                  {selectedPlace.coordinates.lat.toFixed(6)}, {selectedPlace.coordinates.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}*/}
        </div>
    )
}
