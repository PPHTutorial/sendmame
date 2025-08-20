// Google Places API service functions
import { config } from '@/lib/config/environment'
import type {
  GooglePlace,
  LocationDetails,
  ParsedAddress,
  PlacesSearchRequest,
  PlacesSearchResponse,
  AutocompleteRequest,
  AutocompleteResponse,
  AddressComponent,
  PlaceLocation
} from '@/lib/types/places'

class GooglePlacesService {
  private readonly apiKey: string

  constructor() {
    this.apiKey = config.googleMaps.apiKey
    if (!this.apiKey) {
      throw new Error('Google Maps API key is required')
    }
  }

  /**
   * Search for places using text query
   */
  async searchPlaces(request: PlacesSearchRequest): Promise<LocationDetails[]> {
    const url = new URL(config.api.placesTextSearch)
    
    url.searchParams.set('query', request.query)
    url.searchParams.set('key', this.apiKey)
    url.searchParams.set('fields', config.defaults.fields)
    
    if (request.location) {
      url.searchParams.set('location', `${request.location.lat},${request.location.lng}`)
    }
    
    if (request.radius) {
      url.searchParams.set('radius', request.radius.toString())
    }
    
    if (request.type) {
      url.searchParams.set('type', request.type)
    }
    
    if (request.language) {
      url.searchParams.set('language', request.language)
    }
    
    if (request.region) {
      url.searchParams.set('region', request.region)
    }

    try {
      const response = await fetch(url.toString())
      const data: PlacesSearchResponse = await response.json()
      
      if (data.status !== 'OK') {
        throw new Error(data.error_message || `Places API error: ${data.status}`)
      }
      
      // Get detailed information for each place
      const detailedResults = await Promise.all(
        data.results.slice(0, 10).map(place => this.getPlaceDetails(place.place_id))
      )
      
      return detailedResults.filter(result => result !== null) as LocationDetails[]
    } catch (error) {
      console.error('Places search error:', error)
      throw new Error(`Failed to search places: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(placeId: string): Promise<LocationDetails | null> {
    const url = new URL(config.api.placesDetails)
    
    url.searchParams.set('place_id', placeId)
    url.searchParams.set('fields', config.defaults.fields)
    url.searchParams.set('key', this.apiKey)

    try {
      const response = await fetch(url.toString())
      const data = await response.json()
      
      if (data.status !== 'OK') {
        console.warn(`Place details error for ${placeId}:`, data.error_message || data.status)
        return null
      }
      
      const place: GooglePlace = data.result
      return this.transformPlaceToLocationDetails(place)
    } catch (error) {
      console.error(`Place details error for ${placeId}:`, error)
      return null
    }
  }

  /**
   * Get autocomplete suggestions for address input
   */
  async getAutocompleteSuggestions(request: AutocompleteRequest): Promise<AutocompleteResponse> {
    const url = new URL(config.api.autocomplete)
    
    url.searchParams.set('input', request.input)
    url.searchParams.set('key', this.apiKey)
    
    if (request.location) {
      url.searchParams.set('location', `${request.location.lat},${request.location.lng}`)
    }
    
    if (request.radius) {
      url.searchParams.set('radius', request.radius.toString())
    }
    
    if (request.language) {
      url.searchParams.set('language', request.language)
    }
    
    if (request.types) {
      url.searchParams.set('types', request.types)
    }
    
    if (request.components) {
      url.searchParams.set('components', request.components)
    }

    try {
      const response = await fetch(url.toString())
      const data: AutocompleteResponse = await response.json()
      
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(data.error_message || `Autocomplete API error: ${data.status}`)
      }
      
      return data
    } catch (error) {
      console.error('Autocomplete error:', error)
      throw new Error(`Failed to get autocomplete suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocodeAddress(address: string): Promise<LocationDetails | null> {
    const url = new URL(config.api.geocoding)
    
    url.searchParams.set('address', address)
    url.searchParams.set('key', this.apiKey)

    try {
      const response = await fetch(url.toString())
      const data = await response.json()
      
      if (data.status !== 'OK' || !data.results.length) {
        return null
      }
      
      const result = data.results[0]
      return {
        place_id: result.place_id,
        name: result.formatted_address,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        },
        ...this.parseAddressComponents(result.address_components),
        formatted_address: result.formatted_address,
        types: result.types || []
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  /**
   * Reverse geocode coordinates to get address
   */
  async reverseGeocode(lat: number, lng: number): Promise<LocationDetails | null> {
    const url = new URL(config.api.geocoding)
    
    url.searchParams.set('latlng', `${lat},${lng}`)
    url.searchParams.set('key', this.apiKey)

    try {
      const response = await fetch(url.toString())
      const data = await response.json()
      
      if (data.status !== 'OK' || !data.results.length) {
        return null
      }
      
      const result = data.results[0]
      return {
        place_id: result.place_id,
        name: result.formatted_address,
        coordinates: { lat, lng },
        ...this.parseAddressComponents(result.address_components),
        formatted_address: result.formatted_address,
        types: result.types || []
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return null
    }
  }

  /**
   * Transform Google Place to LocationDetails
   */
  private transformPlaceToLocationDetails(place: GooglePlace): LocationDetails {
    return {
      place_id: place.place_id,
      name: place.name,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      phone: place.international_phone_number,
      website: place.website,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      photos: place.photos,
      opening_hours: place.opening_hours,
      types: place.types,
      price_level: place.price_level,
      ...this.parseAddressComponents(place.address_components),
      formatted_address: place.formatted_address
    }
  }

  /**
   * Parse Google address components into structured format
   */
  private parseAddressComponents(components: AddressComponent[]): ParsedAddress {
    const parsed: Partial<ParsedAddress> = {
      street_number: '',
      street_name: '',
      city: '',
      state: '',
      state_code: '',
      country: '',
      country_code: '',
      postal_code: '',
      county: '',
      district: '',
      sublocality: '',
      neighborhood: '',
      formatted_address: ''
    }

    components.forEach(component => {
      const types = component.types

      if (types.includes('street_number')) {
        parsed.street_number = component.long_name
      }
      if (types.includes('route')) {
        parsed.street_name = component.long_name
      }
      if (types.includes('locality')) {
        parsed.city = component.long_name
      }
      if (types.includes('administrative_area_level_1')) {
        parsed.state = component.long_name
        parsed.state_code = component.short_name
      }
      if (types.includes('administrative_area_level_2')) {
        parsed.county = component.long_name
      }
      if (types.includes('country')) {
        parsed.country = component.long_name
        parsed.country_code = component.short_name
      }
      if (types.includes('postal_code')) {
        parsed.postal_code = component.long_name
      }
      if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
        parsed.sublocality = component.long_name
      }
      if (types.includes('neighborhood')) {
        parsed.neighborhood = component.long_name
      }
    })

    return parsed as ParsedAddress
  }

  /**
   * Calculate distance between two coordinates (in meters)
   */
  calculateDistance(
    from: PlaceLocation,
    to: PlaceLocation
  ): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (from.lat * Math.PI) / 180
    const φ2 = (to.lat * Math.PI) / 180
    const Δφ = ((to.lat - from.lat) * Math.PI) / 180
    const Δλ = ((to.lng - from.lng) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService()

// Export individual functions for convenience
export const {
  searchPlaces,
  getPlaceDetails,
  getAutocompleteSuggestions,
  geocodeAddress,
  reverseGeocode,
  calculateDistance
} = googlePlacesService
