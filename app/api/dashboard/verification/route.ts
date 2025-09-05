import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Get verification metrics
    const totalDocuments = await prisma.verificationDocument.count()

    const statusBreakdown = await prisma.verificationDocument.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const recentActivity = await prisma.verificationDocument.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Get monthly trend for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyTrend = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "verification_documents"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month
    `

    const documentTypeBreakdown = await prisma.verificationDocument.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      totalDocuments,
      statusBreakdown: statusBreakdown.map(item => ({
        status: item.status,
        count: item._count.id
      })),
      recentActivity: recentActivity.map(item => ({
        id: item.id,
        type: item.type,
        status: item.status,
        user: {
          firstName: item.user.firstName,
          lastName: item.user.lastName,
          email: item.user.email
        },
        createdAt: item.createdAt
      })),
      monthlyTrend: (monthlyTrend as any[]).map(item => ({
        month: item.month,
        count: Number(item.count)
      })),
      documentTypeBreakdown: documentTypeBreakdown.map(item => ({
        type: item.type,
        count: item._count.id
      }))
    })

  } catch (error) {
    console.error('Error fetching verification data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verification data' },
      { status: 500 }
    )
  }
}
