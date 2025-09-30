import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

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

    // We can add more fields to be returned for the public profile
    const publicProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      profile: {
        profilePicture: user.profile?.profilePicture,
        bio: user.profile?.bio,
        occupation: user.profile?.occupation,
        currentCity: user.profile?.currentCity,
        currentCountry: user.profile?.currentCountry,
        languages: user.profile?.languages,
        senderRating: user.profile?.senderRating,
        travelerRating: user.profile?.travelerRating,
      },
      memberSince: user.createdAt,
      verificationStatus: user.verificationStatus,
    }

    return NextResponse.json(publicProfile)
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
