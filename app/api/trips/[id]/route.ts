// Fakomame Platform - Individual Trip API Route
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { 
  createSuccessResponse, 
  withErrorHandling,
  parseRequestBody,
  ApiError
} from '@/lib/api/utils'
import { requireAuth } from '@/lib/auth'
import { updateTripSchema } from '@/lib/validations'
import type { UpdateTripInput } from '@/lib/validations'

// GET /api/trips/[id] - Get trip details
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const tripData = await prisma.trip.findUnique({
    where: { id },
    include: {
      traveler: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          createdAt: true,
          profile: {
            select: {
              travelerRating: true,
              totalTrips: true,
            }
          }
        }
      },
      packages: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          }
        }
      },
      chats: {
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                }
              }
            }
          }
        }
      },
      _count: {
        select: {
          packages: true,
          chats: true
        }
      }
    }
  })
  
  if (!tripData) {
    throw new ApiError('Trip not found', 404)
  }
  
  return createSuccessResponse(tripData)
})

// PUT /api/trips/[id] - Update trip
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const userPayload = await requireAuth(request)
  const data = await parseRequestBody<UpdateTripInput>(request, updateTripSchema)
  
  // Check if trip exists and user has permission
  const existingTrip = await prisma.trip.findUnique({
    where: { id },
    select: { travelerId: true, status: true }
  })
  
  if (!existingTrip) {
    throw new ApiError('Trip not found', 404)
  }
  
  if (existingTrip.travelerId !== userPayload.userId) {
    throw new ApiError('Not authorized to update this trip', 403)
  }
  
  // Prevent updates if trip is in transit or completed
  if (['IN_TRANSIT', 'COMPLETED'].includes(existingTrip.status)) {
    throw new ApiError('Cannot update trip that is in transit or completed', 400)
  }
  
  // Update trip
  const updatedTrip = await prisma.trip.update({
    where: { id },
    data: {
      ...data,
      ...(data.originAddress && {
        originLatitude: data.originAddress.latitude,
        originLongitude: data.originAddress.longitude,
      }),
      ...(data.destinationAddress && {
        destinationLatitude: data.destinationAddress.latitude,
        destinationLongitude: data.destinationAddress.longitude,
      }),
    },
    include: {
      traveler: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        }
      },
      _count: {
        select: {
          packages: true,
          chats: true
        }
      }
    }
  })
  
  return createSuccessResponse(updatedTrip, 'Trip updated successfully')
})

// DELETE /api/trips/[id] - Delete trip
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const userPayload = await requireAuth(request)
  
  // Check if trip exists and user has permission
  const existingTrip = await prisma.trip.findUnique({
    where: { id },
    select: { 
      travelerId: true, 
      status: true,
      _count: {
        select: {
          packages: true
        }
      }
    }
  })
  
  if (!existingTrip) {
    throw new ApiError('Trip not found', 404)
  }
  
  if (existingTrip.travelerId !== userPayload.userId) {
    throw new ApiError('Not authorized to delete this trip', 403)
  }
  
  // Prevent deletion if trip has packages or is active/completed
  if (existingTrip._count.packages > 0) {
    throw new ApiError('Cannot delete trip that has packages booked', 400)
  }
  
  if (['ACTIVE', 'IN_TRANSIT', 'COMPLETED'].includes(existingTrip.status)) {
    throw new ApiError('Cannot delete trip that is active, in transit, or completed', 400)
  }
  
  // Delete trip
  await prisma.trip.delete({
    where: { id }
  })
  
  return createSuccessResponse(null, 'Trip deleted successfully')
})
