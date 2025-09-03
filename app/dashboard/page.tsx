'use client'

import { useState, useEffect } from 'react'
import { AdminGuard } from '@/components/admin/AdminGuard'
import {
  Users,
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Search,
  Download,
  Bell,
  Shield,
  Menu,
  Home,
  MessageSquare,
  LogOut,
  ChevronRight,
  TrendingDown,
  Target,
  Zap,
  Filter,
  MoreVertical,
  Truck,
  CreditCard,
  Flag,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Globe
} from 'lucide-react'
import { Button, Input } from '@/components/ui'
import Link from 'next/link'

// Enhanced Types for Modern Dashboard
interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalPackages: number
  totalTrips: number
  totalRevenue: number
  pendingVerifications: number
  activeDisputes: number
  successRate: number
  newUsersToday: number
  packagesInTransit: number
  completedDeliveries: number
  userGrowthRate: number
  recentTransactions?: Array<{
    id: string
    amount: number
    status: string
    createdAt: Date
    user: {
      name: string
      email: string
    }
  }>
  topTravelers?: Array<{
    id: string
    name: string
    email: string
    completedTrips: number
  }>
  packagesByStatus?: Record<string, number>
  tripsByStatus?: Record<string, number>
  revenueByMonth?: Array<{
    month: string
    revenue: number
  }>
}

interface AnalyticsCard {
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease'
  icon: any
  color: string
  bgColor: string
  description: string
}

// Modern Sidebar Navigation
const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) => {
  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', active: true },
    { icon: Users, label: 'Users', href: '/admin/users', badge: '2.8K' },
    { icon: Package, label: 'Packages', href: '/admin/packages', badge: '1.4K' },
    { icon: Truck, label: 'Trips', href: '/admin/trips', badge: '892' },
    { icon: CreditCard, label: 'Transactions', href: '/admin/transactions', badge: 'New' },
    { icon: Flag, label: 'Disputes', href: '/admin/disputes', badge: '3' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: MessageSquare, label: 'Support', href: '/admin/support', badge: '12' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
        transform transition-transform duration-300 ease-in-out z-50 border-r border-slate-700/50
        shadow-2xl backdrop-blur-sm
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        xl:translate-x-0 xl:static xl:z-auto xl:shadow-none
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">Fakomame</h1>
              <p className="text-slate-400 text-sm truncate">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 hover:bg-slate-800/70 transition-colors">
              <div className="text-2xl font-bold text-white">98.5%</div>
              <div className="text-xs text-slate-400">Uptime</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 hover:bg-slate-800/70 transition-colors">
              <div className="text-2xl font-bold text-green-400">$45.8K</div>
              <div className="text-xs text-slate-400">Revenue</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`
                flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group
                ${item.active
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:transform hover:scale-[1.01]'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                {item.badge && (
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${item.active
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-600 text-slate-300 group-hover:bg-slate-500'
                    }`}>
                    {item.badge}
                  </span>
                )}
                {item.active && <ChevronRight className="w-4 h-4 text-white" />}
              </div>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">AD</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Admin User</p>
                <p className="text-slate-400 text-xs">Super Administrator</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

