// Amenade Platform - Logout API Route
import { 
  createSuccessResponse, 
  withErrorHandling
} from '@/lib/api/utils'
import { clearAuthCookies } from '@/lib/auth'

// POST /api/auth/logout
export const POST = withErrorHandling(async () => {
  await clearAuthCookies()
  
  return createSuccessResponse(
    null,
    'Logout successful'
  )
})
