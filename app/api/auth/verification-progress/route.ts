// Fakomame Platform - Verification Progress API
import { NextRequest, NextResponse } from 'next/server'
import { getVerificationProgress } from '@/lib/verification-utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(_request: NextRequest) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get verification progress
    const progress = await getVerificationProgress(session.user.id)

    return NextResponse.json({
      success: true,
      data: progress
    })
  } catch (error) {
    console.error('Verification progress error:', error)
    return NextResponse.json(
      { error: 'Failed to get verification progress' },
      { status: 500 }
    )
  }
}
