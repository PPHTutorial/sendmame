'use client'

import React, { useEffect, useState } from 'react'
import { 
  Users, 
  Mail, 
  Phone, 
  Shield, 
  Calendar,
  RefreshCw,
  Search,
  Download,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Star,
  MapPin,
  Clock,
  Key,
  Chrome
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useQuery } from '@tanstack/react-query'

interface Account {
  id: string
  type: string
  provider: string
  providerAccountId: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    isEmailVerified: boolean
    isPhoneVerified: boolean
    verificationStatus: string
    lastLoginAt?: string
    createdAt: string
    profile?: {
      profilePicture?: string
      senderRating: number
      travelerRating: number
      totalTrips: number
      totalDeliveries: number
    }
  }
}

export default function AccountsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [page, setPage] = useState(1)
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Fetch accounts
  const { data: accountsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-accounts', page, searchTerm, selectedProvider, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedProvider && { provider: selectedProvider }),
        ...(dateRange && { dateRange })
      })
      
      const response = await fetch(`/api/dashboard/accounts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch accounts')
      return response.json()
    }
  })

  // Fetch account metrics
  const { data: metrics } = useQuery({
    queryKey: ['account-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/accounts/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    }
  })

  // Handle actions
  const handleViewAccount = (account: Account) => {
    setSelectedAccount(account)
    setShowDetailsModal(true)
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

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google': return <Chrome className="h-4 w-4 text-red-500" />
      case 'facebook': return <div className="h-4 w-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">f</div>
      case 'apple': return <div className="h-4 w-4 bg-black rounded text-white text-xs flex items-center justify-center">🍎</div>
      default: return <Key className="h-4 w-4 text-gray-500" />
    }
  }

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google': return 'bg-red-100 text-red-800'
      case 'facebook': return 'bg-blue-100 text-blue-800'
      case 'apple': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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

  const formatProvider = (provider: string) => {
    return provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_: any, account: Account) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            {account.user.profile?.profilePicture ? (
              <img 
                src={account.user.profile.profilePicture} 
                alt="Profile" 
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <Users className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {account.user.firstName} {account.user.lastName}
            </div>
            <div className="text-sm text-gray-500">{account.user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'provider',
      label: 'Provider',
      render: (_: any, account: Account) => (
        <div className="flex items-center gap-2">
          {getProviderIcon(account.provider)}
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProviderColor(account.provider)}`}>
            {formatProvider(account.provider)}
          </span>
        </div>
      )
    },
    {
      key: 'verification',
      label: 'Verification',
      render: (_: any, account: Account) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {account.user.isEmailVerified ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            <span className="text-sm">Email</span>
          </div>
          <div className="flex items-center gap-2">
            {account.user.isPhoneVerified ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            <span className="text-sm">Phone</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, account: Account) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationStatusColor(account.user.verificationStatus)}`}>
          {account.user.verificationStatus}
        </span>
      )
    },
    {
      key: 'activity',
      label: 'Activity',
      render: (_: any, account: Account) => (
        <div className="text-sm">
          {account.user.profile && (
            <>
              <div className="flex items-center gap-1 text-gray-600">
                <Star className="h-3 w-3" />
                <span>{account.user.profile.senderRating.toFixed(1)} sender</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="h-3 w-3" />
                <span>{account.user.profile.totalTrips} trips</span>
              </div>
            </>
          )}
        </div>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (_: any, account: Account) => (
        <div className="text-sm text-gray-500">
          {account.user.lastLoginAt ? (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(account.user.lastLoginAt)}
            </div>
          ) : (
            <span className="text-gray-400">Never</span>
          )}
        </div>
      )
    },
    {
      key: 'joined',
      label: 'Joined',
      render: (_: any, account: Account) => (
        <div className="text-sm text-gray-500 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(account.user.createdAt)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, account: Account) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === account.id ? null : account.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openActionDropdown === account.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewAccount(account)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
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
            <h3 className="font-medium text-red-800">Error Loading Accounts</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Modal Components
  const AccountDetailsModal = () => (
    showDetailsModal && selectedAccount && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Account Details</h3>
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
                <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedAccount.user.firstName} {selectedAccount.user.lastName}</div>
                  <div><span className="font-medium">Email:</span> {selectedAccount.user.email}</div>
                  {selectedAccount.user.phone && (
                    <div><span className="font-medium">Phone:</span> {selectedAccount.user.phone}</div>
                  )}
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getVerificationStatusColor(selectedAccount.user.verificationStatus)}`}>
                      {selectedAccount.user.verificationStatus}
                    </span>
                  </div>
                  <div><span className="font-medium">Joined:</span> {formatDate(selectedAccount.user.createdAt)}</div>
                  {selectedAccount.user.lastLoginAt && (
                    <div><span className="font-medium">Last Login:</span> {formatDate(selectedAccount.user.lastLoginAt)}</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Account Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">ID:</span> {selectedAccount.id}</div>
                  <div><span className="font-medium">Type:</span> {selectedAccount.type}</div>
                  <div><span className="font-medium">Provider:</span> {formatProvider(selectedAccount.provider)}</div>
                  <div><span className="font-medium">Provider ID:</span> {selectedAccount.providerAccountId}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Verification Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {selectedAccount.user.isEmailVerified ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-400" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">Email Verification</div>
                    <div className="text-sm text-gray-500">
                      {selectedAccount.user.isEmailVerified ? 'Verified' : 'Not verified'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {selectedAccount.user.isPhoneVerified ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-400" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">Phone Verification</div>
                    <div className="text-sm text-gray-500">
                      {selectedAccount.user.isPhoneVerified ? 'Verified' : 'Not verified'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedAccount.user.profile && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Profile Stats</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{selectedAccount.user.profile.senderRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">Sender Rating</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{selectedAccount.user.profile.travelerRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">Traveler Rating</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{selectedAccount.user.profile.totalTrips}</div>
                    <div className="text-sm text-gray-500">Total Trips</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{selectedAccount.user.profile.totalDeliveries}</div>
                    <div className="text-sm text-gray-500">Deliveries</div>
                  </div>
                </div>
              </div>
            )}
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
          <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
          <p className="text-gray-600 mt-2">Monitor user accounts and authentication providers</p>
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
            title="Total Accounts"
            value={metrics.totalAccounts}
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            title="Email Verified"
            value={metrics.emailVerified}
            icon={<Mail className="h-5 w-5" />}
          />
          <MetricCard
            title="Phone Verified"
            value={metrics.phoneVerified}
            icon={<Phone className="h-5 w-5" />}
          />
          <MetricCard
            title="Today's Signups"
            value={metrics.todayRegistrations}
            icon={<Calendar className="h-5 w-5" />}
          />
          <MetricCard
            title="Google"
            value={metrics.googleAccounts}
            icon={<Chrome className="h-5 w-5" />}
          />
          <MetricCard
            title="Facebook"
            value={metrics.facebookAccounts}
            icon={<div className="h-5 w-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">f</div>}
          />
          <MetricCard
            title="Apple"
            value={metrics.appleAccounts}
            icon={<div className="h-5 w-5 bg-black rounded text-white text-xs flex items-center justify-center">🍎</div>}
          />
          <MetricCard
            title="2FA Enabled"
            value={metrics.twoFactorEnabled}
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
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Providers</option>
            <option value="google">Google</option>
            <option value="facebook">Facebook</option>
            <option value="apple">Apple</option>
            <option value="credentials">Email/Password</option>
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
              setSelectedProvider('')
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

      {/* Accounts Table */}
      <DataTable
        data={accountsData?.accounts || []}
        columns={columns}
        pagination={{
          page,
          pageSize: 20,
          total: accountsData?.pagination?.total || 0,
          onPageChange: setPage
        }}
      />

      {/* Modals */}
      <AccountDetailsModal />
    </div>
  )
}
