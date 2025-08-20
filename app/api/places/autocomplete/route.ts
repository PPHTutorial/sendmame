// API route for autocomplete suggestions
import { NextRequest } from 'next/server'
import { 
  createSuccessResponse, 
  withErrorHandling,
  parseSearchParams,
  ApiError 
} from '@/lib/api/utils'
import { googlePlacesService } from '@/lib/services/googlePlaces'
import { z } from 'zod'

const autocompleteSchema = z.object({
  input: z.string().min(1, 'Input is required'),
  lat: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  lng: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  radius: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  language: z.string().optional(),
  types: z.string().optional(),
  components: z.string().optional()
})

// GET /api/places/autocomplete - Get autocomplete suggestions
export const GET = withErrorHandling(async (request: NextRequest) => {
  const params = parseSearchParams(request, autocompleteSchema)
  
  const { input, lat, lng, radius, language, types, components } = params
  
  const autocompleteRequest = {
    input,
    ...(lat && lng && { location: { lat, lng } }),
    ...(radius && { radius }),
    ...(language && { language }),
    ...(types && { types }),
    ...(components && { components })
  }
  
  try {
    const results = await googlePlacesService.getAutocompleteSuggestions(autocompleteRequest)
    
    return createSuccessResponse(results, 'Autocomplete suggestions retrieved successfully')
  } catch (error) {
    console.error('Autocomplete error:', error)
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to get autocomplete suggestions',
      500
    )
  }
})
