import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        {
          user: {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                lastName: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            ]
          }
        },
        {
          packageId: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          tripId: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    if (type) {
      where.confirmationType = type
    }

    // Get safety confirmations with pagination
    const [confirmations, total] = await Promise.all([
      prisma.safetyConfirmation.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          confirmedAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.safetyConfirmation.count({ where })
    ])

    // Filter by status if provided (calculated from confirmations)
    let filteredConfirmations = confirmations
    if (status) {
      filteredConfirmations = confirmations.filter(confirmation => {
        const confirmationData = confirmation.confirmations as Record<string, any>
        const requiredItems = [
          'identity_verified',
          'package_condition_ok',
          'location_confirmed',
          'photo_taken'
        ]
        
        const completedItems = requiredItems.filter(item => confirmationData[item] === true)
        const completionRate = (completedItems.length / requiredItems.length) * 100
        
        if (status === 'complete') return completionRate === 100
        if (status === 'partial') return completionRate >= 50 && completionRate < 100
        if (status === 'incomplete') return completionRate < 50
        return true
      })
    }

    // Transform confirmations to include package/trip data if available
    const transformedConfirmations = await Promise.all(
      filteredConfirmations.map(async (confirmation) => {
        let packageData = null
        let tripData = null

        // Fetch package data if packageId exists
        if (confirmation.packageId) {
          try {
            packageData = await prisma.package.findUnique({
              where: { id: confirmation.packageId },
              select: {
                id: true,
                title: true,
                status: true
              }
            })
          } catch (_error) {
            console.log('Package not found:', confirmation.packageId)
          }
        }

        // Fetch trip data if tripId exists
        if (confirmation.tripId) {
          try {
            tripData = await prisma.trip.findUnique({
              where: { id: confirmation.tripId },
              select: {
                id: true,
                status: true
              }
            })
          } catch (_error) {
            console.log('Trip not found:', confirmation.tripId)
          }
        }

        return {
          ...confirmation,
          package: packageData,
          trip: tripData,
          confirmedAt: confirmation.confirmedAt.toISOString()
        }
      })
    )

    return NextResponse.json({
      confirmations: transformedConfirmations,
      pagination: {
        page,
        pageSize,
        total: status ? filteredConfirmations.length : total,
        totalPages: Math.ceil((status ? filteredConfirmations.length : total) / pageSize)
      }
    })
  } catch (error) {
    console.error('Error fetching safety confirmations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch safety confirmations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const confirmation = await prisma.safetyConfirmation.create({
      data: {
        packageId: data.packageId,
        tripId: data.tripId,
        userId: data.userId,
        confirmationType: data.confirmationType,
        confirmations: data.confirmations || {},
        notes: data.notes
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(confirmation, { status: 201 })
  } catch (error) {
    console.error('Error creating safety confirmation:', error)
    return NextResponse.json(
      { error: 'Failed to create safety confirmation' },
      { status: 500 }
    )
  }
}
