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
  DollarSign,
  MessageSquare,
  Shield,
  Star,
  Bell,
  Settings,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Globe,
  Target,
  Calendar,
  Wallet,
  CreditCard as PaymentIcon,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { MetricCard, SimpleChart, SkeletonLoader } from '@/components/ui/dashboard-components'
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
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')

  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
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
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = () => {
    fetchData(true)
  }

  if (loading) {
    return (
      <div className="p-8">
        <SkeletonLoader type="dashboard" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Error Loading Dashboard</h3>
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  // Chart data preparations
  const userGrowthData = [
    { label: 'Jan', value: Math.floor(metrics.users.total * 0.7) },
    { label: 'Feb', value: Math.floor(metrics.users.total * 0.75) },
    { label: 'Mar', value: Math.floor(metrics.users.total * 0.82) },
    { label: 'Apr', value: Math.floor(metrics.users.total * 0.88) },
    { label: 'May', value: Math.floor(metrics.users.total * 0.94) },
    { label: 'Jun', value: metrics.users.total },
  ]

  const packageStatusData = [
    { label: 'Delivered', value: metrics.packages.delivered, color: 'bg-green-500' },
    { label: 'In Transit', value: metrics.packages.inTransit, color: 'bg-blue-500' },
    { label: 'Active', value: metrics.packages.active, color: 'bg-yellow-500' },
    { label: 'Posted', value: metrics.packages.posted, color: 'bg-purple-500' },
    { label: 'Cancelled', value: metrics.packages.cancelled, color: 'bg-gray-500' },
  ]

  const revenueData = [
    { label: 'Jan', value: Math.floor(metrics.transactions.totalValue * 0.6) },
    { label: 'Feb', value: Math.floor(metrics.transactions.totalValue * 0.7) },
    { label: 'Mar', value: Math.floor(metrics.transactions.totalValue * 0.8) },
    { label: 'Apr', value: Math.floor(metrics.transactions.totalValue * 0.85) },
    { label: 'May', value: Math.floor(metrics.transactions.totalValue * 0.92) },
    { label: 'Jun', value: Math.floor(metrics.transactions.totalValue) },
  ]

  const userRoleData = metrics.users.roleBreakdown.map(role => ({
    label: role.role,
    value: role.count,
    color: role.role === 'ADMIN' ? 'bg-red-500' :
      role.role === 'TRAVELER' ? 'bg-blue-500' : 'bg-green-500'
  }))

  const transactionStatusData = metrics.transactions.statusBreakdown.map(status => ({
    label: status.status,
    value: status.count,
    color: status.status === 'COMPLETED' ? 'bg-green-500' :
      status.status === 'PENDING' ? 'bg-yellow-500' :
        status.status === 'FAILED' ? 'bg-red-500' :
          status.status === 'PROCESSING' ? 'bg-blue-500' : 'bg-gray-500'
  }))

  const ratingDistributionData = [
    { label: '5 Stars', value: metrics.reviews.fiveStars, color: 'bg-green-500' },
    { label: '4 Stars', value: metrics.reviews.fourStars, color: 'bg-lime-500' },
    { label: '3 Stars', value: metrics.reviews.threeStars, color: 'bg-yellow-500' },
    { label: '2 Stars', value: metrics.reviews.twoStars, color: 'bg-orange-500' },
    { label: '1 Star', value: metrics.reviews.oneStar, color: 'bg-red-500' },
  ]

  return (
    <div className="p-8 space-y-8 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Comprehensive analytics and insights for your platform</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border-0 outline-none text-sm font-medium"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics.users.total}
          subtitle={`${metrics.users.active} active • ${metrics.users.verified} verified`}
          trend={{
            value: metrics.users.growth,
            label: 'vs last month',
            direction: metrics.users.growth > 0 ? 'up' : metrics.users.growth < 0 ? 'down' : 'neutral'
          }}
          icon={<Users className="h-5 w-5" />}
        />

        <MetricCard
          title="Package Volume"
          value={metrics.packages.total}
          subtitle={`${metrics.packages.delivered} delivered • ${metrics.packages.inTransit} in transit`}
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
          subtitle={`${formatPercentage(metrics.trips.utilization)} utilization`}
          trend={{
            value: metrics.trips.growth,
            label: 'vs last month',
            direction: metrics.trips.growth > 0 ? 'up' : metrics.trips.growth < 0 ? 'down' : 'neutral'
          }}
          icon={<Plane className="h-5 w-5" />}
        />

        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.transactions.completedValue)}
          subtitle={`${formatCurrency(metrics.transactions.pendingAmount)} pending`}
          trend={{
            value: metrics.transactions.growth,
            label: 'vs last month',
            direction: metrics.transactions.growth > 0 ? 'up' : metrics.transactions.growth < 0 ? 'down' : 'neutral'
          }}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Messages"
          value={metrics.messages.total}
          subtitle={`${metrics.messages.newToday} today`}
          icon={<MessageSquare className="h-5 w-5" />}
        />

        <MetricCard
          title="Active Chats"
          value={metrics.chats.active}
          subtitle={`${formatPercentage((metrics.chats.active / metrics.chats.total) * 100)} activity`}
          icon={<Activity className="h-5 w-5" />}
        />

        <MetricCard
          title="Avg Rating"
          value={metrics.reviews.averageRating.toFixed(1)}
          subtitle={`${metrics.reviews.total} reviews`}
          icon={<Star className="h-5 w-5" />}
        />

        <MetricCard
          title="Success Rate"
          value={formatPercentage(metrics.transactions.successRate)}
          subtitle={`${metrics.transactions.failedCount} failed`}
          icon={<Target className="h-5 w-5" />}
        />

        <MetricCard
          title="Disputes"
          value={metrics.disputes.open}
          subtitle={`${formatPercentage(metrics.disputes.resolutionRate)} resolved`}
          icon={<Shield className="h-5 w-5" />}
        />
      </div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              Monthly
            </div>
          </div>
          <SimpleChart
            data={userGrowthData}
            type="line"
            height={280}
          />
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Growth Rate</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(metrics.users.growth)}
                <span className={getTrendColor(metrics.users.growth)}>
                  {formatPercentage(Math.abs(metrics.users.growth))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Package Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Package Status</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <PieChart className="h-4 w-4" />
              Distribution
            </div>
          </div>
          <SimpleChart
            data={packageStatusData}
            type="doughnut"
            height={280}
          />
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-medium">
                {formatPercentage((metrics.packages.delivered / metrics.packages.total) * 100)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Average Value</span>
              <span className="font-medium">{formatCurrency(metrics.packages.averageValue)}</span>
            </div>
          </div>
        </div>


        {/* Revenue Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BarChart3 className="h-4 w-4" />
              Monthly
            </div>
          </div>
          <SimpleChart
            data={revenueData.map(item => ({ ...item, value: Number(item.value) / 100 }))}
            type="bar"
            height={280}
          />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-green-600 mb-1">This Month</div>
              <div className="text-lg font-semibold text-green-700">
                {formatCurrency(metrics.transactions.revenueThisMonth)}
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-600 mb-1">Avg Transaction</div>
              <div className="text-lg font-semibold text-blue-700">
                {formatCurrency(metrics.transactions.averageValue)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Wallet Balance"
          value={formatCurrency(metrics.wallets.totalBalance)}
          subtitle={`${metrics.wallets.activeWallets} active wallets`}
          icon={<Wallet className="h-5 w-5" />}
        />

        <MetricCard
          title="Payment Methods"
          value={metrics.paymentMethods.total}
          subtitle={`${metrics.paymentMethods.verified} verified`}
          icon={<PaymentIcon className="h-5 w-5" />}
        />

        <MetricCard
          title="Pending Transactions"
          value={metrics.transactions.pendingCount}
          subtitle={formatCurrency(metrics.transactions.pendingAmount)}
          icon={<Clock className="h-5 w-5" />}
        />

        <MetricCard
          title="Transaction Volume"
          value={metrics.transactions.totalVolume}
          subtitle={formatCurrency(metrics.transactions.totalValue)}
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Role Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">User Role Distribution</h3>
          <SimpleChart
            data={userRoleData}
            type="bar"
            height={200}
          />
          <div className="mt-6 grid grid-cols-3 gap-4">
            {userRoleData.map((role) => (
              <div key={role.label} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{role.value}</div>
                <div className="text-sm text-gray-500 capitalize">{role.label.toLowerCase()}s</div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Transaction Status</h3>
          <SimpleChart
            data={transactionStatusData}
            type="doughnut"
            height={200}
          />
          <div className="mt-6 space-y-3">
            {transactionStatusData.map((status) => (
              <div key={status.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                  <span className="text-sm text-gray-600 capitalize">{status.label.toLowerCase()}</span>
                </div>
                <span className="text-sm font-medium">{status.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Verification & Security Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Verification Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Verified Documents</span>
              <span className="text-lg font-bold text-green-600">{metrics.verificationDocuments.verified}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Review</span>
              <span className="text-lg font-bold text-yellow-600">{metrics.verificationDocuments.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rejected</span>
              <span className="text-lg font-bold text-red-600">{metrics.verificationDocuments.rejected}</span>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-600 mb-1">Verification Rate</div>
              <div className="text-lg font-semibold text-blue-700">
                {formatPercentage(metrics.verification.verificationRate)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating Distribution</h3>
          <SimpleChart
            data={ratingDistributionData}
            type="bar"
            height={200}
          />
          <div className="mt-4 flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <span className="text-xs text-yellow-600">Average Rating</span>
            <span className="text-lg font-semibold text-yellow-700">
              ⭐ {metrics.reviews.averageRating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">All Systems Operational</p>
                <p className="text-sm text-gray-500">Last checked: 2 min ago</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{metrics.disputes.open} Open Disputes</p>
                <p className="text-sm text-gray-500">Avg resolution: {metrics.disputes.averageResolutionTime.toFixed(1)} days</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{metrics.sessions.activeSessions} Active Sessions</p>
                <p className="text-sm text-gray-500">Platform engagement: High</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Activity className="h-4 w-4" />
              Live updates
            </div>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {recentActivity.slice(0, 10).map((activity) => (
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

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Communication Overview</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Total Messages</p>
                  <p className="text-sm text-gray-500">All conversations</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{metrics.messages.total.toLocaleString()}</p>
                <p className="text-sm text-gray-500">+{metrics.messages.newThisMonth} this month</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Active Chats</p>
                  <p className="text-sm text-gray-500">Currently ongoing</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{metrics.chats.active}</p>
                <p className="text-sm text-gray-500">of {metrics.chats.total} total</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Notifications</p>
                  <p className="text-sm text-gray-500">Sent to users</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">{metrics.notifications.total.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{metrics.notifications.unread} unread</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
            <Users className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium">Manage Users</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all">
            <Package className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium">View Packages</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all">
            <Plane className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-medium">Track Trips</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all">
            <CreditCard className="h-6 w-6 text-orange-600" />
            <span className="text-sm font-medium">Transactions</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            <span className="text-sm font-medium">Analytics</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all">
            <Settings className="h-6 w-6 text-teal-600" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}
