import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    if (!wallet.isLocked) {
      return NextResponse.json(
        { success: false, error: 'Wallet is not locked' },
        { status: 400 }
      )
    }

    // Unlock the wallet
    const updatedWallet = await prisma.wallet.update({
      where: { id },
      data: {
        isLocked: false,
        lockedReason: null
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

    return NextResponse.json({
      success: true,
      wallet: updatedWallet,
      message: 'Wallet unlocked successfully'
    })

  } catch (error) {
    console.error('Unlock wallet API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unlock wallet' },
      { status: 500 }
    )
  }
}
