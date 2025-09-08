import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { reason } = body
    const { id } = params

    if (!reason) {
      return NextResponse.json(
        { error: 'Deactivation reason is required' },
        { status: 400 }
      )
    }

    // Update payment method
    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      },
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

    // Create audit log/notification if needed
    // This could be expanded to include audit trails

    return NextResponse.json({
      success: true,
      message: 'Payment method deactivated successfully',
      paymentMethod: updatedPaymentMethod
    })

  } catch (error) {
    console.error('Error deactivating payment method:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate payment method' },
      { status: 500 }
    )
  }
}
