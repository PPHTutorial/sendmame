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

  // Get user's ID verification status
  const user = await prisma.user.findUnique({
    where: { id: userPayload.userId },
    select: {
      isIDVerified: true,
      verificationDocs: {
        where: {
          type: {
            in: ['passport', 'driver_license', 'national_id']
          }
        },
        select: {
          type: true,
          status: true,
          rejectionReason: true,
          verifiedAt: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!user) {
    throw new ApiError('User not found', 404)
  }

  return createSuccessResponse({
    isIDVerified: user.isIDVerified,
    documents: user.verificationDocs
  })
})
