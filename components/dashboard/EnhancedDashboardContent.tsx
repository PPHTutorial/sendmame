'use client'

import { useState, useEffect } from 'react'

import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar
} from 'recharts'
import { 
  Users, 
  Package, 
  Route, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Activity,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MetricCard } from '../ui/dashboard-components'
import { Card } from '../ui'
import { CardHeader, CardTitle, CardContent } from '../ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

interface DashboardMetrics {
  overview: {
    totalUsers: number
    totalPackages: number
    totalTrips: number
    totalTransactions: number
    totalDisputes: number
    userGrowth: number
    packageGrowth: number
    tripGrowth: number
    transactionGrowth: number
  }
  charts: {
    userGrowth: { labels: string[], values: number[] }
    packageActivity: { labels: string[], values: number[] }
    tripActivity: { labels: string[], values: number[] }
  }
  distributions: {
    packagesByStatus: { status: string, count: number }[]
    tripsByStatus: { status: string, count: number }[]
    transactionsByStatus: { status: string, count: number }[]
    disputesByStatus: { status: string, count: number }[]
  }
  geographic: {
    topCities: { city: string, count: number }[]
    totalLocations: number
  }
  systemHealth: {
    activeUsers: number
    verifiedUsers: number
    completedTrips: number
    successfulTransactions: number
    uptime: number
    responseTime: number
    errorRate: number
  }
  revenue: {
    total: number
    recent: number
    growth: number
  }
  recentActivities: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    user?: string
    status?: string
  }>
}

const timeRanges = [
  { value: 'day', label: 'Day', icon: Clock },
  { value: 'week', label: 'Week', icon: BarChart3 },
  { value: 'month', label: 'Month', icon: PieChartIcon },
  { value: 'year', label: 'Year', icon: Globe }
]

const COLORS = {
  primary: ['#3B82F6', '#1E40AF', '#1E3A8A'],
  success: ['#10B981', '#059669', '#047857'],
  warning: ['#F59E0B', '#D97706', '#B45309'],
  error: ['#EF4444', '#DC2626', '#B91C1C'],
  purple: ['#8B5CF6', '#7C3AED', '#6D28D9'],
  pink: ['#EC4899', '#DB2777', '#BE185D']
}

const STATUS_COLORS: Record<string, string> = {
  'POSTED': COLORS.primary[0],
  'MATCHED': COLORS.warning[0],
  'IN_TRANSIT': COLORS.purple[0],
  'DELIVERED': COLORS.success[0],
  'CANCELLED': COLORS.error[0],
  'COMPLETED': COLORS.success[0],
  'PENDING': COLORS.warning[0],
  'FAILED': COLORS.error[0],
  'OPEN': COLORS.error[0],
  'RESOLVED': COLORS.success[0]
}

