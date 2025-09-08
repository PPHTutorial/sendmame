'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { 
  Package, 
  PackageCheck, 
  Search, 
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  Weight,
  AlertCircle,
  Download,
  RefreshCw,
  Truck,
  CheckCircle,
  XCircle,
  MoreVertical,
  MessageSquare,
  User,
  PlayCircle,
  StopCircle,
  RotateCcw
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useDialog } from '@/lib/hooks/useDialog'

interface PackageData {
  id: string
  title: string
  description: string
  category: string
  weight: number
  estimatedValue: number
  urgencyLevel: string
  priority: string
  status: string
  pickupLocation: string
  deliveryLocation: string
  pickupDate: string
  deliveryDate: string | null
  createdAt: string
  sender: {
    firstName: string
    lastName: string
    email: string
  }
  traveler: {
    firstName: string
    lastName: string
    email: string
  } | null
  trip: {
    id: string
    travelerId: string
    traveler: {
      firstName: string
      lastName: string
      email: string
    }
  } | null
  stats: {
    packagessent: number
    packagesReceived: number
    trips: number
    transactions: number
  }
}

interface PackageMetrics {
  totalPackages: number
  pendingPackages: number
  inTransitPackages: number
  deliveredPackages: number
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageData[]>([])
  const [metrics, setMetrics] = useState<PackageMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedUrgency, setSelectedUrgency] = useState('')
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
      const response = await fetch('/api/dashboard/packages')
      if (!response.ok) throw new Error('Failed to fetch package metrics')
      
      const data = await response.json()
      const statusBreakdown = data.statusBreakdown || []
      setMetrics({
        totalPackages: data.totalPackages || 0,
        pendingPackages: statusBreakdown.find((s: any) => s.status === 'PENDING')?.count || 0,
        inTransitPackages: statusBreakdown.find((s: any) => s.status === 'IN_TRANSIT')?.count || 0,
        deliveredPackages: statusBreakdown.find((s: any) => s.status === 'DELIVERED')?.count || 0
      })
    } catch (err) {
      console.error('Error fetching package metrics:', err)
    }
  }

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString()
      })

      if (searchTerm) params.append('search', searchTerm)
      if (selectedStatus) params.append('status', selectedStatus)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedUrgency) params.append('urgency', selectedUrgency)

      const response = await fetch(`/api/dashboard/packages/list?${params}`)
      if (!response.ok) throw new Error('Failed to fetch packages')

      const data = await response.json()
      setPackages(data.packages)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [page, pagination.pageSize, searchTerm, selectedStatus, selectedCategory, selectedUrgency])

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

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
      case 'category':
        setSelectedCategory(value)
        break
      case 'urgency':
        setSelectedUrgency(value)
        break
    }
  }

  // Package action handlers
  const handleViewPackage = (pkg: PackageData) => {
    openDialog(PackageDetailsDialog, { package: pkg }, { title: 'Package Details' })
    setOpenActionDropdown(null)
  }

  const handleEditPackage = (pkg: PackageData) => {
    openDialog(EditPackageDialog, { package: pkg }, { title: 'Edit Package' })
    setOpenActionDropdown(null)
  }

  const handleSendMessage = (pkg: PackageData) => {
    openDialog(MessageDialog, { package: pkg }, { title: 'Send Message' })
    setOpenActionDropdown(null)
  }

  const handleDeletePackage = (pkg: PackageData) => {
    openDialog(DeleteConfirmDialog, { package: pkg })
    setOpenActionDropdown(null)
  }

  const handleAssignTraveler = (pkg: PackageData) => {
    openDialog(AssignTravelerDialog, { package: pkg }, { title: 'Assign Traveler' })
    setOpenActionDropdown(null)
  }

  const handleUpdateStatus = async (pkg: PackageData, newStatus: string) => {
    try {
      setActionLoading(pkg.id)
      const response = await fetch(`/api/dashboard/packages/${pkg.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) throw new Error('Failed to update package status')
      
      setPackages(packages.map(p => p.id === pkg.id ? { ...p, status: newStatus } : p))
      await fetchMetrics()
    } catch (err) {
      console.error('Error updating package status:', err)
    } finally {
      setActionLoading(null)
      setOpenActionDropdown(null)
    }
  }

  const handleCancelPackage = async (pkg: PackageData) => {
    try {
      setActionLoading(pkg.id)
      const response = await fetch(`/api/dashboard/packages/${pkg.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!response.ok) throw new Error('Failed to cancel package')
      
      setPackages(packages.map(p => p.id === pkg.id ? { ...p, status: 'CANCELLED' } : p))
      await fetchMetrics()
    } catch (err) {
      console.error('Error canceling package:', err)
    } finally {
      setActionLoading(null)
      setOpenActionDropdown(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-3 w-3" />
      case 'IN_TRANSIT': return <Truck className="h-3 w-3" />
      case 'DELIVERED': return <CheckCircle className="h-3 w-3" />
      case 'CANCELLED': return <XCircle className="h-3 w-3" />
      default: return <Package className="h-3 w-3" />
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-purple-100 text-purple-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ]
    const index = category.length % colors.length
    return colors[index]
  }

  const columns = [
    {
      key: 'package',
      label: 'Package',
      render: (_: any, pkg: PackageData) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <Package className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {pkg.title}
            </div>
            <div className="text-sm text-gray-500 truncate max-w-48">
              {pkg.description}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'sender',
      label: 'Sender',
      render: (_: any, pkg: PackageData) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {pkg.sender.firstName} {pkg.sender.lastName}
          </div>
          <div className="text-gray-500">{pkg.sender.email}</div>
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
            {value.replace('_', ' ')}
          </span>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(value)}`}>
          {value}
        </span>
      )
    },
    /* {
      key: 'urgencyLevel',
      label: 'Urgency',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(value)}`}>
          {value}
        </span>
      )
    }, */
    {
      key: 'details',
      label: 'Details',
      render: (_: any, pkg: PackageData) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-1 text-gray-500">
            <Weight className="h-3 w-3" />
            <span>{pkg.weight}kg</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <DollarSign className="h-3 w-3" />
            <span>${pkg.estimatedValue}</span>
          </div>
        </div>
      )
    },
    {
      key: 'route',
      label: 'Route',
      render: (_: any, pkg: PackageData) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="h-3 w-3 text-green-500" />
            <span className="truncate max-w-24">{pkg.pickupLocation}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="h-3 w-3 text-red-500" />
            <span className="truncate max-w-24">{pkg.deliveryLocation}</span>
          </div>
        </div>
      )
    },
    {
      key: 'dates',
      label: 'Dates',
      render: (_: any, pkg: PackageData) => (
        <div className="text-sm space-y-1">
          <div className="text-gray-500">
            <span className="font-medium">Pickup:</span> {formatDate(pkg.pickupDate)}
          </div>
          <div className="text-gray-500">
            <span className="font-medium">Delivery:</span> {formatDate(pkg.deliveryDate)}
          </div>
        </div>
      )
    },
    {
      key: 'traveler',
      label: 'Traveler',
      render: (_: any, pkg: PackageData) => (
        <div className="text-sm">
          {pkg.traveler ? (
            <div>
              <div className="font-medium text-gray-900">
                {pkg.traveler.firstName} {pkg.traveler.lastName}
              </div>
              <div className="text-gray-500">{pkg.traveler.email}</div>
            </div>
          ) : (
            <span className="text-gray-400 italic">Not assigned</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, pkg: PackageData) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === pkg.id ? null : pkg.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            disabled={actionLoading === pkg.id}
          >
            {actionLoading === pkg.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </button>

          {openActionDropdown === pkg.id && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewPackage(pkg)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                
                <button
                  onClick={() => handleEditPackage(pkg)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit Package
                </button>
                
                <button
                  onClick={() => handleSendMessage(pkg)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message Sender
                </button>

                {!pkg.traveler && pkg.status === 'POSTED' && (
                  <button
                    onClick={() => handleAssignTraveler(pkg)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                  >
                    <User className="h-4 w-4" />
                    Assign Traveler
                  </button>
                )}

                <div className="border-t border-gray-100 my-1"></div>
                
                {/* Status Updates */}
                {pkg.status === 'POSTED' && (
                  <button
                    onClick={() => handleUpdateStatus(pkg, 'IN_TRANSIT')}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Mark In Transit
                  </button>
                )}

                {pkg.status === 'IN_TRANSIT' && (
                  <button
                    onClick={() => handleUpdateStatus(pkg, 'DELIVERED')}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Delivered
                  </button>
                )}

                {(pkg.status === 'POSTED' || pkg.status === 'IN_TRANSIT') && (
                  <button
                    onClick={() => handleCancelPackage(pkg)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                  >
                    <StopCircle className="h-4 w-4" />
                    Cancel Package
                  </button>
                )}

                {pkg.status === 'CANCELLED' && (
                  <button
                    onClick={() => handleUpdateStatus(pkg, 'POSTED')}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reactivate Package
                  </button>
                )}

                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={() => handleDeletePackage(pkg)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Package
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }
  ]

  if (loading && packages.length === 0) {
    return <SkeletonLoader type="dashboard" />  
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Packages</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Dialog Components
  const PackageDetailsDialog = ({ package: pkg }: { package: PackageData }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Package Information</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Title:</span> {pkg.title}</div>
            <div><span className="font-medium">Category:</span> {pkg.category}</div>
            <div><span className="font-medium">Weight:</span> {pkg.weight}kg</div>
            <div><span className="font-medium">Value:</span> ${pkg.estimatedValue}</div>
            <div><span className="font-medium">Urgency:</span> {pkg.urgencyLevel}</div>
            <div><span className="font-medium">Status:</span> 
              <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getStatusColor(pkg.status)}`}>
                {pkg.status}
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Locations & Dates</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Pickup:</span> {pkg.pickupLocation}</div>
            <div><span className="font-medium">Delivery:</span> {pkg.deliveryLocation}</div>
            <div><span className="font-medium">Pickup Date:</span> {formatDate(pkg.pickupDate)}</div>
            <div><span className="font-medium">Delivery Date:</span> {formatDate(pkg.deliveryDate)}</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Description</h4>
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          {pkg.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Sender</h4>
          <div className="text-sm space-y-1">
            <div>{pkg.sender.firstName} {pkg.sender.lastName}</div>
            <div className="text-gray-600">{pkg.sender.email}</div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Traveler</h4>
          {pkg.traveler ? (
            <div className="text-sm space-y-1">
              <div>{pkg.traveler.firstName} {pkg.traveler.lastName}</div>
              <div className="text-gray-600">{pkg.traveler.email}</div>
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic">Not assigned</div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={closeDialog}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  )

  const EditPackageDialog = ({ package: pkg }: { package: PackageData }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            defaultValue={pkg.title}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            defaultValue={pkg.category}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="Electronics">Electronics</option>
            <option value="Documents">Documents</option>
            <option value="Clothing">Clothing</option>
            <option value="Food">Food</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            defaultValue={pkg.weight}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value ($)</label>
          <input
            type="number"
            defaultValue={pkg.estimatedValue}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          defaultValue={pkg.description}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
        />
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={closeDialog}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            // Handle update logic here
            closeDialog()
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Update Package
        </button>
      </div>
    </div>
  )

  const MessageDialog = ({ package: pkg }: { package: PackageData }) => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">Send message to: {pkg.sender.firstName} {pkg.sender.lastName}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          placeholder="Type your message here..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
        />
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={closeDialog}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            // Handle send message logic here
            closeDialog()
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Send Message
        </button>
      </div>
    </div>
  )

  const DeleteConfirmDialog = ({ package: pkg }: { package: PackageData }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-100 rounded-full">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold">Delete Package</h3>
      </div>
      <p className="text-gray-600">
        Are you sure you want to delete the package &quot;{pkg.title}&quot;?
        This action cannot be undone and will permanently remove all package data.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={closeDialog}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            // Handle delete logic here
            closeDialog()
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Delete Package
        </button>
      </div>
    </div>
  )

  const AssignTravelerDialog = ({ package: pkg }: { package: PackageData }) => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">Assign traveler to: {pkg.title}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Traveler</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent">
          <option value="">Choose a traveler...</option>
          {/* Add available travelers here */}
        </select>
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={closeDialog}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            // Handle assign logic here
            closeDialog()
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Assign Traveler
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
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Packages Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage all package deliveries</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add Package
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
            title="Total Packages"
            value={metrics.totalPackages}
            icon={<Package className="h-5 w-5" />}
          />
          <MetricCard
            title="Pending"
            value={metrics.pendingPackages}
            subtitle={`${((metrics.pendingPackages / metrics.totalPackages) * 100).toFixed(1)}% of total`}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="In Transit"
            value={metrics.inTransitPackages}
            subtitle={`${((metrics.inTransitPackages / metrics.totalPackages) * 100).toFixed(1)}% of total`}
            icon={<Truck className="h-5 w-5" />}
          />
          <MetricCard
            title="Delivered"
            value={metrics.deliveredPackages}
            subtitle={`${((metrics.deliveredPackages / metrics.totalPackages) * 100).toFixed(1)}% completed`}
            icon={<PackageCheck className="h-5 w-5" />}
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
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Documents">Documents</option>
            <option value="Clothing">Clothing</option>
            <option value="Food">Food</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={selectedUrgency}
            onChange={(e) => handleFilterChange('urgency', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Urgency</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedStatus('')
              setSelectedCategory('')
              setSelectedUrgency('')
              setPage(1)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Packages Table */}
      <DataTable
        data={packages}
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

