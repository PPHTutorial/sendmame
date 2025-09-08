import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search')
    const event = searchParams.get('event')
    const dateRange = searchParams.get('dateRange')

    // Build where clause
    const where: any = {}

    // Search filter
    if (search) {
      where.OR = [
        { packageId: { contains: search, mode: 'insensitive' } },
        { event: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { package: { 
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { sender: { 
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
              ]
            }},
            { receiver: { 
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
              ]
            }}
          ]
        }}
      ]
    }

    // Event filter
    if (event) {
      where.event = event
    }

    // Date range filter
    if (dateRange) {
      const now = new Date()
      let startDate: Date

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'quarter':
          const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
          startDate = new Date(now.getFullYear(), quarterStartMonth, 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(0)
      }

      where.timestamp = {
        gte: startDate
      }
    }

    const [trackingEvents, total] = await Promise.all([
      prisma.trackingEvent.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { timestamp: 'desc' },
        include: {
          package: {
            select: {
              id: true,
              title: true,
              status: true,
              sender: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              },
              receiver: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma.trackingEvent.count({ where })
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      trackingEvents,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching tracking events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracking events' },
      { status: 500 }
    )
  }
}
