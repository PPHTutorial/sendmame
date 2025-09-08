import { NextResponse } from 'next/server'
import DatabaseService from '@/lib/database-service'

export async function GET() {
  try {
    const transactionMetrics = await DatabaseService.getTransactionMetrics()
    return NextResponse.json(transactionMetrics)
  } catch (error) {
    console.error('Transaction metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction metrics' },
      { status: 500 }
    )
  }
}
