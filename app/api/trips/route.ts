// Fakomame Platform - Trips API Route
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { 
  createSuccessResponse, 
  withErrorHandling,
  parseRequestBody,
  parseSearchParams,
  calculatePagination,
  buildWhereClause
} from '@/lib/api/utils'
import { requireAuth } from '@/lib/auth'
import { createTripSchema, tripSearchSchema } from '@/lib/validations'
import type { CreateTripInput } from '@/lib/validations'

// GET /api/trips - List trips with search and pagination
export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = parseSearchParams(request, tripSearchSchema)
  
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = searchParams
  const { skip, ...pagination } = calculatePagination(page, limit, 0)
  
  // Build where clause
  const where = buildWhereClause(filters, 'trip')
  
  // Add status filter to only show active trips
  where.status = {
    in: ['POSTED', 'ACTIVE', 'COMPLETED', 'CANCELLED',]
  }
  
  // Get total count
  const total = await prisma.trip.count({ where })
  
  // Get trips
  const trips = await prisma.trip.findMany({
    where,
    skip,
    //take: limit,
    orderBy: { [sortBy]: sortOrder },
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
      },
      packages: {
        select: {
          id: true,
          title: true,
          status: true,
          dimensions: true,
        }
      },
      _count: {
        select: {
          packages: true,
          chats: true,
        }
      }
    }
  })
  
  return createSuccessResponse(trips, undefined, {
    ...pagination,
    total,
    totalPages: Math.ceil(total / limit),
  })
})

// POST /api/trips - Create a new trip
export const POST = withErrorHandling(async (request: NextRequest) => {
  const userPayload = await requireAuth(request)
  const data = await parseRequestBody(request, createTripSchema)
  
  // Create trip
  const tripData = await prisma.trip.create({
    data: {
      ...data,
      title: `${data.originAddress.city} to ${data.destinationAddress.city}`,
      travelerId: userPayload.userId,
      originLatitude: data.originAddress.latitude,
      originLongitude: data.originAddress.longitude,
      destinationLatitude: data.destinationAddress.latitude,
      destinationLongitude: data.destinationAddress.longitude,
      availableSpace: data.maxWeight, // Initially all space is available
      status: 'POSTED',
      transportMode: data.transportMode as string,
    },
    include: {
      traveler: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        }
      }
    }
  })
  
  // TODO: Send notifications to potential senders with matching packages
  // TODO: Create audit log entry
  
  return createSuccessResponse(tripData, 'Trip created successfully')
})
