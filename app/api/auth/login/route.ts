// Fakomame Platform - Login API Route
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { 
  createSuccessResponse, 
  withErrorHandling,
  parseRequestBody,
  ApiError
} from '@/lib/api/utils'
import { 
  createAccessToken, 
  createRefreshToken, 
  setAuthCookies,
  checkAuthRateLimit,
  resetAuthRateLimit
} from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import prisma from '@/lib/prisma'
import type { LoginInput } from '@/lib/validations'

// POST /api/login
export const POST = withErrorHandling(async (request: NextRequest) => {
  const data = await parseRequestBody<LoginInput>(request, loginSchema)
  
  // Rate limiting
  const clientId = request.headers.get('x-forwarded-for') || 'anonymous'
  if (!checkAuthRateLimit(`login:${clientId}`)) {
    throw new ApiError('Too many login attempts. Please try again later.', 429)
  }
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      profile: true,
      wallet: true,
    }
  })
  
  if (!user || !user.password) {
    throw new ApiError('Invalid email or password', 401)
  }
  
  // Check if account is active
  if (!user.isActive) {
    throw new ApiError('Account is deactivated. Please contact support.', 403)
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(data.password, user.password)
  if (!isValidPassword) {
    throw new ApiError('Invalid email or password', 401)
  }
  
  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  })
  
  // Create tokens
  const accessToken = await createAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })
  
  const refreshToken = await createRefreshToken(user.id)
  
  // Set auth cookies
  await setAuthCookies(accessToken, refreshToken)
  
  // Reset rate limit on successful login
  resetAuthRateLimit(`login:${clientId}`)
  
  // Return user data and access token (excluding password)
  const { password: _, ...userWithoutPassword } = user

  return createSuccessResponse(
    {
      user: userWithoutPassword,
      accessToken, // Include access token in response
    },
    'Login successful'
  )
})
