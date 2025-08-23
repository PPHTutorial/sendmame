import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/chats - Get user's chats
export async function GET(request: NextRequest) {
  try {
    const userPayload = await requireAuth(request)
    const userId = userPayload.userId

    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
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
                avatar: true,
                email: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
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
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    })

    return NextResponse.json(chats)
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/chats - Create or find existing chat
export async function POST(request: NextRequest) {
  try {
    const userPayload = await requireAuth(request)
    const userId = userPayload.userId
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { participantId, itemType, itemId } = await request.json()

    if (!participantId || !itemType || !itemId) {
      return NextResponse.json(
        { error: 'Missing required fields: participantId, itemType, itemId' },
        { status: 400 }
      )
    }

    // Check if chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [
          itemType === 'package' ? { packageId: itemId } : { tripId: itemId },
          {
            participants: {
              every: {
                OR: [
                  { userId: userId },
                  { userId: participantId }
                ]
              }
            }
          },
          {
            participants: {
              some: { userId: userId }
            }
          },
          {
            participants: {
              some: { userId: participantId }
            }
          }
        ]
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                email: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
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
        }
      }
    })

    if (existingChat) {
      return NextResponse.json(existingChat)
    }

    // Create new chat
    const newChat = await prisma.chat.create({
      data: {
        type: itemType === 'package' ? 'PACKAGE_NEGOTIATION' : 'TRIP_COORDINATION',
        packageId: itemType === 'package' ? itemId : null,
        tripId: itemType === 'trip' ? itemId : null,
        participants: {
          create: [
            { userId: userId },
            { userId: participantId }
          ]
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
                avatar: true,
                email: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
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
        }
      }
    })

    return NextResponse.json(newChat)
  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
