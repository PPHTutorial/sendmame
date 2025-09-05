import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { VerificationStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id

    // Update the verification document
    const updatedDocument = await prisma.verificationDocument.update({
      where: { id: documentId },
      data: {
        status: VerificationStatus.VERIFIED,
        verifiedAt: new Date(),
        rejectionReason: null
      },
      include: {
        user: true
      }
    })

    // Check if user should be marked as verified
    // (if they have at least one verified document)
    const verifiedDocuments = await prisma.verificationDocument.count({
      where: {
        userId: updatedDocument.userId,
        status: VerificationStatus.VERIFIED
      }
    })

    // Update user verification status if they have verified documents
    if (verifiedDocuments > 0) {
      await prisma.user.update({
        where: { id: updatedDocument.userId },
        data: {
          isVerified: true,
          verificationStatus: 'VERIFIED'
        }
      })
    }

    return NextResponse.json({
      success: true,
      document: updatedDocument
    })

  } catch (error) {
    console.error('Error approving verification document:', error)
    return NextResponse.json(
      { error: 'Failed to approve verification document' },
      { status: 500 }
    )
  }
}
