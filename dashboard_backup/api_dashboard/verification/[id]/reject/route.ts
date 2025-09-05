import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { VerificationStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const { reason } = await request.json()

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Update the verification document
    const updatedDocument = await prisma.verificationDocument.update({
      where: { id: documentId },
      data: {
        status: VerificationStatus.REJECTED,
        rejectionReason: reason,
        verifiedAt: null
      },
      include: {
        user: true
      }
    })

    // Check if user should be marked as unverified
    // (if they have no verified documents remaining)
    const verifiedDocuments = await prisma.verificationDocument.count({
      where: {
        userId: updatedDocument.userId,
        status: VerificationStatus.VERIFIED
      }
    })

    // Update user verification status if they have no verified documents
    if (verifiedDocuments === 0) {
      await prisma.user.update({
        where: { id: updatedDocument.userId },
        data: {
          isVerified: false,
          verificationStatus: 'PENDING'
        }
      })
    }

    return NextResponse.json({
      success: true,
      document: updatedDocument
    })

  } catch (error) {
    console.error('Error rejecting verification document:', error)
    return NextResponse.json(
      { error: 'Failed to reject verification document' },
      { status: 500 }
    )
  }
}
