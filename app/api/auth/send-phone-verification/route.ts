import { NextRequest } from 'next/server'
import {
  createSuccessResponse,
  withErrorHandling,
  parseRequestBody,
  ApiError
} from '@/lib/api/utils'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const sendPhoneVerificationSchema = z.object({
  phone: z.string().min(10)
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const userPayload = await requireAuth(request)
  const data = await parseRequestBody(request, sendPhoneVerificationSchema)

  // Verify the user exists
  const user = await prisma.user.findUnique({
    where: { id: userPayload.userId }
  })

  if (!user) {
    throw new ApiError('User not found', 404)
  }

  if (user.isPhoneVerified && user.phone === data.phone) {
    throw new ApiError('Phone is already verified', 400)
  }

  // In a real implementation, you'd send an actual SMS with a verification code
  // For now, we'll simulate this process
  console.log(`Sending verification SMS to ${data.phone} with code: 123456`)

  return createSuccessResponse({
    message: 'Verification code sent to your phone',
    phone: data.phone
  })
})
