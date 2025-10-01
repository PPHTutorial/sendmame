import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { requireAuth } from '@/lib/auth'

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
     apiVersion: '2025-07-30.basil',
})

// Pricing plans configuration
const plans = {
    starter: {
        priceId: process.env.STRIPE_STARTER_PRICE_ID!,
        name: 'Starter Plan',
        price: 999, // $9.99 in cents
    },
    professional: {
        priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
        name: 'Professional Plan',
        price: 2499, // $24.99 in cents
    },
    enterprise: {
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
        name: 'Enterprise Plan',
        price: 4999, // $49.99 in cents
    },
    premium: {
        priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
        name: 'Premium Plan',
        price: 9999, // $99.99 in cents
    },
}

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const userPayload = await requireAuth(request)

        const { planId } = await request.json()

        if (!planId || !plans[planId as keyof typeof plans]) {
            return NextResponse.json(
                { error: 'Invalid plan selected' },
                { status: 400 }
            )
        }

        const plan = plans[planId as keyof typeof plans]

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: plan.name,
                            description: `Monthly subscription for ${plan.name}`,
                            images: ['https://sendmame.com/logo.png'], // Replace with your logo URL
                        },
                        unit_amount: plan.price,
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
            customer_email: userPayload.email,
            metadata: {
                userId: userPayload.userId,
                planId: planId,
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
        })

        return NextResponse.json({
            url: session.url,
            sessionId: session.id
        })

    } catch (error) {
        console.error('Stripe checkout session creation error:', error)

        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}