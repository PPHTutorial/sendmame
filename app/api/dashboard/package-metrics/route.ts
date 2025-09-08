import { NextResponse } from 'next/server'
import DatabaseService from '@/lib/database-service'

export async function GET() {
  try {
    const packageMetrics = await DatabaseService.getPackageMetrics()
    return NextResponse.json(packageMetrics)
  } catch (error) {
    console.error('Package metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch package metrics' },
      { status: 500 }
    )
  }
}
