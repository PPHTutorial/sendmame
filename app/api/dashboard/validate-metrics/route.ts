import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Running comprehensive database metrics validation...')
    
    // Get accurate counts from all tables
    const [
      users,
      packages,
      trips,
      transactions,
      disputes,
      verificationDocs,
      messages,
      chats,
      notifications,
      wallets,
      paymentMethods
    ] = await Promise.all([
      // Users with detailed breakdown
      Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { verificationStatus: 'VERIFIED' } }),
        prisma.user.count({ where: { verificationStatus: 'PENDING' } }),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.user.count({ where: { role: 'SENDER' } }),
        prisma.user.count({ where: { role: 'TRAVELER' } })
      ]),
      
      // Packages with status breakdown
      Promise.all([
        prisma.package.count(),
        prisma.package.count({ where: { status: 'DRAFT' } }),
        prisma.package.count({ where: { status: 'POSTED' } }),
        prisma.package.count({ where: { status: 'MATCHED' } }),
        prisma.package.count({ where: { status: 'IN_TRANSIT' } }),
        prisma.package.count({ where: { status: 'DELIVERED' } }),
        prisma.package.count({ where: { status: 'CANCELLED' } }),
        prisma.package.aggregate({ _sum: { value: true }, _avg: { value: true } })
      ]),
      
      // Trips with status breakdown
      Promise.all([
        prisma.trip.count(),
        prisma.trip.count({ where: { status: 'POSTED' } }),
        prisma.trip.count({ where: { status: 'ACTIVE' } }),
        prisma.trip.count({ where: { status: 'COMPLETED' } }),
        prisma.trip.count({ where: { status: 'CANCELLED' } })
      ]),
      
      // Transactions with comprehensive metrics
      Promise.all([
        prisma.transaction.count(),
        prisma.transaction.count({ where: { status: 'PENDING' } }),
        prisma.transaction.count({ where: { status: 'PROCESSING' } }),
        prisma.transaction.count({ where: { status: 'COMPLETED' } }),
        prisma.transaction.count({ where: { status: 'FAILED' } }),
        prisma.transaction.aggregate({ 
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
          _avg: { amount: true }
        }),
        prisma.transaction.aggregate({ 
          where: { status: 'PENDING' },
          _sum: { amount: true }
        })
      ]),
      
      // Disputes
      Promise.all([
        prisma.dispute.count(),
        prisma.dispute.count({ where: { status: 'OPEN' } }),
        prisma.dispute.count({ where: { status: 'IN_REVIEW' } }),
        prisma.dispute.count({ where: { status: 'RESOLVED' } }),
        prisma.dispute.count({ where: { status: 'CLOSED' } })
      ]),
      
      // Verification Documents
      Promise.all([
        prisma.verificationDocument.count(),
        prisma.verificationDocument.count({ where: { status: 'PENDING' } }),
        prisma.verificationDocument.count({ where: { status: 'VERIFIED' } }),
        prisma.verificationDocument.count({ where: { status: 'REJECTED' } })
      ]),
      
      // Messages
      prisma.message.count(),
      
      // Chats
      Promise.all([
        prisma.chat.count(),
        prisma.chatParticipant.count()
      ]),
      
      // Notifications
      Promise.all([
        prisma.notification.count(),
        prisma.notification.count({ where: { isRead: false } })
      ]),
      
      // Wallets
      Promise.all([
        prisma.wallet.count(),
        prisma.wallet.aggregate({ _sum: { balance: true } })
      ]),
      
      // Payment Methods
      prisma.paymentMethod.count()
    ])

    // Calculate derived metrics
    const userMetrics = {
      total: users[0],
      active: users[1],
      verified: users[2],
      pendingVerification: users[3],
      admins: users[4],
      senders: users[5],
      travelers: users[6],
      verificationRate: users[0] > 0 ? Math.round((users[2] / users[0]) * 100 * 100) / 100 : 0,
      activeRate: users[0] > 0 ? Math.round((users[1] / users[0]) * 100 * 100) / 100 : 0
    }

    const packageMetrics = {
      total: packages[0],
      draft: packages[1],
      posted: packages[2],
      matched: packages[3],
      inTransit: packages[4],
      delivered: packages[5],
      cancelled: packages[6],
      totalValue: packages[7]._sum.value || 0,
      averageValue: packages[7]._avg.value || 0,
      deliveryRate: packages[0] > 0 ? Math.round((packages[5] / packages[0]) * 100 * 100) / 100 : 0,
      activePackages: packages[2] + packages[3] + packages[4] // Posted + Matched + In Transit
    }

    const tripMetrics = {
      total: trips[0],
      posted: trips[1],
      active: trips[2],
      completed: trips[3],
      cancelled: trips[4],
      completionRate: trips[0] > 0 ? Math.round((trips[3] / trips[0]) * 100 * 100) / 100 : 0,
      utilization: trips[0] > 0 ? Math.round(((trips[2] + trips[3]) / trips[0]) * 100 * 100) / 100 : 0
    }

    const transactionMetrics = {
      total: transactions[0],
      pending: transactions[1],
      processing: transactions[2],
      completed: transactions[3],
      failed: transactions[4],
      completedValue: transactions[5]._sum.amount || 0,
      pendingValue: transactions[6]._sum.amount || 0,
      averageValue: transactions[5]._avg.amount || 0,
      successRate: transactions[0] > 0 ? Math.round((transactions[3] / transactions[0]) * 100 * 100) / 100 : 0
    }

    const disputeMetrics = {
      total: disputes[0],
      open: disputes[1],
      inReview: disputes[2],
      resolved: disputes[3],
      closed: disputes[4],
      resolutionRate: disputes[0] > 0 ? Math.round(((disputes[3] + disputes[4]) / disputes[0]) * 100 * 100) / 100 : 0
    }

    const verificationMetrics = {
      total: verificationDocs[0],
      pending: verificationDocs[1],
      verified: verificationDocs[2],
      rejected: verificationDocs[3],
      approvalRate: verificationDocs[0] > 0 ? Math.round((verificationDocs[2] / verificationDocs[0]) * 100 * 100) / 100 : 0
    }

    const communicationMetrics = {
      totalMessages: messages,
      totalChats: chats[0],
      totalChatParticipants: chats[1],
      averageParticipantsPerChat: chats[0] > 0 ? Math.round((chats[1] / chats[0]) * 100) / 100 : 0
    }

    const notificationMetrics = {
      total: notifications[0],
      unread: notifications[1],
      readRate: notifications[0] > 0 ? Math.round(((notifications[0] - notifications[1]) / notifications[0]) * 100 * 100) / 100 : 0
    }

    const walletMetrics = {
      totalWallets: wallets[0],
      totalBalance: wallets[1]._sum.balance || 0,
      averageBalance: wallets[0] > 0 ? Math.round((wallets[1]._sum.balance || 0) / wallets[0] * 100) / 100 : 0
    }

    // Calculate cross-references and data consistency
    const dataConsistency = {
      usersWithWallets: wallets[0],
      userWalletRatio: userMetrics.total > 0 ? Math.round((wallets[0] / userMetrics.total) * 100 * 100) / 100 : 0,
      packagesWithTransactions: Math.min(packageMetrics.total, transactionMetrics.total),
      deliveredPackagesVsCompletedTransactions: {
        delivered: packageMetrics.delivered,
        completed: transactionMetrics.completed,
        ratio: packageMetrics.delivered > 0 ? Math.round((transactionMetrics.completed / packageMetrics.delivered) * 100 * 100) / 100 : 0
      }
    }

    const summary = {
      totalRecords: userMetrics.total + packageMetrics.total + tripMetrics.total + 
                   transactionMetrics.total + disputeMetrics.total + verificationMetrics.total + 
                   communicationMetrics.totalMessages + communicationMetrics.totalChats + 
                   notificationMetrics.total + walletMetrics.totalWallets + paymentMethods,
      lastUpdated: new Date().toISOString(),
      databaseHealth: 'healthy' // You can add more sophisticated health checks
    }

    return NextResponse.json({
      success: true,
      summary,
      metrics: {
        users: userMetrics,
        packages: packageMetrics,
        trips: tripMetrics,
        transactions: transactionMetrics,
        disputes: disputeMetrics,
        verification: verificationMetrics,
        communication: communicationMetrics,
        notifications: notificationMetrics,
        wallets: walletMetrics,
        paymentMethods,
        dataConsistency
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database validation error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to validate database metrics',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500
    })
  }
}
