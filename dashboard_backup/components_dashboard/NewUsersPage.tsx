'use client'

import React, { useEffect, useState } from 'react'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Shield,
  MapPin,
  Star,
  Activity,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react'
import { MetricCard, DataTable } from '@/components/ui/dashboard-components'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  isVerified: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  verificationStatus: string
  lastLoginAt: string | null
  createdAt: string
  profile: {
    currentCountry: string | null
    currentCity: string | null
    senderRating: number
    travelerRating: number
    totalTrips: number
    totalDeliveries: number
  } | null
  stats: {
    packagessent: number
    packagesReceived: number
    trips: number
    transactions: number
  }
}

interface UserMetrics {
  totalUsers: number
  activeUsers: number
  verifiedUsers: number
  newThisMonth: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [metrics, setMetrics] = useState<UserMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    pageSize: 20
  })

  useEffect(() => {
    fetchUsers()
  }, [page, searchTerm, selectedRole, selectedStatus, selectedCountry])

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/dashboard/users')
      if (!response.ok) throw new Error('Failed to fetch user metrics')
      
      const data = await response.json()
      setMetrics({
        totalUsers: data.totalUsers,
        activeUsers: data.activeUsers,
        verifiedUsers: data.verifiedUsers,
        newThisMonth: data.growthData.slice(0, 30).reduce((sum: number, item: any) => sum + item.count, 0)
      })
    } catch (err) {
      console.error('Error fetching user metrics:', err)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString()
      })

      if (searchTerm) params.append('search', searchTerm)
      if (selectedRole) params.append('role', selectedRole)
      if (selectedStatus) params.append('status', selectedStatus)
      if (selectedCountry) params.append('country', selectedCountry)

      const response = await fetch(`/api/dashboard/users/list?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleFilterChange = (type: string, value: string) => {
    setPage(1)
    switch (type) {
      case 'role':
        setSelectedRole(value)
        break
      case 'status':
        setSelectedStatus(value)
        break
      case 'country':
        setSelectedCountry(value)
        break
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never'
    
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return formatDate(dateString)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'SENDER': return 'bg-blue-100 text-blue-800'
      case 'TRAVELER': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-800'
    if (isVerified) return 'bg-green-100 text-green-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusText = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'Inactive'
    if (isVerified) return 'Verified'
    return 'Pending'
  }

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (_: any, user: User) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <Users className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, user: User) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive, user.isVerified)}`}>
          {getStatusText(user.isActive, user.isVerified)}
        </span>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (_: any, user: User) => (
        <div className="text-sm">
          {user.profile?.currentCity && user.profile?.currentCountry ? (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-gray-400" />
              {user.profile.currentCity}, {user.profile.currentCountry}
            </span>
          ) : (
            <span className="text-gray-400">Not specified</span>
          )}
        </div>
      )
    },
    {
      key: 'stats',
      label: 'Activity',
      render: (_: any, user: User) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{user.stats.packagessent + user.stats.packagesReceived} packages</span>
            <span>{user.stats.trips} trips</span>
          </div>
          {user.profile && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400" />
              <span className="text-xs">
                {((user.profile.senderRating + user.profile.travelerRating) / 2 || 0).toFixed(1)}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'verification',
      label: 'Verification',
      render: (_: any, user: User) => (
        <div className="flex items-center gap-1">
          <Mail className={`h-3 w-3 ${user.isEmailVerified ? 'text-green-500' : 'text-gray-400'}`} />
          <Phone className={`h-3 w-3 ${user.isPhoneVerified ? 'text-green-500' : 'text-gray-400'}`} />
          <Shield className={`h-3 w-3 ${user.isVerified ? 'text-green-500' : 'text-gray-400'}`} />
        </div>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (value: string | null) => (
        <span className="text-sm text-gray-500">
          {formatTimeAgo(value)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, user: User) => (
        <div className="flex items-center gap-2">
          <button className="p-1 text-gray-400 hover:text-blue-600">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-green-600">
            <Edit className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  if (loading && users.length === 0) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
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
            <h3 className="font-medium text-red-800">Error Loading Users</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all platform users</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add User
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers}
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers}
            subtitle={`${((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}% of total`}
            icon={<UserCheck className="h-5 w-5" />}
          />
          <MetricCard
            title="Verified Users"
            value={metrics.verifiedUsers}
            subtitle={`${((metrics.verifiedUsers / metrics.totalUsers) * 100).toFixed(1)}% verified`}
            icon={<Shield className="h-5 w-5" />}
          />
          <MetricCard
            title="New This Month"
            value={metrics.newThisMonth}
            icon={<Activity className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="SENDER">Sender</option>
            <option value="TRAVELER">Traveler</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedRole('')
              setSelectedStatus('')
              setSelectedCountry('')
              setPage(1)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        pagination={{
          page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onPageChange: setPage
        }}
      />
    </div>
  )
}
