import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const isActiveParam = searchParams.get('isActive')
    const dateRange = searchParams.get('dateRange')

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        {
          participants: {
            some: {
              user: {
                OR: [
                  {
                    firstName: {
                      contains: search,
                      mode: 'insensitive'
                    }
                  },
                  {
                    lastName: {
                      contains: search,
                      mode: 'insensitive'
                    }
                  },
                  {
                    email: {
                      contains: search,
                      mode: 'insensitive'
                    }
                  }
                ]
              }
            }
          }
        },
        {
          package: {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          trip: {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    if (type) {
      where.type = type
    }

    if (isActiveParam !== null && isActiveParam !== '') {
      where.isActive = isActiveParam === 'true'
    }

    if (dateRange) {
      const now = new Date()
      let startDate: Date

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3)
          startDate = new Date(now.getFullYear(), quarter * 3, 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(0)
      }

      where.createdAt = {
        gte: startDate
      }
    }

    // Get chats with pagination
    const [chats, total] = await Promise.all([
      prisma.chat.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          lastMessageAt: 'desc'
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          package: {
            select: {
              id: true,
              title: true,
              status: true
            }
          },
          trip: {
            select: {
              id: true,
              title: true,
              status: true
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 3,
            include: {
              sender: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          _count: {
            select: {
              messages: true
            }
          }
        }
      }),
      prisma.chat.count({ where })
    ])

    return NextResponse.json({
      chats,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page < Math.ceil(total / pageSize),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const chat = await prisma.chat.create({
      data: {
        type: data.type || 'PACKAGE_NEGOTIATION',
        packageId: data.packageId || null,
        tripId: data.tripId || null,
        lastMessageAt: new Date(),
        isActive: true,
        participants: {
          create: data.participantUserIds?.map((userId: string) => ({
            userId
          })) || []
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        package: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        trip: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 3,
          include: {
            sender: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    return NextResponse.json(chat, { status: 201 })
  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    )
  }
}
