import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * pageSize

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [systemConfigs, total] = await Promise.all([
      prisma.systemConfig.findMany({
        where,
        orderBy: { key: 'asc' },
        skip,
        take: pageSize
      }),
      prisma.systemConfig.count({ where })
    ])

    const pagination = {
      page,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize)
    }

    return NextResponse.json({
      systemConfigs,
      pagination
    })
  } catch (error) {
    console.error('Error fetching system configs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system configs' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, value, description } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Config ID is required' },
        { status: 400 }
      )
    }

    const updatedConfig = await prisma.systemConfig.update({
      where: { id },
      data: {
        value,
        ...(description && { description }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error('Error updating system config:', error)
    return NextResponse.json(
      { error: 'Failed to update system config' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, description } = body

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      )
    }

    const newConfig = await prisma.systemConfig.create({
      data: {
        key,
        value,
        description
      }
    })

    return NextResponse.json(newConfig)
  } catch (error) {
    console.error('Error creating system config:', error)
    return NextResponse.json(
      { error: 'Failed to create system config' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Config ID is required' },
        { status: 400 }
      )
    }

    await prisma.systemConfig.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting system config:', error)
    return NextResponse.json(
      { error: 'Failed to delete system config' },
      { status: 500 }
    )
  }
}
