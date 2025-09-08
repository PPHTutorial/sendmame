import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const _priority = searchParams.get('priority')

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          reporter: {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                lastName: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            ]
          }
        }
      ]
    }

    if (category) {
      where.type = category
    }

    if (status) {
      switch (status.toLowerCase()) {
        case 'open':
          where.status = 'OPEN'
          break
        case 'in_progress':
        case 'investigating':
          where.status = 'IN_REVIEW'
          break
        case 'resolved':
          where.status = 'RESOLVED'
          break
        case 'dismissed':
        case 'closed':
          where.status = 'CLOSED'
          break
      }
    }

    // Get disputes with pagination
    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          involved: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.dispute.count({ where })
    ])

    // Transform disputes to match frontend interface
    const transformedDisputes = disputes.map(dispute => ({
      id: dispute.id,
      packageId: dispute.packageId,
      tripId: dispute.tripId,
      reporterId: dispute.reporterId,
      reportedId: dispute.involvedId, // Map to expected field name
      type: dispute.type,
      category: dispute.type, // Use type as category
      status: dispute.status.toLowerCase(),
      priority: getPriorityFromType(dispute.type), // Calculate priority from type
      title: getDisputeTitle(dispute.type), // Generate title from type
      description: dispute.description,
      resolution: dispute.resolution,
      resolvedAt: dispute.resolvedAt?.toISOString(),
      resolvedBy: dispute.assignedAdminId,
      evidence: dispute.evidence,
      createdAt: dispute.createdAt.toISOString(),
      updatedAt: dispute.updatedAt.toISOString(),
      reporter: dispute.reporter,
      reported: dispute.involved, // Map to expected field name
      package: null, // Would need to fetch if needed
      trip: null, // Would need to fetch if needed
      resolver: null // Would need to fetch if needed
    }))

    return NextResponse.json({
      disputes: transformedDisputes,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('Error fetching disputes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch disputes' },
      { status: 500 }
    )
  }
}

function getPriorityFromType(type: string): string {
  switch (type) {
    case 'payment_issue':
      return 'high'
    case 'damaged_package':
      return 'medium'
    case 'non_delivery':
      return 'high'
    default:
      return 'low'
  }
}

function getDisputeTitle(type: string): string {
  switch (type) {
    case 'payment_issue':
      return 'Payment Issue'
    case 'damaged_package':
      return 'Package Damage'
    case 'non_delivery':
      return 'Non-Delivery'
    default:
      return 'General Dispute'
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const dispute = await prisma.dispute.create({
      data: {
        reporterId: data.reporterId,
        involvedId: data.reportedId,
        packageId: data.packageId || null,
        tripId: data.tripId || null,
        type: data.type,
        description: data.description,
        evidence: data.evidence || [],
        status: 'OPEN'
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        involved: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(dispute, { status: 201 })
  } catch (error) {
    console.error('Error creating dispute:', error)
    return NextResponse.json(
      { error: 'Failed to create dispute' },
      { status: 500 }
    )
  }
}
