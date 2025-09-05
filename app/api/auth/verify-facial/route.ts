// Fakomame Platform - Facial Verification API
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Rate limiting storage
const verificationAttempts = new Map<string, { count: number; resetTime: number }>()

function checkVerificationRateLimit(userId: string): boolean {
  const now = Date.now()
  const attempts = verificationAttempts.get(userId)
  
  if (!attempts || now > attempts.resetTime) {
    verificationAttempts.set(userId, { count: 1, resetTime: now + 15 * 60 * 1000 }) // 15 minutes
    return true
  }
  
  if (attempts.count >= 3) { // Limit to 3 facial verification attempts per 15 minutes
    return false
  }
  
  attempts.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'upload' || !action) {
      return await handleFacialPhotoUpload(request)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use ?action=upload' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Facial verification error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

async function handleFacialPhotoUpload(request: NextRequest) {
  // Check authentication
  const authPayload = await requireAuth(request)
  const userId = authPayload.userId

  // Check rate limiting
  if (!checkVerificationRateLimit(userId)) {
    return NextResponse.json(
      { 
        error: 'Too many upload attempts. Please wait 15 minutes before trying again.' 
      },
      { status: 429 }
    )
  }

  // Get form data
  const formData = await request.formData()
  const facialPhoto = formData.get('facialPhoto') as File

  // Validate required fields
  if (!facialPhoto) {
    return NextResponse.json(
      { error: 'Facial photo is required' },
      { status: 400 }
    )
  }

  // Validate file type and size
  if (!facialPhoto.type.startsWith('image/')) {
    return NextResponse.json(
      { error: 'Facial photo must be an image file' },
      { status: 400 }
    )
  }

  if (facialPhoto.size > 10 * 1024 * 1024) { // 10MB limit
    return NextResponse.json(
      { error: 'Facial photo file size must be less than 10MB' },
      { status: 400 }
    )
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      isFacialVerified: true,
      isActive: true,
    }
  })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  if (user.isFacialVerified) {
    return NextResponse.json(
      { error: 'Facial verification is already completed' },
      { status: 400 }
    )
  }

  if (!user.isActive) {
    return NextResponse.json(
      { error: 'Account is deactivated' },
      { status: 400 }
    )
  }

  try {
    // Convert file to base64 for database storage
    const bytes = await facialPhoto.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const facialPhotoUrl = `data:${facialPhoto.type};base64,${buffer.toString('base64')}`
    
    // Store facial photo in database
    await prisma.$transaction(async (tx) => {
      // Remove any existing facial verification documents for this user
      await tx.verificationDocument.deleteMany({
        where: { 
          userId,
          type: 'facial_photo'
        }
      })

      // Create new facial verification document
      await tx.verificationDocument.create({
        data: {
          userId,
          type: 'facial_photo',
          documentUrl: facialPhotoUrl,
          status: 'PENDING',
        }
      })

      // Note: Facial verification requires manual review, so we don't automatically update isFacialVerified
      // The admin will review and approve/reject the facial photo
    })

    return NextResponse.json({
      message: 'Facial photo uploaded successfully and is under review',
      success: true,
      data: {
        type: 'facial_photo',
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error('Failed to process facial photo:', error)
    return NextResponse.json(
      { error: 'Failed to process facial photo. Please try again.' },
      { status: 500 }
    )
  }
}

// GET endpoint to check verification status
export async function GET(request: NextRequest) {
  try {
    const authPayload = await requireAuth(request)
    const userId = authPayload.userId

    const verificationDoc = await prisma.verificationDocument.findFirst({
      where: { 
        userId,
        type: 'facial_photo'
      },
      select: {
        type: true,
        status: true,
        rejectionReason: true,
        verifiedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        hasDocument: !!verificationDoc,
        ...verificationDoc
      }
    })

  } catch (error) {
    console.error('Failed to get facial verification status:', error)
    return NextResponse.json(
      { error: 'Failed to get facial verification status' },
      { status: 500 }
    )
  }
}
