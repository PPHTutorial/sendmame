import { NextResponse } from 'next/server'
import DatabaseService from '@/lib/database-service'

export async function GET() {
  try {
    const metrics = await DatabaseService.getDashboardMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Dashboard metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    )
  }
}
