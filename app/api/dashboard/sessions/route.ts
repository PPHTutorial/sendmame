import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const dateRange = searchParams.get('dateRange')

    const skip = (page - 1) * pageSize

    // Build where clause
    const where: any = {}

    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    if (status) {
      const now = new Date()
      if (status === 'active') {
        where.expires = { gt: now }
      } else if (status === 'expired') {
        where.expires = { lte: now }
      }
    }

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
          const quarter = Math.floor(now.getMonth() / 3)
          startDate = new Date(now.getFullYear(), quarter * 3, 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(0)
      }

      // Since sessions don't have createdAt, we'll filter by when they expire backwards
      where.expires = {
        ...where.expires,
        gte: startDate
      }
    }

    // Get sessions with user data and pagination
    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          expires: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              lastLoginAt: true,
              createdAt: true,
              verificationStatus: true,
              profile: {
                select: {
                  profilePicture: true,
                  currentCity: true,
                  currentCountry: true
                }
              }
            }
          }
        }
      }),
      prisma.session.count({ where })
    ])

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page < Math.ceil(total / pageSize),
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    await prisma.session.delete({
      where: { id: sessionId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}
