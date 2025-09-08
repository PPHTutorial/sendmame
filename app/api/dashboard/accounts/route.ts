import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search')
    const provider = searchParams.get('provider')
    const dateRange = searchParams.get('dateRange')

    const skip = (page - 1) * pageSize

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        { provider: { contains: search, mode: 'insensitive' } },
        { providerAccountId: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (provider) {
      where.provider = provider
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

      where.user = {
        ...where.user,
        createdAt: {
          gte: startDate
        }
      }
    }

    // Get accounts with user data and pagination
    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          user: {
            createdAt: 'desc'
          }
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              isEmailVerified: true,
              isPhoneVerified: true,
              verificationStatus: true,
              lastLoginAt: true,
              createdAt: true,
              profile: {
                select: {
                  profilePicture: true,
                  senderRating: true,
                  travelerRating: true,
                  totalTrips: true,
                  totalDeliveries: true
                }
              }
            }
          }
        }
      }),
      prisma.account.count({ where })
    ])

    return NextResponse.json({
      accounts,
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
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}
