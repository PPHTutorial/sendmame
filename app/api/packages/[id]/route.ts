// Amenade Platform - Individual Package API Route
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { 
  createSuccessResponse, 
  withErrorHandling,
  parseRequestBody,
  ApiError
} from '@/lib/api/utils'
import { requireAuth } from '@/lib/auth'
import { updatePackageSchema } from '@/lib/validations'
import type { UpdatePackageInput } from '@/lib/validations'

// GET /api/packages/[id] - Get package details
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const packageData = await prisma.package.findUnique({
    where: { id },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          profile: {
            select: {
              senderRating: true,
              totalDeliveries: true,
            }
          }
        }
      },
      receiver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
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
              profile: {
                select: {
                  travelerRating: true,
                  totalTrips: true,
                }
              }
            }
          }
        }
      },
      trackingEvents: {
        orderBy: { timestamp: 'desc' }
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
      }
    }
  })
  
  if (!packageData) {
    throw new ApiError('Package not found', 404)
  }
  
  return createSuccessResponse(packageData)
})

// PUT /api/packages/[id] - Update package
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const userPayload = await requireAuth(request)
  const data = await parseRequestBody<UpdatePackageInput>(request, updatePackageSchema)
  
  // Check if package exists and user has permission
  const existingPackage = await prisma.package.findUnique({
    where: { id },
    select: { senderId: true, status: true }
  })
  
  if (!existingPackage) {
    throw new ApiError('Package not found', 404)
  }
  
  if (existingPackage.senderId !== userPayload.userId) {
    throw new ApiError('Not authorized to update this package', 403)
  }
  
  // Prevent updates if package is in transit or delivered
  if (['IN_TRANSIT', 'DELIVERED'].includes(existingPackage.status)) {
    throw new ApiError('Cannot update package that is in transit or delivered', 400)
  }
  
  // Update package
  const updatedPackage = await prisma.package.update({
    where: { id },
    data: {
      ...data,
      ...(data.pickupAddress && {
        pickupLatitude: data.pickupAddress.latitude,
        pickupLongitude: data.pickupAddress.longitude,
      }),
      ...(data.deliveryAddress && {
        deliveryLatitude: data.deliveryAddress.latitude,
        deliveryLongitude: data.deliveryAddress.longitude,
      }),
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
  
  return createSuccessResponse(updatedPackage, 'Package updated successfully')
})

// DELETE /api/packages/[id] - Delete package
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const userPayload = await requireAuth(request)
  
  // Check if package exists and user has permission
  const existingPackage = await prisma.package.findUnique({
    where: { id },
    select: { senderId: true, status: true }
  })
  
  if (!existingPackage) {
    throw new ApiError('Package not found', 404)
  }
  
  if (existingPackage.senderId !== userPayload.userId) {
    throw new ApiError('Not authorized to delete this package', 403)
  }
  
  // Prevent deletion if package is matched or in transit
  if (['MATCHED', 'IN_TRANSIT', 'DELIVERED'].includes(existingPackage.status)) {
    throw new ApiError('Cannot delete package that is matched, in transit, or delivered', 400)
  }
  
  // Delete package
  await prisma.package.delete({
    where: { id }
  })
  
  return createSuccessResponse(null, 'Package deleted successfully')
})
