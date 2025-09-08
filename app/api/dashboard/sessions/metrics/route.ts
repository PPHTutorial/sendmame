import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())

    const [
      totalSessions,
      activeSessions,
      expiredSessions,
      todaySessions,
      thisHourSessions,
      uniqueUsers,
      averageSessionDuration
    ] = await Promise.all([
      // Total sessions
      prisma.session.count(),
      
      // Active sessions (not expired)
      prisma.session.count({
        where: {
          expires: { gt: now }
        }
      }),
      
      // Expired sessions
      prisma.session.count({
        where: {
          expires: { lte: now }
        }
      }),
      
      // Sessions expiring today (created today)
      prisma.session.count({
        where: {
          expires: { gte: startOfToday }
        }
      }),
      
      // Sessions in this hour
      prisma.session.count({
        where: {
          expires: { gte: startOfHour }
        }
      }),
      
      // Unique users with sessions
      prisma.session.groupBy({
        by: ['userId'],
        _count: { userId: true }
      }).then(result => result.length),
      
      // Average session duration (mock calculation since we don't have start time)
      // This is a simplified calculation
      prisma.session.findMany({
        select: { expires: true },
        take: 100
      }).then(sessions => {
        if (sessions.length === 0) return 0
        // Assume sessions are typically valid for 24 hours on average
        return 24 * 60 // minutes
      })
    ])

    return NextResponse.json({
      totalSessions,
      activeSessions,
      expiredSessions,
      todaySessions,
      thisHourSessions,
      uniqueUsers,
      averageSessionDuration
    })

  } catch (error) {
    console.error('Error fetching session metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session metrics' },
      { status: 500 }
    )
  }
}
