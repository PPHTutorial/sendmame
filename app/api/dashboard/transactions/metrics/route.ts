import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get transaction metrics
    const [
      totalTransactions,
      totalRevenue,
      completedTransactions,
      failedTransactions,
      pendingAmount,
      platformFeesCollected
    ] = await Promise.all([
      // Total transactions count
      prisma.transaction.count(),
      
      // Total revenue (completed transactions)
      prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      
      // Completed transactions count
      prisma.transaction.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Failed transactions count
      prisma.transaction.count({
        where: { status: 'FAILED' }
      }),
      
      // Pending amount
      prisma.transaction.aggregate({
        where: { 
          status: { 
            in: ['PENDING', 'PROCESSING'] 
          } 
        },
        _sum: { amount: true }
      }),
      
      // Platform fees collected
      prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { platformFee: true }
      })
    ])

    const metrics = {
      totalTransactions,
      totalRevenue: totalRevenue._sum.amount || 0,
      completedTransactions,
      failedTransactions,
      pendingAmount: pendingAmount._sum.amount || 0,
      platformFeesCollected: platformFeesCollected._sum.platformFee || 0
    }

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Transaction metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction metrics' },
      { status: 500 }
    )
  }
}
