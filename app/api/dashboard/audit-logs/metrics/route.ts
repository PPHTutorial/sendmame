import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())

    const [
      totalLogs,
      todayLogs,
      thisWeekLogs,
      thisMonthLogs,
      thisHourLogs,
      systemLogs,
      userLogs,
      criticalActions
    ] = await Promise.all([
      // Total audit logs
      prisma.auditLog.count(),
      
      // Today's logs
      prisma.auditLog.count({
        where: {
          createdAt: { gte: today }
        }
      }),
      
      // This week's logs
      prisma.auditLog.count({
        where: {
          createdAt: { gte: thisWeek }
        }
      }),
      
      // This month's logs
      prisma.auditLog.count({
        where: {
          createdAt: { gte: thisMonth }
        }
      }),
      
      // This hour's logs
      prisma.auditLog.count({
        where: {
          createdAt: { gte: thisHour }
        }
      }),
      
      // System logs (no userId)
      prisma.auditLog.count({
        where: {
          userId: null
        }
      }),
      
      // User logs (with userId)
      prisma.auditLog.count({
        where: {
          userId: { not: null }
        }
      }),
      
      // Critical actions (sensitive operations)
      prisma.auditLog.count({
        where: {
          action: {
            in: ['DELETE', 'UPDATE_SENSITIVE', 'LOGIN_FAILED', 'PERMISSION_DENIED', 'SECURITY_VIOLATION']
          }
        }
      })
    ])

    return NextResponse.json({
      totalLogs,
      todayLogs,
      thisWeekLogs,
      thisMonthLogs,
      thisHourLogs,
      systemLogs,
      userLogs,
      criticalActions
    })
  } catch (error) {
    console.error('Error fetching audit log metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
