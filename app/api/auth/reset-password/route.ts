// Fakomame Platform - Reset Password API
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// Validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = resetPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { token, email, password } = validationResult.data

    // Find the reset token
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          }
        }
      }
    })

    // Validate token and user
    if (!passwordReset || 
        passwordReset.used || 
        passwordReset.expiresAt < new Date() ||
        passwordReset.user.email.toLowerCase() !== email.toLowerCase() ||
        !passwordReset.user.isActive) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password)

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: passwordReset.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { 
          used: true,
          usedAt: new Date()
        }
      }),
      // Invalidate all other unused reset tokens for this user
      prisma.passwordReset.updateMany({
        where: {
          userId: passwordReset.userId,
          used: false,
          id: { not: passwordReset.id }
        },
        data: { used: true }
      })
    ])

    return NextResponse.json({
      message: 'Password has been reset successfully',
      success: true
    })

  } catch (error) {
    console.error('Reset password error:', error)
    
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
