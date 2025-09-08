'use client'

import React, { useState } from 'react'
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  RefreshCw,
  Search,
  Download,
  Eye,
  Lock,
  Unlock,
  MoreVertical,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface WalletData {
  id: string
  userId: string
  balance: number
  currency: string
  pendingIn: number
  pendingOut: number
  isLocked: boolean
  lockedReason?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
  _count: {
    transactions: number
  }
}

interface _WalletMetrics {
  totalWallets: number
  totalBalance: number
  lockedWallets: number
  pendingTransactions: number
  avgBalance: number
  totalPendingIn: number
  totalPendingOut: number
}

export default function WalletsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [lockFilter, setLockFilter] = useState('')
  const [balanceFilter, setBalanceFilter] = useState('')
  const [page, setPage] = useState(1)
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showLockModal, setShowLockModal] = useState(false)
  const [showAdjustBalanceModal, setShowAdjustBalanceModal] = useState(false)

  const queryClient = useQueryClient()

  // Fetch wallets
  const { data: walletsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-wallets', page, searchTerm, lockFilter, balanceFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(lockFilter && { locked: lockFilter }),
        ...(balanceFilter && { balance: balanceFilter })
      })
      
      const response = await fetch(`/api/dashboard/wallets?${params}`)
      if (!response.ok) throw new Error('Failed to fetch wallets')
      return response.json()
    }
  })

  // Fetch wallet metrics
  const { data: metrics } = useQuery({
    queryKey: ['wallet-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/wallets/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    }
  })

  // Lock/unlock wallet mutation
  const lockMutation = useMutation({
    mutationFn: async ({ walletId, action, reason }: { walletId: string, action: 'lock' | 'unlock', reason?: string }) => {
      const response = await fetch(`/api/dashboard/wallets/${walletId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      if (!response.ok) throw new Error(`Failed to ${action} wallet`)
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-wallets'] })
      queryClient.invalidateQueries({ queryKey: ['wallet-metrics'] })
      setShowLockModal(false)
    }
  })

  // Adjust balance mutation
  const adjustBalanceMutation = useMutation({
    mutationFn: async ({ walletId, amount, type, reason }: { walletId: string, amount: number, type: 'add' | 'subtract', reason: string }) => {
      const response = await fetch(`/api/dashboard/wallets/${walletId}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type, reason })
      })
      if (!response.ok) throw new Error('Failed to adjust balance')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-wallets'] })
      queryClient.invalidateQueries({ queryKey: ['wallet-metrics'] })
      setShowAdjustBalanceModal(false)
    }
  })

  // Handle actions
  const handleViewWallet = (wallet: WalletData) => {
    setSelectedWallet(wallet)
    setShowDetailsModal(true)
    setOpenActionDropdown(null)
  }

  const handleLockWallet = (wallet: WalletData) => {
    setSelectedWallet(wallet)
    setShowLockModal(true)
    setOpenActionDropdown(null)
  }

  const handleAdjustBalance = (wallet: WalletData) => {
    setSelectedWallet(wallet)
    setShowAdjustBalanceModal(true)
    setOpenActionDropdown(null)
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

  const getBalanceColor = (balance: number) => {
    if (balance > 1000) return 'text-green-600'
    if (balance > 100) return 'text-blue-600'
    if (balance > 0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_: any, wallet: WalletData) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
            {wallet.user.avatar ? (
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {wallet.user.firstName[0]}{wallet.user.lastName[0]}
                </span>
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-600">
                {wallet.user.firstName[0]}{wallet.user.lastName[0]}
              </span>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {wallet.user.firstName} {wallet.user.lastName}
            </div>
            <div className="text-sm text-gray-500">{wallet.user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (_: any, wallet: WalletData) => (
        <div className="text-right">
          <div className={`text-lg font-semibold ${getBalanceColor(wallet.balance)}`}>
            {formatCurrency(wallet.balance)}
          </div>
          <div className="text-sm text-gray-500">{wallet.currency}</div>
        </div>
      )
    },
    {
      key: 'pending',
      label: 'Pending',
      render: (_: any, wallet: WalletData) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-green-600">
            <ArrowDownLeft className="h-3 w-3" />
            {formatCurrency(wallet.pendingIn)}
          </div>
          <div className="flex items-center gap-1 text-red-600">
            <ArrowUpRight className="h-3 w-3" />
            {formatCurrency(wallet.pendingOut)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, wallet: WalletData) => (
        <div className="flex items-center gap-2">
          {wallet.isLocked ? (
            <>
              <Lock className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700 font-medium">Locked</span>
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700 font-medium">Active</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'transactions',
      label: 'Transactions',
      render: (_: any, wallet: WalletData) => (
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {wallet._count.transactions}
          </div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Created',
      render: (value: string) => (
        <div className="text-sm text-gray-500">
          {formatDate(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, wallet: WalletData) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === wallet.id ? null : wallet.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openActionDropdown === wallet.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewWallet(wallet)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                
                <button
                  onClick={() => handleAdjustBalance(wallet)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                >
                  <DollarSign className="h-4 w-4" />
                  Adjust Balance
                </button>

                <button
                  onClick={() => handleLockWallet(wallet)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                >
                  {wallet.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  {wallet.isLocked ? 'Unlock Wallet' : 'Lock Wallet'}
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
            <h3 className="font-medium text-red-800">Error Loading Wallets</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Modal Components
  const WalletDetailsModal = () => (
    showDetailsModal && selectedWallet && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Wallet Details</h3>
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
                <h4 className="font-medium text-gray-900 mb-3">Wallet Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">ID:</span> {selectedWallet.id}</div>
                  <div><span className="font-medium">Balance:</span> 
                    <span className={`ml-1 font-semibold ${getBalanceColor(selectedWallet.balance)}`}>
                      {formatCurrency(selectedWallet.balance)}
                    </span>
                  </div>
                  <div><span className="font-medium">Currency:</span> {selectedWallet.currency}</div>
                  <div><span className="font-medium">Pending In:</span> {formatCurrency(selectedWallet.pendingIn)}</div>
                  <div><span className="font-medium">Pending Out:</span> {formatCurrency(selectedWallet.pendingOut)}</div>
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-1 ${selectedWallet.isLocked ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedWallet.isLocked ? 'Locked' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">User Details</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedWallet.user.firstName} {selectedWallet.user.lastName}</div>
                  <div><span className="font-medium">Email:</span> {selectedWallet.user.email}</div>
                  <div><span className="font-medium">User ID:</span> {selectedWallet.user.id}</div>
                  <div><span className="font-medium">Transactions:</span> {selectedWallet._count.transactions}</div>
                </div>
              </div>
            </div>

            {selectedWallet.isLocked && selectedWallet.lockedReason && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Lock Reason</h4>
                <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg border border-red-200">
                  {selectedWallet.lockedReason}
                </p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Created:</span> {formatDate(selectedWallet.createdAt)}</div>
                <div><span className="font-medium">Updated:</span> {formatDate(selectedWallet.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  )

  const LockModal = () => (
    showLockModal && selectedWallet && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">
            {selectedWallet.isLocked ? 'Unlock Wallet' : 'Lock Wallet'}
          </h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              User: <span className="font-medium">{selectedWallet.user.firstName} {selectedWallet.user.lastName}</span>
            </p>
            <p className="text-sm text-gray-600">
              Balance: <span className="font-medium">{formatCurrency(selectedWallet.balance)}</span>
            </p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            lockMutation.mutate({
              walletId: selectedWallet.id,
              action: selectedWallet.isLocked ? 'unlock' : 'lock',
              reason: formData.get('reason') as string
            })
          }}>
            {!selectedWallet.isLocked && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Locking
                </label>
                <textarea
                  name="reason"
                  rows={3}
                  placeholder="Enter reason for locking this wallet"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                  required
                />
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={lockMutation.isPending}
                className={`px-4 py-2 text-white rounded-lg ${
                  selectedWallet.isLocked 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {lockMutation.isPending ? 'Processing...' : (selectedWallet.isLocked ? 'Unlock' : 'Lock')}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  )

  const AdjustBalanceModal = () => (
    showAdjustBalanceModal && selectedWallet && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">Adjust Balance</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              User: <span className="font-medium">{selectedWallet.user.firstName} {selectedWallet.user.lastName}</span>
            </p>
            <p className="text-sm text-gray-600">
              Current Balance: <span className="font-medium">{formatCurrency(selectedWallet.balance)}</span>
            </p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            adjustBalanceMutation.mutate({
              walletId: selectedWallet.id,
              amount: Number(formData.get('amount')),
              type: formData.get('type') as 'add' | 'subtract',
              reason: formData.get('reason') as string
            })
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Type
                </label>
                <select
                  name="type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                  required
                >
                  <option value="add">Add to Balance</option>
                  <option value="subtract">Subtract from Balance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Adjustment
                </label>
                <textarea
                  name="reason"
                  rows={3}
                  placeholder="Enter reason for balance adjustment"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAdjustBalanceModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjustBalanceMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {adjustBalanceMutation.isPending ? 'Processing...' : 'Adjust Balance'}
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
          <h1 className="text-3xl font-bold text-gray-900">Wallet Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage user wallets and balances</p>
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
            title="Total Wallets"
            value={metrics.totalWallets}
            icon={<Wallet className="h-5 w-5" />}
          />
          <MetricCard
            title="Total Balance"
            value={formatCurrency(metrics.totalBalance)}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <MetricCard
            title="Average Balance"
            value={formatCurrency(metrics.avgBalance)}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Locked Wallets"
            value={metrics.lockedWallets}
            subtitle={`${((metrics.lockedWallets / metrics.totalWallets) * 100).toFixed(1)}% locked`}
            icon={<Lock className="h-5 w-5" />}
          />
          <MetricCard
            title="Pending In"
            value={formatCurrency(metrics.totalPendingIn)}
            icon={<ArrowDownLeft className="h-5 w-5" />}
          />
          <MetricCard
            title="Pending Out"
            value={formatCurrency(metrics.totalPendingOut)}
            icon={<ArrowUpRight className="h-5 w-5" />}
          />
          <MetricCard
            title="Pending Transactions"
            value={metrics.pendingTransactions}
            icon={<Clock className="h-5 w-5" />}
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
            />
          </div>
          
          <select
            value={lockFilter}
            onChange={(e) => setLockFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Wallets</option>
            <option value="locked">Locked Only</option>
            <option value="unlocked">Active Only</option>
          </select>

          <select
            value={balanceFilter}
            onChange={(e) => setBalanceFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Balances</option>
            <option value="high">High Balance (&gt;$1000)</option>
            <option value="medium">Medium Balance ($100-$1000)</option>
            <option value="low">Low Balance ($0-$100)</option>
            <option value="zero">Zero Balance</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('')
              setLockFilter('')
              setBalanceFilter('')
              setPage(1)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Wallets Table */}
      <DataTable
        data={walletsData?.wallets || []}
        columns={columns}
        pagination={{
          page,
          pageSize: 20,
          total: walletsData?.pagination?.total || 0,
          onPageChange: setPage
        }}
      />

      {/* Modals */}
      <WalletDetailsModal />
      <LockModal />
      <AdjustBalanceModal />
    </div>
  )
}