// Modern Top Navigation
const TopNavigation = ({
  isOpen,
  setIsOpen,
  onRefresh,
  isLoading
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onRefresh: () => void
  isLoading: boolean
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-30 xl:ml-80 shadow-sm">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden hover:bg-gray-100 p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm font-medium truncate">
                Real-time insights • Platform management • Live monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search - Hidden on small screens, visible on md+ */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search anything..."
                className="pl-10 w-64 lg:w-80 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="hidden sm:flex hover:bg-blue-50 border-blue-200 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:block">Sync</span>
              </Button>

              <Button variant="outline" size="sm" className="hover:bg-green-50 border-green-200 transition-colors">
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:block">Export</span>
              </Button>

              <Button variant="outline" size="sm" className="relative hover:bg-orange-50 border-orange-200 transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white animate-pulse">
                  3
                </span>
              </Button>

              <Link href="/account/profile">
                <Button variant="outline" size="sm" className="hover:bg-purple-50 border-purple-200 transition-colors">
                  <Users className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:block">Profile</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// Enhanced Analytics Cards
const AnalyticsCards = ({ stats }: { stats: DashboardStats }) => {
  const cards: AnalyticsCard[] = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: stats.userGrowthRate,
      changeType: stats.userGrowthRate >= 0 ? 'increase' : 'decrease',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `${stats.newUsersToday} new today`
    },
    {
      title: 'Active Packages',
      value: stats.totalPackages.toLocaleString(),
      change: 12.5,
      changeType: 'increase',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: `${stats.packagesInTransit} in transit`
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.totalRevenue / 1000).toFixed(1)}K`,
      change: 8.2,
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'This month'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      change: 2.1,
      changeType: 'increase',
      icon: Target,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Delivery success'
    },
    {
      title: 'Active Trips',
      value: stats.totalTrips.toLocaleString(),
      change: -3.2,
      changeType: 'decrease',
      icon: Truck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Live tracking'
    },
    {
      title: 'Open Disputes',
      value: stats.activeDisputes.toLocaleString(),
      change: -15.3,
      changeType: 'decrease',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Needs attention'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 ${card.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${card.color}`} />
            </div>
            <div className="flex items-center space-x-1">
              {card.changeType === 'increase' ? (
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              )}
              <span className={`text-xs sm:text-sm font-bold ${card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                {card.change > 0 ? '+' : ''}{card.change}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
            <p className="text-sm font-medium text-gray-700 mb-1">{card.title}</p>
            <p className="text-xs text-gray-500 truncate">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Professional Charts Section
const ChartsSection = ({ stats }: { stats: DashboardStats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Revenue Trend Chart */}
      <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Revenue Analytics</h3>
            <p className="text-sm text-gray-500">Monthly performance and growth trends</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="hover:bg-blue-50 flex-1 sm:flex-none">
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:block">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-green-50 flex-1 sm:flex-none">
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:block">Export</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Chart Placeholder */}
        <div className="h-64 sm:h-80 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl flex items-center justify-center relative overflow-hidden border border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5"></div>
          <div className="text-center z-10 px-4">
            <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold text-base sm:text-lg mb-2">Professional Revenue Chart</p>
            <p className="text-sm text-gray-500 mb-4">Monthly average: ${(stats.totalRevenue / 6).toFixed(0)}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Gross Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">Net Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-gray-600">Commission</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Status Distribution */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Package Status</h3>
            <p className="text-sm text-gray-500">Live distribution</p>
          </div>
          <Button variant="outline" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        {/* Enhanced Status Chart */}
        <div className="h-64 sm:h-80 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center relative overflow-hidden border border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-emerald-400/5"></div>
          <div className="text-center z-10 w-full px-4">
            <PieChart className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold text-base sm:text-lg mb-4">Live Status Overview</p>
            <div className="space-y-2 sm:space-y-3 text-sm">
              <div className="flex items-center justify-between bg-white/50 rounded-lg p-2 sm:p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Delivered</span>
                </div>
                <span className="font-bold text-green-600">{stats.completedDeliveries}</span>
              </div>
              <div className="flex items-center justify-between bg-white/50 rounded-lg p-2 sm:p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">In Transit</span>
                </div>
                <span className="font-bold text-blue-600">{stats.packagesInTransit}</span>
              </div>
              <div className="flex items-center justify-between bg-white/50 rounded-lg p-2 sm:p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Pending</span>
                </div>
                <span className="font-bold text-yellow-600">{stats.pendingVerifications}</span>
              </div>
              <div className="flex items-center justify-between bg-white/50 rounded-lg p-2 sm:p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Disputes</span>
                </div>
                <span className="font-bold text-red-600">{stats.activeDisputes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Activity Feed
const ActivityFeed = ({ stats }: { stats: DashboardStats }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Recent Transactions */}
      <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
            <p className="text-sm text-gray-500">Latest financial activities and payments</p>
          </div>
          <Link href="/admin/transactions">
            <Button variant="outline" size="sm" className="hover:bg-blue-50">
              <Activity className="w-4 h-4 mr-2" />
              View All
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {stats.recentTransactions?.slice(0, 6).map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{transaction.user.name}</p>
                  <p className="text-sm text-gray-500">{transaction.user.email}</p>
                  <p className="text-xs text-gray-400">Transaction #{transaction.id.slice(-8)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">${transaction.amount}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${transaction.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-800'
                    : transaction.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                  {transaction.status}
                </span>
                <p className="text-xs text-gray-400 mt-1">{new Date(transaction.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )) || (
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No recent transactions</p>
                <p className="text-sm">Financial data will appear here</p>
              </div>
            )}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Top Performers</h3>
            <p className="text-sm text-gray-500">Most active travelers</p>
          </div>
          <Zap className="w-6 h-6 text-yellow-500" />
        </div>

        <div className="space-y-4">
          {stats.topTravelers?.slice(0, 5).map((traveler, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {traveler.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{traveler.name}</p>
                <p className="text-xs text-gray-500 truncate">{traveler.email}</p>
                <p className="text-xs text-blue-600 font-medium">{traveler.completedTrips} trips completed</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold px-2 py-1 rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                  }`}>
                  #{index + 1}
                </span>
              </div>
            </div>
          )) || (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No travelers yet</p>
                <p className="text-sm">Top performers will appear here</p>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default function ModernAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPackages: 0,
    totalTrips: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    activeDisputes: 0,
    successRate: 0,
    newUsersToday: 0,
    packagesInTransit: 0,
    completedDeliveries: 0,
    userGrowthRate: 0,
    recentTransactions: [],
    topTravelers: [],
    packagesByStatus: {},
    tripsByStatus: {},
    revenueByMonth: []
  })

  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch real data from API
  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Dashboard data fetched:', data)
        setStats(data)
      } else if (response.status === 401) {
        console.error('Unauthorized access - redirecting to login')
        window.location.href = '/login'
      } else {
        console.error('Failed to fetch dashboard stats:', response.status)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()

    // Auto-refresh every 2 minutes
    const interval = setInterval(() => {
      fetchDashboardStats()
    }, 120000)

    return () => clearInterval(interval)
  }, [])

  const handleRefreshData = async () => {
    await fetchDashboardStats()
  }

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <RefreshCw className="w-10 h-10 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Loading Dashboard</h2>
            <p className="text-gray-600 text-lg">Fetching real-time analytics and data...</p>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <TopNavigation
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onRefresh={handleRefreshData}
          isLoading={isLoading}
        />

        <main className="xl:ml-80 p-4 sm:p-6 transition-all duration-300">
          {/* Live Status Banner */}
          <div className="mb-6 sm:mb-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Live Data • Last updated: {new Date().toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Real-time synchronization with database • Auto-refresh enabled
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-semibold text-sm">System Status: Operational</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <span className="text-blue-700 font-semibold text-sm">Global Network: Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Cards */}
          <AnalyticsCards stats={stats} />

          {/* Charts Section */}
          <ChartsSection stats={stats} />

          {/* Activity Feed */}
          <ActivityFeed stats={stats} />
        </main>
      </div>
    </AdminGuard>
  )
}
