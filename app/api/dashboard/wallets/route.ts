import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search')
    const locked = searchParams.get('locked')
    const balance = searchParams.get('balance')

    // Build where clause
    const where: any = {}

    // Search filter
    if (search) {
      where.OR = [
        { user: { 
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }},
        { id: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Lock filter
    if (locked) {
      where.isLocked = locked === 'locked' ? true : false
    }

    // Balance filter
    if (balance) {
      switch (balance) {
        case 'high':
          where.balance = { gt: 1000 }
          break
        case 'medium':
          where.balance = { gte: 100, lte: 1000 }
          break
        case 'low':
          where.balance = { gt: 0, lt: 100 }
          break
        case 'zero':
          where.balance = { equals: 0 }
          break
      }
    }

    // Get wallets with pagination
    const [wallets, total] = await Promise.all([
      prisma.wallet.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          },
          _count: {
            select: {
              transactions: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.wallet.count({ where })
    ])

    return NextResponse.json({
      success: true,
      wallets,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    })

  } catch (error) {
    console.error('Wallets API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, currency = 'USD', initialBalance = 0 } = body

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if wallet already exists
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId }
    })

    if (existingWallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet already exists for this user' },
        { status: 400 }
      )
    }

    // Create wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        currency,
        balance: parseFloat(initialBalance.toString())
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            transactions: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      wallet
    })

  } catch (error) {
    console.error('Create wallet error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create wallet' },
      { status: 500 }
    )
  }
}
