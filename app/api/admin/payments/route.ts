import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// API endpoint for admins to get all payment records
// NOTE: This route requires running 'npx prisma db push' and 'npx prisma generate' first
// to generate the SubscriptionPayment model in the Prisma client
export async function GET(request: NextRequest) {
    try {
        // Authenticate the user and check if they are an admin
        const userPayload = await requireAuth(request);
        
        // Get the user to check their role
        const user = await prisma.user.findUnique({
            where: {
                id: userPayload.userId,
            },
            select: {
                role: true,
            },
        });
        
        // Ensure the user is an admin
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }
        
        // Get query parameters for filtering and pagination
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;
        const userId = url.searchParams.get('userId');
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');
        
        // Build filter conditions
        const where: any = {
            type: 'PAYMENT',
        };
        
        if (userId) {
            where.userId = userId;
        }
        
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        } else if (startDate) {
            where.createdAt = {
                gte: new Date(startDate),
            };
        } else if (endDate) {
            where.createdAt = {
                lte: new Date(endDate),
            };
        }
        
        // Fallback to using transactions until Prisma client is updated
        // Get payments with pagination and filters
        const payments = await prisma.transaction.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        subscriptionTier: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: limit,
        });
        
        // Get total count for pagination
        const total = await prisma.transaction.count({ where });
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;
        
        // Get summary statistics
        const summaryResult = await prisma.$queryRaw`
            SELECT 
                COUNT(*) as "totalPayments",
                SUM(amount) as "totalAmount",
                AVG(amount) as "averageAmount",
                COUNT(DISTINCT "userId") as "uniqueUsers"
            FROM "transactions"
            WHERE type = 'PAYMENT'
        `;
        
        // Type assertion for the summary result
        const summary = summaryResult as {
            totalPayments: number;
            totalAmount: number;
            averageAmount: number;
            uniqueUsers: number;
        }[];
        
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
                summary: summary[0],
            },
        });
        
        /* Once Prisma client is updated, uncomment this code:
        // Build filter conditions
        const subscriptionWhere: any = {};
        
        if (userId) {
            subscriptionWhere.userId = userId;
        }
        
        if (subscriptionTier) {
            subscriptionWhere.subscriptionTier = subscriptionTier;
        }
        
        if (startDate && endDate) {
            subscriptionWhere.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        } else if (startDate) {
            subscriptionWhere.createdAt = {
                gte: new Date(startDate),
            };
        } else if (endDate) {
            subscriptionWhere.createdAt = {
                lte: new Date(endDate),
            };
        }
        
        // Get payments with pagination and filters
        const payments = await prisma.subscriptionPayment.findMany({
            where: subscriptionWhere,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                transaction: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: limit,
        });
        
        // Get total count for pagination
        const total = await prisma.subscriptionPayment.count({ where: subscriptionWhere });
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;
        
        // Get summary statistics
        const summary = await prisma.$queryRaw`
            SELECT 
                COUNT(*) as "totalPayments",
                SUM(amount) as "totalAmount",
                AVG(amount) as "averageAmount",
                COUNT(DISTINCT "userId") as "uniqueUsers"
            FROM "subscription_payments"
        `;
        
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
                summary: summary[0],
            },
        });
        */
    } catch (error) {
        console.error('Error fetching admin payment records:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment records' },
            { status: 500 }
        );
    }
}