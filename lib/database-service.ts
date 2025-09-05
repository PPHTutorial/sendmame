import prisma from './prisma'
import { 
  UserRole, 
  PackageStatus, 
  TripStatus, 
  TransactionType, 
  PaymentStatus, 
  VerificationStatus,
  DisputeStatus,
  NotificationType 
} from '@prisma/client'

export interface DashboardMetrics {
  users: {
    total: number
    active: number
    verified: number
    newThisMonth: number
    growth: number
  }
  packages: {
    total: number
    active: number
    delivered: number
    revenue: number
    growth: number
  }
  trips: {
    total: number
    active: number
    completed: number
    utilization: number
  }
  transactions: {
    totalVolume: number
    totalValue: number
    pendingAmount: number
    growth: number
  }
  disputes: {
    total: number
    open: number
    resolved: number
    resolutionRate: number
  }
}

export interface UserMetrics {
  totalUsers: number
  activeUsers: number
  verifiedUsers: number
  roleDistribution: { role: UserRole; count: number }[]
  growthData: { date: string; count: number }[]
  topCountries: { country: string; count: number }[]
}

export interface PackageMetrics {
  totalPackages: number
  statusDistribution: { status: PackageStatus; count: number }[]
  revenueData: { date: string; revenue: number }[]
  categoryDistribution: { category: string; count: number }[]
  averageValue: number
  topRoutes: { route: string; count: number }[]
}

export interface TransactionMetrics {
  totalTransactions: number
  totalVolume: number
  typeDistribution: { type: TransactionType; count: number; volume: number }[]
  statusDistribution: { status: PaymentStatus; count: number }[]
  dailyVolume: { date: string; volume: number; count: number }[]
  averageTransactionValue: number
}

