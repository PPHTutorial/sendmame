import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const headersList = await headers()
        const sig = headersList.get('stripe-signature')

        if (!sig) {
            return NextResponse.json({ error: 'No signature' }, { status: 400 })
        }

        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message)
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session
                await handleCheckoutCompleted(session)
                break

            case 'invoice.payment_succeeded':
                const invoice = event.data.object as Stripe.Invoice
                await handlePaymentSucceeded(invoice)
                break

            case 'invoice.payment_failed':
                const failedInvoice = event.data.object as Stripe.Invoice
                await handlePaymentFailed(failedInvoice)
                break

            case 'customer.subscription.deleted':
                const canceledSubscription = event.data.object as Stripe.Subscription
                await handleSubscriptionCanceled(canceledSubscription)
                break

            default:
                console.log(`Unhandled event type ${event.type}`)
        }

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    try {
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId

        if (!userId || !planId) {
            console.error('Missing userId or planId in session metadata')
            return
        }

        // Map plan IDs to subscription tiers
        const planMapping: Record<string, string> = {
            starter: 'STARTER',
            professional: 'PROFESSIONAL',
            enterprise: 'ENTERPRISE',
            premium: 'PREMIUM'
        }

        const subscriptionTier = planMapping[planId]

        if (!subscriptionTier) {
            console.error('Invalid plan ID:', planId)
            return
        }

        // Update user subscription
        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionTier: subscriptionTier as any,
                subscriptionStatus: 'ACTIVE',
                stripeCustomerId: session.customer as string,
                subscriptionId: session.subscription as string,
            }
        })

        console.log(`User ${userId} subscribed to ${subscriptionTier} plan`)

    } catch (error) {
        console.error('Error handling checkout completed:', error)
    }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    try {
        const subscriptionId = (invoice as any).subscription as string

        // Find user by subscription ID
        const user = await prisma.user.findFirst({
            where: { subscriptionId: subscriptionId }
        })

        if (!user) {
            console.error('User not found for subscription:', subscriptionId)
            return
        }

        // Update subscription status
        await prisma.user.update({
            where: { id: user.id },
            data: {
                subscriptionStatus: 'ACTIVE',
                lastPaymentDate: new Date(),
            }
        })

        console.log(`Payment succeeded for user ${user.id}`)

    } catch (error) {
        console.error('Error handling payment succeeded:', error)
    }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    try {
        const subscriptionId = (invoice as any).subscription as string

        // Find user by subscription ID
        const user = await prisma.user.findFirst({
            where: { subscriptionId: subscriptionId }
        })

        if (!user) {
            console.error('User not found for subscription:', subscriptionId)
            return
        }

        // Update subscription status
        await prisma.user.update({
            where: { id: user.id },
            data: {
                subscriptionStatus: 'PAST_DUE',
            }
        })

        console.log(`Payment failed for user ${user.id}`)

    } catch (error) {
        console.error('Error handling payment failed:', error)
    }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    try {
        const customerId = subscription.customer as string

        // Find user by customer ID
        const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId }
        })

        if (!user) {
            console.error('User not found for customer:', customerId)
            return
        }

        // Update subscription status
        await prisma.user.update({
            where: { id: user.id },
            data: {
                subscriptionStatus: 'CANCELLED',
                subscriptionTier: 'FREE',
            }
        })

        console.log(`Subscription canceled for user ${user.id}`)

    } catch (error) {
        console.error('Error handling subscription canceled:', error)
    }
}