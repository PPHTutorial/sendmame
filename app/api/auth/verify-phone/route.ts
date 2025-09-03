import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { updateOverallVerificationStatus } from '@/lib/verification-utils'

// Validation schemas
const sendVerificationSchema = z.object({
  phone: z.string().min(10, 'Invalid phone number'),
})

const verifyCodeSchema = z.object({
  phone: z.string().min(10, 'Invalid phone number'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
})

// In-memory storage for verification codes (use database in production)
const verificationCodes = new Map<string, { code: string, expiresAt: Date, userId: string }>()

// Rate limiting storage
const verificationAttempts = new Map<string, { count: number; resetTime: number }>()

function checkVerificationRateLimit(phone: string): boolean {
  const now = Date.now()
  const attempts = verificationAttempts.get(phone)
  
  if (!attempts || now > attempts.resetTime) {
    verificationAttempts.set(phone, { count: 1, resetTime: now + 15 * 60 * 1000 }) // 15 minutes
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
        { error: 'Invalid action parameter' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Phone verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleSendVerification(request: NextRequest) {
  // Check authentication
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

  const { phone } = validationResult.data

  // Check rate limiting
  if (!checkVerificationRateLimit(phone)) {
    return NextResponse.json(
      { 
        error: 'Too many verification attempts. Please wait 15 minutes before trying again.' 
      },
      { status: 429 }
    )
  }

  // Find user by phone
  const user = await prisma.user.findFirst({
    where: { 
      id: userId,
      phone: phone 
    },
    select: {
      id: true,
      phone: true,
      firstName: true,
      isPhoneVerified: true,
      isActive: true,
    }
  })

  if (!user) {
    return NextResponse.json(
      { error: 'Phone number not found or does not belong to your account' },
      { status: 404 }
    )
  }

  if (user.isPhoneVerified) {
    return NextResponse.json(
      { error: 'Phone number is already verified' },
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
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  // Store verification code in memory
  verificationCodes.set(phone, {
    code: verificationCode,
    expiresAt,
    userId: user.id
  })

  // Clean up expired codes
  for (const [phoneKey, data] of verificationCodes.entries()) {
    if (data.expiresAt < new Date()) {
      verificationCodes.delete(phoneKey)
    }
  }

  // TODO: Send SMS here using your SMS service
  console.log(`SMS Verification Code for ${phone}: ${verificationCode}`)

  return NextResponse.json({
    message: 'Verification code sent successfully',
    success: true
  })
}

async function handleVerifyCode(request: NextRequest) {
  // Check authentication
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

  const { phone, code } = validationResult.data

  // Find user and verification record
  const user = await prisma.user.findFirst({
    where: { 
      id: userId,
      phone: phone 
    }
  })

  if (!user) {
    return NextResponse.json(
      { error: 'Phone number not found or does not belong to your account' },
      { status: 404 }
    )
  }

  const verification = verificationCodes.get(phone)

  if (!verification || verification.userId !== userId) {
    return NextResponse.json(
      { error: 'Invalid verification code' },
      { status: 400 }
    )
  }

  // Check if code is expired
  if (verification.expiresAt < new Date()) {
    verificationCodes.delete(phone)
    return NextResponse.json(
      { error: 'Verification code has expired. Please request a new one.' },
      { status: 400 }
    )
  }

  // Verify code
  if (verification.code !== code) {
    return NextResponse.json(
      { error: 'Invalid verification code' },
      { status: 400 }
    )
  }

  // Mark phone as verified and clean up verification record
  await prisma.$transaction(async (tx) => {
    // Update phone verification status
    await tx.user.update({
      where: { id: user.id },
      data: { isPhoneVerified: true }
    })

    // Check and update overall verification status
    await updateOverallVerificationStatus(user.id, tx)
  })

  // Delete verification record
  verificationCodes.delete(phone)

  return NextResponse.json({
    message: 'Phone number verified successfully',
    success: true
  })
}
