import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { packageId: string } }
) {
  try {
    const { packageId } = params
    const { status } = await request.json()

    // Validate status
    const validStatuses = ['DRAFT', 'POSTED', 'MATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'DISPUTED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Find the package
    const existingPackage = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        sender: true,
        receiver: true
      }
    })

    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Update package status
    const updatedPackage = await prisma.package.update({
      where: { id: packageId },
      data: {
        status: status,
        updatedAt: new Date(),
        // Set delivery date if marking as delivered
        ...(status === 'DELIVERED' && { deliveryDate: new Date() })
      },
      include: {
        sender: true,
        receiver: true,
        trip: true
      }
    })

    return NextResponse.json({
      success: true,
      package: updatedPackage,
      message: `Package status updated to ${status}`
    })
  } catch (error) {
    console.error('Error updating package status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
