// Fakomame Platform - Packages API Route
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  createSuccessResponse,
  withErrorHandling,
  parseRequestBody,
  parseSearchParams,
  calculatePagination,
  buildWhereClause,
  ApiError
} from '@/lib/api/utils'
import { requireAuth } from '@/lib/auth'
import { createPackageSchema, packageSearchSchema } from '@/lib/validations'
import type { CreatePackageInput, PackageSearchInput } from '@/lib/validations'

// GET /api/packages - List packages with search and pagination
export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = parseSearchParams(request, packageSearchSchema)

  const { page, limit, sortBy, sortOrder, ...filters } = searchParams
  const { skip, ...pagination } = calculatePagination(page, limit, 0)

  // Build where clause
  const where = buildWhereClause(filters, 'package')

  console.log('Package filters:', filters)

  // Add status filter to only show active packages
  where.status = {
    in: ['POSTED', 'MATCHED', 'IN_TRANSIT']
  }

  

  
  // Get total count
  const total = await prisma.package.count({ where })

  // Get packages
  const packages = await prisma.package.findMany({
    where,
    skip,
    //take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          phone: true,
          profile: {
            select: {
              senderRating: true,
              totalDeliveries: true,
            }
          }
        }
      },
      trip: {
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
      },
      _count: {
        select: {
          chats: true,
        }
      }
    }
  })
  //console.log('Fetched packages:', packages)
  return createSuccessResponse(packages, undefined, {
    ...pagination,
    total,
    totalPages: Math.ceil(total / limit),
  })
})

// POST /api/packages - Create a new package
export const POST = withErrorHandling(async (request: NextRequest) => {
  const userPayload = await requireAuth(request)
  const data = await parseRequestBody(request, createPackageSchema)


  // Create package
  const packageData = await prisma.package.create({
    data: {
      ...data,
      senderId: userPayload.userId,
      pickupDate: new Date(data.pickupDate).toISOString(),
      deliveryDate: new Date(data.deliveryDate).toISOString(),
      pickupLatitude: data.pickupAddress.latitude,
      pickupLongitude: data.pickupAddress.longitude,
      deliveryLatitude: data.deliveryAddress.latitude,
      deliveryLongitude: data.deliveryAddress.longitude,
      status: 'POSTED',
    },
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
  })

  // TODO: Send notifications to potential travelers
  // TODO: Create audit log entry

  return createSuccessResponse(packageData, 'Package created successfully')
})
