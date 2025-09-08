'use client'

import React, { useState } from 'react'
import { 
  Shield, 
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Package,
  Car,
  Eye,
  MoreVertical,
  RefreshCw,
  Search,
  Download,
  FileCheck,
  MapPin,
  Camera,
  Lock
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface SafetyConfirmation {
  id: string
  packageId: string
  tripId: string
  userId: string
  confirmationType: string
  confirmations: Record<string, any>
  notes?: string
  confirmedAt: string
  user: {
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
}

export default function SafetyPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [selectedConfirmation, setSelectedConfirmation] = useState<SafetyConfirmation | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const queryClient = useQueryClient()

  // Fetch safety confirmations
  const { data: confirmationsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-safety-confirmations', page, searchTerm, typeFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter })
      })
      
      const response = await fetch(`/api/dashboard/safety-confirmations?${params}`)
      if (!response.ok) throw new Error('Failed to fetch safety confirmations')
      return response.json()
    }
  })

  // Fetch metrics
  const { data: metrics } = useQuery({
    queryKey: ['safety-confirmations-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/safety-confirmations/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    }
  })

  // Verify confirmation mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ confirmationId, status }: { confirmationId: string, status: 'verified' | 'rejected' }) => {
      const response = await fetch(`/api/dashboard/safety-confirmations/${confirmationId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!response.ok) throw new Error('Failed to verify confirmation')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-safety-confirmations'] })
      queryClient.invalidateQueries({ queryKey: ['safety-confirmations-metrics'] })
    }
  })

  // Handle actions
  const handleViewDetails = (confirmation: SafetyConfirmation) => {
    setSelectedConfirmation(confirmation)
    setShowDetailsModal(true)
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
    switch (type.toUpperCase()) {
      case 'ASSIGNMENT':
        return <User className="h-4 w-4 text-blue-500" />
      case 'PICKUP':
        return <Package className="h-4 w-4 text-orange-500" />
      case 'DELIVERY':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getConfirmationStatus = (confirmations: Record<string, any>) => {
    const requiredItems = [
      'identity_verified',
      'package_condition_ok',
      'location_confirmed',
      'photo_taken'
    ]
    
    const completedItems = requiredItems.filter(item => confirmations[item] === true)
    const completionRate = (completedItems.length / requiredItems.length) * 100
    
    if (completionRate === 100) return { status: 'complete', color: 'text-green-700 bg-green-50', text: 'Complete' }
    if (completionRate >= 50) return { status: 'partial', color: 'text-yellow-700 bg-yellow-50', text: `${Math.round(completionRate)}% Complete` }
    return { status: 'incomplete', color: 'text-red-700 bg-red-50', text: 'Incomplete' }
  }

  const columns = [
    {
      key: 'id',
      label: 'Confirmation ID',
      render: (value: string) => (
        <div className="font-mono text-sm text-gray-600">
          #{value.slice(0, 8)}...
        </div>
      )
    },
    {
      key: 'user',
      label: 'User',
      render: (_: any, confirmation: SafetyConfirmation) => (
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">
              {confirmation.user.firstName} {confirmation.user.lastName}
            </div>
            <div className="text-sm text-gray-500">{confirmation.user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'confirmationType',
      label: 'Type',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(value)}
          <span className="capitalize font-medium text-gray-900">
            {value.toLowerCase().replace('_', ' ')}
          </span>
        </div>
      )
    },
    {
      key: 'context',
      label: 'Context',
      render: (_: any, confirmation: SafetyConfirmation) => (
        <div className="text-sm space-y-1">
          {confirmation.package && (
            <div className="flex items-center gap-2">
              <Package className="h-3 w-3 text-blue-500" />
              <span className="font-medium text-blue-600">{confirmation.package.title}</span>
            </div>
          )}
          {confirmation.trip && (
            <div className="flex items-center gap-2">
              <Car className="h-3 w-3 text-purple-500" />
              <span className="font-medium text-purple-600">Trip {confirmation.trip.id.slice(0, 8)}...</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'confirmations',
      label: 'Status',
      render: (confirmations: Record<string, any>) => {
        const { color, text } = getConfirmationStatus(confirmations)
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {text}
          </span>
        )
      }
    },
    {
      key: 'confirmedAt',
      label: 'Confirmed',
      render: (value: string) => (
        <div className="text-sm text-gray-500">
          {formatDate(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, confirmation: SafetyConfirmation) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === confirmation.id ? null : confirmation.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openActionDropdown === confirmation.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewDetails(confirmation)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                
                <button
                  onClick={() => verifyMutation.mutate({ confirmationId: confirmation.id, status: 'verified' })}
                  disabled={verifyMutation.isPending}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Verify
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
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Safety Confirmations</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Details Modal
  const DetailsModal = () => (
    showDetailsModal && selectedConfirmation && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Safety Confirmation Details</h3>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Confirmation Info</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">ID:</span> #{selectedConfirmation.id}</div>
                  <div><span className="font-medium">Type:</span> <span className="capitalize">{selectedConfirmation.confirmationType.toLowerCase()}</span></div>
                  <div><span className="font-medium">Confirmed:</span> {formatDate(selectedConfirmation.confirmedAt)}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedConfirmation.user.firstName} {selectedConfirmation.user.lastName}</div>
                  <div><span className="font-medium">Email:</span> {selectedConfirmation.user.email}</div>
                  <div><span className="font-medium">User ID:</span> {selectedConfirmation.user.id}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Context</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Package ID:</span> {selectedConfirmation.packageId}</div>
                  <div><span className="font-medium">Trip ID:</span> {selectedConfirmation.tripId}</div>
                  {selectedConfirmation.package && (
                    <div><span className="font-medium">Package:</span> {selectedConfirmation.package.title}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Confirmations Checklist */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Safety Checklist</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedConfirmation.confirmations || {}).map(([key, value]) => (
                  <div key={key} className={`flex items-center gap-3 p-3 rounded-lg border ${
                    value === true ? 'bg-green-50 border-green-200' : 
                    value === false ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    {value === true ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : value === false ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {value === true ? 'Confirmed' : 
                         value === false ? 'Not confirmed' : 
                         typeof value === 'string' ? value : 'Pending'}
                      </div>
                    </div>
                    {getConfirmationIcon(key)}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selectedConfirmation.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">{selectedConfirmation.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  )

  const getConfirmationIcon = (key: string) => {
    switch (key) {
      case 'identity_verified':
        return <User className="h-4 w-4 text-gray-400" />
      case 'package_condition_ok':
        return <Package className="h-4 w-4 text-gray-400" />
      case 'location_confirmed':
        return <MapPin className="h-4 w-4 text-gray-400" />
      case 'photo_taken':
        return <Camera className="h-4 w-4 text-gray-400" />
      case 'signature_obtained':
        return <FileCheck className="h-4 w-4 text-gray-400" />
      default:
        return <Lock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Safety Confirmations</h1>
          <p className="text-gray-600 mt-2">Monitor safety verification protocols and security confirmations</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Confirmations"
            value={metrics.totalConfirmations}
            icon={<Shield className="h-5 w-5" />}
          />
          <MetricCard
            title="Today's Confirmations"
            value={metrics.todayConfirmations}
            subtitle="24h activity"
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Completion Rate"
            value={`${metrics.completionRate}%`}
            subtitle="Fully completed"
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="Pending Verification"
            value={metrics.pendingVerification}
            icon={<AlertTriangle className="h-5 w-5" />}
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
              placeholder="Search confirmations..."
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
            <option value="ASSIGNMENT">Assignment</option>
            <option value="PICKUP">Pickup</option>
            <option value="DELIVERY">Delivery</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="complete">Complete</option>
            <option value="partial">Partial</option>
            <option value="incomplete">Incomplete</option>
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
        data={confirmationsData?.confirmations || []}
        columns={columns}
        pagination={{
          page,
          pageSize: 20,
          total: confirmationsData?.pagination?.total || 0,
          onPageChange: setPage
        }}
      />

      {/* Modal */}
      <DetailsModal />
    </div>
  )
}

