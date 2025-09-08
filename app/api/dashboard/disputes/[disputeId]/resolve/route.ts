import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { disputeId: string } }
) {
  try {
    const { disputeId } = params
    const { resolution, status } = await request.json()

    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        resolution,
        status: status === 'resolved' ? 'RESOLVED' : 'CLOSED',
        resolvedAt: new Date()
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        involved: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      dispute: updatedDispute,
      resolvedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error resolving dispute:', error)
    return NextResponse.json(
      { error: 'Failed to resolve dispute' },
      { status: 500 }
    )
  }
}
