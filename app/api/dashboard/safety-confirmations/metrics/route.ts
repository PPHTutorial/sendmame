import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const [
      totalConfirmations,
      todayConfirmations,
      pendingVerification
    ] = await Promise.all([
      // Total safety confirmations
      prisma.safetyConfirmation.count(),
      
      // Today's confirmations
      prisma.safetyConfirmation.count({
        where: {
          confirmedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Pending verification (incomplete confirmations)
      prisma.safetyConfirmation.findMany({
        select: {
          confirmations: true
        }
      })
    ])

    // Calculate completion rates
    let completeConfirmations = 0
    let pendingCount = 0

    for (const confirmation of pendingVerification) {
      const confirmationData = confirmation.confirmations as Record<string, any>
      const requiredItems = [
        'identity_verified',
        'package_condition_ok',
        'location_confirmed',
        'photo_taken'
      ]
      
      const completedItems = requiredItems.filter(item => confirmationData[item] === true)
      const completionRate = (completedItems.length / requiredItems.length) * 100
      
      if (completionRate === 100) {
        completeConfirmations++
      } else {
        pendingCount++
      }
    }

    const overallCompletionRate = totalConfirmations > 0 
      ? Math.round((completeConfirmations / totalConfirmations) * 100)
      : 0

    return NextResponse.json({
      totalConfirmations,
      todayConfirmations,
      completionRate: overallCompletionRate,
      pendingVerification: pendingCount
    })
  } catch (error) {
    console.error('Error fetching safety confirmations metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
