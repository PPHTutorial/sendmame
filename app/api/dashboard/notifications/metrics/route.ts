import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const [
      totalNotifications,
      todayNotifications,
      unreadNotifications,
      totalReadNotifications
    ] = await Promise.all([
      // Total notifications
      prisma.notification.count(),
      
      // Today's notifications
      prisma.notification.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Unread notifications
      prisma.notification.count({
        where: { isRead: false }
      }),
      
      // Read notifications for rate calculation
      prisma.notification.count({
        where: { isRead: true }
      })
    ])

    // Calculate read rate
    const readRate = totalNotifications > 0 
      ? Math.round((totalReadNotifications / totalNotifications) * 100)
      : 0

    return NextResponse.json({
      totalNotifications,
      todayNotifications,
      readRate,
      unreadNotifications
    })
  } catch (error) {
    console.error('Error fetching notifications metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
