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
    const status = searchParams.get('status')

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          message: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
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
      ]
    }

    if (type) {
      where.type = type
    }

    if (status) {
      switch (status) {
        case 'read':
          where.isRead = true
          break
        case 'unread':
          where.isRead = false
          break
      }
    }

    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc'
        },
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
      }),
      prisma.notification.count({ where })
    ])

    // Transform notifications to include proper date formatting
    const transformedNotifications = notifications.map(notification => ({
      ...notification,
      sentAt: notification.createdAt.toISOString(),
      readAt: notification.readAt?.toISOString(),
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString()
    }))

    return NextResponse.json({
      notifications: transformedNotifications,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (data.target === 'all') {
      // Send to all users
      const users = await prisma.user.findMany({
        select: { id: true }
      })
      
      const notifications = await Promise.all(
        users.map(user => 
          prisma.notification.create({
            data: {
              userId: user.id,
              type: data.type,
              title: data.title,
              message: data.message,
              metadata: data.data || {},
              isRead: false
            },
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
          })
        )
      )
      
      return NextResponse.json({ 
        notifications, 
        count: notifications.length 
      }, { status: 201 })
    } else {
      // Send to specific users
      const notifications = await Promise.all(
        (data.userIds || []).map((userId: string) =>
          prisma.notification.create({
            data: {
              userId,
              type: data.type,
              title: data.title,
              message: data.message,
              metadata: data.data || {},
              isRead: false
            },
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
          })
        )
      )

      return NextResponse.json({ 
        notifications, 
        count: notifications.length 
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating notifications:', error)
    return NextResponse.json(
      { error: 'Failed to create notifications' },
      { status: 500 }
    )
  }
}