export default function EnhancedDashboardContent() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('month')
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchMetrics = async (timeRange: string) => {
    try {
      setRefreshing(true)
      const response = await fetch(`/api/dashboard/enhanced-metrics?timeRange=${timeRange}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`)
      }
      
      const data = await response.json()
      setMetrics(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMetrics(selectedTimeRange)
  }, [selectedTimeRange])

  const handleTimeRangeChange = (newRange: string) => {
    setSelectedTimeRange(newRange)
    setLoading(true)
  }

  const refreshData = () => {
    fetchMetrics(selectedTimeRange)
  }

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900">Failed to Load Dashboard</h3>
        <p className="text-gray-600 text-center max-w-md">{error}</p>
        <Button onClick={refreshData} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (!metrics) return null

  // Prepare chart data
  const userGrowthChartData = metrics.charts.userGrowth.labels.map((label, index) => ({
    date: label,
    users: metrics.charts.userGrowth.values[index]
  }))

  const packageActivityChartData = metrics.charts.packageActivity.labels.map((label, index) => ({
    date: label,
    packages: metrics.charts.packageActivity.values[index]
  }))

  const tripActivityChartData = metrics.charts.tripActivity.labels.map((label, index) => ({
    date: label,
    trips: metrics.charts.tripActivity.values[index]
  }))

  // Combine activity data for multi-line chart
  const combinedActivityData = metrics.charts.userGrowth.labels.map((label, index) => ({
    date: label,
    users: metrics.charts.userGrowth.values[index],
    packages: metrics.charts.packageActivity.values[index],
    trips: metrics.charts.tripActivity.values[index]
  }))

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {timeRanges.map((range) => {
              const Icon = range.icon
              return (
                <Button
                  key={range.value}
                  variant={selectedTimeRange === range.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleTimeRangeChange(range.value)}
                  className={cn(
                    "flex items-center space-x-2",
                    selectedTimeRange === range.value 
                      ? "bg-white shadow-sm" 
                      : "hover:bg-gray-50"
                  )}
                  disabled={refreshing}
                >
                  <Icon className="h-4 w-4" />
                  <span>{range.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
        
        <Button 
          onClick={refreshData} 
          variant="outline" 
          size="sm"
          disabled={refreshing}
          className="flex items-center space-x-2"
        >
          <Activity className={cn("h-4 w-4", refreshing && "animate-spin")} />
          <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics.overview.totalUsers}
          //trend={metrics.overview.userGrowth}
          icon={<Users  className="h-5 w-5"/>}
          //color="blue"
        />
        <MetricCard
          title="Active Packages"
          value={metrics.overview.totalPackages}
          //trend={metrics.overview.packageGrowth}
          icon={<Package  className="h-5 w-5"/>}
          //color="green"
        />
        <MetricCard
          title="Total Trips"
          value={metrics.overview.totalTrips}
          //trend={metrics.overview.tripGrowth}
          icon={<Route  className="h-5 w-5"/>}
          //color="purple"
        />
        <MetricCard
          title="Transactions"
          value={metrics.overview.totalTransactions}
          //trend={metrics.overview.transactionGrowth}
          icon={<CreditCard  className="h-5 w-5"/>}
          //color="orange"
        />
      </div>

      {/* Revenue & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <DollarSign className="h-5 w-5" />
              <span>Revenue Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Total Revenue</span>
                <span className="text-lg font-bold text-green-900">
                  ${(metrics.revenue.total / 1000).toFixed(1)}k
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Recent ({selectedTimeRange})</span>
                <span className="text-lg font-bold text-green-900">
                  ${(metrics.revenue.recent / 1000).toFixed(1)}k
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Growth</span>
                <Badge variant={metrics.revenue.growth > 0 ? 'default' : 'destructive'}>
                  {metrics.revenue.growth > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(metrics.revenue.growth).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Activity className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-blue-700">Uptime</div>
                  <div className="text-lg font-bold text-blue-900">
                    {metrics.systemHealth.uptime}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-blue-700">Response Time</div>
                  <div className="text-lg font-bold text-blue-900">
                    {metrics.systemHealth.responseTime}ms
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-blue-700">Verified Users</div>
                  <div className="text-lg font-bold text-blue-900">
                    {(metrics.systemHealth.verifiedUsers / 1000).toFixed(1)}k
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-blue-700">Error Rate</div>
                  <div className="text-lg font-bold text-blue-900">
                    {metrics.systemHealth.errorRate}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity Trends</TabsTrigger>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Combined Activity Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={combinedActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stackId="1" 
                      stroke={COLORS.primary[0]} 
                      fill={COLORS.primary[0]}
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="packages" 
                      stackId="1" 
                      stroke={COLORS.success[0]} 
                      fill={COLORS.success[0]}
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="trips" 
                      stackId="1" 
                      stroke={COLORS.purple[0]} 
                      fill={COLORS.purple[0]}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Growth</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={userGrowthChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke={COLORS.primary[0]} 
                      strokeWidth={2}
                      dot={{ fill: COLORS.primary[0], strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Package Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Package Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={packageActivityChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="packages" fill={COLORS.success[0]} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Package Status */}
            <Card>
              <CardHeader>
                <CardTitle>Package Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={metrics.distributions.packagesByStatus.map(item => ({
                        ...item,
                        fill: STATUS_COLORS[item.status] || COLORS.primary[0]
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label
                    >
                      {metrics.distributions.packagesByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS.primary[0]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Trip Status */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={metrics.distributions.tripsByStatus.map(item => ({
                        ...item,
                        fill: STATUS_COLORS[item.status] || COLORS.purple[0]
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label
                    >
                      {metrics.distributions.tripsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS.purple[0]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Transaction Status */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={metrics.distributions.transactionsByStatus} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="status" type="category" width={80} />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill={COLORS.warning[0]} 
                      radius={[0, 2, 2, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Dispute Status */}
            <Card>
              <CardHeader>
                <CardTitle>Dispute Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="90%" data={metrics.distributions.disputesByStatus}>
                    <RadialBar dataKey="count" cornerRadius={10} fill={COLORS.error[0]} />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Cities */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Top Active Cities</span>
                  <Badge variant="secondary">{metrics.geographic.totalLocations} total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.geographic.topCities.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill={COLORS.purple[0]} 
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.recentActivities.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      activity.type === 'user' && "bg-blue-500",
                      activity.type === 'package' && "bg-green-500",
                      activity.type === 'trip' && "bg-purple-500"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {activity.status && (
                      <Badge 
                        variant={activity.status === 'COMPLETED' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Users</span>
                    <span className="font-medium">{(metrics.systemHealth.activeUsers / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed Trips</span>
                    <span className="font-medium">{metrics.systemHealth.completedTrips}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-medium">
                      {((metrics.systemHealth.successfulTransactions / metrics.overview.totalTransactions) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Disputes</span>
                    <Badge variant={metrics.overview.totalDisputes > 10 ? 'destructive' : 'secondary'}>
                      {metrics.overview.totalDisputes}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
