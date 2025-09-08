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
    const { amount, type, reason } = body

    // Validate input
    if (!amount || !type || !reason) {
      return NextResponse.json(
        { success: false, error: 'Amount, type, and reason are required' },
        { status: 400 }
      )
    }

    if (type !== 'add' && type !== 'subtract') {
      return NextResponse.json(
        { success: false, error: 'Type must be either "add" or "subtract"' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Find the wallet
    const wallet = await prisma.wallet.findUnique({
      where: { id },
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

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      )
    }

    // Check if wallet is locked
    if (wallet.isLocked) {
      return NextResponse.json(
        { success: false, error: 'Cannot adjust balance of locked wallet' },
        { status: 400 }
      )
    }

    // Calculate new balance
    const adjustmentAmount = parseFloat(amount.toString())
    const newBalance = type === 'add' 
      ? wallet.balance + adjustmentAmount 
      : wallet.balance - adjustmentAmount

    // Prevent negative balance
    if (newBalance < 0) {
      return NextResponse.json(
        { success: false, error: 'Adjustment would result in negative balance' },
        { status: 400 }
      )
    }

    // Start transaction to update wallet and create transaction record
    const result = await prisma.$transaction(async (prisma) => {
      // Update wallet balance
      const updatedWallet = await prisma.wallet.update({
        where: { id },
        data: {
          balance: newBalance
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          },
          _count: {
            select: {
              transactions: true
            }
          }
        }
      })

      // Create transaction record for the adjustment
      const transaction = await prisma.transaction.create({
        data: {
          type: type === 'add' ? 'DEPOSIT' : 'WITHDRAWAL',
          amount: type === 'add' ? adjustmentAmount : -adjustmentAmount,
          currency: wallet.currency,
          description: `Manual balance adjustment: ${reason}`,
          userId: wallet.userId,
          walletId: wallet.id,
          platformFee: 0,
          gatewayFee: 0,
          netAmount: type === 'add' ? adjustmentAmount : -adjustmentAmount,
          status: 'COMPLETED',
          processedAt: new Date()
        }
      })

      return { wallet: updatedWallet, transaction }
    })

    return NextResponse.json({
      success: true,
      wallet: result.wallet,
      transaction: result.transaction,
      message: `Balance ${type === 'add' ? 'increased' : 'decreased'} successfully`
    })

  } catch (error) {
    console.error('Adjust balance API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to adjust balance' },
      { status: 500 }
    )
  }
}
