import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get wallet metrics
    const [
      totalWallets,
      lockedWallets,
      totalBalanceResult,
      totalPendingInResult,
      totalPendingOutResult,
      pendingTransactions
    ] = await Promise.all([
      // Total wallets count
      prisma.wallet.count(),
      
      // Locked wallets count
      prisma.wallet.count({
        where: { isLocked: true }
      }),
      
      // Total balance across all wallets
      prisma.wallet.aggregate({
        _sum: { balance: true }
      }),
      
      // Total pending in
      prisma.wallet.aggregate({
        _sum: { pendingIn: true }
      }),
      
      // Total pending out
      prisma.wallet.aggregate({
        _sum: { pendingOut: true }
      }),
      
      // Pending transactions count
      prisma.transaction.count({
        where: { 
          status: { 
            in: ['PENDING', 'PROCESSING'] 
          } 
        }
      })
    ])

    const totalBalance = totalBalanceResult._sum.balance || 0
    const totalPendingIn = totalPendingInResult._sum.pendingIn || 0
    const totalPendingOut = totalPendingOutResult._sum.pendingOut || 0
    const avgBalance = totalWallets > 0 ? totalBalance / totalWallets : 0

    const metrics = {
      totalWallets,
      totalBalance,
      lockedWallets,
      pendingTransactions,
      avgBalance,
      totalPendingIn,
      totalPendingOut
    }

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Wallet metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet metrics' },
      { status: 500 }
    )
  }
}
