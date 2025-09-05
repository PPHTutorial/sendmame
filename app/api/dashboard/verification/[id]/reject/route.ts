import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { VerificationStatus } from '@prisma/client'
import { fa } from 'zod/v4/locales'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const { reason, docType } = await request.json()

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

    // Determine which user verification field to update based on document type
    const userUpdateData: any = {
      // Always set overall verification to false when any document is rejected
      isVerified: false,
      verificationStatus: VerificationStatus.PENDING
    }

    switch (docType) {
      case 'national_id':
      case 'passport':
      case 'drivers_license':
        userUpdateData.isIDVerified = false
        break
      case 'facial_photo':
        userUpdateData.isFacialVerified = false
        break
      case 'address_document':
      case 'lease_agreement':
      case 'utility_bill':
      case 'bank_statement':
        userUpdateData.isAddressVerified = false
        break
      default:
        break
    }

    // Update user verification fields
    await prisma.user.update({
      where: { id: updatedDocument.userId },
      data: userUpdateData
    })

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