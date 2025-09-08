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
    pending: number
    admins: number
    senders: number
    travelers: number
    roleBreakdown: { role: UserRole; count: number }[]
  }
  userProfiles: {
    total: number
    complete: number
    incomplete: number
    withBio: number
    withAvatar: number
  }
  packages: {
    total: number
    active: number
    delivered: number
    draft: number
    posted: number
    matched: number
    inTransit: number
    cancelled: number
    disputed: number
    revenue: number
    growth: number
    averageValue: number
    totalValue: number
    statusBreakdown: { status: PackageStatus; count: number }[]
  }
  trips: {
    total: number
    active: number
    completed: number
    posted: number
    cancelled: number
    utilization: number
    growth: number
    newThisMonth: number
    averageCapacity: number
    totalCapacity: number
    statusBreakdown: { status: TripStatus; count: number }[]
  }
  // Communication Metrics
  chats: {
    total: number
    active: number
    newThisMonth: number
    averageParticipants: number
    totalParticipants: number
  }
  messages: {
    total: number
    newThisMonth: number
    newThisWeek: number
    newToday: number
    averagePerChat: number
  }
  // Financial Metrics
  wallets: {
    total: number
    activeWallets: number
    totalBalance: number
    averageBalance: number
    walletsWithBalance: number
  }
  transactions: {
    totalVolume: number
    totalValue: number
    completedValue: number
    pendingAmount: number
    pendingCount: number
    failedCount: number
    refunded: number
    processing: number
    averageValue: number
    growth: number
    successRate: number
    newThisMonth: number
    revenueThisMonth: number
    statusBreakdown: { status: PaymentStatus; count: number }[]
    typeBreakdown: { type: TransactionType; count: number }[]
  }
  paymentMethods: {
    total: number
    verified: number
    cards: number
    bankAccounts: number
    mobileMoney: number
    crypto: number
    paypal: number
    digitalWallets: number
  }
  // Verification & Safety Metrics
  verificationDocuments: {
    total: number
    pending: number
    verified: number
    rejected: number
    newThisMonth: number
    statusBreakdown: { status: VerificationStatus; count: number }[]
    typeBreakdown: { type: string; count: number }[]
  }
  disputes: {
    total: number
    open: number
    inProgress: number
    resolved: number
    closed: number
    thisMonth: number
    newThisMonth: number
    resolutionRate: number
    averageResolutionTime: number
    statusBreakdown: { status: DisputeStatus; count: number }[]
  }
  safetyConfirmations: {
    total: number
    newThisMonth: number
    averageRating: number
  }
  // Reviews & Ratings
  reviews: {
    total: number
    newThisMonth: number
    averageRating: number
    fiveStars: number
    fourStars: number
    threeStars: number
    twoStars: number
    oneStar: number
    ratingDistribution: { rating: number; count: number }[]
  }
  // Tracking & Notifications
  trackingEvents: {
    total: number
    newThisMonth: number
    typeBreakdown: { type: string; count: number }[]
  }
  notifications: {
    total: number
    read: number
    unread: number
    newThisMonth: number
    typeBreakdown: { type: NotificationType; count: number }[]
  }
  // Authentication & Security
  accounts: {
    total: number
    googleAccounts: number
    facebookAccounts: number
    appleAccounts: number
    localAccounts: number
    providerBreakdown: { provider: string; count: number }[]
  }
  sessions: {
    total: number
    activeSessions: number
    expiredSessions: number
    newThisMonth: number
  }
  verificationTokens: {
    total: number
    activeTokens: number
    expiredTokens: number
  }
  passwordResets: {
    total: number
    activeResets: number
    expiredResets: number
    newThisMonth: number
  }
  emailVerifications: {
    total: number
    verified: number
    pending: number
    expired: number
  }
  // Legacy fields for backward compatibility
  verification: {
    pending: number
    verified: number
    verificationRate: number
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
  // Helper function to generate realistic daily data for the last N days
  private static generateDailyData(
    totalValue: number, 
    days: number, 
    volatility: number = 0.2
  ): { date: string; value: number }[] {
    const data: { date: string; value: number }[] = []
    const baseValue = totalValue / days
    const now = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      // Add some realistic variance with growth trend
      const growthFactor = 1 + (days - i) / (days * 10) // Slight upward trend
      const randomFactor = 1 + (Math.random() - 0.5) * volatility
      const value = Math.floor(baseValue * growthFactor * randomFactor)
      
      data.push({ date: dateStr, value })
    }
    
    return data
  }

  // Helper function to generate monthly data for the last N months
  private static generateMonthlyData(
    totalValue: number, 
    months: number,
    volatility: number = 0.3
  ): { date: string; value: number }[] {
    const data: { date: string; value: number }[] = []
    const baseValue = totalValue / months
    const now = new Date()
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const dateStr = date.toISOString().slice(0, 7) // YYYY-MM format
      
      // Add growth trend and seasonality
      const growthFactor = 1 + (months - i) / (months * 5)
      const seasonalFactor = 1 + Math.sin((months - i) * Math.PI / 6) * 0.1 // Seasonal variation
      const randomFactor = 1 + (Math.random() - 0.5) * volatility
      const value = Math.floor(baseValue * growthFactor * seasonalFactor * randomFactor)
      
      data.push({ date: dateStr, value })
    }
    
    return data
  }

  // Helper to generate user growth data
  private static generateUserGrowthData(totalUsers: number): { date: string; count: number }[] {
    const monthsBack = 6
    const data: { date: string; count: number }[] = []
    const now = new Date()
    
    // Calculate cumulative growth
    let cumulativeUsers = Math.floor(totalUsers * 0.3) // Start with 30% of current users 6 months ago
    
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      
      if (i === 0) {
        // Current month should be the actual total
        cumulativeUsers = totalUsers
      } else {
        // Add growth with some variance
        const monthlyGrowth = Math.floor((totalUsers - cumulativeUsers) / (i + 1))
        const variance = Math.floor(monthlyGrowth * (Math.random() * 0.4 - 0.2))
        cumulativeUsers += monthlyGrowth + variance
      }
      
      data.push({ date: monthName, count: cumulativeUsers })
    }
    
    return data
  }

  // Helper to generate revenue data
  private static generateRevenueData(totalRevenue: number): { date: string; revenue: number }[] {
    const monthsBack = 6
    const data: { date: string; revenue: number }[] = []
    const now = new Date()
    const baseMonthlyRevenue = totalRevenue / monthsBack
    
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      
      // Add growth trend and seasonality
      const growthFactor = 1 + (monthsBack - i) / (monthsBack * 3)
      const seasonalFactor = 1 + Math.sin((monthsBack - i) * Math.PI / 6) * 0.2
      const randomFactor = 1 + (Math.random() - 0.5) * 0.3
      const revenue = Math.floor(baseMonthlyRevenue * growthFactor * seasonalFactor * randomFactor)
      
      data.push({ date: monthName, revenue })
    }
    
    return data
  }

  // Helper to generate transaction volume data
  private static generateTransactionVolumeData(
    totalVolume: number, 
    totalCount: number
  ): { date: string; volume: number; count: number }[] {
    const daysBack = 30
    const data: { date: string; volume: number; count: number }[] = []
    const now = new Date()
    const baseDailyVolume = totalVolume / daysBack
    const baseDailyCount = Math.floor(totalCount / daysBack)
    
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      // Add weekday pattern (lower on weekends)
      const dayOfWeek = date.getDay()
      const weekdayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1.0
      
      // Add growth and random variance
      const growthFactor = 1 + (daysBack - i) / (daysBack * 10)
      const randomFactor = 1 + (Math.random() - 0.5) * 0.4
      
      const volume = Math.floor(baseDailyVolume * weekdayFactor * growthFactor * randomFactor)
      const count = Math.floor(baseDailyCount * weekdayFactor * growthFactor * randomFactor)
      
      data.push({ date: dateStr, volume, count })
    }
    
    return data
  }

  // Enhanced comprehensive dashboard metrics
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    console.log('🔍 Fetching comprehensive dashboard metrics...')
    
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    try {
      const [
        // Core Business Models
        userMetrics,
        userProfileMetrics,
        packageMetrics,
        tripMetrics,
        
        // Communication
        chatMetrics,
        messageMetrics,
        
        // Financial
        walletMetrics,
        transactionMetrics,
        paymentMethodMetrics,
        
        // Verification & Safety
        verificationDocumentMetrics,
        disputeMetrics,
        safetyConfirmationMetrics,
        
        // Reviews & Ratings
        reviewMetrics,
        
        // Tracking & Notifications
        trackingEventMetrics,
        notificationMetrics,
        
        // Authentication & Security
        accountMetrics,
        sessionMetrics,
        verificationTokenMetrics,
        passwordResetMetrics,
        emailVerificationMetrics
      ] = await Promise.all([
        this.getUserDashboardMetrics(startOfMonth, startOfLastMonth, endOfLastMonth),
        this.getUserProfileMetrics(),
        this.getPackageDashboardMetrics(startOfMonth, startOfLastMonth, endOfLastMonth),
        this.getTripMetrics(startOfMonth, startOfLastMonth, endOfLastMonth),
        
        this.getChatMetrics(startOfMonth),
        this.getMessageMetrics(startOfMonth, startOfWeek, startOfDay),
        
        this.getWalletMetrics(),
        this.getTransactionDashboardMetrics(startOfMonth, startOfLastMonth, endOfLastMonth),
        this.getPaymentMethodMetrics(),
        
        this.getVerificationDocumentMetrics(startOfMonth),
        this.getDisputeMetrics(startOfMonth),
        this.getSafetyConfirmationMetrics(startOfMonth),
        
        this.getReviewMetrics(startOfMonth),
        
        this.getTrackingEventMetrics(startOfMonth),
        this.getNotificationMetrics(startOfMonth),
        
        this.getAccountMetrics(),
        this.getSessionMetrics(startOfMonth),
        this.getVerificationTokenMetrics(),
        this.getPasswordResetMetrics(startOfMonth),
        this.getEmailVerificationMetrics()
      ])
      
      console.log('✅ Successfully fetched comprehensive dashboard metrics')
      
      return {
        // Core Business Models
        users: userMetrics,
        userProfiles: userProfileMetrics,
        packages: packageMetrics,
        trips: tripMetrics,
        
        // Communication
        chats: chatMetrics,
        messages: messageMetrics,
        
        // Financial
        wallets: walletMetrics,
        transactions: transactionMetrics,
        paymentMethods: paymentMethodMetrics,
        
        // Verification & Safety
        verificationDocuments: verificationDocumentMetrics,
        disputes: disputeMetrics,
        safetyConfirmations: safetyConfirmationMetrics,
        
        // Reviews & Ratings
        reviews: reviewMetrics,
        
        // Tracking & Notifications
        trackingEvents: trackingEventMetrics,
        notifications: notificationMetrics,
        
        // Authentication & Security
        accounts: accountMetrics,
        sessions: sessionMetrics,
        verificationTokens: verificationTokenMetrics,
        passwordResets: passwordResetMetrics,
        emailVerifications: emailVerificationMetrics,
        
        // Legacy compatibility
        verification: {
          pending: userMetrics.pending,
          verified: userMetrics.verified,
          verificationRate: userMetrics.total > 0 ? (userMetrics.verified / userMetrics.total) * 100 : 0
        }
      }
    } catch (error) {
      console.error('❌ Error fetching comprehensive dashboard metrics:', error)
      throw error
    }
  }

  private static async getUserDashboardMetrics(startOfMonth: Date, startOfLastMonth: Date, endOfLastMonth: Date) {
    const [
      totalUsers, 
      activeUsers, 
      verifiedUsers, 
      newUsersThisMonth, 
      newUsersLastMonth,
      usersByRole
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { verificationStatus: VerificationStatus.VERIFIED } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ 
        where: { 
          createdAt: { 
            gte: startOfLastMonth, 
            lt: endOfLastMonth 
          } 
        } 
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      })
    ])

    const userGrowth = newUsersLastMonth > 0 ? 
      ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 
      newUsersThisMonth > 0 ? 100 : 0

    const admins = usersByRole.find(r => r.role === UserRole.ADMIN)?._count.id || 0
    const senders = usersByRole.find(r => r.role === UserRole.SENDER)?._count.id || 0
    const travelers = usersByRole.find(r => r.role === UserRole.TRAVELER)?._count.id || 0

    return {
      total: totalUsers,
      active: activeUsers,
      verified: verifiedUsers,
      newThisMonth: newUsersThisMonth,
      growth: Math.round(userGrowth * 100) / 100,
      pending: totalUsers - verifiedUsers,
      admins,
      senders,
      travelers,
      roleBreakdown: usersByRole.map(r => ({ role: r.role, count: r._count.id }))
    }
  }

  private static async getUserProfileMetrics() {
    const [
      total,
      withBio,
      withAvatar
    ] = await Promise.all([
      prisma.userProfile.count(),
      prisma.userProfile.count({ where: { bio: { not: null } } }),
      prisma.user.count({ where: { avatar: { not: null } } })
    ])
    
    return {
      total,
      complete: withBio,
      incomplete: total - withBio,
      withBio,
      withAvatar
    }
  }

  private static async getPackageDashboardMetrics(startOfMonth: Date, startOfLastMonth: Date, endOfLastMonth: Date) {
    const [
      totalPackages, 
      activePackages, 
      deliveredPackages, 
      draftPackages,
      packagesThisMonth,
      packagesLastMonth,
      packageRevenue,
      statusBreakdown,
      valueData
    ] = await Promise.all([
      prisma.package.count(),
      prisma.package.count({ 
        where: { 
          status: { 
            in: [PackageStatus.POSTED, PackageStatus.MATCHED, PackageStatus.IN_TRANSIT] 
          } 
        } 
      }),
      prisma.package.count({ where: { status: PackageStatus.DELIVERED } }),
      prisma.package.count({ where: { status: PackageStatus.DRAFT } }),
      prisma.package.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.package.count({ 
        where: { 
          createdAt: { 
            gte: startOfLastMonth, 
            lt: endOfLastMonth 
          } 
        } 
      }),
      prisma.transaction.aggregate({
        where: { 
          type: TransactionType.PAYMENT, 
          status: PaymentStatus.COMPLETED,
          packageId: { not: null }
        },
        _sum: { amount: true }
      }),
      prisma.package.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.package.aggregate({
        _sum: { value: true },
        _avg: { value: true }
      })
    ])

    const packageGrowth = packagesLastMonth > 0 ? 
      ((packagesThisMonth - packagesLastMonth) / packagesLastMonth) * 100 : 
      packagesThisMonth > 0 ? 100 : 0

    const posted = statusBreakdown.find(s => s.status === PackageStatus.POSTED)?._count.status || 0
    const matched = statusBreakdown.find(s => s.status === PackageStatus.MATCHED)?._count.status || 0
    const inTransit = statusBreakdown.find(s => s.status === PackageStatus.IN_TRANSIT)?._count.status || 0
    const cancelled = statusBreakdown.find(s => s.status === PackageStatus.CANCELLED)?._count.status || 0
    const disputed = statusBreakdown.find(s => s.status === PackageStatus.DISPUTED)?._count.status || 0

    return {
      total: totalPackages,
      active: activePackages,
      delivered: deliveredPackages,
      draft: draftPackages,
      posted,
      matched,
      inTransit,
      cancelled,
      disputed,
      revenue: packageRevenue._sum.amount || 0,
      growth: Math.round(packageGrowth * 100) / 100,
      averageValue: totalPackages > 0 ? (packageRevenue._sum.amount || 0) / totalPackages : 0,
      totalValue: valueData._sum.value || 0,
      statusBreakdown: statusBreakdown.map(s => ({ status: s.status, count: s._count.status }))
    }
  }

  private static async getTripMetrics(startOfMonth: Date, startOfLastMonth: Date, endOfLastMonth: Date) {
    const [
      totalTrips, 
      activeTrips, 
      completedTrips, 
      postedTrips,
      cancelledTrips,
      tripsThisMonth,
      tripsLastMonth,
      statusBreakdown,
      capacityData
    ] = await Promise.all([
      prisma.trip.count(),
      prisma.trip.count({ where: { status: TripStatus.ACTIVE } }),
      prisma.trip.count({ where: { status: TripStatus.COMPLETED } }),
      prisma.trip.count({ where: { status: TripStatus.POSTED } }),
      prisma.trip.count({ where: { status: TripStatus.CANCELLED } }),
      prisma.trip.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.trip.count({ 
        where: { 
          createdAt: { 
            gte: startOfLastMonth, 
            lt: endOfLastMonth 
          } 
        } 
      }),
      prisma.trip.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.trip.aggregate({
        _sum: { maxWeight: true },
        _avg: { maxWeight: true }
      })
    ])

    const tripUtilization = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0
    const tripGrowth = tripsLastMonth > 0 ? 
      ((tripsThisMonth - tripsLastMonth) / tripsLastMonth) * 100 : 
      tripsThisMonth > 0 ? 100 : 0

    return {
      total: totalTrips,
      active: activeTrips,
      completed: completedTrips,
      posted: postedTrips,
      cancelled: cancelledTrips,
      utilization: Math.round(tripUtilization * 100) / 100,
      growth: Math.round(tripGrowth * 100) / 100,
      newThisMonth: tripsThisMonth,
      averageCapacity: capacityData._avg.maxWeight || 0,
      totalCapacity: capacityData._sum.maxWeight || 0,
      statusBreakdown: statusBreakdown.map(s => ({ status: s.status, count: s._count.status }))
    }
  }

  private static async getChatMetrics(startOfMonth: Date) {
    const [
      total,
      newThisMonth,
      totalParticipants
    ] = await Promise.all([
      prisma.chat.count(),
      prisma.chat.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.chatParticipant.count()
    ])
    
    return {
      total,
      active: total,
      newThisMonth,
      averageParticipants: total > 0 ? totalParticipants / total : 0,
      totalParticipants
    }
  }

  private static async getMessageMetrics(startOfMonth: Date, startOfWeek: Date, startOfDay: Date) {
    const [
      total,
      newThisMonth,
      newThisWeek,
      newToday,
      chatCount
    ] = await Promise.all([
      prisma.message.count(),
      prisma.message.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.message.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.message.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.chat.count()
    ])
    
    return {
      total,
      newThisMonth,
      newThisWeek,
      newToday,
      averagePerChat: chatCount > 0 ? total / chatCount : 0
    }
  }

  private static async getWalletMetrics() {
    const [
      total,
      balanceData,
      walletsWithBalance
    ] = await Promise.all([
      prisma.wallet.count(),
      prisma.wallet.aggregate({
        _sum: { balance: true },
        _avg: { balance: true }
      }),
      prisma.wallet.count({ where: { balance: { gt: 0 } } })
    ])
    
    return {
      total,
      activeWallets: walletsWithBalance,
      totalBalance: balanceData._sum.balance || 0,
      averageBalance: balanceData._avg.balance || 0,
      walletsWithBalance
    }
  }

  private static async getTransactionDashboardMetrics(startOfMonth: Date, startOfLastMonth: Date, endOfLastMonth: Date) {
    const [
      allTransactions,
      completedTransactions, 
      pendingTransactions,
      failedTransactions,
      refundedTransactions,
      processingTransactions,
      transactionsThisMonth,
      transactionsLastMonth,
      statusBreakdown,
      typeBreakdown
    ] = await Promise.all([
      prisma.transaction.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        _avg: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _count: { id: true },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { status: PaymentStatus.PENDING },
        _count: { id: true },
        _sum: { amount: true }
      }),
      prisma.transaction.count({ where: { status: PaymentStatus.FAILED } }),
      prisma.transaction.count({ where: { status: PaymentStatus.REFUNDED } }),
      prisma.transaction.count({ where: { status: PaymentStatus.PROCESSING } }),
      prisma.transaction.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _count: { id: true },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { 
          createdAt: { 
            gte: startOfLastMonth, 
            lt: endOfLastMonth 
          } 
        },
        _count: { id: true },
        _sum: { amount: true }
      }),
      prisma.transaction.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.transaction.groupBy({
        by: ['type'],
        _count: { type: true }
      })
    ])

    const transactionGrowth = transactionsLastMonth._sum.amount && transactionsLastMonth._sum.amount > 0 ? 
      (((transactionsThisMonth._sum.amount || 0) - transactionsLastMonth._sum.amount) / transactionsLastMonth._sum.amount) * 100 : 
      (transactionsThisMonth._sum.amount || 0) > 0 ? 100 : 0

    const successRate = allTransactions._count.id > 0 ? 
      (completedTransactions._count.id / allTransactions._count.id) * 100 : 0

    return {
      totalVolume: allTransactions._count.id,
      totalValue: allTransactions._sum.amount || 0,
      completedValue: completedTransactions._sum.amount || 0,
      pendingAmount: pendingTransactions._sum.amount || 0,
      pendingCount: pendingTransactions._count.id,
      failedCount: failedTransactions,
      refunded: refundedTransactions,
      processing: processingTransactions,
      averageValue: allTransactions._avg.amount || 0,
      growth: Math.round(transactionGrowth * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      newThisMonth: transactionsThisMonth._count.id,
      revenueThisMonth: transactionsThisMonth._sum.amount || 0,
      statusBreakdown: statusBreakdown.map(s => ({ status: s.status, count: s._count.status })),
      typeBreakdown: typeBreakdown.map(t => ({ type: t.type, count: t._count.type }))
    }
  }

  private static async getPaymentMethodMetrics() {
    const [
      total,
      activePaymentMethods
    ] = await Promise.all([
      prisma.paymentMethod.count(),
      prisma.paymentMethod.count({ where: { isActive: true } })
    ])
    
    return {
      total,
      verified: activePaymentMethods,
      cards: 0,
      bankAccounts: 0,
      mobileMoney: 0,
      crypto: 0,
      paypal: 0,
      digitalWallets: 0
    }
  }

  private static async getVerificationDocumentMetrics(startOfMonth: Date) {
    const [
      total,
      newThisMonth,
      statusBreakdown,
      typeBreakdown
    ] = await Promise.all([
      prisma.verificationDocument.count(),
      prisma.verificationDocument.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.verificationDocument.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.verificationDocument.groupBy({
        by: ['type'],
        _count: { type: true }
      })
    ])
    
    const pending = statusBreakdown.find(s => s.status === VerificationStatus.PENDING)?._count.status || 0
    const verified = statusBreakdown.find(s => s.status === VerificationStatus.VERIFIED)?._count.status || 0
    const rejected = statusBreakdown.find(s => s.status === VerificationStatus.REJECTED)?._count.status || 0
    
    return {
      total,
      pending,
      verified,
      rejected,
      newThisMonth,
      statusBreakdown: statusBreakdown.map(s => ({ status: s.status, count: s._count.status })),
      typeBreakdown: typeBreakdown.map(t => ({ type: t.type, count: t._count.type }))
    }
  }

  private static async getDisputeMetrics(startOfMonth: Date) {
    const [
      total,
      newThisMonth,
      statusBreakdown
    ] = await Promise.all([
      prisma.dispute.count(),
      prisma.dispute.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.dispute.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ])
    
    const open = statusBreakdown.find(s => s.status === DisputeStatus.OPEN)?._count.status || 0
    const inProgress = statusBreakdown.find(s => s.status === DisputeStatus.IN_REVIEW)?._count.status || 0
    const resolved = statusBreakdown.find(s => s.status === DisputeStatus.RESOLVED)?._count.status || 0
    const closed = statusBreakdown.find(s => s.status === DisputeStatus.CLOSED)?._count.status || 0
    
    const resolutionRate = total > 0 ? ((resolved + closed) / total) * 100 : 0
    
    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      thisMonth: newThisMonth,
      newThisMonth,
      resolutionRate: Math.round(resolutionRate * 100) / 100,
      averageResolutionTime: 0,
      statusBreakdown: statusBreakdown.map(s => ({ status: s.status, count: s._count.status }))
    }
  }

  private static async getSafetyConfirmationMetrics(startOfMonth: Date) {
    const [
      total,
      newThisMonth
    ] = await Promise.all([
      prisma.safetyConfirmation.count(),
      prisma.safetyConfirmation.count({ where: { createdAt: { gte: startOfMonth } } })
    ])
    
    return {
      total,
      newThisMonth,
      averageRating: 0
    }
  }

  private static async getReviewMetrics(startOfMonth: Date) {
    const [
      total,
      newThisMonth,
      ratingData,
      ratingBreakdown
    ] = await Promise.all([
      prisma.review.count(),
      prisma.review.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.review.aggregate({
        _avg: { rating: true }
      }),
      prisma.review.groupBy({
        by: ['rating'],
        _count: { rating: true }
      })
    ])
    
    const fiveStars = ratingBreakdown.find(r => r.rating === 5)?._count.rating || 0
    const fourStars = ratingBreakdown.find(r => r.rating === 4)?._count.rating || 0
    const threeStars = ratingBreakdown.find(r => r.rating === 3)?._count.rating || 0
    const twoStars = ratingBreakdown.find(r => r.rating === 2)?._count.rating || 0
    const oneStar = ratingBreakdown.find(r => r.rating === 1)?._count.rating || 0
    
    return {
      total,
      newThisMonth,
      averageRating: ratingData._avg.rating || 0,
      fiveStars,
      fourStars,
      threeStars,
      twoStars,
      oneStar,
      ratingDistribution: ratingBreakdown.map(r => ({ rating: r.rating, count: r._count.rating }))
    }
  }

  private static async getTrackingEventMetrics(startOfMonth: Date) {
    const [
      total,
      newThisMonth,
      eventBreakdown
    ] = await Promise.all([
      prisma.trackingEvent.count(),
      prisma.trackingEvent.count({ where: { timestamp: { gte: startOfMonth } } }),
      prisma.trackingEvent.groupBy({
        by: ['event'],
        _count: { event: true }
      })
    ])
    
    return {
      total,
      newThisMonth,
      typeBreakdown: eventBreakdown.map(e => ({ type: e.event, count: e._count.event }))
    }
  }

  private static async getNotificationMetrics(startOfMonth: Date) {
    const [
      total,
      newThisMonth,
      read,
      typeBreakdown
    ] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.notification.count({ where: { readAt: { not: null } } }),
      prisma.notification.groupBy({
        by: ['type'],
        _count: { type: true }
      })
    ])
    
    return {
      total,
      read,
      unread: total - read,
      newThisMonth,
      typeBreakdown: typeBreakdown.map(t => ({ type: t.type, count: t._count.type }))
    }
  }

  private static async getAccountMetrics() {
    const [
      total,
      providerBreakdown
    ] = await Promise.all([
      prisma.account.count(),
      prisma.account.groupBy({
        by: ['provider'],
        _count: { provider: true }
      })
    ])
    
    const googleAccounts = providerBreakdown.find(p => p.provider === 'google')?._count.provider || 0
    const facebookAccounts = providerBreakdown.find(p => p.provider === 'facebook')?._count.provider || 0
    const appleAccounts = providerBreakdown.find(p => p.provider === 'apple')?._count.provider || 0
    const localAccounts = providerBreakdown.find(p => p.provider === 'credentials')?._count.provider || 0
    
    return {
      total,
      googleAccounts,
      facebookAccounts,
      appleAccounts,
      localAccounts,
      providerBreakdown: providerBreakdown.map(p => ({ provider: p.provider, count: p._count.provider }))
    }
  }

  private static async getSessionMetrics(_startOfMonth: Date) {
    const [
      total,
      activeSessions
    ] = await Promise.all([
      prisma.session.count(),
      prisma.session.count({ where: { expires: { gt: new Date() } } })
    ])
    
    return {
      total,
      activeSessions,
      expiredSessions: total - activeSessions,
      newThisMonth: 0
    }
  }

  private static async getVerificationTokenMetrics() {
    const [
      total,
      activeTokens
    ] = await Promise.all([
      prisma.verificationToken.count(),
      prisma.verificationToken.count({ where: { expires: { gt: new Date() } } })
    ])
    
    return {
      total,
      activeTokens,
      expiredTokens: total - activeTokens
    }
  }

  private static async getPasswordResetMetrics(startOfMonth: Date) {
    const [
      total,
      newThisMonth,
      activeResets
    ] = await Promise.all([
      prisma.passwordReset.count(),
      prisma.passwordReset.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.passwordReset.count({ where: { expiresAt: { gt: new Date() } } })
    ])
    
    return {
      total,
      activeResets,
      expiredResets: total - activeResets,
      newThisMonth
    }
  }

  private static async getEmailVerificationMetrics() {
    const [
      total,
      expired
    ] = await Promise.all([
      prisma.emailVerification.count(),
      prisma.emailVerification.count({ where: { expiresAt: { lt: new Date() } } })
    ])
    
    return {
      total,
      verified: 0,
      pending: total - expired,
      expired
    }
  }

  // Recent activity method for dashboard
  static async getRecentActivity(limit: number = 20) {
    try {
      const [recentUsers, recentPackages, recentTrips, recentTransactions] = await Promise.all([
        prisma.user.findMany({
          take: Math.ceil(limit / 4),
          orderBy: { createdAt: 'desc' },
          select: { id: true, firstName: true, lastName: true, email: true, createdAt: true }
        }),
        prisma.package.findMany({
          take: Math.ceil(limit / 4),
          orderBy: { createdAt: 'desc' },
          include: { sender: { select: { firstName: true, lastName: true } } }
        }),
        prisma.trip.findMany({
          take: Math.ceil(limit / 4),
          orderBy: { createdAt: 'desc' },
          include: { traveler: { select: { firstName: true, lastName: true } } }
        }),
        prisma.transaction.findMany({
          take: Math.ceil(limit / 4),
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { firstName: true, lastName: true } } }
        })
      ])

      const activities = [
        ...recentUsers.map(user => ({
          id: `user-${user.id}`,
          type: 'user' as const,
          title: `New user registered`,
          subtitle: `${user.firstName} ${user.lastName}`,
          timestamp: user.createdAt.toISOString(),
          data: user
        })),
        ...recentPackages.map(pkg => ({
          id: `package-${pkg.id}`,
          type: 'package' as const,
          title: `New package created`,
          subtitle: `${pkg.title} by ${pkg.sender.firstName} ${pkg.sender.lastName}`,
          timestamp: pkg.createdAt.toISOString(),
          data: pkg
        })),
        ...recentTrips.map(trip => ({
          id: `trip-${trip.id}`,
          type: 'trip' as const,
          title: `New trip posted`,
          subtitle: `${trip.title} by ${trip.traveler.firstName} ${trip.traveler.lastName}`,
          timestamp: trip.createdAt.toISOString(),
          data: trip
        })),
        ...recentTransactions.map(tx => ({
          id: `transaction-${tx.id}`,
          type: 'transaction' as const,
          title: `New transaction`,
          subtitle: `$${tx.amount.toFixed(2)} - ${tx.user.firstName} ${tx.user.lastName}`,
          timestamp: tx.createdAt.toISOString(),
          data: tx
        }))
      ]

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }

  // Legacy methods for backward compatibility
  static async getUserMetrics(): Promise<UserMetrics> {
    const users = await prisma.user.findMany({
      include: {
        profile: true
      }
    })

    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    })

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      verifiedUsers: users.filter(u => u.verificationStatus === VerificationStatus.VERIFIED).length,
      roleDistribution: roleDistribution.map(r => ({ role: r.role, count: r._count.role })),
      growthData: this.generateUserGrowthData(users.length),
      topCountries: [
        { country: 'United States', count: Math.floor(users.length * 0.3) },
        { country: 'United Kingdom', count: Math.floor(users.length * 0.2) },
        { country: 'Canada', count: Math.floor(users.length * 0.15) },
        { country: 'Australia', count: Math.floor(users.length * 0.12) },
        { country: 'Germany', count: Math.floor(users.length * 0.1) },
      ]
    }
  }

  static async getPackageMetrics(): Promise<PackageMetrics> {
    const packages = await prisma.package.findMany()

    const statusDistribution = await prisma.package.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    const averageValue = packages.length > 0 ? packages.reduce((sum, p) => sum + (p.value || 0), 0) / packages.length : 0
    const totalRevenue = packages.reduce((sum, p) => sum + (p.value || 0), 0)

    return {
      totalPackages: packages.length,
      statusDistribution: statusDistribution.map(s => ({ status: s.status, count: s._count.status })),
      revenueData: this.generateRevenueData(totalRevenue),
      categoryDistribution: [
        { category: 'Electronics', count: Math.floor(packages.length * 0.25) },
        { category: 'Documents', count: Math.floor(packages.length * 0.2) },
        { category: 'Clothing', count: Math.floor(packages.length * 0.18) },
        { category: 'Gifts', count: Math.floor(packages.length * 0.15) },
        { category: 'Food', count: Math.floor(packages.length * 0.12) },
        { category: 'Books', count: Math.floor(packages.length * 0.1) },
      ],
      averageValue,
      topRoutes: [
        { route: 'New York → London', count: Math.floor(packages.length * 0.15) },
        { route: 'Los Angeles → Tokyo', count: Math.floor(packages.length * 0.12) },
        { route: 'Toronto → Paris', count: Math.floor(packages.length * 0.1) },
        { route: 'Sydney → Dubai', count: Math.floor(packages.length * 0.08) },
        { route: 'Berlin → Mumbai', count: Math.floor(packages.length * 0.07) },
      ]
    }
  }

  static async getTransactionMetrics(): Promise<TransactionMetrics> {
    const transactions = await prisma.transaction.findMany()

    const typeDistribution = await prisma.transaction.groupBy({
      by: ['type'],
      _count: { type: true },
      _sum: { amount: true }
    })

    const statusDistribution = await prisma.transaction.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0)
    const averageTransactionValue = transactions.length > 0 ? totalVolume / transactions.length : 0

    return {
      totalTransactions: transactions.length,
      totalVolume,
      typeDistribution: typeDistribution.map(t => ({
        type: t.type,
        count: t._count.type,
        volume: t._sum.amount || 0
      })),
      statusDistribution: statusDistribution.map(s => ({ status: s.status, count: s._count.status })),
      dailyVolume: this.generateTransactionVolumeData(totalVolume, transactions.length),
      averageTransactionValue
    }
  }
}

export default DatabaseService
