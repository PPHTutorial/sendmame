import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const body = await request.json()
    const { subject, message } = body

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true 
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create a notification for the user
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'MESSAGE_RECEIVED',
        title: `Message from Admin: ${subject}`,
        message: message,
        isRead: false
      }
    })

    // In a real application, you would also send an email
    // TODO: Send email notification
    // await sendEmailNotification(user.email, subject, message)

    return NextResponse.json({
      success: true,
      message: `Message sent successfully to ${user.firstName} ${user.lastName}`
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
