'use client'

import React, { useEffect, useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  Eye, 
  Activity,
  PieChart,
  AlertCircle,
  Calendar,
  Globe,
  Target,
  Zap,
  Clock
} from 'lucide-react'
import { MetricCard, SimpleChart, DataTable } from '@/components/ui/dashboard-components'
import type { 
  UserMetrics, 
  PackageMetrics, 
  TransactionMetrics 
} from '@/lib/database-service'

export default function AnalyticsPage() {
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null)
  const [packageMetrics, setPackageMetrics] = useState<PackageMetrics | null>(null)
  const [transactionMetrics, setTransactionMetrics] = useState<TransactionMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [usersRes, packagesRes, transactionsRes] = await Promise.all([
          fetch('/api/dashboard/users'),
          fetch('/api/dashboard/packages'),
          fetch('/api/dashboard/transactions')
        ])

        if (!usersRes.ok || !packagesRes.ok || !transactionsRes.ok) {
          throw new Error('Failed to fetch analytics data')
        }

        const [userData, packageData, transactionData] = await Promise.all([
          usersRes.json(),
          packagesRes.json(),
          transactionsRes.json()
        ])

        setUserMetrics(userData)
        setPackageMetrics(packageData)
        setTransactionMetrics(transactionData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-xl"></div>
            ))}
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
            <h3 className="font-medium text-red-800">Error Loading Analytics</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!userMetrics || !packageMetrics || !transactionMetrics) return null

  // Chart data preparation with safe fallbacks
  const userGrowthChartData = (userMetrics.growthData || []).slice(0, 7).reverse().map(item => ({
    label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.count
  }))

  const roleDistributionData = (userMetrics.roleDistribution || []).map(item => ({
    label: item.role,
    value: item.count,
    color: item.role === 'ADMIN' ? '#ef4444' : item.role === 'SENDER' ? '#3b82f6' : '#10b981'
  }))

  const packageStatusData = (packageMetrics.statusDistribution || []).map((item, index) => ({
    label: item.status.replace('_', ' '),
    value: item.count,
    color: `hsl(${index * 60}, 70%, 60%)`
  }))

  const revenueChartData = (packageMetrics.revenueData || []).slice(0, 7).reverse().map(item => ({
    label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.revenue / 100
  }))

  const transactionVolumeData = (transactionMetrics.dailyVolume || []).slice(0, 7).reverse().map(item => ({
    label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.count
  }))

  // Top routes table data
  const topRoutesColumns = [
    {
      key: 'route',
      label: 'Route',
      sortable: true
    },
    {
      key: 'count',
      label: 'Packages',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">{value.toLocaleString()}</span>
      )
    },
    {
      key: 'percentage',
      label: 'Share',
      render: (_: any, row: any) => {
        const percentage = ((row.count / packageMetrics.totalPackages) * 100).toFixed(1)
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{percentage}%</span>
          </div>
        )
      }
    }
  ]

  // Top countries table data
  const topCountriesColumns = [
    {
      key: 'country',
      label: 'Country',
      sortable: true
    },
    {
      key: 'count',
      label: 'Users',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">{value.toLocaleString()}</span>
      )
    },
    {
      key: 'percentage',
      label: 'Share',
      render: (_: any, row: any) => {
        const percentage = ((row.count / userMetrics.totalUsers) * 100).toFixed(1)
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{percentage}%</span>
          </div>
        )
      }
    }
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Deep insights and performance metrics for your platform</p>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={userMetrics.totalUsers}
          subtitle={`${userMetrics.verifiedUsers} verified • ${userMetrics.activeUsers} active`}
          icon={<Users className="h-5 w-5" />}
        />

        <MetricCard
          title="Total Packages"
          value={packageMetrics.totalPackages}
          subtitle={`$${packageMetrics.averageValue.toFixed(2)} avg value`}
          icon={<Package className="h-5 w-5" />}
        />

        <MetricCard
          title="Total Revenue"
          value={`$${(transactionMetrics.totalVolume / 100).toLocaleString()}`}
          subtitle={`${transactionMetrics.totalTransactions} transactions`}
          icon={<DollarSign className="h-5 w-5" />}
        />

        <MetricCard
          title="Avg Transaction"
          value={`$${(transactionMetrics.averageTransactionValue / 100).toFixed(2)}`}
          subtitle="Per transaction value"
          icon={<Target className="h-5 w-5" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Growth (Last 7 Days)</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <SimpleChart
            data={userGrowthChartData}
            type="line"
            height={300}
          />
        </div>

        {/* User Role Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Role Distribution</h3>
            <div className="p-2 bg-purple-50 rounded-lg">
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <SimpleChart
            data={roleDistributionData}
            type="pie"
            height={300}
          />
        </div>

        {/* Package Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Package Status</h3>
            <div className="p-2 bg-green-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <SimpleChart
            data={packageStatusData}
            type="bar"
            height={300}
          />
        </div>

        {/* Revenue Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend (Last 7 Days)</h3>
            <div className="p-2 bg-orange-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <SimpleChart
            data={revenueChartData}
            type="line"
            height={300}
          />
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Platform Growth</p>
              <p className="text-2xl font-bold">Strong</p>
              <p className="text-blue-100 text-sm">Steady user acquisition</p>
            </div>
            <Zap className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Delivery Success</p>
              <p className="text-2xl font-bold">
                {packageMetrics.statusDistribution.find(s => s.status === 'DELIVERED')?.count || 0}
              </p>
              <p className="text-green-100 text-sm">Packages delivered</p>
            </div>
            <Package className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Global Reach</p>
              <p className="text-2xl font-bold">{userMetrics.topCountries.length}</p>
              <p className="text-purple-100 text-sm">Countries served</p>
            </div>
            <Globe className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Avg Processing</p>
              <p className="text-2xl font-bold">2.3h</p>
              <p className="text-orange-100 text-sm">Package matching</p>
            </div>
            <Clock className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Routes */}
        <DataTable
          data={(packageMetrics.topRoutes || []).map(route => ({
            ...route,
            percentage: ((route.count / (packageMetrics.totalPackages || 1)) * 100).toFixed(1)
          }))}
          columns={topRoutesColumns}
        />

        {/* Top Countries */}
        <DataTable
          data={(userMetrics.topCountries || []).map(country => ({
            ...country,
            percentage: ((country.count / (userMetrics.totalUsers || 1)) * 100).toFixed(1)
          }))}
          columns={topCountriesColumns}
        />
      </div>

      {/* Transaction Volume */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Transaction Volume (Last 7 Days)</h3>
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Activity className="h-5 w-5 text-indigo-600" />
          </div>
        </div>
        <SimpleChart
          data={transactionVolumeData}
          type="bar"
          height={300}
        />
      </div>
    </div>
  )
}


