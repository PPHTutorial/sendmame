// Amenade Platform - Token Refresh API
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, createAccessToken } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      )
    }

    // Verify refresh token
    const payload = await verifyToken(refreshToken)
    
    // Check if this is a refresh token (createRefreshToken sets type: 'refresh')
    if (payload.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 401 }
      )
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isIDVerified: true,
        isFacialVerified: true,
        isAddressVerified: true,
        isVerified: true,
      }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      )
    }

    // Create new access token
    const newAccessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Update the access token cookie
    cookieStore.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          isIDVerified: user.isIDVerified,
          isFacialVerified: user.isFacialVerified,
          isAddressVerified: user.isAddressVerified,
          isVerified: user.isVerified,
        }
      }
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Invalid or expired refresh token' },
      { status: 401 }
    )
  }
}
