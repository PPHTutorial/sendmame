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

export interface ComprehensiveDashboardMetrics {
  // Core Business Models
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
    posted: number
    matched: number
    inTransit: number
    delivered: number
    cancelled: number
    disputed: number
    draft: number
    newThisMonth: number
    totalValue: number
    averageValue: number
    statusBreakdown: { status: PackageStatus; count: number }[]
  }
  trips: {
    total: number
    posted: number
    active: number
    completed: number
    cancelled: number
    newThisMonth: number
    averageCapacity: number
    totalCapacity: number
    statusBreakdown: { status: TripStatus; count: number }[]
  }
  
  // Communication
  chats: {
    total: number
    active: number
    newThisMonth: number
    averageParticipants: number
    totalParticipants: number
  }
  chatParticipants: {
    total: number
    activeParticipants: number
  }
  messages: {
    total: number
    newThisMonth: number
    newThisWeek: number
    newToday: number
    averagePerChat: number
  }
  
  // Financial
  wallets: {
    total: number
    activeWallets: number
    totalBalance: number
    averageBalance: number
    walletsWithBalance: number
  }
  transactions: {
    total: number
    pending: number
    completed: number
    failed: number
    refunded: number
    processing: number
    totalVolume: number
    averageAmount: number
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
  
  // Verification & Safety
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
    newThisMonth: number
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
}

