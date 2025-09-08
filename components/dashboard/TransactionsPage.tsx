'use client'

import React, { useEffect, useState } from 'react'
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  RefreshCw,
  Search,
  Download,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Transaction {
  id: string
  type: string
  amount: number
  currency: string
  status: string
  description: string
  packageId?: string
  tripId?: string
  platformFee: number
  gatewayFee: number
  netAmount: number
  processedAt?: string
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  paymentMethod?: {
    type: string
    last4?: string
    brand?: string
  }
}

interface _TransactionMetrics {
  totalRevenue: number
  totalTransactions: number
  pendingAmount: number
  completedTransactions: number
  failedTransactions: number
  platformFeesCollected: number
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [page, setPage] = useState(1)
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)

  const queryClient = useQueryClient()

  // Fetch transactions
  const { data: transactionsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-transactions', page, searchTerm, selectedType, selectedStatus, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedType && { type: selectedType }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(dateRange && { dateRange })
      })
      
      const response = await fetch(`/api/dashboard/transactions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch transactions')
      return response.json()
    }
  })

  // Fetch transaction metrics
  const { data: metrics } = useQuery({
    queryKey: ['transaction-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/transactions/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    }
  })

  // Refund transaction mutation
  const refundMutation = useMutation({
    mutationFn: async ({ transactionId, amount, reason }: { transactionId: string, amount: number, reason: string }) => {
      const response = await fetch(`/api/dashboard/transactions/${transactionId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason })
      })
      if (!response.ok) throw new Error('Failed to process refund')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-metrics'] })
      setShowRefundModal(false)
    }
  })

  // Handle actions
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowDetailsModal(true)
    setOpenActionDropdown(null)
  }

  const handleRefund = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowRefundModal(true)
    setOpenActionDropdown(null)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED': return <XCircle className="h-4 w-4 text-red-500" />
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'REFUNDED': return <ArrowDownLeft className="h-4 w-4 text-orange-500" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REFUNDED': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT': return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'PAYOUT': return <ArrowDownLeft className="h-4 w-4 text-blue-500" />
      case 'REFUND': return <ArrowDownLeft className="h-4 w-4 text-orange-500" />
      case 'COMMISSION': return <DollarSign className="h-4 w-4 text-purple-500" />
      default: return <DollarSign className="h-4 w-4 text-gray-500" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
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

  const columns = [
    {
      key: 'transaction',
      label: 'Transaction',
      render: (_: any, transaction: Transaction) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getTypeIcon(transaction.type)}
            {getStatusIcon(transaction.status)}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {transaction.description || `${transaction.type} Transaction`}
            </div>
            <div className="text-sm text-gray-500">ID: {transaction.id.slice(0, 8)}...</div>
          </div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'User',
      render: (_: any, transaction: Transaction) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {transaction.user.firstName} {transaction.user.lastName}
          </div>
          <div className="text-gray-500">{transaction.user.email}</div>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (_: any, transaction: Transaction) => (
        <div className="text-right">
          <div className={`font-medium ${
            transaction.type === 'PAYMENT' || transaction.type === 'COMMISSION' 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {transaction.type === 'PAYMENT' || transaction.type === 'COMMISSION' ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </div>
          <div className="text-sm text-gray-500">
            Net: {formatCurrency(transaction.netAmount)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'method',
      label: 'Payment Method',
      render: (_: any, transaction: Transaction) => (
        <div className="text-sm">
          {transaction.paymentMethod ? (
            <div>
              <div className="font-medium">
                {transaction.paymentMethod.brand} •••• {transaction.paymentMethod.last4}
              </div>
              <div className="text-gray-500 capitalize">{transaction.paymentMethod.type}</div>
            </div>
          ) : (
            <span className="text-gray-400">N/A</span>
          )}
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (_: any, transaction: Transaction) => (
        <div className="text-sm">
          <div>{formatDate(transaction.createdAt)}</div>
          {transaction.processedAt && (
            <div className="text-gray-500">
              Processed: {formatDate(transaction.processedAt)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, transaction: Transaction) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === transaction.id ? null : transaction.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openActionDropdown === transaction.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewTransaction(transaction)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                
                {transaction.status === 'COMPLETED' && (transaction.type === 'PAYMENT' || transaction.type === 'PAYOUT') && (
                  <button
                    onClick={() => handleRefund(transaction)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                  >
                    <ArrowDownLeft className="h-4 w-4" />
                    Issue Refund
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
            <h3 className="font-medium text-red-800">Error Loading Transactions</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Modal Components
  const TransactionDetailsModal = () => (
    showDetailsModal && selectedTransaction && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Transaction Details</h3>
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
                <h4 className="font-medium text-gray-900 mb-3">Transaction Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">ID:</span> {selectedTransaction.id}</div>
                  <div><span className="font-medium">Type:</span> {selectedTransaction.type}</div>
                  <div><span className="font-medium">Amount:</span> {formatCurrency(selectedTransaction.amount)}</div>
                  <div><span className="font-medium">Platform Fee:</span> {formatCurrency(selectedTransaction.platformFee)}</div>
                  <div><span className="font-medium">Gateway Fee:</span> {formatCurrency(selectedTransaction.gatewayFee)}</div>
                  <div><span className="font-medium">Net Amount:</span> {formatCurrency(selectedTransaction.netAmount)}</div>
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">User & Payment Details</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">User:</span> {selectedTransaction.user.firstName} {selectedTransaction.user.lastName}</div>
                  <div><span className="font-medium">Email:</span> {selectedTransaction.user.email}</div>
                  {selectedTransaction.paymentMethod && (
                    <>
                      <div><span className="font-medium">Payment Method:</span> {selectedTransaction.paymentMethod.type}</div>
                      <div><span className="font-medium">Card:</span> {selectedTransaction.paymentMethod.brand} •••• {selectedTransaction.paymentMethod.last4}</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {selectedTransaction.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedTransaction.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Related Package</h4>
                {selectedTransaction.packageId ? (
                  <div className="text-sm">
                    <div>Package ID: {selectedTransaction.packageId}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">No related package</div>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Related Trip</h4>
                {selectedTransaction.tripId ? (
                  <div className="text-sm">
                    <div>Trip ID: {selectedTransaction.tripId}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">No related trip</div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Created:</span> {formatDate(selectedTransaction.createdAt)}</div>
                {selectedTransaction.processedAt && (
                  <div><span className="font-medium">Processed:</span> {formatDate(selectedTransaction.processedAt)}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  )

  const RefundModal = () => (
    showRefundModal && selectedTransaction && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">Issue Refund</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Transaction: <span className="font-medium">{selectedTransaction.id.slice(0, 8)}...</span>
            </p>
            <p className="text-sm text-gray-600">
              Original Amount: <span className="font-medium">{formatCurrency(selectedTransaction.amount)}</span>
            </p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            refundMutation.mutate({
              transactionId: selectedTransaction.id,
              amount: Number(formData.get('amount')),
              reason: formData.get('reason') as string
            })
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Amount
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  max={selectedTransaction.amount}
                  defaultValue={selectedTransaction.amount}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Refund
                </label>
                <textarea
                  name="reason"
                  rows={3}
                  placeholder="Enter reason for refund"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={refundMutation.isPending}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {refundMutation.isPending ? 'Processing...' : 'Issue Refund'}
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
          <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage all financial transactions</p>
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
            title="Total Revenue"
            value={formatCurrency(metrics.totalRevenue)}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <MetricCard
            title="Total Transactions"
            value={metrics.totalTransactions}
            icon={<CreditCard className="h-5 w-5" />}
          />
          <MetricCard
            title="Pending Amount"
            value={formatCurrency(metrics.pendingAmount)}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Completed"
            value={metrics.completedTransactions}
            subtitle={`${((metrics.completedTransactions / metrics.totalTransactions) * 100).toFixed(1)}% success rate`}
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="Failed"
            value={metrics.failedTransactions}
            subtitle={`${((metrics.failedTransactions / metrics.totalTransactions) * 100).toFixed(1)}% failure rate`}
            icon={<XCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="Platform Fees"
            value={formatCurrency(metrics.platformFeesCollected)}
            icon={<TrendingUp className="h-5 w-5" />}
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
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="PAYMENT">Payment</option>
            <option value="PAYOUT">Payout</option>
            <option value="REFUND">Refund</option>
            <option value="COMMISSION">Commission</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
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
              setSelectedType('')
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

      {/* Transactions Table */}
      <DataTable
        data={transactionsData?.transactions || []}
        columns={columns}
        pagination={{
          page,
          pageSize: 20,
          total: transactionsData?.pagination?.total || 0,
          onPageChange: setPage
        }}
      />

      {/* Modals */}
      <TransactionDetailsModal />
      <RefundModal />
    </div>
  )
}

