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
    const { reason } = body

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

    // Validate reason is provided
    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Reason is required for locking wallet' },
        { status: 400 }
      )
    }

    // Lock the wallet
    const updatedWallet = await prisma.wallet.update({
      where: { id },
      data: {
        isLocked: true,
        lockedReason: reason
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
      message: 'Wallet locked successfully'
    })

  } catch (error) {
    console.error('Lock wallet API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to lock wallet' },
      { status: 500 }
    )
  }
}
