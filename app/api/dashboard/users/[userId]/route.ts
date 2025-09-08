import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Don't allow deleting admin users
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      )
    }

    // Delete user and related data
    await prisma.$transaction(async (tx) => {
      // Delete related verification documents first
      await tx.verificationDocument.deleteMany({
        where: { userId }
      })

      // Delete user profile if exists
      await tx.userProfile.deleteMany({
        where: { userId }
      })

      // Delete packages related to the user
      await tx.package.deleteMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      })

      // Delete trips related to the user
      await tx.trip.deleteMany({
        where: { travelerId: userId }
      })

      // Delete transactions related to the user
      await tx.transaction.deleteMany({
        where: { userId }
      })

      // Delete user reviews
      await tx.review.deleteMany({
        where: {
          OR: [
            { giverId: userId },
            { receiverId: userId }
          ]
        }
      })

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'User and all related data deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
