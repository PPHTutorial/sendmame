import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { canUserPost } from '@/lib/subscription';

/**
 * Middleware to verify subscription status before allowing users to post
 * Checks if user has an active subscription and available post slots
 */
export async function POST(request: NextRequest) {
    try {
        // Authenticate the user
        const userPayload = await requireAuth(request);
        
        // Check if user can post based on their subscription status
        const postStatus = await canUserPost(userPayload.userId);
        
        if (!postStatus.canPost) {
            return NextResponse.json({
                success: false,
                message: postStatus.message,
                remainingPosts: postStatus.remainingPosts || 0,
                currentTier: postStatus.currentTier,
                needsSubscription: true
            }, { status: 403 });
        }
        
        // If they can post, return the status and remaining posts
        return NextResponse.json({
            success: true,
            remainingPosts: postStatus.remainingPosts,
            currentTier: postStatus.currentTier
        });
    } catch (error) {
        console.error('Error checking posting eligibility:', error);
        return NextResponse.json(
            { 
                success: false,
                message: 'Failed to verify posting eligibility',
            },
            { status: 500 }
        );
    }
}