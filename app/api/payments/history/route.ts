import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// API endpoint to get payment history for a user
// NOTE: This route requires running 'npx prisma db push' and 'npx prisma generate' first
// to generate the SubscriptionPayment model in the Prisma client
export async function GET(request: NextRequest) {
    try {
        // Authenticate the user
        const userPayload = await requireAuth(request);
        
        // Get query parameters for pagination
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;
        
        // Fallback to using transactions for payment history until Prisma client is updated
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: userPayload.userId,
                type: 'PAYMENT',
            },
            orderBy: {
                createdAt: 'desc',
            },
            /* skip,
            take: limit, */
        });
        
        // Get total count for pagination
        const total = await prisma.transaction.count({
            where: {
                userId: userPayload.userId,
                type: 'PAYMENT',
            },
        });
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;
        
        return NextResponse.json({
            success: true,
            data: {
                payments: transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasMore,
                },
            },
        });

        /* Once Prisma client is updated, uncomment this code:
        // Get payment history with pagination
        const payments = await prisma.subscriptionPayment.findMany({
            where: {
                userId: userPayload.userId,
            },
            include: {
                transaction: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: limit,
        });
        
        // Get total count for pagination
        const total = await prisma.subscriptionPayment.count({
            where: {
                userId: userPayload.userId,
            },
        });
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;
        
        return NextResponse.json({
            success: true,
            data: {
                payments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasMore,
                },
            },
        });
        */
    } catch (error) {
        console.error('Error fetching payment history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment history' },
            { status: 500 }
        );
    }
}