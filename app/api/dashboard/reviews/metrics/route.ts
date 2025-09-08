import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const [
      totalReviews,
      publicReviews,
      highRatedReviews,
      lowRatedReviews,
      recentReviews
    ] = await Promise.all([
      // Total reviews
      prisma.review.count(),
      
      // Public reviews
      prisma.review.count({
        where: {
          isPublic: true
        }
      }),
      
      // High rated reviews (4-5 stars)
      prisma.review.count({
        where: {
          rating: {
            gte: 4
          }
        }
      }),
      
      // Low rated reviews (1-2 stars)
      prisma.review.count({
        where: {
          rating: {
            lte: 2
          }
        }
      }),

      // Reviews from last 7 days
      prisma.review.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Calculate average rating
    const averageRatingResult = await prisma.review.aggregate({
      _avg: {
        rating: true
      }
    })

    const averageRating = averageRatingResult._avg.rating 
      ? Math.round(averageRatingResult._avg.rating * 10) / 10
      : 0

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      _count: {
        rating: true
      },
      orderBy: {
        rating: 'asc'
      }
    })

    // Get reviews by category
    const categoryBreakdown = await prisma.review.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    })

    return NextResponse.json({
      totalReviews,
      publicReviews,
      highRatedReviews,
      lowRatedReviews,
      recentReviews,
      averageRating,
      ratingDistribution,
      categoryBreakdown
    })
  } catch (error) {
    console.error('Error fetching reviews metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
