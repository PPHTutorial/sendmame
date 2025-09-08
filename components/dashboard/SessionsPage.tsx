'use client'

import React, { useEffect, useState } from 'react'
import { 
  Users, 
  Clock, 
  Calendar,
  RefreshCw,
  Search,
  Download,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Trash2,
  AlertCircle,
  MapPin,
  Monitor,
  Timer
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface Session {
  id: string
  sessionToken: string
  userId: string
  expires: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    lastLoginAt?: string
    createdAt: string
    verificationStatus: string
    profile?: {
      profilePicture?: string
      currentCity?: string
      currentCountry?: string
    }
  }
}

interface _SessionMetrics {
  totalSessions: number
  activeSessions: number
  expiredSessions: number
  todaySessions: number
  thisHourSessions: number
  uniqueUsers: number
  averageSessionDuration: number
}

export default function SessionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [page, setPage] = useState(1)
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const queryClient = useQueryClient()

  // Fetch sessions
  const { data: sessionsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-sessions', page, searchTerm, selectedStatus, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(dateRange && { dateRange })
      })
      
      const response = await fetch(`/api/dashboard/sessions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch sessions')
      return response.json()
    }
  })

  // Fetch session metrics
  const { data: metrics } = useQuery({
    queryKey: ['session-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/sessions/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    }
  })

  // Handle actions
  const handleViewSession = (session: Session) => {
    setSelectedSession(session)
    setShowDetailsModal(true)
    setOpenActionDropdown(null)
  }

  const handleDeleteSession = async () => {
    if (!selectedSession) return
    
    try {
      const response = await fetch(`/api/dashboard/sessions?id=${selectedSession.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete session')
      
      setShowDeleteConfirm(false)
      setSelectedSession(null)
      setOpenActionDropdown(null)
      
      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['dashboard-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['session-metrics'] })
    } catch (err) {
      console.error('Error deleting session:', err)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setOpenActionDropdown(null)
      }
    }

    if (openActionDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openActionDropdown])

  const isSessionActive = (expires: string) => {
    return new Date(expires) > new Date()
  }

  const getSessionStatusColor = (expires: string) => {
    return isSessionActive(expires) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getTimeUntilExpiry = (expires: string) => {
    const now = new Date()
    const expiryDate = new Date(expires)
    const diff = expiryDate.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_: any, session: Session) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            {session.user.profile?.profilePicture ? (
              <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-500" />
              </div>
            ) : (
              <Users className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {session.user.firstName} {session.user.lastName}
            </div>
            <div className="text-sm text-gray-500">{session.user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'sessionInfo',
      label: 'Session Info',
      render: (_: any, session: Session) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 flex items-center gap-1">
            <Monitor className="h-4 w-4" />
            {session.id.slice(0, 8)}...
          </div>
          <div className="text-gray-500">Token: {session.sessionToken.slice(0, 12)}...</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, session: Session) => (
        <div className="flex items-center gap-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSessionStatusColor(session.expires)}`}>
            {isSessionActive(session.expires) ? 'Active' : 'Expired'}
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationStatusColor(session.user.verificationStatus)}`}>
            {session.user.verificationStatus}
          </span>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (_: any, session: Session) => (
        <div className="text-sm">
          {session.user.profile?.currentCity || session.user.profile?.currentCountry ? (
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="h-3 w-3" />
              <span>
                {session.user.profile.currentCity}
                {session.user.profile.currentCity && session.user.profile.currentCountry && ', '}
                {session.user.profile.currentCountry}
              </span>
            </div>
          ) : (
            <span className="text-gray-400">Unknown</span>
          )}
        </div>
      )
    },
    {
      key: 'expires',
      label: 'Expires',
      render: (_: any, session: Session) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 flex items-center gap-1">
            <Timer className="h-3 w-3" />
            {getTimeUntilExpiry(session.expires)}
          </div>
          <div className="text-gray-500">{formatDate(session.expires)}</div>
        </div>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (_: any, session: Session) => (
        <div className="text-sm text-gray-500">
          {session.user.lastLoginAt ? (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(session.user.lastLoginAt)}
            </div>
          ) : (
            <span className="text-gray-400">Never</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, session: Session) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === session.id ? null : session.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openActionDropdown === session.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewSession(session)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    setSelectedSession(session)
                    setShowDeleteConfirm(true)
                    setOpenActionDropdown(null)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Revoke Session
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }
  ]

  if (isLoading) {
    return <SkeletonLoader type="dashboard" />  
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <XCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Sessions</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Modal Components
  const SessionDetailsModal = () => (
    showDetailsModal && selectedSession && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Session Details</h3>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Session Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">ID:</span> {selectedSession.id}</div>
                  <div><span className="font-medium">Session Token:</span> {selectedSession.sessionToken}</div>
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getSessionStatusColor(selectedSession.expires)}`}>
                      {isSessionActive(selectedSession.expires) ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  <div><span className="font-medium">Expires:</span> {formatDate(selectedSession.expires)}</div>
                  <div><span className="font-medium">Time Until Expiry:</span> {getTimeUntilExpiry(selectedSession.expires)}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedSession.user.firstName} {selectedSession.user.lastName}</div>
                  <div><span className="font-medium">Email:</span> {selectedSession.user.email}</div>
                  {selectedSession.user.phone && (
                    <div><span className="font-medium">Phone:</span> {selectedSession.user.phone}</div>
                  )}
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getVerificationStatusColor(selectedSession.user.verificationStatus)}`}>
                      {selectedSession.user.verificationStatus}
                    </span>
                  </div>
                  {selectedSession.user.lastLoginAt && (
                    <div><span className="font-medium">Last Login:</span> {formatDate(selectedSession.user.lastLoginAt)}</div>
                  )}
                </div>
              </div>
            </div>

            {selectedSession.user.profile && (selectedSession.user.profile.currentCity || selectedSession.user.profile.currentCountry) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Location Information</h4>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-6 w-6 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Current Location</div>
                    <div className="text-sm text-gray-500">
                      {selectedSession.user.profile.currentCity}
                      {selectedSession.user.profile.currentCity && selectedSession.user.profile.currentCountry && ', '}
                      {selectedSession.user.profile.currentCountry}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Security Status</h4>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                {isSessionActive(selectedSession.expires) ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <div>
                      <div className="font-medium text-gray-900">Session Active</div>
                      <div className="text-sm text-gray-500">
                        This session is currently active and will expire {getTimeUntilExpiry(selectedSession.expires)}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-red-500" />
                    <div>
                      <div className="font-medium text-gray-900">Session Expired</div>
                      <div className="text-sm text-gray-500">
                        This session has expired and is no longer valid
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  )

  const DeleteConfirmModal = () => (
    showDeleteConfirm && selectedSession && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Revoke Session</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to revoke this session? The user will be logged out immediately.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleDeleteSession}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Revoke Session
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(false)
                setSelectedSession(null)
              }}
              className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  )

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage user sessions and authentication states</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
          <MetricCard
            title="Total Sessions"
            value={metrics.totalSessions}
            icon={<Monitor className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Sessions"
            value={metrics.activeSessions}
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="Expired Sessions"
            value={metrics.expiredSessions}
            icon={<XCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="Today's Sessions"
            value={metrics.todaySessions}
            icon={<Calendar className="h-5 w-5" />}
          />
          <MetricCard
            title="This Hour"
            value={metrics.thisHourSessions}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Unique Users"
            value={metrics.uniqueUsers}
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            title="Avg Duration"
            value={formatDuration(metrics.averageSessionDuration)}
            icon={<Timer className="h-5 w-5" />}
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
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedStatus('')
              setDateRange('')
              setPage(1)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <DataTable
        data={sessionsData?.sessions || []}
        columns={columns}
        pagination={{
          page,
          pageSize: 20,
          total: sessionsData?.pagination?.total || 0,
          onPageChange: setPage
        }}
      />

      {/* Modals */}
      <SessionDetailsModal />
      <DeleteConfirmModal />
    </div>
  )
}

