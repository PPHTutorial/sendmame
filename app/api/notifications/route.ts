import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createErrorResponse, createSuccessResponse } from '@/lib/api/utils'

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const userPayload = await requireAuth(request)
    const userId = userPayload.userId

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const offset = (page - 1) * limit

    const whereClause = {
      userId: userId,
      isDeleted: false,
      ...(unreadOnly && { isRead: false })
    }

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        //skip: offset,
        //take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      }),
      prisma.notification.count({
        where: whereClause
      })
    ])

    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
        isDeleted: false
      }
    })

    return createSuccessResponse({
      notifications,
      pagination: {
        page,
        //limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      unreadCount
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return createErrorResponse('Failed to fetch notifications', 500)
  }
}

// POST /api/notifications - Create a notification (admin/system use)
export async function POST(request: NextRequest) {
  try {
    const _userPayload = await requireAuth(request)
    const { type, title, message, userId: targetUserId, packageId, tripId, chatId, metadata } = await request.json()

    if (!type || !title || !message || !targetUserId) {
      return createErrorResponse('Missing required fields: type, title, message, userId', 400)
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId: targetUserId,
        packageId,
        tripId,
        chatId,
        metadata: metadata || {}
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    return createSuccessResponse(notification, 'Notification created successfully')
  } catch (error) {
    console.error('Error creating notification:', error)
    return createErrorResponse('Failed to create notification', 500)
  }
}