export class ComprehensiveDatabaseService {
  // Get comprehensive metrics for ALL models
  static async getComprehensiveMetrics(): Promise<ComprehensiveDashboardMetrics> {
    console.log('🔍 Fetching comprehensive metrics for ALL database tables...')
    
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
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
        chatParticipantMetrics,
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
        this.getUserMetrics(startOfMonth),
        this.getUserProfileMetrics(),
        this.getPackageMetrics(startOfMonth),
        this.getTripMetrics(startOfMonth),
        
        this.getChatMetrics(startOfMonth),
        this.getChatParticipantMetrics(),
        this.getMessageMetrics(startOfMonth, startOfWeek, startOfDay),
        
        this.getWalletMetrics(),
        this.getTransactionMetrics(startOfMonth),
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
      
      console.log('✅ Successfully fetched comprehensive metrics for all tables')
      
      return {
        users: userMetrics,
        userProfiles: userProfileMetrics,
        packages: packageMetrics,
        trips: tripMetrics,
        chats: chatMetrics,
        chatParticipants: chatParticipantMetrics,
        messages: messageMetrics,
        wallets: walletMetrics,
        transactions: transactionMetrics,
        paymentMethods: paymentMethodMetrics,
        verificationDocuments: verificationDocumentMetrics,
        disputes: disputeMetrics,
        safetyConfirmations: safetyConfirmationMetrics,
        reviews: reviewMetrics,
        trackingEvents: trackingEventMetrics,
        notifications: notificationMetrics,
        accounts: accountMetrics,
        sessions: sessionMetrics,
        verificationTokens: verificationTokenMetrics,
        passwordResets: passwordResetMetrics,
        emailVerifications: emailVerificationMetrics
      }
    } catch (error) {
      console.error('❌ Error fetching comprehensive metrics:', error)
      throw error
    }
  }
  
  private static async getUserMetrics(startOfMonth: Date) {
    const [
      total,
      active,
      verified,
      newThisMonth,
      pending,
      roleBreakdown
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { verificationStatus: VerificationStatus.VERIFIED } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      })
    ])
    
    const admins = roleBreakdown.find(r => r.role === UserRole.ADMIN)?._count.role || 0
    const senders = roleBreakdown.find(r => r.role === UserRole.SENDER)?._count.role || 0
    const travelers = roleBreakdown.find(r => r.role === UserRole.TRAVELER)?._count.role || 0
    
    return {
      total,
      active,
      verified,
      newThisMonth,
      growth: newThisMonth,
      pending,
      admins,
      senders,
      travelers,
      roleBreakdown: roleBreakdown.map(r => ({ role: r.role, count: r._count.role }))
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
  
  private static async getPackageMetrics(startOfMonth: Date) {
    const [
      total,
      newThisMonth,
      statusBreakdown,
      valueData
    ] = await Promise.all([
      prisma.package.count(),
      prisma.package.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.package.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.package.aggregate({
        _sum: { value: true },
        _avg: { value: true }
      })
    ])
    
    const posted = statusBreakdown.find(s => s.status === PackageStatus.POSTED)?._count.status || 0
    const matched = statusBreakdown.find(s => s.status === PackageStatus.MATCHED)?._count.status || 0
    const inTransit = statusBreakdown.find(s => s.status === PackageStatus.IN_TRANSIT)?._count.status || 0
    const delivered = statusBreakdown.find(s => s.status === PackageStatus.DELIVERED)?._count.status || 0
    const cancelled = statusBreakdown.find(s => s.status === PackageStatus.CANCELLED)?._count.status || 0
    const disputed = statusBreakdown.find(s => s.status === PackageStatus.DISPUTED)?._count.status || 0
    const draft = statusBreakdown.find(s => s.status === PackageStatus.DRAFT)?._count.status || 0
    
    return {
      total,
      posted,
      matched,
      inTransit,
      delivered,
      cancelled,
      disputed,
      draft,
      newThisMonth,
      totalValue: valueData._sum.value || 0,
      averageValue: valueData._avg.value || 0,
      statusBreakdown: statusBreakdown.map(s => ({ status: s.status, count: s._count.status }))
    }
  }
  
  private static async getTripMetrics(startOfMonth: Date) {
    const [
      total,
      newThisMonth,
      statusBreakdown,
      capacityData
    ] = await Promise.all([
      prisma.trip.count(),
      prisma.trip.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.trip.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.trip.aggregate({
        _sum: { maxWeight: true },
        _avg: { maxWeight: true }
      })
    ])
    
    const posted = statusBreakdown.find(s => s.status === TripStatus.POSTED)?._count.status || 0
    const active = statusBreakdown.find(s => s.status === TripStatus.ACTIVE)?._count.status || 0
    const completed = statusBreakdown.find(s => s.status === TripStatus.COMPLETED)?._count.status || 0
    const cancelled = statusBreakdown.find(s => s.status === TripStatus.CANCELLED)?._count.status || 0
    
    return {
      total,
      posted,
      active,
      completed,
      cancelled,
      newThisMonth,
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
      active: total, // Assume all chats are active for now
      newThisMonth,
      averageParticipants: total > 0 ? totalParticipants / total : 0,
      totalParticipants
    }
  }
  
  private static async getChatParticipantMetrics() {
    const [total] = await Promise.all([
      prisma.chatParticipant.count()
    ])
    
    return {
      total,
      activeParticipants: total // Assume all participants are active
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
  
  private static async getTransactionMetrics(startOfMonth: Date) {
    const [
      total,
      newThisMonth,
      statusBreakdown,
      typeBreakdown,
      volumeData
    ] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.transaction.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.transaction.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        _avg: { amount: true }
      })
    ])
    
    const pending = statusBreakdown.find(s => s.status === PaymentStatus.PENDING)?._count.status || 0
    const completed = statusBreakdown.find(s => s.status === PaymentStatus.COMPLETED)?._count.status || 0
    const failed = statusBreakdown.find(s => s.status === PaymentStatus.FAILED)?._count.status || 0
    const refunded = statusBreakdown.find(s => s.status === PaymentStatus.REFUNDED)?._count.status || 0
    const processing = statusBreakdown.find(s => s.status === PaymentStatus.PROCESSING)?._count.status || 0
    
    return {
      total,
      pending,
      completed,
      failed,
      refunded,
      processing,
      totalVolume: volumeData._sum.amount || 0,
      averageAmount: volumeData._avg.amount || 0,
      newThisMonth,
      revenueThisMonth: volumeData._sum.amount || 0, // Simplified
      statusBreakdown: statusBreakdown.map(s => ({ status: s.status, count: s._count.status })),
      typeBreakdown: typeBreakdown.map(t => ({ type: t.type, count: t._count.type }))
    }
  }
  
  private static async getPaymentMethodMetrics() {
    const [
      total,
      activePaymentMethods
      // Add more specific queries based on your payment method structure
    ] = await Promise.all([
      prisma.paymentMethod.count(),
      prisma.paymentMethod.count({ where: { isActive: true } })
    ])
    
    return {
      total,
      verified: activePaymentMethods, // Using isActive as verified proxy
      cards: 0, // Add specific queries based on your schema
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
    
    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      newThisMonth,
      averageResolutionTime: 0, // Calculate based on your needs
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
      averageRating: 0 // Add rating field to schema if needed
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
      newThisMonth: 0 // Can't calculate without createdAt field
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
      verified: 0, // No verifiedAt field in schema
      pending: total - expired,
      expired
    }
  }
}

export default ComprehensiveDatabaseService
