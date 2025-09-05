import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { VerificationStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const { docType } = await request.json()

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

    // Determine which user verification field to update based on document type
    const userUpdateData: any = {}

    console.log('Document type for approval:', docType)

    switch (docType) {
      case 'national_id':
      case 'passport':
      case 'drivers_license':
        userUpdateData.isIDVerified = true
        break
      case 'facial_photo':
        userUpdateData.isFacialVerified = true
        break
      case 'address_document':
      case 'lease_agreement':
      case 'utility_bill':
      case 'bank_statement':
        userUpdateData.isAddressVerified = true
        break
      default:
        break
    }

    // Get current user data to check all verification fields
    const currentUser = await prisma.user.findUnique({
      where: { id: updatedDocument.userId }
    })

    if (!currentUser) {
      throw new Error('User not found')
    }

    // Apply the document-specific verification update
    const updatedUserData = {
      ...currentUser,
      ...userUpdateData
    }

    // Check if ALL five verification fields are true
    const allVerificationsPassed =
      updatedUserData.isPhoneVerified &&
      updatedUserData.isEmailVerified &&
      updatedUserData.isIDVerified &&
      updatedUserData.isFacialVerified &&
      updatedUserData.isAddressVerified

    // Update overall verification status only if all verifications are complete
    if (allVerificationsPassed) {
      userUpdateData.isVerified = true
      userUpdateData.verificationStatus = VerificationStatus.VERIFIED
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
    console.error('Error approving verification document:', error)
    return NextResponse.json(
      { error: 'Failed to approve verification document' },
      { status: 500 }
    )
  }
}