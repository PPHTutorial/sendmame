import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createErrorResponse, createSuccessResponse } from '@/lib/api/utils'

// PUT /api/notifications/read-all - Mark all notifications as read
export async function PUT(request: NextRequest) {
  try {
    const userPayload = await requireAuth(request)
    const userId = userPayload.userId

    // Mark all unread notifications as read
    const result = await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
        isDeleted: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return createSuccessResponse(
      { updatedCount: result.count },
      `${result.count} notifications marked as read`
    )
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return createErrorResponse('Failed to mark all notifications as read', 500)
  }
}