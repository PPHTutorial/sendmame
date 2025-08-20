// Environment configuration for Google Places API
export const config = {
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry'] as const,
  },
  
  // Google Places API URLs
  api: {
    placesTextSearch: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
    placesDetails: 'https://maps.googleapis.com/maps/api/place/details/json',
    placesNearby: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
    geocoding: 'https://maps.googleapis.com/maps/api/geocode/json',
    autocomplete: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
  },
  
  // Default search parameters
  defaults: {
    radius: 50000, // 50km
    type: 'establishment',
    fields: [
      'place_id',
      'name', 
      'formatted_address',
      'geometry',
      'address_components',
      'international_phone_number',
      'website',
      'rating',
      'user_ratings_total',
      'photos',
      'opening_hours'
    ].join(',')
  }
}

// Validate environment variables
export function validateEnvironment() {
  const errors: string[] = []
  
  if (!config.googleMaps.apiKey) {
    errors.push('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is required')
  }
  
  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`)
  }
}
