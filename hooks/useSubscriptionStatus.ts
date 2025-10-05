import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook to check if a user can post new content based on their subscription
 * Returns subscription status, remaining posts, and functions to verify before posting
 */
export function useSubscriptionStatus() {
  const [status, setStatus] = useState<{
    canPost: boolean;
    remainingPosts: number;
    currentTier?: string;
    needsSubscription: boolean;
    loading: boolean;
    message?: string;
  }>({
    canPost: false,
    remainingPosts: 0,
    needsSubscription: false,
    loading: true,
  });

  const checkEligibility = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const response = await fetch('/api/check-post-eligibility', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setStatus({
          canPost: false,
          remainingPosts: data.remainingPosts || 0,
          currentTier: data.currentTier,
          needsSubscription: true,
          loading: false,
          message: data.message || 'Subscription check failed',
        });
        return false;
      }
      
      setStatus({
        canPost: data.success,
        remainingPosts: data.remainingPosts || 0,
        currentTier: data.currentTier,
        needsSubscription: !data.success,
        loading: false,
      });
      
      return data.success;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      setStatus({
        canPost: false,
        remainingPosts: 0,
        needsSubscription: true,
        loading: false,
        message: 'Failed to verify subscription status',
      });
      return false;
    }
  };

  // Load subscription status on mount
  useEffect(() => {
    checkEligibility();
  }, []);

  /**
   * Verify if the user can post before submitting a form
   * Shows toast notifications with subscription info if needed
   */
  const verifyBeforePost = async () => {
    const canPost = await checkEligibility();
    
    if (!canPost) {
      if (status.needsSubscription) {
        toast.error(
          status.message || 
          `You need to renew your subscription to continue posting. Your ${status.currentTier} plan has expired.`,
          { duration: 5000 }
        );
      } else if (status.remainingPosts <= 0) {
        toast.error(
          `You have used all your available posts (${status.remainingPosts}/${getMaxPosts(status.currentTier)}) for this period.`,
          { duration: 5000 }
        );
      }
      
      // Redirect to subscription page after a delay
      setTimeout(() => {
        window.location.href = '/subscription';
      }, 2000);
      
      return false;
    }
    
    return true;
  };

  /**
   * Get max posts based on subscription tier
   */
  const getMaxPosts = (tier?: string) => {
    switch (tier?.toUpperCase()) {
      case 'STANDARD':
        return 10;
      case 'PREMIUM':
        return 50;
      case 'FREE':
      default:
        return 3;
    }
  };

  return {
    ...status,
    checkEligibility,
    verifyBeforePost,
    maxPosts: getMaxPosts(status.currentTier),
  };
}