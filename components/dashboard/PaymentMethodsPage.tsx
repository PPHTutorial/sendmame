'use client'

import React, { useState } from 'react'
import { 
  CreditCard, 
  Smartphone, 
  Building2,
  RefreshCw,
  Search,
  Download,
  Eye,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface PaymentMethod {
  id: string
  userId: string
  type: string
  brand?: string
  last4?: string
  expiryMonth?: number
  expiryYear?: number
  holderName?: string
  isDefault: boolean
  isActive: boolean
  bankName?: string
  accountType?: string
  phoneNumber?: string
  provider?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  _count: {
    transactions: number
  }
}

interface PaymentMethodMetrics {
  totalPaymentMethods: number
  activePaymentMethods: number
  cardMethods: number
  bankMethods: number
  mobileMethods: number
  defaultMethods: number
}

export default function PaymentMethodsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)

  const queryClient = useQueryClient()

  // Fetch payment methods
  const { data: paymentMethodsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-payment-methods', page, searchTerm, typeFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter })
      })
      
      const response = await fetch(`/api/dashboard/payment-methods?${params}`)
      if (!response.ok) throw new Error('Failed to fetch payment methods')
      return response.json()
    }
  })

  // Fetch payment method metrics
  const { data: metrics } = useQuery({
    queryKey: ['payment-method-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/payment-methods/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    }
  })

  // Deactivate payment method mutation
  const deactivateMutation = useMutation({
    mutationFn: async ({ paymentMethodId, reason }: { paymentMethodId: string, reason: string }) => {
      const response = await fetch(`/api/dashboard/payment-methods/${paymentMethodId}/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      if (!response.ok) throw new Error('Failed to deactivate payment method')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-payment-methods'] })
      queryClient.invalidateQueries({ queryKey: ['payment-method-metrics'] })
      setShowDeactivateModal(false)
    }
  })

  // Handle actions
  const handleViewPaymentMethod = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod)
    setShowDetailsModal(true)
    setOpenActionDropdown(null)
  }

  const handleDeactivate = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod)
    setShowDeactivateModal(true)
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
      case 'card':
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4 text-blue-500" />
      case 'bank_account':
      case 'bank_transfer':
        return <Building2 className="h-4 w-4 text-green-500" />
      case 'mobile_money':
      case 'mobile_payment':
        return <Smartphone className="h-4 w-4 text-purple-500" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />
  }

  const columns = [
    {
      key: 'method',
      label: 'Payment Method',
      render: (_: any, method: PaymentMethod) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getTypeIcon(method.type)}
            {method.isDefault && <Shield className="h-4 w-4 text-yellow-500" />}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {method.brand && method.last4 
                ? `${method.brand} •••• ${method.last4}`
                : method.bankName || method.provider || 'Payment Method'
              }
            </div>
            <div className="text-sm text-gray-500 capitalize">
              {method.type.replace('_', ' ')}
              {method.isDefault && ' (Default)'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'User',
      render: (_: any, method: PaymentMethod) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {method.user.firstName} {method.user.lastName}
          </div>
          <div className="text-gray-500">{method.user.email}</div>
        </div>
      )
    },
    {
      key: 'details',
      label: 'Details',
      render: (_: any, method: PaymentMethod) => (
        <div className="text-sm">
          {method.holderName && (
            <div className="font-medium">{method.holderName}</div>
          )}
          {method.expiryMonth && method.expiryYear && (
            <div className="text-gray-500">
              Expires: {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
            </div>
          )}
          {method.accountType && (
            <div className="text-gray-500 capitalize">{method.accountType}</div>
          )}
          {method.phoneNumber && (
            <div className="text-gray-500">{method.phoneNumber}</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, method: PaymentMethod) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(method.isActive)}
          <span className={`text-sm font-medium ${
            method.isActive ? 'text-green-700' : 'text-red-700'
          }`}>
            {method.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    },
    {
      key: 'transactions',
      label: 'Transactions',
      render: (_: any, method: PaymentMethod) => (
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {method._count.transactions}
          </div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Added',
      render: (value: string) => (
        <div className="text-sm text-gray-500">
          {formatDate(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, method: PaymentMethod) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === method.id ? null : method.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openActionDropdown === method.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewPaymentMethod(method)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                
                {method.isActive && (
                  <button
                    onClick={() => handleDeactivate(method)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Deactivate
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
            <h3 className="font-medium text-red-800">Error Loading Payment Methods</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Modal Components
  const PaymentMethodDetailsModal = () => (
    showDetailsModal && selectedPaymentMethod && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Payment Method Details</h3>
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
                <h4 className="font-medium text-gray-900 mb-3">Payment Method Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">ID:</span> {selectedPaymentMethod.id}</div>
                  <div><span className="font-medium">Type:</span> {selectedPaymentMethod.type}</div>
                  {selectedPaymentMethod.brand && (
                    <div><span className="font-medium">Brand:</span> {selectedPaymentMethod.brand}</div>
                  )}
                  {selectedPaymentMethod.last4 && (
                    <div><span className="font-medium">Last 4:</span> •••• {selectedPaymentMethod.last4}</div>
                  )}
                  {selectedPaymentMethod.holderName && (
                    <div><span className="font-medium">Holder:</span> {selectedPaymentMethod.holderName}</div>
                  )}
                  <div><span className="font-medium">Default:</span> {selectedPaymentMethod.isDefault ? 'Yes' : 'No'}</div>
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-1 ${selectedPaymentMethod.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedPaymentMethod.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">User Details</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedPaymentMethod.user.firstName} {selectedPaymentMethod.user.lastName}</div>
                  <div><span className="font-medium">Email:</span> {selectedPaymentMethod.user.email}</div>
                  <div><span className="font-medium">User ID:</span> {selectedPaymentMethod.user.id}</div>
                  <div><span className="font-medium">Transactions:</span> {selectedPaymentMethod._count.transactions}</div>
                </div>
              </div>
            </div>

            {selectedPaymentMethod.expiryMonth && selectedPaymentMethod.expiryYear && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Card Details</h4>
                <div className="text-sm">
                  <div>Expires: {selectedPaymentMethod.expiryMonth.toString().padStart(2, '0')}/{selectedPaymentMethod.expiryYear}</div>
                </div>
              </div>
            )}

            {(selectedPaymentMethod.bankName || selectedPaymentMethod.accountType) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Bank Details</h4>
                <div className="text-sm space-y-1">
                  {selectedPaymentMethod.bankName && (
                    <div><span className="font-medium">Bank:</span> {selectedPaymentMethod.bankName}</div>
                  )}
                  {selectedPaymentMethod.accountType && (
                    <div><span className="font-medium">Account Type:</span> {selectedPaymentMethod.accountType}</div>
                  )}
                </div>
              </div>
            )}

            {(selectedPaymentMethod.phoneNumber || selectedPaymentMethod.provider) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Mobile Payment Details</h4>
                <div className="text-sm space-y-1">
                  {selectedPaymentMethod.phoneNumber && (
                    <div><span className="font-medium">Phone:</span> {selectedPaymentMethod.phoneNumber}</div>
                  )}
                  {selectedPaymentMethod.provider && (
                    <div><span className="font-medium">Provider:</span> {selectedPaymentMethod.provider}</div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Added:</span> {formatDate(selectedPaymentMethod.createdAt)}</div>
                <div><span className="font-medium">Updated:</span> {formatDate(selectedPaymentMethod.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  )

  const DeactivateModal = () => (
    showDeactivateModal && selectedPaymentMethod && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">Deactivate Payment Method</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              User: <span className="font-medium">{selectedPaymentMethod.user.firstName} {selectedPaymentMethod.user.lastName}</span>
            </p>
            <p className="text-sm text-gray-600">
              Method: <span className="font-medium">
                {selectedPaymentMethod.brand && selectedPaymentMethod.last4 
                  ? `${selectedPaymentMethod.brand} •••• ${selectedPaymentMethod.last4}`
                  : selectedPaymentMethod.bankName || selectedPaymentMethod.provider || 'Payment Method'
                }
              </span>
            </p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            deactivateMutation.mutate({
              paymentMethodId: selectedPaymentMethod.id,
              reason: formData.get('reason') as string
            })
          }}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Deactivation
              </label>
              <textarea
                name="reason"
                rows={3}
                placeholder="Enter reason for deactivating this payment method"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={deactivateMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deactivateMutation.isPending ? 'Processing...' : 'Deactivate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  )

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <p className="text-gray-600 mt-2">Manage user payment methods and security</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <MetricCard
            title="Total Methods"
            value={metrics.totalPaymentMethods}
            icon={<CreditCard className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Methods"
            value={metrics.activePaymentMethods}
            subtitle={`${((metrics.activePaymentMethods / metrics.totalPaymentMethods) * 100).toFixed(1)}% active`}
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="Credit Cards"
            value={metrics.cardMethods}
            icon={<CreditCard className="h-5 w-5" />}
          />
          <MetricCard
            title="Bank Accounts"
            value={metrics.bankMethods}
            icon={<Building2 className="h-5 w-5" />}
          />
          <MetricCard
            title="Mobile Payments"
            value={metrics.mobileMethods}
            icon={<Smartphone className="h-5 w-5" />}
          />
          <MetricCard
            title="Default Methods"
            value={metrics.defaultMethods}
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
              placeholder="Search users or methods..."
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
            <option value="card">Credit/Debit Cards</option>
            <option value="bank_account">Bank Accounts</option>
            <option value="mobile_money">Mobile Money</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="default">Default Methods</option>
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

      {/* Payment Methods Table */}
      <DataTable
        data={paymentMethodsData?.paymentMethods || []}
        columns={columns}
        pagination={{
          page,
          pageSize: 20,
          total: paymentMethodsData?.pagination?.total || 0,
          onPageChange: setPage
        }}
      />

      {/* Modals */}
      <PaymentMethodDetailsModal />
      <DeactivateModal />
    </div>
  )
}
