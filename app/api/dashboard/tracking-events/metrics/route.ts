import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [
      totalEvents,
      todayEvents,
      pickupEvents,
      deliveryEvents,
      transitEvents,
      exceptionEvents
    ] = await Promise.all([
      // Total events count
      prisma.trackingEvent.count(),
      
      // Today's events count
      prisma.trackingEvent.count({
        where: {
          timestamp: {
            gte: todayStart
          }
        }
      }),
      
      // Pickup events count
      prisma.trackingEvent.count({
        where: {
          event: { in: ['picked_up', 'pickup'] }
        }
      }),
      
      // Delivery events count
      prisma.trackingEvent.count({
        where: {
          event: { in: ['delivered', 'delivery'] }
        }
      }),
      
      // In transit events count
      prisma.trackingEvent.count({
        where: {
          event: { in: ['in_transit', 'transit'] }
        }
      }),
      
      // Exception events count
      prisma.trackingEvent.count({
        where: {
          event: { in: ['exception', 'error'] }
        }
      })
    ])

    const metrics = {
      totalEvents,
      todayEvents,
      pickupEvents,
      deliveryEvents,
      transitEvents,
      exceptionEvents
    }

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Tracking events metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracking event metrics' },
      { status: 500 }
    )
  }
}
