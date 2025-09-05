'use client'

import React, { useEffect, useState } from 'react'
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
  XCircle
} from 'lucide-react'
import { MetricCard, DataTable } from '@/components/ui/dashboard-components'

interface PackageData {
  id: string
  title: string
  description: string
  category: string
  weight: number
  estimatedValue: number
  urgencyLevel: string
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
    departure: string
    arrival: string
  } | null
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

  useEffect(() => {
    fetchPackages()
  }, [page, searchTerm, selectedStatus, selectedCategory, selectedUrgency]) // Dependencies are stable

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/dashboard/packages')
      if (!response.ok) throw new Error('Failed to fetch package metrics')
      
      const data = await response.json()
      setMetrics({
        totalPackages: data.totalPackages,
        pendingPackages: data.statusBreakdown.find((s: any) => s.status === 'PENDING')?.count || 0,
        inTransitPackages: data.statusBreakdown.find((s: any) => s.status === 'IN_TRANSIT')?.count || 0,
        deliveredPackages: data.statusBreakdown.find((s: any) => s.status === 'DELIVERED')?.count || 0
      })
    } catch (err) {
      console.error('Error fetching package metrics:', err)
    }
  }

  const fetchPackages = async () => {
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
      case 'category':
        setSelectedCategory(value)
        break
      case 'urgency':
        setSelectedUrgency(value)
        break
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
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
    {
      key: 'urgencyLevel',
      label: 'Urgency',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(value)}`}>
          {value}
        </span>
      )
    },
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
      render: (_: any, _pkg: PackageData) => (
        <div className="flex items-center gap-2">
          <button className="p-1 text-gray-400 hover:text-blue-600">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-green-600">
            <Edit className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  if (loading && packages.length === 0) {
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
            <h3 className="font-medium text-red-800">Error Loading Packages</h3>
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
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
    </div>
  )
}

