import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get trip metrics
    const [
      totalTrips,
      activeTrips,
      completedTrips,
      averageRatingData
    ] = await Promise.all([
      prisma.trip.count(),
      prisma.trip.count({ where: { status: { in: ['POSTED', 'ACTIVE'] } } }),
      prisma.trip.count({ where: { status: 'COMPLETED' } }),
      prisma.userProfile.aggregate({
        _avg: {
          travelerRating: true
        },
        where: {
          travelerRating: {
            gt: 0
          }
        }
      })
    ])

    return NextResponse.json({
      totalTrips,
      activeTrips,
      completedTrips,
      averageRating: averageRatingData._avg.travelerRating || 0
    })
  } catch (error) {
    console.error('Error fetching trip metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
