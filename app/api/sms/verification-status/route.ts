import { NextRequest } from 'next/server'
import {
  createSuccessResponse,
  withErrorHandling,
  ApiError
} from '@/lib/api/utils'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userPayload = await requireAuth(request)

  // Get user's verification status
  const user = await prisma.user.findUnique({
    where: { id: userPayload.userId },
    select: {
      isPhoneVerified: true,
      phone: true
    }
  })

  if (!user) {
    throw new ApiError('User not found', 404)
  }

  return createSuccessResponse({
    isPhoneVerified: user.isPhoneVerified,
    phone: user.phone
  })
})
