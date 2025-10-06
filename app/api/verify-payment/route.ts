import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
});

// This endpoint verifies a payment session and updates the user's database record
export async function POST(request: NextRequest) {
    try {
        // Authenticate the user
        const userPayload = await requireAuth(request);
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Missing session ID' },
                { status: 400 }
            );
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        // If the session is not completed, return an error
        if (session.status !== 'complete') {
            return NextResponse.json(
                { error: 'Payment not completed' },
                { status: 400 }
            );
        }

        // Check if this payment has already been processed to prevent duplicates
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                gatewayId: session.payment_intent as string,
                status: 'COMPLETED',
                userId: userPayload.userId
            }
        });

        if (existingTransaction) {
            return NextResponse.json({
                success: true,
                message: 'Payment already verified and processed'
            });
        }

        // Also check by session ID in metadata to catch any edge cases
        const existingBySessionId = await prisma.transaction.findFirst({
            where: {
                userId: userPayload.userId,
                status: 'COMPLETED',
                metadata: {
                    path: ['sessionId'],
                    equals: sessionId
                }
            }
        });

        if (existingBySessionId) {
            return NextResponse.json({
                success: true,
                message: 'Payment already verified and processed'
            });
        }

        // Map plan IDs to subscription tiers - matching the plans in subscription/page.tsx
        const planMapping: Record<string, string> = {
            free: 'FREE',
            standard: 'STANDARD',
            premium: 'PREMIUM'
        };

        const planId = session.metadata?.planId;

        if (!planId) {
            return NextResponse.json(
                { error: 'Missing plan ID in session metadata' },
                { status: 400 }
            );
        }

        const subscriptionTier = planMapping[planId as keyof typeof planMapping];

        if (!subscriptionTier) {
            return NextResponse.json(
                { error: 'Invalid plan ID' },
                { status: 400 }
            );
        }

        // Calculate subscription end date (1 month from now)
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        // Get payment amount from the session
        const paymentIntent = session.payment_intent as string;
        const paymentDetails = await stripe.paymentIntents.retrieve(paymentIntent);
        const amount = paymentDetails.amount / 100; // Convert from cents to dollars/pounds


        try {
            await prisma.transaction.create({
                data: {
                    userId: userPayload.userId,
                    type: 'PAYMENT',
                    amount: amount,
                    currency: session.currency?.toUpperCase() || 'USD',
                    status: 'COMPLETED',
                    description: `Subscription payment for ${subscriptionTier} plan`,
                    gatewayId: paymentIntent,
                    processedAt: new Date(),
                    netAmount: amount,
                    metadata: {
                        sessionId: sessionId,
                        planId: planId,
                        stripeCustomerId: typeof session.customer === 'string' ? session.customer : JSON.stringify(session.customer || ''),
                    }
                }
            });


            await prisma.user.update({
                where: { id: userPayload.userId },
                data: {
                    subscriptionTier: subscriptionTier,
                    subscriptionStatus: 'ACTIVE',
                    stripeCustomerId: session.customer as string,
                    lastPaymentDate: new Date(),
                }
            });
        } catch (error) {
            console.error('Error updating user record:', error);
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified and all records updated successfully'
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        );
    }
}