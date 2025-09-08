import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const { tripId } = params

    // Find the trip
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        packages: true,
        chats: true
      }
    })

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    // Delete trip and related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete related chats and messages
      for (const chat of trip.chats) {
        await tx.message.deleteMany({
          where: { chatId: chat.id }
        })
        await tx.chatParticipant.deleteMany({
          where: { chatId: chat.id }
        })
        await tx.chat.delete({
          where: { id: chat.id }
        })
      }

      // Update packages to remove trip association
      await tx.package.updateMany({
        where: { tripId: tripId },
        data: {
          tripId: null,
          status: 'POSTED' // Reset to posted status
        }
      })

      // Finally delete the trip
      await tx.trip.delete({
        where: { id: tripId }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Trip and related data deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting trip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { tripId: string } }
) {
  try {
    const { tripId } = params
    const updateData = await request.json()

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

    // Update trip
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        traveler: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            profile: {
              select: {
                travelerRating: true,
                totalTrips: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      trip: updatedTrip,
      message: 'Trip updated successfully'
    })
  } catch (error) {
    console.error('Error updating trip:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
