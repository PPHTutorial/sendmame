/* eslint-disable react/no-unescaped-entities */
'use client'

import React, { useEffect, useState } from 'react'
import { 
  Users, 
  Package, 
  Plane, 
  CreditCard, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react'
import { MetricCard, SimpleChart, DataTable } from '@/components/ui/dashboard-components'
import type { DashboardMetrics } from '@/lib/database-service'

interface RecentActivity {
  id: string
  type: 'user' | 'package' | 'trip' | 'transaction'
  title: string
  subtitle: string
  timestamp: string
  data: any
}

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, activityRes] = await Promise.all([
          fetch('/api/dashboard/metrics'),
          fetch('/api/dashboard/activity')
        ])

        if (!metricsRes.ok || !activityRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const metricsData = await metricsRes.json()
        const activityData = await activityRes.json()

        setMetrics(metricsData)
        setRecentActivity(activityData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Dashboard</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />
      case 'package': return <Package className="h-4 w-4" />
      case 'trip': return <Plane className="h-4 w-4" />
      case 'transaction': return <CreditCard className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-50 text-blue-600'
      case 'package': return 'bg-green-50 text-green-600'
      case 'trip': return 'bg-purple-50 text-purple-600'
      case 'transaction': return 'bg-orange-50 text-orange-600'
      default: return 'bg-gray-50 text-gray-600'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const chartData = [
    { label: 'Active', value: metrics.packages.active, color: 'bg-green-500' },
    { label: 'Delivered', value: metrics.packages.delivered, color: 'bg-blue-500' },
    { label: 'In Transit', value: metrics.packages.total - metrics.packages.active - metrics.packages.delivered, color: 'bg-orange-500' }
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics.users.total}
          subtitle={`${metrics.users.active} active users`}
          trend={{
            value: metrics.users.growth,
            label: 'vs last month',
            direction: metrics.users.growth > 0 ? 'up' : metrics.users.growth < 0 ? 'down' : 'neutral'
          }}
          icon={<Users className="h-5 w-5" />}
        />

        <MetricCard
          title="Packages"
          value={metrics.packages.total}
          subtitle={`${metrics.packages.delivered} delivered`}
          trend={{
            value: metrics.packages.growth,
            label: 'vs last month',
            direction: metrics.packages.growth > 0 ? 'up' : metrics.packages.growth < 0 ? 'down' : 'neutral'
          }}
          icon={<Package className="h-5 w-5" />}
        />

        <MetricCard
          title="Active Trips"
          value={metrics.trips.active}
          subtitle={`${metrics.trips.utilization.toFixed(1)}% utilization`}
          icon={<Plane className="h-5 w-5" />}
        />

        <MetricCard
          title="Revenue"
          value={`$${(metrics.packages.revenue / 100).toLocaleString()}`}
          subtitle={`$${(metrics.transactions.pendingAmount / 100).toLocaleString()} pending`}
          trend={{
            value: metrics.transactions.growth,
            label: 'vs last month',
            direction: metrics.transactions.growth > 0 ? 'up' : metrics.transactions.growth < 0 ? 'down' : 'neutral'
          }}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Package Status Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Package Status Distribution</h3>
          <SimpleChart
            data={chartData}
            type="pie"
            height={300}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Activity className="h-4 w-4" />
              Live updates
            </div>
          </div>
          
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {recentActivity.slice(0, 8).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{activity.title}</p>
                  <p className="text-sm text-gray-500 truncate">{activity.subtitle}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Users className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium">Manage Users</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Package className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium">View Packages</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Plane className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-medium">Track Trips</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <CreditCard className="h-6 w-6 text-orange-600" />
            <span className="text-sm font-medium">Transactions</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
            <span className="text-sm font-medium">Analytics</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <CheckCircle className="h-6 w-6 text-teal-600" />
            <span className="text-sm font-medium">Reports</span>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">All Systems Operational</p>
              <p className="text-sm text-gray-500">Last checked: 2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{metrics.disputes.open} Open Disputes</p>
              <p className="text-sm text-gray-500">{metrics.disputes.resolutionRate.toFixed(1)}% resolution rate</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{metrics.transactions.totalVolume} Transactions</p>
              <p className="text-sm text-gray-500">Processing normally</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
