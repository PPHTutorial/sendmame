// Fakomame Platform - User Registration API
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import {
  createSuccessResponse,
  createErrorResponse,
  withErrorHandling,
  parseRequestBody,
  ApiError
} from '@/lib/api/utils'
import {
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  validatePasswordStrength,
  checkAuthRateLimit,
  resetAuthRateLimit
} from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import type { RegisterData } from '@/lib/types'
import prisma from '@/lib/prisma'
import { $Enums } from '@prisma/client'
import { Payload } from '@prisma/client/runtime/library'

// POST /api/auth/register
export const POST = withErrorHandling(async (request: NextRequest) => {
  const data = await parseRequestBody<RegisterData>(request, registerSchema)

  // Rate limiting
  const clientId = request.headers.get('x-forwarded-for') || 'anonymous'
  if (!checkAuthRateLimit(`register:${clientId}`)) {
    throw new ApiError('Too many registration attempts. Please try again later.', 429)
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        ...(data.phone ? [{ phone: data.phone }] : [])
      ]
    }
  })

  if (existingUser) {
    throw new ApiError(
      existingUser.email === data.email
        ? 'An account with this email already exists'
        : 'An account with this phone number already exists',
      409
    )
  }

  // Validate password strength
  if (!validatePasswordStrength(data.password)) {
    throw new ApiError(
      'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
      400
    )
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: (data.role as 'SENDER' | 'TRAVELER' | 'ADMIN') || 'SENDER',
      isEmailVerified: false,
      profile: {
        create: {
          bio: '',
          languages: ['English'],
          senderRating: 0,
          travelerRating: 0,
          totalTrips: 0,
          totalDeliveries: 0,
        }
      }
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isEmailVerified: true,
      profile: {
        select: {
          bio: true,
          profilePicture: true,
          senderRating: true,
          travelerRating: true,
          totalTrips: true,
          totalDeliveries: true,
          createdAt: true,
          languages: true,
        }
      }
    }
  })

  // Generate tokens

  const accessToken = await createAccessToken({ userId: user.id, email: user.email, role: user.role })
  const refreshToken = await createRefreshToken(user.id)

  // Set auth cookies
  await setAuthCookies(accessToken, refreshToken)

  // Reset rate limit on success
  resetAuthRateLimit(`register:${clientId}`)

  return createSuccessResponse({
    user,
    message: 'Account created successfully. Please verify your email.'
  })
})
