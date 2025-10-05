import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createErrorResponse, createSuccessResponse } from '@/lib/api/utils'

// POST /api/chats/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const userPayload = await requireAuth(request)
    const userId = userPayload.userId

    const { chatId, content, attachments, type } = await request.json()

    if (!chatId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: chatId, content' },
        { status: 400 }
      )
    }

    // Verify user is participant in the chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            userId: userId
          }
        }
      }
    })

    if (!chat) {
      return createErrorResponse('Chat not found or access denied', 404)
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        attachments: attachments || [],
        messageType: type || 'text',
        senderId: userId,
        chatId: chatId
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
    })

    // Update chat's last activity
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    })

    return createSuccessResponse(message, 'Message sent successfully')
  } catch (error) {
    console.error('Error sending message:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

// GET /api/chats/messages - Get messages for a chat
export async function GET(request: NextRequest) {
  try {
    const userPayload = await requireAuth(request)
    const userId = userPayload.userId

    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!chatId) {
      return createErrorResponse('Missing required parameter: chatId', 400)
    }

    // Verify user is participant in the chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            userId: userId
          }
        }
      }
    })

    if (!chat) {
      return createErrorResponse('Chat not found or access denied', 404)
    }

    // Get messages with pagination
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
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
    })

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: { chatId }
    })

    return createSuccessResponse({
      data: messages.reverse(),
      messages: 'Messages fetched successfully',
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return createErrorResponse('Internal server error', 500)
  }
}
