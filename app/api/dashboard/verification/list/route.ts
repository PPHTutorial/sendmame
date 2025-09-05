import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''

    const skip = (page - 1) * pageSize

    // Build where conditions
    const where: any = {}

    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    // Get total count for pagination would be calculated differently with grouping
    // So we'll get all documents first then group and paginate
    
    // Get documents grouped by user
    const documents = await prisma.verificationDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            verificationStatus: true,
            createdAt: true
          }
        }
      }
    })

    // Group documents by user
    const userGroups = new Map()
    documents.forEach(doc => {
      const userId = doc.userId
      if (!userGroups.has(userId)) {
        userGroups.set(userId, {
          user: doc.user,
          documents: [],
          latestSubmission: doc.createdAt,
          hasRejected: false,
          hasVerified: false,
          hasPending: false
        })
      }
      
      const group = userGroups.get(userId)
      group.documents.push(doc)
      
      // Update status flags
      if (doc.status === 'REJECTED') group.hasRejected = true
      if (doc.status === 'VERIFIED') group.hasVerified = true
      if (doc.status === 'PENDING') group.hasPending = true
      
      // Update latest submission date
      if (doc.createdAt > group.latestSubmission) {
        group.latestSubmission = doc.createdAt
      }
    })

    // Convert to array and apply pagination
    const groupedUsers = Array.from(userGroups.values())
      .sort((a, b) => new Date(b.latestSubmission).getTime() - new Date(a.latestSubmission).getTime())
    
    const totalUsers = groupedUsers.length
    const paginatedUsers = groupedUsers.slice(skip, skip + pageSize)
    const totalPages = Math.ceil(totalUsers / pageSize)

    return NextResponse.json({
      userGroups: paginatedUsers,
      pagination: {
        page,
        pageSize,
        total: totalUsers,
        totalPages
      }
    })

  } catch (error) {
    console.error('Error fetching verification documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verification documents' },
      { status: 500 }
    )
  }
}
