import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authPayload = await requireAuth(request)
    if (!authPayload.role || authPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current date ranges for comparisons
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    // Parallel database queries for dashboard stats
    const [
      totalUsers,
      activeUsersCount,
      totalPackages,
      totalTrips,
      revenueData,
      pendingVerifications,
      activeDisputes,
      successfulDeliveries,
      totalDeliveries,
      newUsersToday,
      packagesInTransit,
      completedDeliveries,
      lastMonthUsers,
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),

      // Active users (users with activity in last 30 days)
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Total packages count
      prisma.package.count(),

      // Total trips count
      prisma.trip.count(),

      // Revenue calculation from completed transactions
      prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: 'COMPLETED',
        },
      }),

      // Pending verifications (packages with POSTED status)
      prisma.package.count({
        where: {
          status: 'POSTED',
        },
      }),

      // Active disputes
      prisma.dispute.count({
        where: {
          status: 'OPEN',
        },
      }),

      // Successful deliveries (completed packages)
      prisma.package.count({
        where: {
          status: 'DELIVERED',
        },
      }),

      // Total deliveries for success rate calculation
      prisma.package.count({
        where: {
          status: {
            in: ['DELIVERED', 'CANCELLED', 'DISPUTED'],
          },
        },
      }),

      // New users today
      prisma.user.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),

      // Packages in transit
      prisma.package.count({
        where: {
          status: 'IN_TRANSIT',
        },
      }),

      // Completed deliveries (same as successful)
      prisma.package.count({
        where: {
          status: 'DELIVERED',
        },
      }),

      // Users count from last month for growth rate
      prisma.user.count({
        where: {
          createdAt: {
            lt: lastMonth,
          },
        },
      }),
    ])

    // Calculate derived metrics
    const totalRevenue = revenueData._sum.amount || 0
    const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0
    const userGrowthRate = lastMonthUsers > 0 ? ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0

    // Additional analytics data
    const [
      recentTransactions,
      topTravelers,
      packagesByStatus,
      tripsByStatus,
      revenueByMonth,
    ] = await Promise.all([
      // Recent transactions for activity feed
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { 
              firstName: true, 
              lastName: true, 
              email: true 
            },
          },
        },
      }),

      // Top travelers by completed trips
      prisma.user.findMany({
        where: { role: 'TRAVELER' },
        include: {
          _count: {
            select: {
              trips: {
                where: { status: 'COMPLETED' },
              },
            },
          },
        },
        orderBy: {
          trips: {
            _count: 'desc',
          },
        },
        take: 5,
      }),

      // Package distribution by status
      prisma.package.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),

      // Trip distribution by status
      prisma.trip.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),

      // Revenue by month (last 6 months)
      prisma.transaction.groupBy({
        by: ['createdAt'],
        _sum: {
          amount: true,
        },
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ])

    // Prepare response data
    const dashboardStats = {
      totalUsers,
      activeUsers: activeUsersCount,
      totalPackages,
      totalTrips,
      totalRevenue: Number(totalRevenue),
      pendingVerifications,
      activeDisputes,
      successRate: Number(successRate.toFixed(1)),
      newUsersToday,
      packagesInTransit,
      completedDeliveries,
      userGrowthRate: Number(userGrowthRate.toFixed(1)),
      recentTransactions: recentTransactions.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        status: tx.status,
        createdAt: tx.createdAt,
        user: {
          name: `${tx.user.firstName} ${tx.user.lastName}`,
          email: tx.user.email,
        },
      })),
      topTravelers: topTravelers.map(traveler => ({
        id: traveler.id,
        name: `${traveler.firstName} ${traveler.lastName}`,
        email: traveler.email,
        completedTrips: traveler._count.trips,
      })),
      packagesByStatus: packagesByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<string, number>),
      tripsByStatus: tripsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<string, number>),
      revenueByMonth: revenueByMonth.map(item => ({
        month: item.createdAt.toISOString().slice(0, 7), // YYYY-MM format
        revenue: Number(item._sum.amount || 0),
      })),
    }

    return NextResponse.json(dashboardStats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
