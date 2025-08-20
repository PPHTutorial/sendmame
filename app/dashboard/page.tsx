'use client'

import { useAuth } from '@/lib/hooks/api'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui'
import Link from 'next/link'

const AuthGuard = dynamic(
  () => import('@/components/auth').then(mod => ({ default: mod.AuthGuard })),
  { ssr: false }
)

const UserProfile = dynamic(
  () => import('@/components/auth').then(mod => ({ default: mod.UserProfile })),
  { ssr: false }
)

const DashboardContent = dynamic(
  () => Promise.resolve(DashboardContentComponent),
  { ssr: false }
)

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-2">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  <span className="text-xl font-bold">Fakomame</span>
                </Link>
                <span className="text-green-200">|</span>
                <h1 className="text-2xl font-bold">Dashboard</h1>
              </div>
              <UserProfile />
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 py-4">
              <a href="#" className="text-green-600 font-semibold border-b-2 border-green-600 pb-2">
                Overview
              </a>
              <a href="#" className="text-gray-600 hover:text-green-600 pb-2">
                My Packages
              </a>
              <a href="#" className="text-gray-600 hover:text-green-600 pb-2">
                My Trips
              </a>
              <a href="#" className="text-gray-600 hover:text-green-600 pb-2">
                Messages
              </a>
              <a href="#" className="text-gray-600 hover:text-green-600 pb-2">
                Settings
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <DashboardContent />
        </main>
      </div>
    </AuthGuard>
  )
}

function DashboardContentComponent() {
  const { getCurrentUser } = useAuth()
  const { data: user, isLoading } = getCurrentUser

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-green-100 text-lg">
            Ready to send packages or plan your next trip? Let&apos;s get started.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {user?.sentPackages || 0}
              </div>
              <div className="text-sm text-gray-600">Packages Sent</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {user?.receivedPackages || 0}
              </div>
              <div className="text-sm text-gray-600">Packages Received</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {user?.trips || 0}
              </div>
              <div className="text-sm text-gray-600">Trips Posted</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                4.9
              </div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              📦 Send a Package
            </Button>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              ✈️ Post a Trip
            </Button>
            <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
              🔍 Browse Packages
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Account Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user?.emailVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user?.emailVerified ? '✅ Verified' : '⏳ Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Phone</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user?.phoneVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user?.phoneVerified ? '✅ Verified' : '⏳ Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ID Document</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user?.idVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user?.idVerified ? '✅ Verified' : '⏳ Pending'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tips & Help
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>💡 Complete your profile verification to increase trust</p>
            <p>📱 Download our mobile app for faster tracking</p>
            <p>🎯 Set up notifications to never miss updates</p>
            <Button variant="outline" size="sm" className="w-full mt-3 border-purple-600 text-purple-600 hover:bg-purple-50">
              View Help Center
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Activity
        </h3>
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h4>
          <p className="text-gray-500 mb-6">
            Start by sending a package or posting a trip to see your activity here.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Send First Package
            </Button>
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              Post First Trip
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
