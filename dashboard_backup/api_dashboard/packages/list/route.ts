import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''
    const urgency = searchParams.get('urgency') || ''

    const skip = (page - 1) * pageSize

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sender: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ]
    }

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    if (urgency) {
      where.urgencyLevel = urgency
    }

    // Get packages with pagination
    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          trip: {
            include: {
              traveler: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.package.count({ where })
    ])

    const totalPages = Math.ceil(total / pageSize)

    // Add stats and format data for each package
    const packagesWithStats = await Promise.all(packages.map(async (pkg) => ({
      ...pkg,
      // Map database fields to interface
      weight: pkg.dimensions ? (pkg.dimensions as any)?.weight || 0 : 0,
      estimatedValue: pkg.value || 0,
      urgencyLevel: pkg.priority?.toUpperCase() || 'NORMAL',
      pickupLocation: pkg.pickupAddress ? (pkg.pickupAddress as any)?.city || 'Unknown' : 'Unknown',
      deliveryLocation: pkg.deliveryAddress ? (pkg.deliveryAddress as any)?.city || 'Unknown' : 'Unknown',
      traveler: pkg.trip?.traveler || null,
      stats: {
        packagessent: await prisma.package.count({ where: { senderId: pkg.senderId } }),
        packagesReceived: 0, // Packages received would be as receiver
        trips: pkg.trip ? await prisma.trip.count({ where: { travelerId: pkg.trip.travelerId } }) : 0,
        transactions: await prisma.transaction.count({ 
          where: { userId: pkg.senderId }
        })
      }
    })))

    return NextResponse.json({
      packages: packagesWithStats,
      pagination: {
        page,
        pageSize,
        total,
        totalPages
      }
    })

  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}
