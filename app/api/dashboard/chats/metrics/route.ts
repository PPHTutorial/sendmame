import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [
      totalChats,
      activeChats,
      todayChats,
      packageNegotiationChats,
      tripCoordinationChats,
      supportChats,
      totalMessages
    ] = await Promise.all([
      // Total chats count
      prisma.chat.count(),
      
      // Active chats count
      prisma.chat.count({
        where: { isActive: true }
      }),
      
      // Today's chats count
      prisma.chat.count({
        where: {
          createdAt: {
            gte: todayStart
          }
        }
      }),
      
      // Package negotiation chats
      prisma.chat.count({
        where: { type: 'PACKAGE_NEGOTIATION' }
      }),
      
      // Trip coordination chats
      prisma.chat.count({
        where: { type: 'TRIP_COORDINATION' }
      }),
      
      // Support chats
      prisma.chat.count({
        where: { type: 'SUPPORT' }
      }),
      
      // Total messages count
      prisma.message.count()
    ])

    const metrics = {
      totalChats,
      activeChats,
      todayChats,
      packageNegotiationChats,
      tripCoordinationChats,
      supportChats,
      totalMessages
    }

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Chats metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat metrics' },
      { status: 500 }
    )
  }
}
