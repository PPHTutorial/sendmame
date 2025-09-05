// Fakomame Platform - ID Verification API
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Validation schemas
const uploadDocumentSchema = z.object({
  type: z.enum(['passport', 'drivers_license', 'national_id'], {
    errorMap: () => ({ message: 'Invalid document type' })
  }),
})

// Rate limiting storage
const verificationAttempts = new Map<string, { count: number; resetTime: number }>()

function checkVerificationRateLimit(userId: string): boolean {
  const now = Date.now()
  const attempts = verificationAttempts.get(userId)
  
  if (!attempts || now > attempts.resetTime) {
    verificationAttempts.set(userId, { count: 1, resetTime: now + 15 * 60 * 1000 }) // 15 minutes
    return true
  }
  
  if (attempts.count >= 3) { // Limit to 3 ID upload attempts per 15 minutes
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
      return await handleDocumentUpload(request)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use ?action=upload' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('ID verification error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

async function handleDocumentUpload(request: NextRequest) {
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
  const frontDocument = formData.get('frontDocument') as File
  const backDocument = formData.get('backDocument') as File | null
  const type = formData.get('type') as string

  // Validate required fields
  if (!frontDocument || !type) {
    return NextResponse.json(
      { error: 'Front document file and type are required' },
      { status: 400 }
    )
  }

  // Validate document type
  const validationResult = uploadDocumentSchema.safeParse({ type })
  if (!validationResult.success) {
    return NextResponse.json(
      { 
        error: 'Invalid document type', 
        details: validationResult.error.errors 
      },
      { status: 400 }
    )
  }

  // For non-passport documents, back image is required
  if (type !== 'passport' && !backDocument) {
    return NextResponse.json(
      { error: 'Back document image is required for this document type' },
      { status: 400 }
    )
  }

  // Validate front document file
  if (!frontDocument.type.startsWith('image/') && frontDocument.type !== 'application/pdf') {
    return NextResponse.json(
      { error: 'Front document must be an image or PDF file' },
      { status: 400 }
    )
  }

  if (frontDocument.size > 10 * 1024 * 1024) { // 10MB limit
    return NextResponse.json(
      { error: 'Front document file size must be less than 10MB' },
      { status: 400 }
    )
  }

  // Validate back document file if present
  if (backDocument) {
    if (!backDocument.type.startsWith('image/') && backDocument.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Back document must be an image or PDF file' },
        { status: 400 }
      )
    }

    if (backDocument.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'Back document file size must be less than 10MB' },
        { status: 400 }
      )
    }
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      isIDVerified: true,
      isActive: true,
    }
  })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  if (user.isIDVerified) {
    return NextResponse.json(
      { error: 'ID is already verified' },
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
    // Convert files to base64 for database storage
    const frontBytes = await frontDocument.arrayBuffer()
    const frontBuffer = Buffer.from(frontBytes)
    const frontDocumentUrl = `data:${frontDocument.type};base64,${frontBuffer.toString('base64')}`
    
    let backDocumentUrl: string | null = null
    if (backDocument) {
      const backBytes = await backDocument.arrayBuffer()
      const backBuffer = Buffer.from(backBytes)
      backDocumentUrl = `data:${backDocument.type};base64,${backBuffer.toString('base64')}`
    }
    
    // Store documents in database
    await prisma.$transaction(async (tx) => {
      // Remove any existing verification documents for this user
      await tx.verificationDocument.deleteMany({
        where: { userId }
      })

      // Create new verification document
      await tx.verificationDocument.create({
        data: {
          userId,
          type: validationResult.data.type,
          documentUrl: frontDocumentUrl,
          backDocumentUrl,
          status: 'PENDING',
        }
      })

      // Note: ID verification requires manual review, so we don't automatically update isIDVerified
      // The admin will review and approve/reject the document
    })

    return NextResponse.json({
      message: 'ID document uploaded successfully and is under review',
      success: true,
      data: {
        type: validationResult.data.type,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error('Failed to process ID document:', error)
    return NextResponse.json(
      { error: 'Failed to process ID document. Please try again.' },
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
      where: { userId },
      select: {
        type: true,
        documentUrl: true,
        backDocumentUrl: true,
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
    console.error('Failed to get verification status:', error)
    return NextResponse.json(
      { error: 'Failed to get verification status' },
      { status: 500 }
    )
  }
}
