import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * API route to check and update subscription statuses
 * This should be called by a scheduled job (e.g., cron job)
 * To protect this endpoint, we use a secret key for authentication
 */
export async function POST(request: NextRequest) {
    try {
        // Get API key from request headers for security
        const apiKey = request.headers.get('x-api-key');
        
        // Check if API key is valid
        if (apiKey !== process.env.SUBSCRIPTION_CRON_API_KEY) {
            return NextResponse.json({ 
                success: false, 
                message: 'Unauthorized' 
            }, { status: 401 });
        }
        
        // Find all users with subscriptions that need to be checked
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        // Get users with active subscriptions that have expired
        const expiredSubscriptions = await prisma.user.findMany({
            where: {
                subscriptionStatus: 'ACTIVE',
                subscriptionTier: { not: 'FREE' },
                lastPaymentDate: {
                    lt: oneMonthAgo
                }
            },
            select: {
                id: true,
                email: true,
                subscriptionTier: true,
                lastPaymentDate: true
            }
        });
        
        // Update all expired subscriptions to inactive
        if (expiredSubscriptions.length > 0) {
            await prisma.user.updateMany({
                where: {
                    id: {
                        in: expiredSubscriptions.map(user => user.id)
                    }
                },
                data: {
                    subscriptionStatus: 'INACTIVE',
                    subscriptionTier: 'FREE'
                }
            });
            
            // TODO: Send email notifications to users about expired subscriptions
            console.log(`Updated ${expiredSubscriptions.length} expired subscriptions`);
        }
        
        return NextResponse.json({
            success: true,
            message: `Updated ${expiredSubscriptions.length} expired subscriptions`
        });
    } catch (error) {
        console.error('Error in subscription update cron:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update subscriptions' },
            { status: 500 }
        );
    }
}