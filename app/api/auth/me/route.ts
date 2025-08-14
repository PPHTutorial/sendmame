// Fakomame Platform - Current User API Route
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  createSuccessResponse,
  withErrorHandling,
  ApiError,
  createErrorResponse
} from '@/lib/api/utils'
import { requireAuth } from '@/lib/auth'

// GET /api/auth/me
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    const userPayload = await requireAuth(request)

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      include: {
        profile: true,
        wallet: true,
        _count: {
          select: {
            sentPackages: true,
            receivedPackages: true,
            trips: true,
            givenReviews: true,
            receivedReviews: true,
          }
        }
      }
    })

    if (!user) {
      throw new ApiError('User not found', 404)
    }

    // Calculate average ratings
    const avgRatings = await prisma.review.groupBy({
      by: ['receiverId'],
      where: { receiverId: user.id },
      _avg: { rating: true },
      _count: { rating: true },
    })

    const userWithStats = {
      ...user,
      password: undefined, // Remove password from response
      stats: {
        ...user._count,
        averageRating: avgRatings[0]?._avg.rating || 0,
        totalRatings: avgRatings[0]?._count.rating || 0,
      }
    }

    return createSuccessResponse(userWithStats)
  } catch (error: any) {
    createErrorResponse(error)
    throw new ApiError('Authentication required', 401)
  }
})
