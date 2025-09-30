import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

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

    const packages = await prisma.package.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        finalPrice: true,
        createdAt: true,
      }
    })

    const trips = await prisma.trip.findMany({
      where: { travelerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      }
    })

    const transactions = await prisma.transaction.findMany({
      where: { 
        userId: userId,
        type: 'PAYMENT'
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        description: true,
        amount: true,
        status: true,
        createdAt: true,
      }
    })

    const formattedPackages = packages.map(p => ({
      id: p.id,
      type: 'package_posted',
      title: 'New package posted',
      description: p.title,
      time: dayjs(p.createdAt).fromNow(),
      status: p.status.toLowerCase(),
      amount: p.finalPrice ? `$${p.finalPrice}` : null,
      createdAt: p.createdAt,
    }))

    const formattedTrips = trips.map(t => ({
      id: t.id,
      type: 'trip_posted',
      title: 'New trip posted',
      description: t.title,
      time: dayjs(t.createdAt).fromNow(),
      status: t.status.toLowerCase(),
      amount: null,
      createdAt: t.createdAt,
    }))

    const formattedTransactions = transactions.map(t => ({
      id: t.id,
      type: 'payment_received',
      title: 'Payment received',
      description: t.description || 'Payment for service',
      time: dayjs(t.createdAt).fromNow(),
      status: t.status.toLowerCase(),
      amount: `$${t.amount}`,
      createdAt: t.createdAt,
    }))

    const allActivities = [
      ...formattedPackages,
      ...formattedTrips,
      ...formattedTransactions,
    ]

    const sortedActivities = allActivities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    return NextResponse.json(sortedActivities)
  } catch (error) {
    console.error('Failed to fetch user activity:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
