import { NextResponse } from 'next/server'
import DatabaseService from '@/lib/database-service'

export async function GET() {
  try {
    const userMetrics = await DatabaseService.getUserMetrics()
    return NextResponse.json(userMetrics)
  } catch (error) {
    console.error('User metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user metrics' },
      { status: 500 }
    )
  }
}
