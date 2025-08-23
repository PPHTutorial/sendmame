'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui'
import Link from 'next/link'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  Filter,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Clock,
  Target,
  Globe
} from 'lucide-react'

const AuthGuard = dynamic(
  () => import('@/components/auth').then(mod => ({ default: mod.AuthGuard })),
  { ssr: false }
)

// Analytics Overview Component
function AnalyticsOverview() {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$45,231',
      change: '+23.1%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-green-500',
      description: 'vs last month'
    },
    {
      title: 'Active Users',
      value: '2,847',
      change: '+12.3%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500',
      description: 'vs last month'
    },
    {
      title: 'Package Success Rate',
      value: '96.8%',
      change: '+2.1%',
      changeType: 'positive',
      icon: Target,
      color: 'bg-purple-500',
      description: 'vs last month'
    },
    {
      title: 'Average Delivery Time',
      value: '2.4 days',
      change: '-8.2%',
      changeType: 'positive',
      icon: Clock,
      color: 'bg-orange-500',
      description: 'vs last month'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`${metric.color} p-3 rounded-lg`}>
              <metric.icon className="w-6 h-6 text-white" />
            </div>
            <div className={`flex items-center space-x-1 text-sm ${
              metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.changeType === 'positive' ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span>{metric.change}</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
            <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
            <p className="text-xs text-gray-500">{metric.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Revenue Chart Component
function RevenueChart() {
  const [timeframe, setTimeframe] = useState('7d')

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Revenue Analytics</h3>
          <p className="text-gray-600">Track your earning trends over time</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Mock Chart Area */}
      <div className="h-80 bg-gradient-to-t from-blue-50 to-transparent rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
        <div className="text-center">
          <BarChart3 className="w-20 h-20 text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Revenue Chart</p>
          <p className="text-gray-500 text-sm">Interactive revenue visualization would be displayed here</p>
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Package Revenue</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Trip Revenue</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Total Revenue</span>
        </div>
      </div>
    </div>
  )
}

// Performance Metrics Component
function PerformanceMetrics() {
  const performanceData = [
    {
      category: 'Package Delivery',
      metrics: [
        { label: 'Success Rate', value: '96.8%', trend: 'up' },
        { label: 'Average Time', value: '2.4 days', trend: 'down' },
        { label: 'Customer Rating', value: '4.9/5', trend: 'up' },
        { label: 'On-time Delivery', value: '94.2%', trend: 'up' }
      ]
    },
    {
      category: 'Trip Management',
      metrics: [
        { label: 'Trip Completion', value: '98.1%', trend: 'up' },
        { label: 'Average Distance', value: '245 miles', trend: 'neutral' },
        { label: 'Traveler Rating', value: '4.8/5', trend: 'up' },
        { label: 'Capacity Utilization', value: '78.3%', trend: 'up' }
      ]
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {performanceData.map((section, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{section.category}</h3>
          <div className="space-y-4">
            {section.metrics.map((metric, metricIndex) => (
              <div key={metricIndex} className="flex items-center justify-between">
                <span className="text-gray-600">{metric.label}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{metric.value}</span>
                  {metric.trend === 'up' && (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  )}
                  {metric.trend === 'down' && (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  )}
                  {metric.trend === 'neutral' && (
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Geographic Distribution Component
function GeographicDistribution() {
  const locations = [
    { city: 'San Francisco', packages: 142, percentage: 28.4 },
    { city: 'Los Angeles', packages: 89, percentage: 17.8 },
    { city: 'New York', packages: 76, percentage: 15.2 },
    { city: 'Chicago', packages: 54, percentage: 10.8 },
    { city: 'Seattle', packages: 43, percentage: 8.6 },
    { city: 'Others', packages: 96, percentage: 19.2 }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
          <p className="text-gray-600">Package destinations by city</p>
        </div>
        <Globe className="w-6 h-6 text-gray-400" />
      </div>

      <div className="space-y-4">
        {locations.map((location, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{location.city}</span>
                <span className="text-sm text-gray-600">{location.packages} packages</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${location.percentage}%` }}
                ></div>
              </div>
            </div>
            <span className="text-sm text-gray-500 w-12 text-right">
              {location.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 2000)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                  ← Back to Dashboard
                </Link>
                <span className="text-gray-300">|</span>
                <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
            <p className="text-gray-600">
              Comprehensive insights into your package delivery and trip management performance.
            </p>
          </div>

          {/* Overview Metrics */}
          <AnalyticsOverview />

          {/* Revenue Chart */}
          <RevenueChart />

          {/* Performance Metrics and Geographic Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PerformanceMetrics />
            </div>
            <div className="lg:col-span-1">
              <GeographicDistribution />
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
