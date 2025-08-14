'use client'

import { useAuth } from '@/lib/hooks/api'
import dynamic from 'next/dynamic'
import { Card, Button, Badge } from '@/components/ui'

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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <UserProfile />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
    return <div className="animate-pulse">Loading dashboard...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName}!
        </h2>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your packages and trips.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">
              {user?.sentPackages || 0}
            </div>
            <div className="text-sm text-gray-600">Packages Sent</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {user?.receivedPackages || 0}
            </div>
            <div className="text-sm text-gray-600">Packages Received</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {user?.trips || 0}
            </div>
            <div className="text-sm text-gray-600">Trips Posted</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {user?.givenReviews || 0}
            </div>
            <div className="text-sm text-gray-600">Reviews Given</div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Button className="w-full" variant="primary">
              Send a Package
            </Button>
            <Button className="w-full" variant="outline">
              Post a Trip
            </Button>
            <Button className="w-full" variant="outline">
              Browse Packages
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Verified</span>
              <Badge variant={user?.emailVerified ? 'success' : 'warning'}>
                {user?.emailVerified ? 'Verified' : 'Pending'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Phone Verified</span>
              <Badge variant={user?.phoneVerified ? 'success' : 'warning'}>
                {user?.phoneVerified ? 'Verified' : 'Pending'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ID Verified</span>
              <Badge variant={user?.idVerified ? 'success' : 'warning'}>
                {user?.idVerified ? 'Verified' : 'Pending'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity to show.</p>
          <p className="text-sm mt-2">
            Start by sending a package or posting a trip!
          </p>
        </div>
      </Card>
    </div>
  )
}
