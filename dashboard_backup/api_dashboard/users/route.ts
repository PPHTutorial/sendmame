import { NextResponse } from 'next/server'
import DatabaseService from '@/lib/database-service'

export async function GET() {
  try {
    const metrics = await DatabaseService.getUserMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('User metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user metrics' },
      { status: 500 }
    )
  }
}
