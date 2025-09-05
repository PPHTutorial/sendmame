import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const country = searchParams.get('country') || ''

    const skip = (page - 1) * pageSize

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role) {
      where.role = role
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    } else if (status === 'verified') {
      where.isVerified = true
    } else if (status === 'unverified') {
      where.isVerified = false
    }

    if (country) {
      where.profile = {
        currentCountry: country
      }
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: {
            select: {
              currentCountry: true,
              currentCity: true,
              senderRating: true,
              travelerRating: true,
              totalTrips: true,
              totalDeliveries: true
            }
          },
          _count: {
            select: {
              sentPackages: true,
              receivedPackages: true,
              trips: true,
              transactions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        verificationStatus: user.verificationStatus,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        profile: user.profile,
        stats: {
          packagessent: user._count.sentPackages,
          packagesReceived: user._count.receivedPackages,
          trips: user._count.trips,
          transactions: user._count.transactions
        }
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('Users list API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
