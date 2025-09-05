import { NextResponse } from 'next/server'
import DatabaseService from '@/lib/database-service'

export async function GET() {
  try {
    const activity = await DatabaseService.getRecentActivity(20)
    return NextResponse.json(activity)
  } catch (error) {
    console.error('Recent activity API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    )
  }
}
