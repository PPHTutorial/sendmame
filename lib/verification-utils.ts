// Amenade Platform - Verification Utilities
import prisma from '@/lib/prisma'

/**
 * Checks if all verification types are complete and updates overall verification status
 */
export async function updateOverallVerificationStatus(userId: string, tx?: any) {
  const db = tx || prisma

  // Get current verification status
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      isPhoneVerified: true,
      isEmailVerified: true,
      isIDVerified: true,
      isFacialVerified: true,
      isAddressVerified: true,
      isVerified: true,
    }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Check if all verifications are complete
  const allVerificationsComplete = 
    user.isPhoneVerified &&
    user.isEmailVerified &&
    user.isIDVerified &&
    user.isFacialVerified &&
    user.isAddressVerified

  // Update overall verification status only if all are complete and not already verified
  if (allVerificationsComplete && !user.isVerified) {
    await db.user.update({
      where: { id: userId },
      data: { isVerified: true }
    })
    return { wasUpdated: true, isNowFullyVerified: true }
  }

  // If not all complete but currently marked as verified, unmark it
  if (!allVerificationsComplete && user.isVerified) {
    await db.user.update({
      where: { id: userId },
      data: { isVerified: false }
    })
    return { wasUpdated: true, isNowFullyVerified: false }
  }

  return { wasUpdated: false, isNowFullyVerified: allVerificationsComplete }
}

/**
 * Get verification progress for a user
 */
export async function getVerificationProgress(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPhoneVerified: true,
      isEmailVerified: true,
      isIDVerified: true,
      isFacialVerified: true,
      isAddressVerified: true,
      isVerified: true,
    }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const verifications = [
    { type: 'email', completed: user.isEmailVerified },
    { type: 'phone', completed: user.isPhoneVerified },
    { type: 'id', completed: user.isIDVerified },
    { type: 'facial', completed: user.isFacialVerified },
    { type: 'address', completed: user.isAddressVerified },
  ]

  const completedCount = verifications.filter(v => v.completed).length
  const totalCount = verifications.length
  const progressPercentage = Math.round((completedCount / totalCount) * 100)

  return {
    verifications,
    completedCount,
    totalCount,
    progressPercentage,
    isFullyVerified: user.isVerified,
    allComplete: completedCount === totalCount,
  }
}

/**
 * Verification types enum for consistency
 */
export const VerificationTypes = {
  EMAIL: 'email',
  PHONE: 'phone',
  ID: 'id',
  FACIAL: 'facial',
  ADDRESS: 'address',
} as const

export type VerificationType = typeof VerificationTypes[keyof typeof VerificationTypes]
