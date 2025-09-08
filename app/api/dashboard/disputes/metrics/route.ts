import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const [
      totalDisputes,
      openDisputes,
      resolvedToday,
      totalResolved
    ] = await Promise.all([
      // Total disputes
      prisma.dispute.count(),
      
      // Open disputes
      prisma.dispute.count({
        where: {
          status: {
            in: ['OPEN', 'IN_REVIEW']
          }
        }
      }),
      
      // Resolved today
      prisma.dispute.count({
        where: {
          status: 'RESOLVED',
          resolvedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Total resolved disputes for rate calculation
      prisma.dispute.count({
        where: { status: 'RESOLVED' }
      })
    ])

    // Get high priority disputes (assuming type determines priority)
    const highPriorityDisputes = await prisma.dispute.count({
      where: {
        type: {
          in: ['payment_issue', 'damaged_package']
        }
      }
    })

    // Calculate resolution rate
    const resolutionRate = totalDisputes > 0 
      ? Math.round((totalResolved / totalDisputes) * 100)
      : 0

    return NextResponse.json({
      totalDisputes,
      openDisputes,
      resolvedToday,
      highPriorityDisputes,
      resolutionRate
    })
  } catch (error) {
    console.error('Error fetching disputes metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
