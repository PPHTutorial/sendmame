import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// API endpoint to get a specific payment detail
// NOTE: This route requires running 'npx prisma db push' and 'npx prisma generate' first
// to generate the SubscriptionPayment model in the Prisma client
export async function GET(
    request: NextRequest,
    { params }: { params: { paymentId: string } }
) {
    try {
        // Authenticate the user
        const userPayload = await requireAuth(request);
        const { paymentId } = params;
        
        if (!paymentId) {
            return NextResponse.json(
                { error: 'Payment ID is required' },
                { status: 400 }
            );
        }
        
        // Fallback to using transactions until Prisma client is updated
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: paymentId,
                userId: userPayload.userId,
                type: 'PAYMENT',
            },
        });
        
        if (!transaction) {
            return NextResponse.json(
                { error: 'Payment not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            data: transaction,
        });
        
        /* Once Prisma client is updated, uncomment this code:
        // Get the payment with transaction details
        const payment = await prisma.subscriptionPayment.findUnique({
            where: {
                id: paymentId,
                userId: userPayload.userId, // Ensure the payment belongs to the authenticated user
            },
            include: {
                transaction: true,
            },
        });
        
        if (!payment) {
            return NextResponse.json(
                { error: 'Payment not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            data: payment,
        });
        */
    } catch (error) {
        console.error('Error fetching payment details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment details' },
            { status: 500 }
        );
    }
}