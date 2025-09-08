'use client'

import React, { useState } from 'react'
import { 
  Bell, 
  Send,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Download,
  Eye,
  MoreVertical,
  Plus,
  Mail,
  MessageSquare,
  Smartphone,
  Settings
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  metadata?: Record<string, any>
  isRead: boolean
  readAt?: string
  sentAt: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [newNotification, setNewNotification] = useState({
    type: 'general',
    title: '',
    message: '',
    target: 'specific' as 'all' | 'specific',
    userIds: [] as string[]
  })

  const queryClient = useQueryClient()

  // Fetch notifications
  const { data: notificationsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-notifications', page, searchTerm, typeFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter })
      })
      
      const response = await fetch(`/api/dashboard/notifications?${params}`)
      if (!response.ok) throw new Error('Failed to fetch notifications')
      return response.json()
    }
  })

  // Fetch metrics
  const { data: metrics } = useQuery({
    queryKey: ['notifications-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/notifications/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    }
  })

  // Create notification mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newNotification) => {
      const response = await fetch('/api/dashboard/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create notification')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-metrics'] })
      setShowCreateModal(false)
      setShowBulkModal(false)
      setNewNotification({ type: 'general', title: '', message: '', target: 'specific', userIds: [] })
    }
  })

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async ({ notificationId }: { notificationId: string }) => {
      const response = await fetch(`/api/dashboard/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to mark as read')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-metrics'] })
    }
  })

  // Handle actions
  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification)
    setShowDetailsModal(true)
    setOpenActionDropdown(null)
  }

  const handleMarkRead = (notification: Notification) => {
    markReadMutation.mutate({ notificationId: notification.id })
    setOpenActionDropdown(null)
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

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />
      case 'sms':
        return <Smartphone className="h-4 w-4 text-green-500" />
      case 'push':
        return <Bell className="h-4 w-4 text-purple-500" />
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-orange-500" />
    }
  }

  const columns = [
    {
      key: 'user',
      label: 'Recipient',
      render: (_: any, notification: Notification) => (
        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">
              {notification.user.firstName} {notification.user.lastName}
            </div>
            <div className="text-sm text-gray-500">{notification.user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'title',
      label: 'Notification',
      render: (_: any, notification: Notification) => (
        <div className="max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            {getTypeIcon(notification.type)}
            <span className="text-xs text-gray-500 uppercase">{notification.type}</span>
          </div>
          <div className="font-medium text-gray-900 line-clamp-1">{notification.title}</div>
          <p className="text-sm text-gray-500 line-clamp-2">{notification.message}</p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, notification: Notification) => (
        <div className="space-y-1">
          {notification.isRead ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Read
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Unread
            </span>
          )}
        </div>
      )
    },
    {
      key: 'sentAt',
      label: 'Sent',
      render: (value: string) => (
        <div className="text-sm text-gray-500">
          {formatDate(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, notification: Notification) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === notification.id ? null : notification.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openActionDropdown === notification.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewDetails(notification)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkRead(notification)}
                    disabled={markReadMutation.isPending}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Read
                  </button>
                )}
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
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Notifications</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Modal Components
  const DetailsModal = () => (
    showDetailsModal && selectedNotification && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Notification Details</h3>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Notification Info</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">ID:</span> {selectedNotification.id}</div>
                  <div><span className="font-medium">Type:</span> <span className="capitalize">{selectedNotification.type}</span></div>
                  <div><span className="font-medium">Status:</span> {selectedNotification.isRead ? 'Read' : 'Unread'}</div>
                  <div><span className="font-medium">Sent:</span> {formatDate(selectedNotification.sentAt)}</div>
                  {selectedNotification.readAt && (
                    <div><span className="font-medium">Read:</span> {formatDate(selectedNotification.readAt)}</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recipient</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedNotification.user.firstName} {selectedNotification.user.lastName}</div>
                  <div><span className="font-medium">Email:</span> {selectedNotification.user.email}</div>
                  <div><span className="font-medium">User ID:</span> {selectedNotification.user.id}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Content</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <h5 className="font-medium text-gray-900">{selectedNotification.title}</h5>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{selectedNotification.message}</p>
                </div>
              </div>
            </div>

            {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Additional Data</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(selectedNotification.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  )

  const CreateModal = () => (
    (showCreateModal || showBulkModal) && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              {showBulkModal ? 'Send Bulk Notification' : 'Create Notification'}
            </h3>
            <button
              onClick={() => {
                setShowCreateModal(false)
                setShowBulkModal(false)
                setNewNotification({ type: 'general', title: '', message: '', target: 'specific', userIds: [] })
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push</option>
                  <option value="system">System</option>
                </select>
              </div>

              {showBulkModal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target
                  </label>
                  <select
                    value={newNotification.target}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, target: e.target.value as 'all' | 'specific' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="specific">Specific Users</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                placeholder="Notification title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                placeholder="Notification message..."
              />
            </div>

            {!showBulkModal && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User IDs (comma-separated)
                </label>
                <input
                  type="text"
                  onChange={(e) => setNewNotification(prev => ({ 
                    ...prev, 
                    userIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                  placeholder="user1, user2, user3..."
                />
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => createMutation.mutate(newNotification)}
                disabled={!newNotification.title || !newNotification.message || createMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Send Notification
              </button>
              
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowBulkModal(false)
                  setNewNotification({ type: 'general', title: '', message: '', target: 'specific', userIds: [] })
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Notifications Management</h1>
          <p className="text-gray-600 mt-2">Send and manage user notifications across all channels</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
          <button 
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Users className="h-4 w-4" />
            Bulk Send
          </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Sent"
            value={metrics.totalNotifications}
            icon={<Send className="h-5 w-5" />}
          />
          <MetricCard
            title="Today's Notifications"
            value={metrics.todayNotifications}
            subtitle="24h activity"
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Read Rate"
            value={`${metrics.readRate}%`}
            subtitle="Overall engagement"
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="Unread Messages"
            value={metrics.unreadNotifications}
            icon={<Bell className="h-5 w-5" />}
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
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="general">General</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
            <option value="system">System</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('')
              setTypeFilter('')
              setStatusFilter('')
              setPage(1)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={notificationsData?.notifications || []}
        columns={columns}
        pagination={{
          page,
          pageSize: 20,
          total: notificationsData?.pagination?.total || 0,
          onPageChange: setPage
        }}
      />

      {/* Modals */}
      <DetailsModal />
      <CreateModal />
    </div>
  )
}

