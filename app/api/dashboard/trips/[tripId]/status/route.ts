import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const { tripId } = params
    const { status } = await request.json()

    // Find the trip
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    })

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    // Validate status
    const validStatuses = ['POSTED', 'ACTIVE', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update trip status
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        status,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      trip: updatedTrip,
      message: `Trip status updated to ${status.toLowerCase()}`
    })
  } catch (error) {
    console.error('Error updating trip status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
