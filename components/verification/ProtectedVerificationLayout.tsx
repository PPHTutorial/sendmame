'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/api'

interface ProtectedVerificationLayoutProps {
  children: React.ReactNode
}

export function ProtectedVerificationLayout({ children }: ProtectedVerificationLayoutProps) {
  const { getCurrentUser } = useAuth()
  const { data: user, isLoading, error } = getCurrentUser
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && (error || !user)) {
      router.push('/login?redirect=/verification')
    }
  }, [user, isLoading, error, router])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Verifying authentication...</span>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">Authentication required</div>
          <div className="text-gray-600">Redirecting to login...</div>
        </div>
      </div>
    )
  }

  // Render children if authenticated
  return <>{children}</>
}
