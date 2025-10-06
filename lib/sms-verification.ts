// Server-side SMS verification storage using database
// Database-based storage for verification codes (following email verification pattern)

import prisma from '@/lib/prisma'

// Store verification code in database (server-side only)
export async function storeVerificationCode(phoneNumber: string, code: string, userId: string): Promise<void> {
    
    const expiresAt = new Date(Date.now() + (15 * 60 * 1000)) // 15 minutes
    
    // Upsert phone verification record
    await prisma.phoneVerification.upsert({
        where: { userId },
        create: {
            userId,
            phoneNumber,
            code,
            expiresAt,
            attempts: 0,
        },
        update: {
            phoneNumber,
            code,
            expiresAt,
            attempts: 0, // Reset attempts on new code
        }
    })

    console.log('Stored verification code for:', phoneNumber, 'User:', userId)
}

// Get verification code from database (server-side only)
export async function getStoredCode(phoneNumber: string): Promise<{ code: string; expiresAt: Date; userId: string; phoneNumber: string } | null> {
    const verification = await prisma.phoneVerification.findFirst({
        where: { 
            phoneNumber,
            expiresAt: { gte: new Date() } // Only get non-expired codes
        }
    })

    if (!verification) {
        return null
    }

    return {
        code: verification.code,
        expiresAt: verification.expiresAt,
        userId: verification.userId,
        phoneNumber: verification.phoneNumber
    }
}

// Verify code (server-side only)
export async function verifyCode(phoneNumber: string, code: string, userId: string): Promise<boolean> {
    const stored = await getStoredCode(phoneNumber)

    //console.log('Verifying code for:', phoneNumber, 'User:', userId, 'Stored:', stored)

    if (!stored) {
        return false
    }

    if (stored.expiresAt < new Date()) {
        await removeVerificationCode(phoneNumber)
        return false
    }

    // Verify user ID matches
    if (stored.userId !== userId) {
        return false
    }

    if (stored.code === code) {
        await removeVerificationCode(phoneNumber) // Remove code after successful verification
        return true
    }

    // Increment attempts
    await incrementAttempts(userId)
    return false
}

// Remove verification code from database (server-side only)
export async function removeVerificationCode(phoneNumber: string): Promise<void> {
    await prisma.phoneVerification.deleteMany({
        where: { phoneNumber }
    })
}

// Increment verification attempts
async function incrementAttempts(userId: string): Promise<void> {
    await prisma.phoneVerification.updateMany({
        where: { userId },
        data: { attempts: { increment: 1 } }
    })
}

// Clean up expired codes from database (server-side only)
export async function cleanupExpiredCodes(): Promise<void> {
    await prisma.phoneVerification.deleteMany({
        where: {
            expiresAt: { lt: new Date() }
        }
    })
}
