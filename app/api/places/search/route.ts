// API route for Google Places integration
import { NextRequest } from 'next/server'
import { 
  createSuccessResponse, 
  withErrorHandling,
  parseSearchParams,
  ApiError 
} from '@/lib/api/utils'
import { googlePlacesService } from '@/lib/services/googlePlaces'
import { z } from 'zod'

// Validation schemas
const searchPlacesSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  lat: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  lng: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  radius: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  type: z.string().optional(),
  language: z.string().optional(),
  region: z.string().optional()
})

const autocompleteSchema = z.object({
  input: z.string().min(1, 'Input is required'),
  lat: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  lng: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  radius: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  language: z.string().optional(),
  types: z.string().optional(),
  components: z.string().optional()
})

const geocodeSchema = z.object({
  address: z.string().min(1, 'Address is required')
})

const reverseGeocodeSchema = z.object({
  lat: z.string().transform(val => parseFloat(val)),
  lng: z.string().transform(val => parseFloat(val))
})

// GET /api/places/search - Search for places
export const GET = withErrorHandling(async (request: NextRequest) => {
  const params = parseSearchParams(request, searchPlacesSchema)
  
  const { query, lat, lng, radius, type, language, region } = params
  
  const searchRequest = {
    query,
    ...(lat && lng && { location: { lat, lng } }),
    ...(radius && { radius }),
    ...(type && { type }),
    ...(language && { language }),
    ...(region && { region })
  }
  
  try {
    const results = await googlePlacesService.searchPlaces(searchRequest)
    
    return createSuccessResponse(results, 'Places found successfully')
  } catch (error) {
    console.error('Places search error:', error)
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to search places',
      500
    )
  }
})
