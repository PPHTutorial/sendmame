import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { amount, reason } = body

    // Validate input
    if (!amount || !reason) {
      return NextResponse.json(
        { success: false, error: 'Amount and reason are required' },
        { status: 400 }
      )
    }

    // Find the original transaction
    const originalTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: true,
        paymentMethod: true
      }
    })

    if (!originalTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Validate that transaction can be refunded
    if (originalTransaction.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Only completed transactions can be refunded' },
        { status: 400 }
      )
    }

    if (amount > originalTransaction.amount) {
      return NextResponse.json(
        { success: false, error: 'Refund amount cannot exceed original amount' },
        { status: 400 }
      )
    }

    // Create refund transaction
    const refundTransaction = await prisma.transaction.create({
      data: {
        type: 'REFUND',
        amount: -Math.abs(parseFloat(amount.toString())), // Negative amount for refund
        currency: originalTransaction.currency,
        description: `Refund for transaction ${originalTransaction.id}: ${reason}`,
        userId: originalTransaction.userId,
        packageId: originalTransaction.packageId,
        tripId: originalTransaction.tripId,
        paymentMethodId: originalTransaction.paymentMethodId,
        platformFee: 0,
        gatewayFee: 0,
        netAmount: -Math.abs(parseFloat(amount.toString())),
        status: 'COMPLETED',
        processedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        paymentMethod: {
          select: {
            id: true,
            type: true,
            last4: true,
            brand: true
          }
        }
      }
    })

    // Update original transaction status if full refund
    if (amount === originalTransaction.amount) {
      await prisma.transaction.update({
        where: { id: originalTransaction.id },
        data: {
          status: 'REFUNDED'
        }
      })
    }

    // Update user's wallet if it exists
    const wallet = await prisma.wallet.findUnique({
      where: { userId: originalTransaction.userId }
    })

    if (wallet) {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: parseFloat(amount.toString())
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      refund: refundTransaction,
      message: 'Refund processed successfully'
    })

  } catch (error) {
    console.error('Refund API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process refund' },
      { status: 500 }
    )
  }
}
