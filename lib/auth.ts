// Amenade Platform - Authentication Utilities
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { JwtPayload, AuthUser } from '@/lib/types'
import prisma from './prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'amenade-super-secret-key-change-in-production'
)

const JWT_ISSUER = 'amenade'
const JWT_AUDIENCE = 'amenade-users'

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '7d'
const REFRESH_TOKEN_EXPIRY = '7d'

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
  }
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// JWT utilities
export async function createAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .sign(JWT_SECRET)
}

export async function createRefreshToken(userId: string): Promise<string> {
  return await new SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
    
    return payload as unknown as JwtPayload
  } catch (_error) {
    throw new AuthError('Invalid or expired token')
  }
}

// Cookie utilities
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()
  
  // Set access token cookie (httpOnly, secure)
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
  
  // Set refresh token cookie (httpOnly, secure)
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value
    
    if (!accessToken) {
      return null
    }
    
    const payload = await verifyToken(accessToken)
    
    return {
      id: payload.userId,
      email: payload.email,
      firstName: '', // Will be populated from database
      lastName: '',
      role: payload.role,
      avatar: undefined,
      isVerified: false,
    }
  } catch (_error) {
    return null
  }
}

// Middleware helper for API routes
export async function requireAuth(request: Request): Promise<JwtPayload> {
  let token: string | null = null

  // Try to get token from Authorization header first (Bearer token)
  const authorization = request.headers.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    token = authorization.substring(7) // Remove 'Bearer ' prefix
  } else {
    // Try to get token from cookies
    const cookieStore = await cookies()
    token = cookieStore.get('accessToken')?.value || null
  }

  if (!token) {
    throw new AuthError('No authorization token provided')
  }

  return await verifyToken(token)
}

// Role-based access control
export function requireRole(userRole: string, allowedRoles: string[]): void {
  if (!allowedRoles.includes(userRole)) {
    throw new AuthError('Insufficient permissions', 403)
  }
}

// Generate secure random codes
export function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Password strength validation
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Rate limiting for authentication attempts
const authAttempts = new Map<string, { count: number; resetTime: number }>()

export function checkAuthRateLimit(identifier: string): boolean {
  const now = Date.now()
  const attempts = authAttempts.get(identifier)
  
  if (!attempts || now > attempts.resetTime) {
    authAttempts.set(identifier, { count: 1, resetTime: now + 1 * 60 * 1000 }) // 1 minute
    return true
  }
  
  if (attempts.count >= 5) {
    return false
  }
  
  attempts.count++
  return true
}

export function resetAuthRateLimit(identifier: string): void {
  authAttempts.delete(identifier)
}


export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            return null
          }

          const isValidPassword = await verifyPassword(credentials.password, user.password)

          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile: _profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email || '' }
          })

          if (!existingUser) {
            // Create new user from Google OAuth
            const names = (user.name || '').split(' ')
            const firstName = names[0] || ''
            const lastName = names.slice(1).join(' ') || ''

            await prisma.user.create({
              data: {
                email: user.email || '',
                firstName,
                lastName,
                avatar: user.image,
                isEmailVerified: true, // Google emails are already verified
                isActive: true,
                role: 'SENDER', // Default role
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
              }
            })
          } else if (!existingUser.isActive) {
            // Reactivate deactivated account
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { 
                isActive: true,
                avatar: user.image || existingUser.avatar,
                isEmailVerified: true
              }
            })
          }

          return true
        } catch (error) {
          console.error('Google OAuth sign-in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account: _account }) {
      if (user) {
        // First time JWT creation
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email || '' },
          select: { id: true, role: true, isActive: true }
        })
        
        if (dbUser) {
          token.role = dbUser.role
          token.userId = dbUser.id
          token.isActive = dbUser.isActive
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId || token.sub
        ;(session.user as any).role = token.role
        ;(session.user as any).isActive = token.isActive
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}

