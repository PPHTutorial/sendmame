// API route for geocoding
import { NextRequest } from 'next/server'
import { 
  createSuccessResponse, 
  withErrorHandling,
  parseSearchParams,
  ApiError 
} from '@/lib/api/utils'
import { googlePlacesService } from '@/lib/services/googlePlaces'
import { z } from 'zod'

const geocodeSchema = z.object({
  address: z.string().min(1, 'Address is required')
})

const reverseGeocodeSchema = z.object({
  lat: z.string().transform(val => parseFloat(val)),
  lng: z.string().transform(val => parseFloat(val))
})

// GET /api/places/geocode - Geocode address to coordinates
export const GET = withErrorHandling(async (request: NextRequest) => {
  const url = new URL(request.url)
  const mode = url.searchParams.get('mode')
  
  if (mode === 'reverse') {
    // Reverse geocoding: coordinates to address
    const params = parseSearchParams(request, reverseGeocodeSchema)
    const { lat, lng } = params
    
    try {
      const result = await googlePlacesService.reverseGeocode(lat, lng)
      
      if (!result) {
        throw new ApiError('No address found for the given coordinates', 404)
      }
      
      return createSuccessResponse(result, 'Address retrieved successfully')
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to reverse geocode coordinates',
        500
      )
    }
  } else {
    // Forward geocoding: address to coordinates
    const params = parseSearchParams(request, geocodeSchema)
    const { address } = params
    
    try {
      const result = await googlePlacesService.geocodeAddress(address)
      
      if (!result) {
        throw new ApiError('No coordinates found for the given address', 404)
      }
      
      return createSuccessResponse(result, 'Coordinates retrieved successfully')
    } catch (error) {
      console.error('Geocoding error:', error)
      throw new ApiError(
        error instanceof Error ? error.message : 'Failed to geocode address',
        500
      )
    }
  }
})
