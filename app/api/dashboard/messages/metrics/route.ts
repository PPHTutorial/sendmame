import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const [
      totalMessages,
      totalChats,
      activeChats,
      todayMessages,
      flaggedMessages
    ] = await Promise.all([
      // Total messages
      prisma.message.count(),
      
      // Total chats
      prisma.chat.count(),
      
      // Active chats
      prisma.chat.count({
        where: { isActive: true }
      }),
      
      // Today's messages
      prisma.message.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Flagged/deleted messages
      prisma.message.count({
        where: { isDeleted: true }
      })
    ])

    return NextResponse.json({
      totalMessages,
      totalChats,
      activeChats,
      todayMessages,
      flaggedMessages
    })
  } catch (error) {
    console.error('Error fetching messages metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
