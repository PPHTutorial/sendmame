'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  Users,
  UserCheck,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Shield,
  MapPin,
  Star,
  Activity,
  AlertCircle,
  Download,
  RefreshCw,
  MoreVertical,
  MessageSquare,
  Ban,
  CheckCircle,
  Clock,
  Settings,
  Send
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useDialog } from '@/lib/hooks/useDialog'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  isVerified: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  verificationStatus: string
  lastLoginAt: string | null
  createdAt: string
  profile: {
    currentCountry: string | null
    currentCity: string | null
    senderRating: number
    travelerRating: number
    totalTrips: number
    totalDeliveries: number
  } | null
  stats: {
    packagessent: number
    packagesReceived: number
    trips: number
    transactions: number
  }
}

interface UserMetrics {
  totalUsers: number
  activeUsers: number
  verifiedUsers: number
  newThisMonth: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [metrics, setMetrics] = useState<UserMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    pageSize: 20
  })

  // Action dropdown state
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Dialog management using useDialog hook
  const { openDialog, closeDialog, dialog } = useDialog()

  // Data fetching functions
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString()
      })

      if (searchTerm) params.append('search', searchTerm)
      if (selectedRole) params.append('role', selectedRole)
      if (selectedStatus) params.append('status', selectedStatus)
      if (selectedCountry) params.append('country', selectedCountry)

      const response = await fetch(`/api/dashboard/users/list?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, selectedRole, selectedStatus, selectedCountry, pagination.pageSize])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    fetchMetrics()
  }, [])

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
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [openActionDropdown])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/dashboard/users')
      if (!response.ok) throw new Error('Failed to fetch user metrics')

      const data = await response.json()
      setMetrics({
        totalUsers: data.totalUsers,
        activeUsers: data.activeUsers,
        verifiedUsers: data.verifiedUsers,
        newThisMonth: data.growthData.slice(0, 30).reduce((sum: number, item: any) => sum + item.count, 0)
      })
    } catch (err) {
      console.error('Error fetching user metrics:', err)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleFilterChange = (type: string, value: string) => {
    setPage(1)
    switch (type) {
      case 'role':
        setSelectedRole(value)
        break
      case 'status':
        setSelectedStatus(value)
        break
      case 'country':
        setSelectedCountry(value)
        break
    }
  }

  // User action handlers
  const handleViewUser = (user: User) => {
    setOpenActionDropdown(null)
    // Implement view logic - could open a modal or navigate to detail page
    console.log('View user:', user)
  }

  const handleEditUser = (user: User) => {
    openDialog(EditUserDialog, { user }, { title: 'Edit User' })
    setOpenActionDropdown(null)
  }

  const handleSendMessage = (user: User) => {
    openDialog(MessageDialog, { user }, { title: 'Send Message' })
    setOpenActionDropdown(null)
  }

  const handleDeleteUser = (user: User) => {
    openDialog(DeleteConfirmDialog, { user })
    setOpenActionDropdown(null)
  }

  const handleToggleActive = async (user: User) => {
    try {
      setActionLoading(user.id)
      const response = await fetch(`/api/dashboard/users/${user.id}/toggle-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error('Failed to update user status')

      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      await fetchMetrics()
    } catch (err) {
      console.error('Error toggling user status:', err)
    } finally {
      setActionLoading(null)
      setOpenActionDropdown(null)
    }
  }

  const handleToggleVerification = async (user: User) => {
    try {
      setActionLoading(user.id)
      const response = await fetch(`/api/dashboard/users/${user.id}/toggle-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error('Failed to update verification status')

      setUsers(users.map(u => u.id === user.id ? { ...u, isVerified: !u.isVerified } : u))
      await fetchMetrics()
    } catch (err) {
      console.error('Error toggling verification status:', err)
    } finally {
      setActionLoading(null)
      setOpenActionDropdown(null)
    }
  }

  const handleResetPassword = async (user: User) => {
    try {
      setActionLoading(user.id)
      const response = await fetch(`/api/dashboard/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error('Failed to reset password')

      // Show success message or notification
      console.log('Password reset email sent to:', user.email)
    } catch (err) {
      console.error('Error resetting password:', err)
    } finally {
      setActionLoading(null)
      setOpenActionDropdown(null)
    }
  }

  const confirmDeleteUser = async (userToDelete: User) => {
    if (!userToDelete) return

    try {
      setActionLoading(userToDelete.id)
      const response = await fetch(`/api/dashboard/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error('Failed to delete user')

      setUsers(users.filter(u => u.id !== userToDelete.id))
      await fetchMetrics()
      closeDialog()
    } catch (err) {
      console.error('Error deleting user:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never'

    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return formatDate(dateString)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'SENDER': return 'bg-blue-100 text-blue-800'
      case 'TRAVELER': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-800'
    if (isVerified) return 'bg-green-100 text-green-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusText = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'Inactive'
    if (isVerified) return 'Verified'
    return 'Pending'
  }

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (_: any, user: User) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <Users className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, user: User) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive, user.isVerified)}`}>
          {getStatusText(user.isActive, user.isVerified)}
        </span>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (_: any, user: User) => (
        <div className="text-sm">
          {user.profile?.currentCity && user.profile?.currentCountry ? (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-gray-400" />
              {user.profile.currentCity}, {user.profile.currentCountry}
            </span>
          ) : (
            <span className="text-gray-400">Not specified</span>
          )}
        </div>
      )
    },
    {
      key: 'stats',
      label: 'Activity',
      render: (_: any, user: User) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{user.stats.packagessent + user.stats.packagesReceived} packages</span>
            <span>{user.stats.trips} trips</span>
          </div>
          {user.profile && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400" />
              <span className="text-xs">
                {((user.profile.senderRating + user.profile.travelerRating) / 2 || 0).toFixed(1)}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'verification',
      label: 'Verification',
      render: (_: any, user: User) => (
        <div className="flex items-center gap-1">
          <Mail className={`h-3 w-3 ${user.isEmailVerified ? 'text-green-500' : 'text-gray-400'}`} />
          <Phone className={`h-3 w-3 ${user.isPhoneVerified ? 'text-green-500' : 'text-gray-400'}`} />
          <Shield className={`h-3 w-3 ${user.isVerified ? 'text-green-500' : 'text-gray-400'}`} />
        </div>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (value: string | null) => (
        <span className="text-sm text-gray-500">
          {formatTimeAgo(value)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, user: User) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === user.id ? null : user.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            disabled={actionLoading === user.id}
          >
            {actionLoading === user.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </button>

          {openActionDropdown === user.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewUser(user)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>

                <button
                  onClick={() => handleEditUser(user)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit User
                </button>

                <button
                  onClick={() => handleSendMessage(user)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={() => handleToggleActive(user)}
                  className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 ${user.isActive
                      ? 'text-red-700'
                      : 'text-green-700'
                    }`}
                >
                  {user.isActive ? (
                    <>
                      <Ban className="h-4 w-4" />
                      Deactivate User
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Activate User
                    </>
                  )}
                </button>

                {user.role !== 'ADMIN' && (
                  <button
                    onClick={() => handleToggleVerification(user)}
                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 ${user.isVerified
                        ? 'text-orange-700'
                        : 'text-blue-700'
                      }`}
                  >
                    {user.isVerified ? (
                      <>
                        <Clock className="h-4 w-4" />
                        Mark Unverified
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Mark Verified
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => handleResetPassword(user)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4" />
                  Reset Password
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                {user.role !== 'ADMIN' && (
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete User
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )
    }
  ]

  if (loading && users.length === 0) {
    return <SkeletonLoader type="dashboard" />  
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Users</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Dialog Components for useDialog hook
  const EditUserDialog = ({ user }: { user: User }) => {
    const [firstName, setFirstName] = useState(user?.firstName || '')
    const [lastName, setLastName] = useState(user?.lastName || '')
    const [email, setEmail] = useState(user?.email || '')
    const [role, setRole] = useState(user?.role || 'SENDER')
    const [saving, setSaving] = useState(false)

    const handleSaveChanges = async () => {
      if (!user || !firstName.trim() || !lastName.trim() || !email.trim()) return

      try {
        setSaving(true)
        const response = await fetch(`/api/dashboard/users/${user.id}/update`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, email, role })
        })

        if (!response.ok) throw new Error('Failed to update user')

        const updatedUser = await response.json()
        setUsers(users.map(u => u.id === user.id ? { ...u, ...updatedUser.user } : u))
        closeDialog()
        console.log('User updated successfully')
      } catch (err) {
        console.error('Error updating user:', err)
      } finally {
        setSaving(false)
      }
    }

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="SENDER">Sender</option>
            <option value="TRAVELER">Traveler</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={closeDialog}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={saving || !firstName.trim() || !lastName.trim() || !email.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    )
  }

  const MessageDialog = ({ user }: { user: User }) => {
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)

    const handleSendMessage = async () => {
      if (!subject.trim() || !message.trim() || !user) return

      try {
        setSending(true)
        const response = await fetch(`/api/dashboard/users/${user.id}/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, message })
        })

        if (!response.ok) throw new Error('Failed to send message')

        closeDialog()
        console.log('Message sent successfully')
      } catch (err) {
        console.error('Error sending message:', err)
      } finally {
        setSending(false)
      }
    }

    return (
      <div className="space-y-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Sending message to: <span className="font-medium">{user.firstName} {user.lastName}</span>
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            placeholder="Enter message subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            rows={4}
            placeholder="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={closeDialog}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={sending}
          >
            Cancel
          </button>
          <button
            onClick={handleSendMessage}
            disabled={sending || !subject.trim() || !message.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    )
  }

  // Delete Confirm Dialog Component
  const DeleteConfirmDialog = ({ user }: { user: User }) => (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-100 rounded-full">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold">Delete User</h3>
      </div>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete <span className="font-medium">{user.firstName} {user.lastName}</span>?
        This action cannot be undone and will permanently remove the user and all their data.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={closeDialog}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => confirmDeleteUser(user)}
          disabled={actionLoading === user.id}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {actionLoading === user.id ? 'Deleting...' : 'Delete User'}
        </button>
      </div>
    </div>
  )

  // Dialog Renderer Component
  const DialogRenderer = () => {
    if (!dialog.isOpen || !dialog.component) return null

    const DialogComponent = dialog.component

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          {dialog.config.title && (
            <h3 className="text-lg font-semibold mb-4">{dialog.config.title}</h3>
          )}
          <DialogComponent {...dialog.props} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all platform users</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add User
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers}
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers}
            subtitle={`${((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}% of total`}
            icon={<UserCheck className="h-5 w-5" />}
          />
          <MetricCard
            title="Verified Users"
            value={metrics.verifiedUsers}
            subtitle={`${((metrics.verifiedUsers / metrics.totalUsers) * 100).toFixed(1)}% verified`}
            icon={<Shield className="h-5 w-5" />}
          />
          <MetricCard
            title="New This Month"
            value={metrics.newThisMonth}
            icon={<Activity className="h-5 w-5" />}
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
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="SENDER">Sender</option>
            <option value="TRAVELER">Traveler</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedRole('')
              setSelectedStatus('')
              setSelectedCountry('')
              setPage(1)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        pagination={{
          page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onPageChange: setPage
        }}
      />

      {/* Dialog Renderer */}
      <DialogRenderer />
    </div>
  )
}
