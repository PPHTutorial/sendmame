import { User } from '@prisma/client';
import prisma from './prisma';
import { pricingPlans } from '@/app/subscription/page';

/**
 * Checks and updates user subscription status based on:
 * 1. Time elapsed since last payment (subscription expires after 1 month)
 * 2. Number of posts used compared to allowed maximum
 * 
 * @param userId The ID of the user to check
 * @returns An object containing the user's current status, remaining posts, and if they need to resubscribe
 */
export async function checkSubscriptionStatus(userId: string) {
  try {
    // Get user and their current subscription details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if subscription needs to be updated
    const needsUpdate = await shouldUpdateSubscription(user);
    
    if (needsUpdate) {
      // Reset to free tier if subscription expired or posts exhausted
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: 'FREE',
          subscriptionStatus: 'INACTIVE',
        },
      });

      return {
        currentTier: 'FREE',
        isSubscriptionActive: false,
        remainingPosts: 3, // Free tier posts
        needsResubscribe: true,
        reason: needsUpdate.reason
      };
    }

    // Get remaining posts count
    const remainingPosts = await getRemainingPosts(user);
    
    // If user has no more posts remaining, update status
    if (remainingPosts <= 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'INACTIVE',
        },
      });

      return {
        currentTier: user.subscriptionTier,
        isSubscriptionActive: false,
        remainingPosts: 0,
        needsResubscribe: true,
        reason: 'You have used all your available posts for this subscription period.'
      };
    }

    return {
      currentTier: user.subscriptionTier,
      isSubscriptionActive: user.subscriptionStatus === 'ACTIVE',
      remainingPosts,
      needsResubscribe: false,
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    throw error;
  }
}

/**
 * Determines if a user's subscription should be updated based on time elapsed and usage
 */
async function shouldUpdateSubscription(user: User): Promise<{ update: boolean; reason: string } | false> {
  // Check if subscription has expired (more than 1 month since last payment)
  if (user.lastPaymentDate) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (user.lastPaymentDate < oneMonthAgo) {
      return {
        update: true,
        reason: 'Your subscription has expired. Please renew to continue enjoying premium features.'
      };
    }
  }

  // Free tier users don't need subscription updates based on time
  if (user.subscriptionTier === 'FREE') {
    return false;
  }

  // Check if the user has exhausted their posts
  const remainingPosts = await getRemainingPosts(user);
  
  if (remainingPosts <= 0) {
    return {
      update: true,
      reason: 'You have used all your available posts for this subscription period.'
    };
  }

  return false;
}

/**
 * Calculate how many posts a user has left in their current subscription period
 */
async function getRemainingPosts(user: User): Promise<number> {
  // Get the maximum number of posts allowed for this user's tier
  let maxPosts = 3; // Default free tier
  
  const planDetails = pricingPlans.find(plan => {
    return plan.id.toUpperCase() === user.subscriptionTier;
  });
  
  if (planDetails) {
    maxPosts = planDetails.maxPost;
  }

  // If not subscribed or inactive, return 0
  if (!user.lastPaymentDate || user.subscriptionStatus !== 'ACTIVE') {
    return 0;
  }

  // Only count posts created after the last payment date
  const [packageCount, tripCount] = await Promise.all([
    prisma.package.count({
      where: {
        senderId: user.id,
        createdAt: {
          gte: user.lastPaymentDate
        }
      }
    }),
    prisma.trip.count({
      where: {
        travelerId: user.id,
        createdAt: {
          gte: user.lastPaymentDate
        }
      }
    })
  ]);

  // Total posts used (packages + trips)
  const postsUsed = packageCount + tripCount;
  
  // Remaining posts
  return Math.max(0, maxPosts - postsUsed);
}

/**
 * Middleware-friendly function to verify subscription before posting
 * Returns true if user can post, false if they need to subscribe
 */
export async function canUserPost(userId: string): Promise<{
  canPost: boolean;
  message?: string;
  remainingPosts?: number;
  currentTier?: string;
}> {
  try {
    const status = await checkSubscriptionStatus(userId);
    
    if (!status.isSubscriptionActive || status.needsResubscribe) {
      return {
        canPost: false,
        message: status.reason || 'Your subscription needs to be renewed before posting.',
        currentTier: status.currentTier || undefined
      };
    }
    
    if (status.remainingPosts <= 0) {
      return {
        canPost: false,
        message: 'You have used all your available posts for this subscription period.',
        remainingPosts: 0,
        currentTier: status.currentTier || undefined
      };
    }
    
    return {
      canPost: true,
      remainingPosts: status.remainingPosts,
      currentTier: status.currentTier || undefined
    };
  } catch (error) {
    console.error('Error checking if user can post:', error);
    return {
      canPost: false,
      message: 'Could not verify subscription status. Please try again later.'
    };
  }
}