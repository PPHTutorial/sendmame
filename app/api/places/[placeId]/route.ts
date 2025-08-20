// API route for place details
import { NextRequest } from 'next/server'
import { 
  createSuccessResponse, 
  withErrorHandling,
  ApiError 
} from '@/lib/api/utils'
import { googlePlacesService } from '@/lib/services/googlePlaces'

// GET /api/places/[placeId] - Get detailed place information
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
) => {
  const { placeId } = await params
  
  if (!placeId) {
    throw new ApiError('Place ID is required', 400)
  }
  
  try {
    const result = await googlePlacesService.getPlaceDetails(placeId)
    
    if (!result) {
      throw new ApiError('Place not found', 404)
    }
    
    return createSuccessResponse(result, 'Place details retrieved successfully')
  } catch (error) {
    console.error('Place details error:', error)
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to get place details',
      500
    )
  }
})
