import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { confirmationId: string } }
) {
  try {
    const { confirmationId } = params
    const { status } = await request.json()

    // For now, we'll just return success since there's no verification status field in the schema
    // In a real implementation, you might want to add a verification status field or log this action
    
    const confirmation = await prisma.safetyConfirmation.findUnique({
      where: { id: confirmationId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!confirmation) {
      return NextResponse.json(
        { error: 'Confirmation not found' },
        { status: 404 }
      )
    }

    // Here you could log the verification action or update a verification status
    // For now, we'll just return the confirmation with a verification timestamp

    return NextResponse.json({
      confirmation,
      verificationStatus: status,
      verifiedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error verifying safety confirmation:', error)
    return NextResponse.json(
      { error: 'Failed to verify confirmation' },
      { status: 500 }
    )
  }
}
