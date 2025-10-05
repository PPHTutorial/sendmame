import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
});

// Map plan IDs to subscription tiers
const planMapping: Record<string, string> = {
    free: 'FREE',
    standard: 'STANDARD',
    premium: 'PREMIUM'
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const headersList = await headers()
        const signature = headersList.get('stripe-signature') as string;
      
        // Verify the webhook signature
        let event;
        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err: any) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
        }

        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            // Make sure the session is paid
            if (session.payment_status !== 'paid') {
                return NextResponse.json({ success: false, message: 'Payment not completed' });
            }

            // Get the user from the client_reference_id
            const userId = session.client_reference_id;
            if (!userId) {
                console.error('No userId found in the session');
                return NextResponse.json(
                    { error: 'No user ID found in the session' },
                    { status: 400 }
                );
            }

            // Extract plan ID from metadata
            const planId = session.metadata?.planId;
            if (!planId) {
                console.error('No plan ID found in the session metadata');
                return NextResponse.json(
                    { error: 'No plan ID found in the session metadata' },
                    { status: 400 }
                );
            }

            const subscriptionTier = planMapping[planId];
            if (!subscriptionTier) {
                console.error(`Invalid plan ID: ${planId}`);
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

            // 1. Create the transaction record
            const transaction = await prisma.transaction.create({
                data: {
                    userId: userId,
                    type: 'PAYMENT',
                    amount: amount,
                    currency: session.currency?.toUpperCase() || 'GBP',
                    status: 'COMPLETED',
                    description: `Subscription payment for ${subscriptionTier} plan`,
                    gatewayId: paymentIntent,
                    processedAt: new Date(),
                    netAmount: amount,
                    metadata: JSON.stringify({
                        sessionId: session.id,
                        planId: planId,
                        stripeCustomerId: session.customer,
                    })
                }
            });
            
            // 2. Update the user record
            await prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionTier: subscriptionTier,
                    subscriptionStatus: 'ACTIVE',
                    stripeCustomerId: session.customer as string,
                    lastPaymentDate: new Date(),
                }
            });
            
            // 3. Store payment data in SubscriptionPayment
            // Note: This requires running prisma db push first to create the table
            // Once the Prisma client is updated, uncomment this code
            /*
            await prisma.subscriptionPayment.create({
                data: {
                    userId: userId,
                    subscriptionTier: subscriptionTier,
                    amount: amount,
                    currency: session.currency?.toUpperCase() || 'GBP',
                    startDate: new Date(),
                    endDate: endDate,
                    stripeSessionId: session.id,
                    stripeCustomerId: session.customer as string,
                    stripePaymentIntentId: paymentIntent,
                    transactionId: transaction.id,
                    description: `${subscriptionTier} plan subscription payment`,
                    metadata: JSON.stringify({
                        sessionId: session.id,
                        planId: planId,
                    })
                }
            });
            */

            return NextResponse.json({
                success: true,
                message: 'Payment processed successfully'
            });
        }

        // For other event types, just acknowledge receipt
        return NextResponse.json({ success: true, message: 'Event received' });

    } catch (error) {
        console.error('Error handling webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}