'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/api'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui'
import Link from 'next/link'
import { ArrowLeft, Eye, Package, Truck, DollarSign } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const AuthGuard = dynamic(
  () => import('@/components/auth').then(mod => ({ default: mod.AuthGuard })),
  { ssr: false }
)

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  status: string;
  amount: string | null;
  createdAt: string;
}

function ActivityItem({ activity }: { activity: Activity }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'package_posted':
        return <Package className="w-5 h-5 text-blue-500" />
      case 'trip_posted':
        return <Truck className="w-5 h-5 text-green-500" />
      case 'payment_received':
        return <DollarSign className="w-5 h-5 text-yellow-500" />
      default:
        return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="flex items-start space-x-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="mt-1">
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900">{activity.title}</p>
          {activity.amount && (
            <span className="text-sm font-medium text-green-600">{activity.amount}</span>
          )}
        </div>
        <p className="text-sm text-gray-600">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
      </div>
      <div className={`text-xs font-semibold capitalize px-2 py-1 rounded-full ${
        activity.status === 'completed' || activity.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
      }`}>
        {activity.status}
      </div>
    </div>
  )
}

export default function AllActivityPage() {
  const { getCurrentUser } = useAuth()
  const { data: currentUser } = getCurrentUser
  
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAllUserActivity = useCallback(async (userId: string) => {
    setIsLoading(true)
    try {
      // The 'all=true' query param will be used to fetch all activities
      const response = await fetch(`/api/users/${userId}/activity?all=true`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error('Failed to fetch all user activity:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchAllUserActivity(currentUser.id)
    }
  }, [currentUser, fetchAllUserActivity])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/account/profile" className="text-blue-600 hover:text-blue-700 flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Profile
                </Link>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                All Activity
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading all activities...</p>
              </div>
            ) : activities.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {activities.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Eye className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Activity Yet</h3>
                <p className="text-sm text-gray-500 mt-1">When you post packages or trips, they will appear here.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
