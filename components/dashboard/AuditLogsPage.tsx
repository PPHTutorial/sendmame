'use client'

import React, { useEffect, useState } from 'react'
import { 
  FileText, 
  Shield, 
  User, 
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
  Clock,
  Settings,
  Activity,
  Database
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface AuditLog {
  id: string
  userId?: string
  action: string
  entity: string
  entityId?: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
  createdAt: string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    profile?: {
      profilePicture?: string
    }
  } | null
}

interface _AuditLogMetrics {
  totalLogs: number
  todayLogs: number
  thisWeekLogs: number
  thisMonthLogs: number
  thisHourLogs: number
  systemLogs: number
  userLogs: number
  criticalActions: number
}

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [page, setPage] = useState(1)
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const queryClient = useQueryClient()

  // Fetch audit logs
  const { data: auditLogsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-audit-logs', page, searchTerm, selectedAction, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedAction && { action: selectedAction }),
        ...(dateRange && { dateRange })
      })
      
      const response = await fetch(`/api/dashboard/audit-logs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch audit logs')
      return response.json()
    }
  })

  // Fetch audit log metrics
  const { data: metrics } = useQuery({
    queryKey: ['audit-log-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/audit-logs/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    }
  })

  // Handle actions
  const handleViewAuditLog = (auditLog: AuditLog) => {
    setSelectedAuditLog(auditLog)
    setShowDetailsModal(true)
    setOpenActionDropdown(null)
  }

  const handleDeleteAuditLog = async () => {
    if (!selectedAuditLog) return
    
    try {
      const response = await fetch(`/api/dashboard/audit-logs?id=${selectedAuditLog.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete audit log')
      
      setShowDeleteConfirm(false)
      setSelectedAuditLog(null)
      setOpenActionDropdown(null)
      
      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['dashboard-audit-logs'] })
      queryClient.invalidateQueries({ queryKey: ['audit-log-metrics'] })
    } catch (err) {
      console.error('Error deleting audit log:', err)
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

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'login':
        return 'bg-green-100 text-green-800'
      case 'update':
      case 'modify':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
      case 'logout':
        return 'bg-red-100 text-red-800'
      case 'login_failed':
      case 'permission_denied':
      case 'security_violation':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <CheckCircle className="h-3 w-3" />
      case 'update':
      case 'modify':
        return <Settings className="h-3 w-3" />
      case 'delete':
        return <Trash2 className="h-3 w-3" />
      case 'login':
      case 'logout':
        return <User className="h-3 w-3" />
      case 'login_failed':
      case 'permission_denied':
      case 'security_violation':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Activity className="h-3 w-3" />
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

  const formatJsonData = (data: any) => {
    if (!data) return 'None'
    if (typeof data === 'string') return data
    return JSON.stringify(data, null, 2)
  }

  const truncateString = (str: string, maxLength: number = 50) => {
    if (str.length <= maxLength) return str
    return str.substring(0, maxLength) + '...'
  }

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_: any, auditLog: AuditLog) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            {auditLog.user ? (
              <>
                {auditLog.user.profile?.profilePicture ? (
                  <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                ) : (
                  <User className="h-5 w-5 text-gray-500" />
                )}
              </>
            ) : (
              <Settings className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div>
            {auditLog.user ? (
              <>
                <div className="font-medium text-gray-900">
                  {auditLog.user.firstName} {auditLog.user.lastName}
                </div>
                <div className="text-sm text-gray-500">{auditLog.user.email}</div>
              </>
            ) : (
              <>
                <div className="font-medium text-gray-900">System</div>
                <div className="text-sm text-gray-500">Automated Action</div>
              </>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      render: (_: any, auditLog: AuditLog) => (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(auditLog.action)}`}>
            {getActionIcon(auditLog.action)}
            {auditLog.action}
          </span>
        </div>
      )
    },
    {
      key: 'entity',
      label: 'Entity',
      render: (_: any, auditLog: AuditLog) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 flex items-center gap-1">
            <Database className="h-4 w-4" />
            {auditLog.entity}
          </div>
          {auditLog.entityId && (
            <div className="text-gray-500">ID: {truncateString(auditLog.entityId, 20)}</div>
          )}
        </div>
      )
    },
    {
      key: 'details',
      label: 'Details',
      render: (_: any, auditLog: AuditLog) => (
        <div className="text-sm max-w-xs">
          {auditLog.oldValues && (
            <div className="text-gray-600">
              <span className="font-medium">Old:</span> {truncateString(formatJsonData(auditLog.oldValues), 30)}
            </div>
          )}
          {auditLog.newValues && (
            <div className="text-gray-600">
              <span className="font-medium">New:</span> {truncateString(formatJsonData(auditLog.newValues), 30)}
            </div>
          )}
          {!auditLog.oldValues && !auditLog.newValues && (
            <span className="text-gray-400">No details</span>
          )}
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (_: any, auditLog: AuditLog) => (
        <div className="text-sm text-gray-500">
          {auditLog.ipAddress ? (
            <div className="space-y-1">
              <div className="font-medium">IP: {auditLog.ipAddress}</div>
              {auditLog.userAgent && (
                <div className="text-xs">
                  {truncateString(auditLog.userAgent, 40)}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">Unknown</span>
          )}
        </div>
      )
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (_: any, auditLog: AuditLog) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(auditLog.createdAt)}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, auditLog: AuditLog) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === auditLog.id ? null : auditLog.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openActionDropdown === auditLog.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewAuditLog(auditLog)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    setSelectedAuditLog(auditLog)
                    setShowDeleteConfirm(true)
                    setOpenActionDropdown(null)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Log
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
            <h3 className="font-medium text-red-800">Error Loading Audit Logs</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Modal Components
  const AuditLogDetailsModal = () => (
    showDetailsModal && selectedAuditLog && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Audit Log Details</h3>
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
                <h4 className="font-medium text-gray-900 mb-3">Log Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">ID:</span> {selectedAuditLog.id}</div>
                  <div><span className="font-medium">Action:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getActionColor(selectedAuditLog.action)}`}>
                      {selectedAuditLog.action}
                    </span>
                  </div>
                  <div><span className="font-medium">Entity:</span> {selectedAuditLog.entity}</div>
                  {selectedAuditLog.entityId && (
                    <div><span className="font-medium">Entity ID:</span> {selectedAuditLog.entityId}</div>
                  )}
                  <div><span className="font-medium">Timestamp:</span> {formatDate(selectedAuditLog.createdAt)}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
                <div className="space-y-2 text-sm">
                  {selectedAuditLog.user ? (
                    <>
                      <div><span className="font-medium">Name:</span> {selectedAuditLog.user.firstName} {selectedAuditLog.user.lastName}</div>
                      <div><span className="font-medium">Email:</span> {selectedAuditLog.user.email}</div>
                      <div><span className="font-medium">User ID:</span> {selectedAuditLog.user.id}</div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Settings className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">System Action</div>
                        <div className="text-xs text-gray-500">No user associated</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(selectedAuditLog.ipAddress || selectedAuditLog.userAgent) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Location & Device Information</h4>
                <div className="space-y-3">
                  {selectedAuditLog.ipAddress && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">IP Address</div>
                        <div className="text-sm text-gray-500">{selectedAuditLog.ipAddress}</div>
                      </div>
                    </div>
                  )}
                  {selectedAuditLog.userAgent && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Database className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">User Agent</div>
                        <div className="text-sm text-gray-500 break-words">{selectedAuditLog.userAgent}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(selectedAuditLog.oldValues || selectedAuditLog.newValues) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Data Changes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAuditLog.oldValues && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Old Values</h5>
                      <pre className="text-xs bg-red-50 border border-red-200 rounded-lg p-3 overflow-auto max-h-40">
                        {formatJsonData(selectedAuditLog.oldValues)}
                      </pre>
                    </div>
                  )}
                  {selectedAuditLog.newValues && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">New Values</h5>
                      <pre className="text-xs bg-green-50 border border-green-200 rounded-lg p-3 overflow-auto max-h-40">
                        {formatJsonData(selectedAuditLog.newValues)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  )

  const DeleteConfirmModal = () => (
    showDeleteConfirm && selectedAuditLog && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Delete Audit Log</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this audit log? This action cannot be undone and may affect compliance requirements.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleDeleteAuditLog}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Log
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(false)
                setSelectedAuditLog(null)
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
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-2">System activity tracking and audit trail</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6">
          <MetricCard
            title="Total Logs"
            value={metrics.totalLogs}
            icon={<FileText className="h-5 w-5" />}
          />
          <MetricCard
            title="Today's Logs"
            value={metrics.todayLogs}
            icon={<Calendar className="h-5 w-5" />}
          />
          <MetricCard
            title="This Week"
            value={metrics.thisWeekLogs}
            icon={<Activity className="h-5 w-5" />}
          />
          <MetricCard
            title="This Month"
            value={metrics.thisMonthLogs}
            icon={<Database className="h-5 w-5" />}
          />
          <MetricCard
            title="This Hour"
            value={metrics.thisHourLogs}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="System Logs"
            value={metrics.systemLogs}
            icon={<Settings className="h-5 w-5" />}
          />
          <MetricCard
            title="User Logs"
            value={metrics.userLogs}
            icon={<User className="h-5 w-5" />}
          />
          <MetricCard
            title="Critical Actions"
            value={metrics.criticalActions}
            icon={<Shield className="h-5 w-5" />}
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
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="LOGIN_FAILED">Login Failed</option>
            <option value="PERMISSION_DENIED">Permission Denied</option>
            <option value="SECURITY_VIOLATION">Security Violation</option>
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
              setSelectedAction('')
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

      {/* Audit Logs Table */}
      <DataTable
        data={auditLogsData?.auditLogs || []}
        columns={columns}
        pagination={{
          page,
          pageSize: 20,
          total: auditLogsData?.pagination?.total || 0,
          onPageChange: setPage
        }}
      />

      {/* Modals */}
      <AuditLogDetailsModal />
      <DeleteConfirmModal />
    </div>
  )
}

