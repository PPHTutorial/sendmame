import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'


const assignmentSchema = z.object({
    packageId: z.string(),
    tripId: z.string(),
    confirmations: z.object({
        legalCompliance: z.boolean(),
        damageInspection: z.boolean(),
        accurateDescription: z.boolean(),
        safetyMeasures: z.boolean(),
        termsAcceptance: z.boolean()
    }),

    userId: z.string(),
    confirmationType: z.enum(['ASSIGNMENT', 'PICKUP', 'DELIVERY']),
    notification: z.enum(['TO_TRIP', 'TO_PACKAGE'])
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        console.log('Assignment request body:', body)
        const { packageId, tripId, confirmations, userId, confirmationType, notification } = assignmentSchema.parse(body)

        // Verify all confirmations are true
        const allConfirmed = Object.values(confirmations).every(Boolean)
        if (!allConfirmed) {
            return NextResponse.json(
                { error: 'All safety confirmations must be accepted' },
                { status: 400 }
            )
        }

        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            // Get package and trip details
            const packageData = await tx.package.findUnique({
                where: { id: packageId },
                include: { sender: true }
            })

            const tripData = await tx.trip.findUnique({
                where: { id: tripId },
                include: { traveler: true }
            })

            if (!packageData || !tripData) {
                throw new Error('Package or trip not found')
            }

            // Check if package is already assigned
            if (packageData.tripId) {
                throw new Error('Package is already assigned to a trip')
            }

            // Check if trip has enough capacity
            const packageDimensions = packageData.dimensions as any
            const packageWeight = packageDimensions?.weight || 0
            /* if (tripData.availableSpace < packageWeight) {
                throw new Error('According to your lauggage weight space, this package cannot be added because it exceeds the required space/dimension')
            } */

            // Update package status and assign to trip
            const updatedPackage = await tx.package.update({
                where: { id: packageId },
                data: {
                    tripId,
                    status: 'MATCHED'
                },
                include: {
                    sender: true,
                    trip: {
                        include: { traveler: true }
                    }
                }
            })

            // Update trip available space
            await tx.trip.update({
                where: { id: tripId },
                data: {
                    availableSpace: tripData.availableSpace - packageWeight
                }
            })

            // Check if a chat already exists for this package and trip
            let chat = await tx.chat.findFirst({
                where: {
                    packageId,
                    tripId,
                    type: 'NOTIFICATION'
                },
                include: {
                    participants: {
                        include: { user: true }
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        include: { sender: true }
                    }
                }
            })

            // Create a chat for communication if it doesn't exist
            if (!chat) {
                chat = await tx.chat.create({
                    data: {
                        type: 'NOTIFICATION',
                        packageId,
                        tripId,
                        participants: {
                            create: [
                                { userId: packageData.senderId },
                                // { chatId: tripData.travelerId }
                            ]
                        }
                    },
                    include: {
                        participants: {
                            include: { user: true }
                        },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            include: { sender: true }
                        }
                    }
                })
            }

            // Create tracking event
            if (notification === 'TO_PACKAGE') {
                await tx.trackingEvent.create({
                    data: {
                        packageId,
                        event: 'MATCHED',
                        description: `Package matched with trip: ${tripData.title}`,
                        location: JSON.stringify(tripData.originAddress),
                        timestamp: new Date()
                    }
                })

                // Create notifications for both parties
                await tx.notification.create({
                    data: {
                        userId: packageData.senderId,
                        type: 'PACKAGE_MATCH',
                        title: 'Package Matched!',
                        message: `Your package "${packageData.title}" has been matched with a trip.`,
                        packageId: packageId
                    }
                })
            }

            await tx.notification.create({
                data: {
                    userId: tripData.travelerId,
                    type: 'TRIP_REQUEST',
                    title: 'New Package Assignment',
                    message: `A package has been assigned to your trip "${tripData.title}".`,
                    tripId: tripId
                }
            })

            // Log safety confirmations
            await tx.safetyConfirmation.create({
                data: {
                    packageId,
                    tripId,
                    userId: packageData.senderId, // Assuming sender made the assignment
                    confirmationType: 'ASSIGNMENT',
                    confirmations: JSON.stringify(confirmations),
                    confirmedAt: new Date()
                }
            })

            return {
                package: updatedPackage,
                chat,
                success: true
            }
        })

        return NextResponse.json(result)

    } catch (error) {
        console.error('Assignment error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Assignment failed' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') // 'available-trips' or 'available-packages'
        const userId = searchParams.get('userId')
        const packageId = searchParams.get('packageId')
        const tripId = searchParams.get('tripId')

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        if (type === 'available-trips' && packageId) {
            // Get available trips for a package
            const packageData = await prisma.package.findUnique({
                where: { id: packageId }
            })

            if (!packageData) {
                return NextResponse.json(
                    { error: 'Package not found' },
                    { status: 404 }
                )
            }

            const availableTrips = await prisma.trip.findMany({
                where: {
                    travelerId: userId,
                    status: 'POSTED',
                    availableSpace: {
                        gte: (packageData.dimensions as any)?.weight || 0
                    },
                    // Add route compatibility check if needed
                },
                include: {
                    traveler: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            profile: true
                        }
                    }
                },
                orderBy: {
                    departureDate: 'asc'
                }
            })

            return NextResponse.json({ trips: availableTrips })

        } else if (type === 'available-packages' && tripId) {
            // Get available packages for a trip
            const tripData = await prisma.trip.findUnique({
                where: { id: tripId }
            })

            if (!tripData) {
                return NextResponse.json(
                    { error: 'Trip not found' },
                    { status: 404 }
                )
            }

            const availablePackages = await prisma.package.findMany({
                where: {
                    senderId: userId,
                    status: 'POSTED',
                    tripId: null, // Not assigned yet
                    // Add route compatibility and weight checks
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            profile: true
                        }
                    }
                },
                orderBy: {
                    pickupDate: 'asc'
                }
            })

            return NextResponse.json({ packages: availablePackages })
        }

        return NextResponse.json(
            { error: 'Invalid request parameters' },
            { status: 400 }
        )

    } catch (error) {
        console.error('Get assignments error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch available assignments' },
            { status: 500 }
        )
    }
}
