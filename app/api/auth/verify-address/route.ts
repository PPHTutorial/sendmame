// Fakomame Platform - Address Verification API
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Validation schemas
const addressVerificationSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  documentType: z.enum(['utility_bill', 'bank_statement', 'lease_agreement'], {
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
  
  if (attempts.count >= 3) { // Limit to 3 address verification attempts per 15 minutes
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
      return await handleAddressDocumentUpload(request)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use ?action=upload' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Address verification error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

async function handleAddressDocumentUpload(request: NextRequest) {
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
  const addressDocument = formData.get('addressDocument') as File
  const street = formData.get('street') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string
  const postalCode = formData.get('postalCode') as string
  const country = formData.get('country') as string
  const documentType = formData.get('documentType') as string

  // Validate required fields
  if (!addressDocument || !street || !city || !state || !postalCode || !country || !documentType) {
    return NextResponse.json(
      { error: 'All address fields and document are required' },
      { status: 400 }
    )
  }

  // Validate address data
  const validationResult = addressVerificationSchema.safeParse({ 
    street, city, state, postalCode, country, documentType 
  })
  if (!validationResult.success) {
    return NextResponse.json(
      { 
        error: 'Invalid address data', 
        details: validationResult.error.errors 
      },
      { status: 400 }
    )
  }

  // Validate file type and size
  if (!addressDocument.type.startsWith('image/') && addressDocument.type !== 'application/pdf') {
    return NextResponse.json(
      { error: 'Address document must be an image or PDF file' },
      { status: 400 }
    )
  }

  if (addressDocument.size > 10 * 1024 * 1024) { // 10MB limit
    return NextResponse.json(
      { error: 'Address document file size must be less than 10MB' },
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
      isAddressVerified: true,
      isActive: true,
    }
  })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  if (user.isAddressVerified) {
    return NextResponse.json(
      { error: 'Address is already verified' },
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
    const bytes = await addressDocument.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const documentUrl = `data:${addressDocument.type};base64,${buffer.toString('base64')}`
    
    // Store address verification in database
    await prisma.$transaction(async (tx) => {
      // Remove any existing address verification documents for this user
      await tx.verificationDocument.deleteMany({
        where: { 
          userId,
          type: 'address_document'
        }
      })

      // Create new address verification document
      await tx.verificationDocument.create({
        data: {
          userId,
          type: 'address_document',
          documentUrl,
          status: 'PENDING',
          // Store address data in a JSON field (we'll need to add this to schema)
          metadata: {
            address: {
              street: validationResult.data.street,
              city: validationResult.data.city,
              state: validationResult.data.state,
              postalCode: validationResult.data.postalCode,
              country: validationResult.data.country,
            },
            documentType: validationResult.data.documentType,
          }
        }
      })

      // Note: Address verification requires manual review, so we don't automatically update isAddressVerified
      // The admin will review and approve/reject the address document
    })

    return NextResponse.json({
      message: 'Address document uploaded successfully and is under review',
      success: true,
      data: {
        type: 'address_document',
        status: 'PENDING',
        address: {
          street: validationResult.data.street,
          city: validationResult.data.city,
          state: validationResult.data.state,
          postalCode: validationResult.data.postalCode,
          country: validationResult.data.country,
        },
        documentType: validationResult.data.documentType,
        submittedAt: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error('Failed to process address document:', error)
    return NextResponse.json(
      { error: 'Failed to process address document. Please try again.' },
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
        type: 'address_document'
      },
      select: {
        type: true,
        status: true,
        rejectionReason: true,
        verifiedAt: true,
        createdAt: true,
        metadata: true,
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
    console.error('Failed to get address verification status:', error)
    return NextResponse.json(
      { error: 'Failed to get address verification status' },
      { status: 500 }
    )
  }
}
