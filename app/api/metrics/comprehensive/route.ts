import { NextRequest, NextResponse } from 'next/server'
import ComprehensiveDatabaseService from '@/lib/comprehensive-database-service'

export async function GET(_request: NextRequest) {
  try {
    console.log('📊 API: Fetching comprehensive dashboard metrics...')
    
    // Get comprehensive metrics for ALL database tables
    const metrics = await ComprehensiveDatabaseService.getComprehensiveMetrics()
    
    console.log('✅ API: Successfully retrieved comprehensive metrics')
    console.log('📈 Metrics Summary:')
    console.log(`   👥 Users: ${metrics.users.total} (${metrics.users.newThisMonth} new this month)`)
    console.log(`   📦 Packages: ${metrics.packages.total} (${metrics.packages.newThisMonth} new this month)`)
    console.log(`   🚀 Trips: ${metrics.trips.total} (${metrics.trips.newThisMonth} new this month)`)
    console.log(`   💬 Messages: ${metrics.messages.total} (${metrics.messages.newThisMonth} new this month)`)
    console.log(`   💰 Transactions: ${metrics.transactions.total} (${metrics.transactions.newThisMonth} new this month)`)
    console.log(`   📋 Reviews: ${metrics.reviews.total} (${metrics.reviews.newThisMonth} new this month)`)
    console.log(`   🔐 Verification Docs: ${metrics.verificationDocuments.total} (${metrics.verificationDocuments.newThisMonth} new this month)`)
    console.log(`   ⚡ Disputes: ${metrics.disputes.total} (${metrics.disputes.newThisMonth} new this month)`)
    console.log(`   🔔 Notifications: ${metrics.notifications.total} (${metrics.notifications.newThisMonth} new this month)`)
    console.log(`   🏦 Accounts: ${metrics.accounts.total}`)
    console.log(`   🛡️ Sessions: ${metrics.sessions.total} (${metrics.sessions.activeSessions} active)`)
    
    return NextResponse.json({
      success: true,
      data: metrics,
      message: 'Comprehensive metrics retrieved successfully',
      timestamp: new Date().toISOString(),
      totalTables: 21,
      coverage: 'Complete database coverage including all models'
    })
  } catch (error) {
    console.error('❌ API Error fetching comprehensive metrics:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch comprehensive metrics',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Optional: Add POST method for more specific metric queries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tables, dateRange, filters } = body
    
    console.log('📊 API: Custom metrics query requested')
    console.log('   Tables:', tables)
    console.log('   Date Range:', dateRange)
    console.log('   Filters:', filters)
    
    // For now, return the comprehensive metrics
    // In the future, you can implement custom filtering based on the request
    const metrics = await ComprehensiveDatabaseService.getComprehensiveMetrics()
    
    return NextResponse.json({
      success: true,
      data: metrics,
      message: 'Custom metrics query completed',
      timestamp: new Date().toISOString(),
      requestedTables: tables || 'all',
      coverage: 'Complete database coverage'
    })
  } catch (error) {
    console.error('❌ API Error processing custom metrics query:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process custom metrics query',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
