import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const updateProfileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    otherName: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    bio: z.string().optional().nullable(),
    occupation: z.string().optional().nullable(),
    currentCity: z.string().optional().nullable(),
    currentCountry: z.string().optional().nullable(),
    languages: z.array(z.string()).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const session = await requireAuth(req)
        const { userId } = params

        if (!session || session.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const body = await req.json()
        const validation = updateProfileSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
        }

        console.log('Profile update data:', validation.data)
        const { firstName, lastName, otherName, username, bio, occupation, currentCity, currentCountry, languages, dateOfBirth } = validation.data;

        // Check if profile exists, if not create it
        const userProfile = await prisma.userProfile.findUnique({
            where: { userId },
        });

        const profileData = {
            bio,
            occupation,
            currentCity,
            currentCountry,
            languages,
        };

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                otherName,
                dateOfBirth,
                username,
                profile: {
                    [userProfile ? 'update' : 'create']: profileData,
                },
            },
            include: {
                profile: true,
            },
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Error updating profile:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.flatten() }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
