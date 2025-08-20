// React hooks for Google Places API
import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import type { 
  LocationDetails, 
  AutocompleteResponse,
  PlaceLocation 
} from '@/lib/types/places'

// Base API functions
const placesApi = {
  search: async (params: {
    query: string
    lat?: number
    lng?: number
    radius?: number
    type?: string
    language?: string
    region?: string
  }): Promise<LocationDetails[]> => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString())
      }
    })
    
    const response = await fetch(`/api/places/search?${searchParams}`)
    if (!response.ok) {
      throw new Error('Failed to search places')
    }
    
    const data = await response.json()
    return data.data
  },

  autocomplete: async (params: {
    input: string
    lat?: number
    lng?: number
    radius?: number
    language?: string
    types?: string
    components?: string
  }): Promise<AutocompleteResponse> => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString())
      }
    })
    
    const response = await fetch(`/api/places/autocomplete?${searchParams}`)
    if (!response.ok) {
      throw new Error('Failed to get autocomplete suggestions')
    }
    
    const data = await response.json()
    return data.data
  },

  geocode: async (address: string): Promise<LocationDetails> => {
    const response = await fetch(`/api/places/geocode?address=${encodeURIComponent(address)}`)
    if (!response.ok) {
      throw new Error('Failed to geocode address')
    }
    
    const data = await response.json()
    return data.data
  },

  reverseGeocode: async (lat: number, lng: number): Promise<LocationDetails> => {
    const response = await fetch(`/api/places/geocode?mode=reverse&lat=${lat}&lng=${lng}`)
    if (!response.ok) {
      throw new Error('Failed to reverse geocode coordinates')
    }
    
    const data = await response.json()
    return data.data
  },

  getPlaceDetails: async (placeId: string): Promise<LocationDetails> => {
    const response = await fetch(`/api/places/${placeId}`)
    if (!response.ok) {
      throw new Error('Failed to get place details')
    }
    
    const data = await response.json()
    return data.data
  }
}

// Hook for searching places
export function useSearchPlaces() {
  return useMutation({
    mutationFn: placesApi.search,
    onError: (error) => {
      console.error('Places search error:', error)
    }
  })
}

// Hook for autocomplete with debouncing
export function useAutocomplete(
  input: string,
  options: {
    enabled?: boolean
    debounceMs?: number
    location?: PlaceLocation
    radius?: number
    language?: string
    types?: string
    components?: string
  } = {}
) {
  const {
    enabled = true,
    debounceMs = 300,
    location,
    radius,
    language,
    types,
    components
  } = options

  const [debouncedInput, setDebouncedInput] = useState(input)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [input, debounceMs])

  return useQuery({
    queryKey: ['autocomplete', debouncedInput, location, radius, language, types, components],
    queryFn: () => placesApi.autocomplete({
      input: debouncedInput,
      ...(location && { lat: location.lat, lng: location.lng }),
      ...(radius && { radius }),
      ...(language && { language }),
      ...(types && { types }),
      ...(components && { components })
    }),
    enabled: enabled && debouncedInput.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}

// Hook for geocoding addresses
export function useGeocode() {
  return useMutation({
    mutationFn: placesApi.geocode,
    onError: (error) => {
      console.error('Geocoding error:', error)
    }
  })
}

// Hook for reverse geocoding
export function useReverseGeocode() {
  return useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) => 
      placesApi.reverseGeocode(lat, lng),
    onError: (error) => {
      console.error('Reverse geocoding error:', error)
    }
  })
}

// Hook for getting place details
export function usePlaceDetails(placeId: string | null) {
  return useQuery({
    queryKey: ['placeDetails', placeId],
    queryFn: () => placesApi.getPlaceDetails(placeId!),
    enabled: !!placeId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Hook for getting user's current location
export function useCurrentLocation() {
  const [location, setLocation] = useState<PlaceLocation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setLoading(false)
      },
      (error) => {
        setError(error.message)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }, [])

  return {
    location,
    error,
    loading,
    getCurrentLocation
  }
}

// Combined hook for address input with autocomplete and place selection
export function useAddressInput(initialValue = '') {
  const [inputValue, setInputValue] = useState(initialValue)
  const [selectedPlace, setSelectedPlace] = useState<LocationDetails | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { data: autocompleteData, isLoading: autocompleteLoading } = useAutocomplete(
    inputValue,
    { enabled: showSuggestions && inputValue.length > 2 }
  )

  const placeDetailsMutation = useMutation({
    mutationFn: placesApi.getPlaceDetails,
    onSuccess: (data) => {
      setSelectedPlace(data)
      setInputValue(data.formatted_address)
      setShowSuggestions(false)
    }
  })

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value)
    setSelectedPlace(null)
    setShowSuggestions(value.length > 2)
  }, [])

  const handleSuggestionSelect = useCallback((placeId: string) => {
    placeDetailsMutation.mutate(placeId)
  }, [placeDetailsMutation])

  const handleClearSelection = useCallback(() => {
    setInputValue('')
    setSelectedPlace(null)
    setShowSuggestions(false)
  }, [])

  return {
    inputValue,
    selectedPlace,
    showSuggestions,
    suggestions: autocompleteData?.predictions || [],
    isLoadingSuggestions: autocompleteLoading,
    isLoadingPlaceDetails: placeDetailsMutation.isPending,
    handleInputChange,
    handleSuggestionSelect,
    handleClearSelection,
    setShowSuggestions
  }
}
