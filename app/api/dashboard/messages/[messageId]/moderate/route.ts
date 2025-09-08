import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { messageId } = params
    const { action, reason } = await request.json()

    let updateData: any = {}

    switch (action) {
      case 'hide':
      case 'archive':
        updateData = {
          isDeleted: true
        }
        break
      case 'flag':
        updateData = {
          isDeleted: true
        }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: updateData,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Create audit log or notification if needed
    // This could be extended to log moderation actions

    return NextResponse.json({
      message: updatedMessage,
      action,
      reason,
      moderatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error moderating message:', error)
    return NextResponse.json(
      { error: 'Failed to moderate message' },
      { status: 500 }
    )
  }
}
