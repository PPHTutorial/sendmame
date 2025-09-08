import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [
      totalAccounts,
      emailVerified,
      phoneVerified,
      todayRegistrations,
      googleAccounts,
      facebookAccounts,
      appleAccounts,
      twoFactorEnabled
    ] = await Promise.all([
      // Total linked accounts
      prisma.account.count(),
      
      // Email verified users with accounts
      prisma.account.count({
        where: {
          user: {
            isEmailVerified: true
          }
        }
      }),
      
      // Phone verified users with accounts
      prisma.account.count({
        where: {
          user: {
            isPhoneVerified: true
          }
        }
      }),
      
      // Today's registrations
      prisma.account.count({
        where: {
          user: {
            createdAt: {
              gte: startOfToday
            }
          }
        }
      }),
      
      // Google accounts
      prisma.account.count({
        where: { provider: 'google' }
      }),
      
      // Facebook accounts
      prisma.account.count({
        where: { provider: 'facebook' }
      }),
      
      // Apple accounts
      prisma.account.count({
        where: { provider: 'apple' }
      }),
      
      // Two-factor enabled accounts
      prisma.account.count({
        where: {
          user: {
            twoFactorEnabled: true
          }
        }
      })
    ])

    return NextResponse.json({
      totalAccounts,
      emailVerified,
      phoneVerified,
      todayRegistrations,
      googleAccounts,
      facebookAccounts,
      appleAccounts,
      twoFactorEnabled
    })

  } catch (error) {
    console.error('Error fetching account metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account metrics' },
      { status: 500 }
    )
  }
}
