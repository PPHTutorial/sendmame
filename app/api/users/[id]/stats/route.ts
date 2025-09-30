import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import dayjs from 'dayjs'

const paramsSchema = z.object({
  id: z.string()//.cuid({ message: "Invalid user ID" }),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validation = paramsSchema.safeParse(await params)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid user ID format', details: validation.error.errors },
        { status: 400 }
      )
    }

    const userId = validation.data.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const totalPackagesSent = await prisma.package.count({
      where: { senderId: userId },
    })

    const totalTripsCompleted = await prisma.trip.count({
      where: { 
        travelerId: userId,
        status: 'COMPLETED'
      },
    })
    
    const totalReviews = await prisma.review.count({
        where: { receiverId: userId }
    })

    // Mock response time for now
    const responseTime = '< 1 hour'

    const stats = {
      totalPackagesSent,
      totalTripsCompleted,
      senderRating: user.profile?.senderRating || 0,
      travelerRating: user.profile?.travelerRating || 0,
      successRate: user.profile?.successRate || 0,
      totalDeliveries: user.profile?.totalDeliveries || 0,
      memberSince: dayjs(user.createdAt).format('YYYY'),
      verificationStatus: user.verificationStatus,
      totalReviews,
      responseTime,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch user stats:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
