'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Search, 
  Eye,
  Check,
  X,
  Clock,
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move
} from 'lucide-react'
import { MetricCard, DataTable } from '@/components/ui/dashboard-components'

interface VerificationDocument {
  id: string
  userId: string
  type: string
  documentUrl: string
  backImageUrl?: string | null
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  rejectionReason: string | null
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string | null
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
    createdAt: string
  }
}

interface UserGroup {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string | null
    verificationStatus: string
    createdAt: string
  }
  documents: VerificationDocument[]
  latestSubmission: string
  hasRejected: boolean
  hasVerified: boolean
  hasPending: boolean
}

interface VerificationMetrics {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
}

interface DocumentViewerProps {
  document: VerificationDocument
  onClose: () => void
  onApprove: (docId: string) => void
  onReject: (docId: string, reason: string) => void
}

function DocumentViewer({ document, onClose, onApprove, onReject }: DocumentViewerProps) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(document.id, rejectionReason)
      setShowRejectForm(false)
      setRejectionReason('')
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'passport': return 'Passport'
      case 'driver_license': return 'Driver License'
      case 'national_id': return 'National ID'
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'VERIFIED': return 'text-green-600 bg-green-100'
      case 'REJECTED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Document Verification Review
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {getDocumentTypeLabel(document.type)} - {document.user.firstName} {document.user.lastName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Document Display */}
          <div className="flex-1 p-6 bg-gray-50">
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 h-full flex items-center justify-center relative">
              {document.documentUrl ? (
                <div className="relative w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={document.documentUrl}
                    alt={`${getDocumentTypeLabel(document.type)} document`}
                    className={`w-full h-full object-contain transition-transform ${
                      isZoomed ? 'scale-150' : 'scale-100'
                    }`}
                    style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No document available</p>
                </div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="w-80 border-l border-gray-200 p-6 bg-white overflow-y-auto">
            {/* User Info */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">User Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {document.user.avatar ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={document.user.avatar}
                          alt="User avatar"
                          className="h-10 w-10 rounded-full"
                        />
                      </>
                    ) : (
                      <User className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {document.user.firstName} {document.user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{document.user.email}</div>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">Account Status: </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(document.user.verificationStatus)}`}>
                    {document.user.verificationStatus}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">Member since: </span>
                  <span className="text-gray-900">
                    {new Date(document.user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Document Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Type: </span>
                  <span className="text-gray-900">{getDocumentTypeLabel(document.type)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status: </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(document.status)}`}>
                    {document.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Submitted: </span>
                  <span className="text-gray-900">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {document.verifiedAt && (
                  <div>
                    <span className="text-gray-500">Verified: </span>
                    <span className="text-gray-900">
                      {new Date(document.verifiedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {document.rejectionReason && (
                  <div>
                    <span className="text-gray-500">Rejection Reason: </span>
                    <span className="text-red-600">{document.rejectionReason}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {document.status === 'PENDING' && (
              <div className="space-y-3">
                <button
                  onClick={() => onApprove(document.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Approve Document
                </button>

                {!showRejectForm ? (
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Reject Document
                  </button>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleReject}
                        disabled={!rejectionReason.trim()}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectForm(false)
                          setRejectionReason('')
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => window.open(document.documentUrl, '_blank')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Document
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerificationPage() {
  const [documents, setDocuments] = useState<VerificationDocument[]>([])
  const [metrics, setMetrics] = useState<VerificationMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    pageSize: 20
  })
  const [selectedDocument, setSelectedDocument] = useState<VerificationDocument | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/verification')
      if (!response.ok) throw new Error('Failed to fetch verification metrics')
      
      const data = await response.json()
      setMetrics({
        totalRequests: data.totalDocuments,
        pendingRequests: data.statusBreakdown.find((s: any) => s.status === 'PENDING')?.count || 0,
        approvedRequests: data.statusBreakdown.find((s: any) => s.status === 'VERIFIED')?.count || 0,
        rejectedRequests: data.statusBreakdown.find((s: any) => s.status === 'REJECTED')?.count || 0
      })
    } catch (err) {
      console.error('Error fetching verification metrics:', err)
    }
  }, [])

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString()
      })

      if (searchTerm) params.append('search', searchTerm)
      if (selectedStatus) params.append('status', selectedStatus)
      if (selectedType) params.append('type', selectedType)

      const response = await fetch(`/api/dashboard/verification/list?${params}`)
      if (!response.ok) throw new Error('Failed to fetch verification documents')

      const data = await response.json()
      setDocuments(data.documents)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, selectedStatus, selectedType, pagination.pageSize])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const handleApprove = async (docId: string) => {
    try {
      const response = await fetch(`/api/dashboard/verification/${docId}/approve`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to approve document')

      // Refresh data
      await fetchDocuments()
      await fetchMetrics()
      setSelectedDocument(null)
    } catch (err) {
      console.error('Error approving document:', err)
    }
  }

  const handleReject = async (docId: string, reason: string) => {
    try {
      const response = await fetch(`/api/dashboard/verification/${docId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })

      if (!response.ok) throw new Error('Failed to reject document')

      // Refresh data
      await fetchDocuments()
      await fetchMetrics()
      setSelectedDocument(null)
    } catch (err) {
      console.error('Error rejecting document:', err)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleFilterChange = (type: string, value: string) => {
    setPage(1)
    switch (type) {
      case 'status':
        setSelectedStatus(value)
        break
      case 'type':
        setSelectedType(value)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'VERIFIED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-3 w-3" />
      case 'VERIFIED': return <ShieldCheck className="h-3 w-3" />
      case 'REJECTED': return <ShieldX className="h-3 w-3" />
      default: return <Shield className="h-3 w-3" />
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'passport': return 'Passport'
      case 'driver_license': return 'Driver License'
      case 'national_id': return 'National ID'
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_: any, doc: VerificationDocument) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            {doc.user.avatar ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={doc.user.avatar}
                  alt="User avatar"
                  className="h-10 w-10 rounded-full"
                />
              </>
            ) : (
              <User className="h-5 w-5 text-gray-600" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {doc.user.firstName} {doc.user.lastName}
            </div>
            <div className="text-sm text-gray-500">{doc.user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Document Type',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium">{getDocumentTypeLabel(value)}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}>
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Submitted',
      render: (value: string) => (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Calendar className="h-3 w-3" />
          {formatDate(value)}
        </div>
      )
    },
    {
      key: 'verifiedAt',
      label: 'Processed',
      render: (value: string | null) => (
        <span className="text-sm text-gray-500">
          {value ? formatDate(value) : 'Pending'}
        </span>
      )
    },
    {
      key: 'rejectionReason',
      label: 'Notes',
      render: (value: string | null) => (
        <div className="text-sm">
          {value ? (
            <div className="flex items-center gap-1 text-red-600">
              <MessageSquare className="h-3 w-3" />
              <span className="truncate max-w-32" title={value}>
                {value}
              </span>
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, doc: VerificationDocument) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDocument(doc)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Document"
          >
            <Eye className="h-4 w-4" />
          </button>
          {doc.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleApprove(doc.id)}
                className="p-1 text-gray-400 hover:text-green-600"
                title="Approve"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedDocument(doc)}
                className="p-1 text-gray-400 hover:text-red-600"
                title="Reject"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ]

  if (loading && documents.length === 0) {
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
            <h3 className="font-medium text-red-800">Error Loading Verification Requests</h3>
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
          <h1 className="text-3xl font-bold text-gray-900">Verification Management</h1>
          <p className="text-gray-600 mt-2">Review and manage user verification documents</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => fetchDocuments()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Requests"
            value={metrics.totalRequests}
            icon={<FileText className="h-5 w-5" />}
          />
          <MetricCard
            title="Pending Review"
            value={metrics.pendingRequests}
            subtitle={`${((metrics.pendingRequests / metrics.totalRequests) * 100).toFixed(1)}% of total`}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Approved"
            value={metrics.approvedRequests}
            subtitle={`${((metrics.approvedRequests / metrics.totalRequests) * 100).toFixed(1)}% success rate`}
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <MetricCard
            title="Rejected"
            value={metrics.rejectedRequests}
            subtitle={`${((metrics.rejectedRequests / metrics.totalRequests) * 100).toFixed(1)}% rejection rate`}
            icon={<ShieldX className="h-5 w-5" />}
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
            value={selectedStatus}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Document Types</option>
            <option value="passport">Passport</option>
            <option value="driver_license">Driver License</option>
            <option value="national_id">National ID</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedStatus('')
              setSelectedType('')
              setPage(1)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <DataTable
        data={documents}
        columns={columns}
        pagination={{
          page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onPageChange: setPage
        }}
      />

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  )
}
