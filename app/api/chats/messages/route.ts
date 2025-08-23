import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/chats/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const userPayload = await requireAuth(request)
    const userId = userPayload.userId

    const { chatId, content } = await request.json()

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
      return NextResponse.json({ error: 'Chat not found or access denied' }, { status: 404 })
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
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

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
      return NextResponse.json(
        { error: 'Missing required parameter: chatId' },
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
      return NextResponse.json({ error: 'Chat not found or access denied' }, { status: 404 })
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

    return NextResponse.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
