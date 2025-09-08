import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const transport = searchParams.get('transport') || ''

    const skip = (page - 1) * pageSize

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { 
          traveler: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        {
          originAddress: {
            path: ['city'],
            string_contains: search
          }
        },
        {
          destinationAddress: {
            path: ['city'],
            string_contains: search
          }
        }
      ]
    }

    if (status) {
      where.status = status
    }

    if (transport) {
      where.transportMode = transport
    }

    // Get trips with pagination
    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.trip.count({ where })
    ])

    return NextResponse.json({
      trips,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
