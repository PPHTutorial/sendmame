import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function requireAdmin(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return null
  } catch (error) {
    console.error('Admin middleware error:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export function withAdminAuth(handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest) => {
    const authResponse = await requireAdmin(request)
    if (authResponse) {
      return authResponse
    }
    
    return handler(request)
  }
}
