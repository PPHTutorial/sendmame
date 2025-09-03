import { NextRequest, NextResponse } from 'next/server'
import { verifyCode } from '@/lib/sms-verification'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { updateOverallVerificationStatus } from '@/lib/verification-utils'

interface SMSVerifyRequest {
    phoneNumber: string
    code: string
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const authPayload = await requireAuth(request)
        const userId = authPayload.userId

        const body: SMSVerifyRequest = await request.json()
        const { phoneNumber, code } = body

      

        // Validate input
        if (!phoneNumber || !code) {
            return NextResponse.json(
                { success: false, error: 'Phone number and verification code are required' },
                { status: 400 }
            )
        }

        // Find user by phone number and verify they own this phone
        const user = await prisma.user.findFirst({
            where: { 
                id: userId,
                phone: phoneNumber 
            }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Phone number not found or does not belong to your account' },
                { status: 404 }
            )
        }

        if (user.isPhoneVerified) {
            return NextResponse.json(
                { success: false, error: 'Phone number is already verified' },
                { status: 400 }
            )
        }

        // Verify the code using the shared verification function
        
        const isValid = verifyCode(phoneNumber, code, userId)

        if (await isValid) {
            // Update database to mark phone as verified
            await prisma.$transaction(async (tx) => {
                // Update phone verification status
                await tx.user.update({
                    where: { id: user.id },
                    data: { isPhoneVerified: true }
                })

                // Check and update overall verification status
                await updateOverallVerificationStatus(user.id, tx)
            })

            return NextResponse.json({
                success: true,
                message: 'Phone number verified successfully'
            })
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid or expired verification code' },
                { status: 400 }
            )
        }

    } catch (error) {
        console.error('SMS verification error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
