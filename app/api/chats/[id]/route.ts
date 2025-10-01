import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createErrorResponse, createSuccessResponse } from '@/lib/api/utils'

// GET /api/chats/[id] - Get specific chat with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userPayload = await requireAuth(request)
    const userId = userPayload.userId

    const chatId = params.id

    // Verify user is participant in the chat and get chat details
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
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
          where: {
            isDeleted: false
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
          },
          orderBy: {
            createdAt: 'asc'
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

    if (!chat) {
      return createErrorResponse('Chat not found', 404)
    }

    return createSuccessResponse(chat, 'Chat fetched successfully')
  } catch (error) {
    console.error('Error fetching chat:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
