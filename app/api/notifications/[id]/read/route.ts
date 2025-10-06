import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createErrorResponse, createSuccessResponse } from '@/lib/api/utils'

// PUT /api/notifications/[id]/read - Mark notification as read
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = await requireAuth(request)
    const userId = userPayload.userId
    const notificationId = params.id

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: userId,
        isDeleted: false
      }
    })

    if (!notification) {
      return createErrorResponse('Notification not found', 404)
    }

    // Mark as read
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return createSuccessResponse(updatedNotification, 'Notification marked as read')
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return createErrorResponse('Failed to mark notification as read', 500)
  }
}