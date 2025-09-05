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

  // Get user's facial verification status
  const user = await prisma.user.findUnique({
    where: { id: userPayload.userId },
    select: {
      isFacialVerified: true,
      verificationDocs: {
        where: {
          type: 'facial_photo'
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

  const latestDocument = user.verificationDocs[0]

  return createSuccessResponse({
    isFacialVerified: user.isFacialVerified,
    hasDocument: !!latestDocument,
    status: latestDocument?.status || 'NOT_SUBMITTED',
    rejectionReason: latestDocument?.rejectionReason,
    verifiedAt: latestDocument?.verifiedAt,
    submittedAt: latestDocument?.createdAt
  })
})