export class DatabaseService {
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Users metrics
    const [totalUsers, activeUsers, verifiedUsers, newUsersThisMonth, newUsersLastMonth] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ 
        where: { 
          createdAt: { 
            gte: startOfLastMonth, 
            lt: endOfLastMonth 
          } 
        } 
      })
    ])

    const userGrowth = newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 0

    // Packages metrics
    const [totalPackages, activePackages, deliveredPackages, packageRevenue] = await Promise.all([
      prisma.package.count(),
      prisma.package.count({ 
        where: { 
          status: { 
            in: [PackageStatus.POSTED, PackageStatus.MATCHED, PackageStatus.IN_TRANSIT] 
          } 
        } 
      }),
      prisma.package.count({ where: { status: PackageStatus.DELIVERED } }),
      prisma.transaction.aggregate({
        where: { type: TransactionType.PAYMENT, status: PaymentStatus.COMPLETED },
        _sum: { amount: true }
      })
    ])

    // Trips metrics
    const [totalTrips, activeTrips, completedTrips] = await Promise.all([
      prisma.trip.count(),
      prisma.trip.count({ where: { status: TripStatus.ACTIVE } }),
      prisma.trip.count({ where: { status: TripStatus.COMPLETED } })
    ])

    // Transactions metrics
    const [transactionStats, pendingTransactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _count: { id: true },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { status: PaymentStatus.PENDING },
        _sum: { amount: true }
      })
    ])

    // Disputes metrics
    const [totalDisputes, openDisputes, resolvedDisputes] = await Promise.all([
      prisma.dispute.count(),
      prisma.dispute.count({ where: { status: DisputeStatus.OPEN } }),
      prisma.dispute.count({ where: { status: DisputeStatus.RESOLVED } })
    ])

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
        newThisMonth: newUsersThisMonth,
        growth: userGrowth
      },
      packages: {
        total: totalPackages,
        active: activePackages,
        delivered: deliveredPackages,
        revenue: packageRevenue._sum.amount || 0,
        growth: 0 // Calculate based on monthly comparison
      },
      trips: {
        total: totalTrips,
        active: activeTrips,
        completed: completedTrips,
        utilization: totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0
      },
      transactions: {
        totalVolume: transactionStats._count.id,
        totalValue: transactionStats._sum.amount || 0,
        pendingAmount: pendingTransactions._sum.amount || 0,
        growth: 0 // Calculate based on monthly comparison
      },
      disputes: {
        total: totalDisputes,
        open: openDisputes,
        resolved: resolvedDisputes,
        resolutionRate: totalDisputes > 0 ? (resolvedDisputes / totalDisputes) * 100 : 0
      }
    }
  }

  static async getUserMetrics(): Promise<UserMetrics> {
    const [totalUsers, activeUsers, verifiedUsers, roleDistribution, growthData, topCountries] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isVerified: true } }),
      
      // Role distribution
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      }),

      // Growth data (last 30 days) - simplified version
      prisma.user.findMany({
        where: { 
          createdAt: { 
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          } 
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' }
      }),

      // Top countries
      prisma.userProfile.groupBy({
        by: ['currentCountry'],
        _count: { id: true },
        where: { currentCountry: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    ])

    // Process growth data
    const growthMap = new Map<string, number>()
    growthData.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0]
      growthMap.set(date, (growthMap.get(date) || 0) + 1)
    })

    const sortedGrowthData = Array.from(growthMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      roleDistribution: roleDistribution.map(item => ({
        role: item.role,
        count: item._count.id
      })),
      growthData: sortedGrowthData,
      topCountries: topCountries.map(item => ({
        country: item.currentCountry || 'Unknown',
        count: item._count.id
      }))
    }
  }

  static async getPackageMetrics(): Promise<PackageMetrics> {
    const [
      totalPackages,
      statusDistribution,
      revenueTransactions,
      categoryDistribution,
      averageValue,
      packageRoutes
    ] = await Promise.all([
      prisma.package.count(),
      
      // Status distribution
      prisma.package.groupBy({
        by: ['status'],
        _count: { id: true }
      }),

      // Revenue data (last 30 days)
      prisma.transaction.findMany({
        where: { 
          type: TransactionType.PAYMENT, 
          status: PaymentStatus.COMPLETED,
          createdAt: { 
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          }
        },
        select: { amount: true, createdAt: true }
      }),

      // Category distribution
      prisma.package.groupBy({
        by: ['category'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),

      // Average package value
      prisma.package.aggregate({
        _avg: { value: true },
        where: { value: { not: null } }
      }),

      // Get packages for route analysis
      prisma.package.findMany({
        select: {
          pickupAddress: true,
          deliveryAddress: true
        },
        take: 1000 // Limit for performance
      })
    ])

    // Process revenue data
    const revenueMap = new Map<string, number>()
    revenueTransactions.forEach(txn => {
      const date = txn.createdAt.toISOString().split('T')[0]
      revenueMap.set(date, (revenueMap.get(date) || 0) + txn.amount)
    })

    const revenueData = Array.from(revenueMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Process route data
    const routeMap = new Map<string, number>()
    packageRoutes.forEach(pkg => {
      try {
        const pickup = pkg.pickupAddress as any
        const delivery = pkg.deliveryAddress as any
        if (pickup?.city && delivery?.city) {
          const route = `${pickup.city} → ${delivery.city}`
          routeMap.set(route, (routeMap.get(route) || 0) + 1)
        }
      } catch (e) {
        // Handle JSON parsing errors
      }
    })

    const topRoutes = Array.from(routeMap.entries())
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalPackages,
      statusDistribution: statusDistribution.map(item => ({
        status: item.status,
        count: item._count.id
      })),
      revenueData,
      categoryDistribution: categoryDistribution.map(item => ({
        category: item.category,
        count: item._count.id
      })),
      averageValue: averageValue._avg.value || 0,
      topRoutes
    }
  }

  static async getTransactionMetrics(): Promise<TransactionMetrics> {
    const [
      totalStats,
      typeDistribution,
      statusDistribution,
      recentTransactions,
      averageValue
    ] = await Promise.all([
      prisma.transaction.aggregate({
        _count: { id: true },
        _sum: { amount: true }
      }),

      // Type distribution with volume
      prisma.transaction.groupBy({
        by: ['type'],
        _count: { id: true },
        _sum: { amount: true }
      }),

      // Status distribution
      prisma.transaction.groupBy({
        by: ['status'],
        _count: { id: true }
      }),

      // Daily volume (last 30 days)
      prisma.transaction.findMany({
        where: { 
          createdAt: { 
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          } 
        },
        select: { amount: true, createdAt: true }
      }),

      // Average transaction value
      prisma.transaction.aggregate({
        _avg: { amount: true }
      })
    ])

    // Process daily volume data
    const volumeMap = new Map<string, { volume: number; count: number }>()
    recentTransactions.forEach(txn => {
      const date = txn.createdAt.toISOString().split('T')[0]
      const existing = volumeMap.get(date) || { volume: 0, count: 0 }
      volumeMap.set(date, {
        volume: existing.volume + txn.amount,
        count: existing.count + 1
      })
    })

    const dailyVolume = Array.from(volumeMap.entries())
      .map(([date, data]) => ({ date, volume: data.volume, count: data.count }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return {
      totalTransactions: totalStats._count.id,
      totalVolume: totalStats._sum.amount || 0,
      typeDistribution: typeDistribution.map(item => ({
        type: item.type,
        count: item._count.id,
        volume: item._sum.amount || 0
      })),
      statusDistribution: statusDistribution.map(item => ({
        status: item.status,
        count: item._count.id
      })),
      dailyVolume,
      averageTransactionValue: averageValue._avg.amount || 0
    }
  }

  static async getRecentActivity(limit: number = 10) {
    const [recentUsers, recentPackages, recentTrips, recentTransactions] = await Promise.all([
      prisma.user.findMany({
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          role: true
        }
      }),
      
      prisma.package.findMany({
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          offeredPrice: true,
          currency: true,
          createdAt: true,
          sender: {
            select: { firstName: true, lastName: true }
          }
        }
      }),

      prisma.trip.findMany({
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          departureDate: true,
          createdAt: true,
          traveler: {
            select: { firstName: true, lastName: true }
          }
        }
      }),

      prisma.transaction.findMany({
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
          user: {
            select: { firstName: true, lastName: true }
          }
        }
      })
    ])

    // Combine and sort all activities
    const activities = [
      ...recentUsers.map(user => ({
        id: user.id,
        type: 'user' as const,
        title: `New ${user.role.toLowerCase()} registered`,
        subtitle: `${user.firstName} ${user.lastName}`,
        timestamp: user.createdAt,
        data: user
      })),
      ...recentPackages.map(pkg => ({
        id: pkg.id,
        type: 'package' as const,
        title: pkg.title,
        subtitle: `${pkg.sender.firstName} ${pkg.sender.lastName} • ${pkg.status}`,
        timestamp: pkg.createdAt,
        data: pkg
      })),
      ...recentTrips.map(trip => ({
        id: trip.id,
        type: 'trip' as const,
        title: trip.title,
        subtitle: `${trip.traveler.firstName} ${trip.traveler.lastName} • ${trip.status}`,
        timestamp: trip.createdAt,
        data: trip
      })),
      ...recentTransactions.map(txn => ({
        id: txn.id,
        type: 'transaction' as const,
        title: `${txn.type} - ${txn.currency} ${txn.amount}`,
        subtitle: `${txn.user.firstName} ${txn.user.lastName} • ${txn.status}`,
        timestamp: txn.createdAt,
        data: txn
      }))
    ]

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit)
  }
}

export default DatabaseService
