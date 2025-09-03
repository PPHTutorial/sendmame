// Fakomame Platform - Email Verification API
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateVerificationCode } from '@/lib/email'
import { sendEmail } from '@/lib/email'
import { createEmailVerificationTemplate } from '@/lib/email-templates'
import { updateOverallVerificationStatus } from '@/lib/verification-utils'

// Validation schemas
const sendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const verifyCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
})

// Rate limiting storage
const verificationAttempts = new Map<string, { count: number; resetTime: number }>()

function checkVerificationRateLimit(email: string): boolean {
  const now = Date.now()
  const attempts = verificationAttempts.get(email)
  
  if (!attempts || now > attempts.resetTime) {
    verificationAttempts.set(email, { count: 1, resetTime: now + 15 * 60 * 1000 }) // 15 minutes
    return true
  }
  
  if (attempts.count >= 5) {
    return false
  }
  
  attempts.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'send') {
      return await handleSendVerification(request)
    } else if (action === 'verify') {
      return await handleVerifyCode(request)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use ?action=send or ?action=verify' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

async function handleSendVerification(request: NextRequest) {
  // Check authentication using custom JWT system
  const authPayload = await requireAuth(request)
  const userId = authPayload.userId

  const body = await request.json()
  
  // Validate input
  const validationResult = sendVerificationSchema.safeParse(body)
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

  // Verify the email belongs to the authenticated user
  const sessionUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true }
  })

  if (!sessionUser || sessionUser.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json(
      { error: 'Email does not match authenticated user' },
      { status: 403 }
    )
  }

  // Check rate limiting
  if (!checkVerificationRateLimit(email)) {
    return NextResponse.json(
      { 
        error: 'Too many verification attempts. Please wait 15 minutes before trying again.' 
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
      isEmailVerified: true,
      isActive: true,
    }
  })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  if (user.isEmailVerified) {
    return NextResponse.json(
      { error: 'Email is already verified' },
      { status: 400 }
    )
  }

  if (!user.isActive) {
    return NextResponse.json(
      { error: 'Account is deactivated' },
      { status: 400 }
    )
  }

  // Generate verification code
  const verificationCode = generateVerificationCode()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  // Store verification code in database
  await prisma.emailVerification.upsert({
    where: { userId: user.id },
    update: {
      code: verificationCode,
      expiresAt,
      attempts: 0,
    },
    create: {
      userId: user.id,
      code: verificationCode,
      expiresAt,
      attempts: 0,
    }
  })

  // Send verification email
  const emailTemplate = createEmailVerificationTemplate({
    firstName: user.firstName,
    verificationCode,
    email: user.email,
  })

  const emailResult = await sendEmail(user.email, emailTemplate)
  
  if (!emailResult.success) {
    console.error('Failed to send verification email:', emailResult.error)
    return NextResponse.json(
      { error: 'Failed to send verification email. Please try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    message: 'Verification code sent successfully',
    success: true
  })
}

async function handleVerifyCode(request: NextRequest) {
  // Check authentication using custom JWT system
  const authPayload = await requireAuth(request)
  const userId = authPayload.userId

  const body = await request.json()
  
  // Validate input
  const validationResult = verifyCodeSchema.safeParse(body)
  if (!validationResult.success) {
    return NextResponse.json(
      { 
        error: 'Invalid input', 
        details: validationResult.error.errors 
      },
      { status: 400 }
    )
  }

  const { email, code } = validationResult.data

  // Find user and verification record
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      emailVerification: true
    }
  })

  if (!user || !user.emailVerification) {
    return NextResponse.json(
      { error: 'Invalid verification code' },
      { status: 400 }
    )
  }

  // Verify the user matches the authenticated session
  if (user.id !== userId) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 403 }
    )
  }

  const verification = user.emailVerification

  // Check if code is expired
  if (verification.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'Verification code has expired. Please request a new one.' },
      { status: 400 }
    )
  }

  // Check attempts limit
  if (verification.attempts >= 5) {
    return NextResponse.json(
      { error: 'Too many verification attempts. Please request a new code.' },
      { status: 400 }
    )
  }

  // Verify code
  if (verification.code !== code) {
    // Increment attempts
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { attempts: verification.attempts + 1 }
    })

    return NextResponse.json(
      { error: 'Invalid verification code' },
      { status: 400 }
    )
  }

  // Mark email as verified and clean up verification record
  await prisma.$transaction(async (tx) => {
    // Update email verification status
    await tx.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true }
    })

    // Check and update overall verification status
    await updateOverallVerificationStatus(user.id, tx)

    // Delete verification record
    await tx.emailVerification.delete({
      where: { id: verification.id }
    })
  })

  return NextResponse.json({
    message: 'Email verified successfully',
    success: true
  })
}
