import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { packageId: string } }
) {
  try {
    const { packageId } = params

    // Find the package
    const existingPackage = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        sender: true,
        receiver: true,
        trip: true
      }
    })

    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Check if package can be cancelled
    if (existingPackage.status === 'DELIVERED') {
      return NextResponse.json(
        { error: 'Cannot cancel a delivered package' },
        { status: 400 }
      )
    }

    if (existingPackage.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Package is already cancelled' },
        { status: 400 }
      )
    }

    // Cancel the package
    const cancelledPackage = await prisma.package.update({
      where: { id: packageId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      },
      include: {
        sender: true,
        receiver: true,
        trip: true
      }
    })

    // TODO: Send notifications to sender and traveler
    // TODO: Handle refunds if applicable

    return NextResponse.json({
      success: true,
      package: cancelledPackage,
      message: 'Package cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling package:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
