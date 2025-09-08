import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
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
        receiver: true
      }
    })

    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Check if package can be deleted (e.g., not in transit)
    if (existingPackage.status === 'IN_TRANSIT') {
      return NextResponse.json(
        { error: 'Cannot delete a package that is in transit' },
        { status: 400 }
      )
    }

    // Delete package and related data
    await prisma.$transaction(async (tx) => {
      // Delete tracking events
      await tx.trackingEvent.deleteMany({
        where: { packageId }
      })

      // Delete chats related to the package
      await tx.chat.deleteMany({
        where: { packageId }
      })

      // Finally delete the package
      await tx.package.delete({
        where: { id: packageId }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Package and all related data deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
