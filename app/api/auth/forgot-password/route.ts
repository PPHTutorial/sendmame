// Fakomame Platform - Forgot Password API
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { generatePasswordResetToken } from '@/lib/email'
import { sendEmail } from '@/lib/email'
import { createPasswordResetTemplate } from '@/lib/email-templates'

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Rate limiting storage
const resetAttempts = new Map<string, { count: number; resetTime: number }>()

function checkResetRateLimit(email: string): boolean {
  const now = Date.now()
  const attempts = resetAttempts.get(email)
  
  if (!attempts || now > attempts.resetTime) {
    resetAttempts.set(email, { count: 1, resetTime: now + 15 * 60 * 1000 }) // 15 minutes
    return true
  }
  
  if (attempts.count >= 3) {
    return false
  }
  
  attempts.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = forgotPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { email } = validationResult.data

    // Check rate limiting
    if (!checkResetRateLimit(email)) {
      return NextResponse.json(
        { 
          error: 'Too many reset attempts. Please wait 15 minutes before trying again.' 
        },
        { status: 429 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      }
    })

    // Always return success to prevent email enumeration
    // but only send email if user exists and is active
    if (user && user.isActive) {
      // Generate reset token
      const resetToken = generatePasswordResetToken()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store reset token in database
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt,
          used: false,
        }
      })

      // Send password reset email
      const emailTemplate = createPasswordResetTemplate({
        firstName: user.firstName,
        resetToken,
        email: user.email,
      })

      const emailResult = await sendEmail(user.email, emailTemplate)
      
      if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult.error)
        // Continue anyway to prevent email enumeration
      }
    }

    return NextResponse.json({
      message: 'If an account with that email exists, we have sent you a password reset link.',
      success: true
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
