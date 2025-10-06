import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { requireAuth } from '@/lib/auth'


const url = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : 'http://localhost:3000'

const key = process.env.STRIPE_TEST_SECRET_KEY!
// Initialize Stripe with your secret key
const stripe = new Stripe(key, {
    apiVersion: '2025-07-30.basil',
})



export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const userPayload = await requireAuth(request)

        const { planId, title, price, description } = await request.json()

        if (!planId) {
            return NextResponse.json(
                { error: 'Invalid plan selected' },
                { status: 400 }
            )
        }

        // Use the plan data from the request instead of the hardcoded values
        const planPrice = price
        const planName = title
        const planDescription = description

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: planName,
                            description: planDescription,
                            images: ['https://sendmame.com/logo.png'],
                        },
                        unit_amount: planPrice,
                        // recurring: {
                        //     interval: 'month',
                        // },
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${url}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${url}/subscription`,
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