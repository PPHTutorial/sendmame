'use client'

import React, { useState } from 'react'
import { 
  AlertTriangle, 
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Download,
  Eye,
  MoreVertical,
  MessageSquare,
  FileText,
  User,
  Package,
  Car,
  DollarSign
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Dispute {
  id: string
  packageId?: string
  tripId?: string
  reporterId: string
  reportedId: string
  type: string
  category: string
  status: string
  priority: string
  title: string
  description: string
  resolution?: string
  resolvedAt?: string
  resolvedBy?: string
  evidence: string[]
  createdAt: string
  updatedAt: string
  reporter: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  reported: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  package?: {
    id: string
    title: string
    status: string
  }
  trip?: {
    id: string
    status: string
  }
  resolver?: {
    id: string
    firstName: string
    lastName: string
  }
  _count?: {
    messages: number
  }
}

export default function DisputesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [resolutionText, setResolutionText] = useState('')

  const queryClient = useQueryClient()

  // Fetch disputes
  const { data: disputesData, isLoading, error } = useQuery({
    queryKey: ['dashboard-disputes', page, searchTerm, categoryFilter, statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter })
      })
      
      const response = await fetch(`/api/dashboard/disputes?${params}`)
      if (!response.ok) throw new Error('Failed to fetch disputes')
      return response.json()
    }
  })

  // Fetch metrics
  const { data: metrics } = useQuery({
    queryKey: ['disputes-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/disputes/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    }
  })

  // Resolve dispute mutation
  const resolveMutation = useMutation({
    mutationFn: async ({ disputeId, resolution, status }: { disputeId: string, resolution: string, status: string }) => {
      const response = await fetch(`/api/dashboard/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution, status })
      })
      if (!response.ok) throw new Error('Failed to resolve dispute')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-disputes'] })
      queryClient.invalidateQueries({ queryKey: ['disputes-metrics'] })
      setShowResolveModal(false)
      setResolutionText('')
    }
  })

  // Handle actions
  const handleViewDetails = (dispute: Dispute) => {
    setSelectedDispute(dispute)
    setShowDetailsModal(true)
    setOpenActionDropdown(null)
  }

  const handleResolve = (dispute: Dispute) => {
    setSelectedDispute(dispute)
    setShowResolveModal(true)
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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'delivery':
        return <Package className="h-4 w-4 text-blue-500" />
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-500" />
      case 'service':
        return <Car className="h-4 w-4 text-purple-500" />
      case 'communication':
        return <MessageSquare className="h-4 w-4 text-orange-500" />
      case 'safety':
        return <Shield className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'in_progress':
      case 'investigating':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'resolved':
      case 'closed':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'dismissed':
      case 'rejected':
        return 'text-gray-700 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'text-green-700 bg-green-50'
      case 'medium':
        return 'text-yellow-700 bg-yellow-50'
      case 'high':
        return 'text-orange-700 bg-orange-50'
      case 'critical':
        return 'text-red-700 bg-red-50'
      default:
        return 'text-gray-700 bg-gray-50'
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'Dispute ID',
      render: (value: string) => (
        <div className="font-mono text-sm text-gray-600">
          #{value.slice(0, 8)}...
        </div>
      )
    },
    {
      key: 'reporter',
      label: 'Reporter',
      render: (_: any, dispute: Dispute) => (
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">
              {dispute.reporter.firstName} {dispute.reporter.lastName}
            </div>
            <div className="text-sm text-gray-500">{dispute.reporter.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'reported',
      label: 'Against',
      render: (_: any, dispute: Dispute) => (
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">
              {dispute.reported.firstName} {dispute.reported.lastName}
            </div>
            <div className="text-sm text-gray-500">{dispute.reported.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'title',
      label: 'Issue',
      render: (_: any, dispute: Dispute) => (
        <div className="max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            {getCategoryIcon(dispute.category)}
            <span className="text-xs text-gray-500 uppercase">{dispute.category}</span>
          </div>
          <div className="font-medium text-gray-900 line-clamp-1">{dispute.title}</div>
          <p className="text-sm text-gray-500 line-clamp-2">{dispute.description}</p>
        </div>
      )
    },
    {
      key: 'context',
      label: 'Context',
      render: (_: any, dispute: Dispute) => (
        <div className="text-sm">
          {dispute.package && (
            <div className="font-medium text-blue-600 mb-1">
              📦 {dispute.package.title}
              <div className="text-xs text-gray-500 capitalize">Status: {dispute.package.status}</div>
            </div>
          )}
          {dispute.trip && (
            <div className="font-medium text-purple-600 mb-1">
              🚗 Trip {dispute.trip.id.slice(0, 8)}...
              <div className="text-xs text-gray-500 capitalize">Status: {dispute.trip.status}</div>
            </div>
          )}
          {!dispute.package && !dispute.trip && (
            <span className="text-gray-400">General Issue</span>
          )}
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(value)}`}>
          {value === 'in_progress' ? 'In Progress' : value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => (
        <div className="text-sm text-gray-500">
          <div>{formatDate(value)}</div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, dispute: Dispute) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === dispute.id ? null : dispute.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openActionDropdown === dispute.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewDetails(dispute)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                
                {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                  <button
                    onClick={() => handleResolve(dispute)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Resolve
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
            <h3 className="font-medium text-red-800">Error Loading Disputes</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Modal Components
  const DetailsModal = () => (
    showDetailsModal && selectedDispute && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Dispute Details</h3>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Dispute Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Dispute Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">ID:</span> #{selectedDispute.id}</div>
                  <div><span className="font-medium">Type:</span> <span className="capitalize">{selectedDispute.type}</span></div>
                  <div><span className="font-medium">Category:</span> <span className="capitalize">{selectedDispute.category}</span></div>
                  <div><span className="font-medium">Priority:</span> <span className="capitalize">{selectedDispute.priority}</span></div>
                  <div><span className="font-medium">Status:</span> <span className="capitalize">{selectedDispute.status}</span></div>
                  <div><span className="font-medium">Created:</span> {formatDate(selectedDispute.createdAt)}</div>
                  {selectedDispute.resolvedAt && (
                    <div><span className="font-medium">Resolved:</span> {formatDate(selectedDispute.resolvedAt)}</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Context</h4>
                <div className="space-y-2 text-sm">
                  {selectedDispute.package && (
                    <>
                      <div><span className="font-medium">Package:</span> {selectedDispute.package.title}</div>
                      <div><span className="font-medium">Package Status:</span> <span className="capitalize">{selectedDispute.package.status}</span></div>
                    </>
                  )}
                  {selectedDispute.trip && (
                    <>
                      <div><span className="font-medium">Trip ID:</span> {selectedDispute.trip.id}</div>
                      <div><span className="font-medium">Trip Status:</span> <span className="capitalize">{selectedDispute.trip.status}</span></div>
                    </>
                  )}
                  {selectedDispute.resolver && (
                    <div><span className="font-medium">Resolved By:</span> {selectedDispute.resolver.firstName} {selectedDispute.resolver.lastName}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Issue Description */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Issue Description</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">{selectedDispute.title}</h5>
                <p className="text-sm text-gray-600">{selectedDispute.description}</p>
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Reporter</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">
                        {selectedDispute.reporter.firstName} {selectedDispute.reporter.lastName}
                      </div>
                      <div className="text-sm text-blue-700">{selectedDispute.reporter.email}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Reported User</h4>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-red-600" />
                    <div>
                      <div className="font-medium text-red-900">
                        {selectedDispute.reported.firstName} {selectedDispute.reported.lastName}
                      </div>
                      <div className="text-sm text-red-700">{selectedDispute.reported.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence */}
            {selectedDispute.evidence.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Evidence ({selectedDispute.evidence.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedDispute.evidence.map((evidence, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{evidence}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution */}
            {selectedDispute.resolution && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Resolution</h4>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">{selectedDispute.resolution}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  )

  const ResolveModal = () => (
    showResolveModal && selectedDispute && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">Resolve Dispute</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Notes
              </label>
              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe how this dispute was resolved..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => resolveMutation.mutate({
                  disputeId: selectedDispute.id,
                  resolution: resolutionText,
                  status: 'resolved'
                })}
                disabled={!resolutionText || resolveMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                Resolve
              </button>
              
              <button
                onClick={() => resolveMutation.mutate({
                  disputeId: selectedDispute.id,
                  resolution: resolutionText,
                  status: 'dismissed'
                })}
                disabled={!resolutionText || resolveMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Dismiss
              </button>
            </div>
            
            <button
              onClick={() => setShowResolveModal(false)}
              className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
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
          <h1 className="text-3xl font-bold text-gray-900">Dispute Management</h1>
          <p className="text-gray-600 mt-2">Track and resolve user disputes and conflicts</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <MetricCard
            title="Total Disputes"
            value={metrics.totalDisputes}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <MetricCard
            title="Open Cases"
            value={metrics.openDisputes}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Resolved Today"
            value={metrics.resolvedToday}
            subtitle="24h resolution"
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="High Priority"
            value={metrics.highPriorityDisputes}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <MetricCard
            title="Resolution Rate"
            value={`${metrics.resolutionRate}%`}
            subtitle="This month"
            icon={<Shield className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search disputes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="delivery">Delivery</option>
            <option value="payment">Payment</option>
            <option value="service">Service</option>
            <option value="communication">Communication</option>
            <option value="safety">Safety</option>
            <option value="other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('')
              setCategoryFilter('')
              setStatusFilter('')
              setPriorityFilter('')
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
        data={disputesData?.disputes || []}
        columns={columns}
        pagination={{
          page,
          pageSize: 20,
          total: disputesData?.pagination?.total || 0,
          onPageChange: setPage
        }}
      />

      {/* Modals */}
      <DetailsModal />
      <ResolveModal />
    </div>
  )
}

