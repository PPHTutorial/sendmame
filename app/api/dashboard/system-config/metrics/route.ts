import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalConfigs,
      recentlyUpdated,
      configsWithDescription,
      configsWithoutDescription,
      todayUpdated,
      thisWeekUpdated
    ] = await Promise.all([
      // Total system configs
      prisma.systemConfig.count(),
      
      // Recently updated (last 7 days)
      prisma.systemConfig.count({
        where: {
          updatedAt: { gte: thisWeek }
        }
      }),
      
      // Configs with description
      prisma.systemConfig.count({
        where: {
          description: { not: null }
        }
      }),
      
      // Configs without description
      prisma.systemConfig.count({
        where: {
          description: null
        }
      }),
      
      // Updated today
      prisma.systemConfig.count({
        where: {
          updatedAt: { gte: today }
        }
      }),
      
      // Updated this week
      prisma.systemConfig.count({
        where: {
          updatedAt: { gte: thisWeek }
        }
      })
    ])

    return NextResponse.json({
      totalConfigs,
      recentlyUpdated,
      configsWithDescription,
      configsWithoutDescription,
      todayUpdated,
      thisWeekUpdated
    })
  } catch (error) {
    console.error('Error fetching system config metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
