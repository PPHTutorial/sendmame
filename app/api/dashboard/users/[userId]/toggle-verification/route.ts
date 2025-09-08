import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Don't allow toggling verification for admin users
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot modify admin user verification status' },
        { status: 403 }
      )
    }

    // Toggle verification status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: !user.isVerified,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${updatedUser.isVerified ? 'verified' : 'unverified'} successfully`
    })
  } catch (error) {
    console.error('Error toggling user verification status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
