'use client'

import React, { useEffect, useState } from 'react'
import { 
  Plane, 
  Car, 
  Train, 
  Search, 
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Package,
  AlertCircle,
  Download,
  RefreshCw,
  MoreVertical,
  MessageSquare,
  Ban,
  CheckCircle,
  Clock,
  Weight,
  Route,
  Star,
  Users,
  DollarSign
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'

interface Trip {
  id: string
  title: string
  travelerId: string
  traveler: {
    id: string
    firstName: string
    lastName: string
    avatar: string | null
    profile: {
      travelerRating: number
      totalTrips: number
    } | null
  }
  originAddress: {
    city: string
    country: string
    address: string
    latitude: number
    longitude: number
  }
  destinationAddress: {
    city: string
    country: string
    address: string
    latitude: number
    longitude: number
  }
  departureDate: string
  arrivalDate: string
  flexibleDates: boolean
  maxWeight: number
  availableSpace: number
  transportMode: string
  pricePerKg: number | null
  minimumPrice: number | null
  maximumPrice: number | null
  status: string
  packageTypes: string[]
  restrictions: string[]
  images: string[]
  createdAt: string
  packages: Array<{
    id: string
    title: string
    status: string
    dimensions: any
  }>
  _count: {
    packages: number
    chats: number
  }
}

interface TripMetrics {
  totalTrips: number
  activeTrips: number
  completedTrips: number
  averageRating: number
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [metrics, setMetrics] = useState<TripMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedTransport, setSelectedTransport] = useState('')
  const [selectedRoute, setSelectedRoute] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    pageSize: 20
  })

  // Action dropdown state
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [editFormData, setEditFormData] = useState<any>({})

  const handleSaveTrip = async () => {
    if (!selectedTrip) return

    try {
      setActionLoading(selectedTrip.id)
      const response = await fetch(`/api/dashboard/trips/${selectedTrip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })
      
      if (!response.ok) throw new Error('Failed to update trip')
      
      const { trip: updatedTrip } = await response.json()
      
      // Update local state
      setTrips(trips.map(t => t.id === selectedTrip.id ? { ...t, ...updatedTrip } : t))
      setShowEditModal(false)
      setSelectedTrip(null)
      setEditFormData({})
      await fetchMetrics()
    } catch (err) {
      console.error('Error updating trip:', err)
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [page, searchTerm, selectedStatus, selectedTransport, selectedRoute])

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
      const response = await fetch('/api/dashboard/trips')
      if (!response.ok) throw new Error('Failed to fetch trip metrics')
      
      const data = await response.json()
      setMetrics({
        totalTrips: data.totalTrips,
        activeTrips: data.activeTrips,
        completedTrips: data.completedTrips,
        averageRating: data.averageRating
      })
    } catch (err) {
      console.error('Error fetching trip metrics:', err)
    }
  }

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString()
      })

      if (searchTerm) params.append('search', searchTerm)
      if (selectedStatus) params.append('status', selectedStatus)
      if (selectedTransport) params.append('transport', selectedTransport)
      if (selectedRoute) params.append('route', selectedRoute)

      const response = await fetch(`/api/dashboard/trips/list?${params}`)
      if (!response.ok) throw new Error('Failed to fetch trips')

      const data = await response.json()
      setTrips(data.trips)
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
      case 'transport':
        setSelectedTransport(value)
        break
      case 'route':
        setSelectedRoute(value)
        break
    }
  }

  // Trip action handlers
  const handleViewTrip = (trip: Trip) => {
    setSelectedTrip(trip)
    setOpenActionDropdown(null)
    // Navigate to trip details
    window.open(`/trips/${trip.id}`, '_blank')
  }

  const handleEditTrip = (trip: Trip) => {
    setSelectedTrip(trip)
    setEditFormData({
      title: trip.title,
      transportMode: trip.transportMode,
      departureDate: new Date(trip.departureDate).toISOString().slice(0, 16),
      arrivalDate: new Date(trip.arrivalDate).toISOString().slice(0, 16),
      maxWeight: trip.maxWeight,
      pricePerKg: trip.pricePerKg || '',
      status: trip.status
    })
    setShowEditModal(true)
    setOpenActionDropdown(null)
  }

  const handleDeleteTrip = (trip: Trip) => {
    setSelectedTrip(trip)
    setShowDeleteConfirm(true)
    setOpenActionDropdown(null)
  }

  const handleToggleStatus = async (trip: Trip) => {
    try {
      setActionLoading(trip.id)
      const newStatus = trip.status === 'POSTED' ? 'ACTIVE' : 
                       trip.status === 'ACTIVE' ? 'COMPLETED' : 'POSTED'
      
      const response = await fetch(`/api/dashboard/trips/${trip.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) throw new Error('Failed to update trip status')
      
      setTrips(trips.map(t => t.id === trip.id ? { ...t, status: newStatus } : t))
      await fetchMetrics()
    } catch (err) {
      console.error('Error updating trip status:', err)
    } finally {
      setActionLoading(null)
      setOpenActionDropdown(null)
    }
  }

  const confirmDeleteTrip = async () => {
    if (!selectedTrip) return

    try {
      setActionLoading(selectedTrip.id)
      const response = await fetch(`/api/dashboard/trips/${selectedTrip.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!response.ok) throw new Error('Failed to delete trip')
      
      setTrips(trips.filter(t => t.id !== selectedTrip.id))
      await fetchMetrics()
      setShowDeleteConfirm(false)
      setSelectedTrip(null)
    } catch (err) {
      console.error('Error deleting trip:', err)
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

  const getTransportIcon = (transport: string) => {
    switch (transport.toLowerCase()) {
      case 'plane':
        return <Plane className="h-4 w-4" />
      case 'car':
        return <Car className="h-4 w-4" />
      case 'train':
        return <Train className="h-4 w-4" />
      default:
        return <Route className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED': return 'bg-blue-100 text-blue-800'
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = [
    {
      key: 'trip',
      label: 'Trip',
      render: (_: any, trip: Trip) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            {getTransportIcon(trip.transportMode)}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {trip.title}
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {trip.originAddress.city} → {trip.destinationAddress.city}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'traveler',
      label: 'Traveler',
      render: (_: any, trip: Trip) => (
        <div>
          <div className="font-medium text-gray-900">
            {trip.traveler.firstName} {trip.traveler.lastName}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400" />
            {trip.traveler.profile?.travelerRating.toFixed(1) || '0.0'}
            <span className="text-gray-400">({trip.traveler.profile?.totalTrips || 0} trips)</span>
          </div>
        </div>
      )
    },
    {
      key: 'dates',
      label: 'Travel Dates',
      render: (_: any, trip: Trip) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-900">
            <Calendar className="h-3 w-3" />
            {formatDate(trip.departureDate)}
          </div>
          <div className="text-gray-500">
            to {formatDate(trip.arrivalDate)}
          </div>
          {trip.flexibleDates && (
            <span className="inline-flex px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full mt-1">
              Flexible
            </span>
          )}
        </div>
      )
    },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (_: any, trip: Trip) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-900">
            <Weight className="h-3 w-3" />
            {trip.availableSpace}/{trip.maxWeight} kg
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ 
                width: `${((trip.maxWeight - trip.availableSpace) / trip.maxWeight) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'packages',
      label: 'Packages',
      render: (_: any, trip: Trip) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-900">
            <Package className="h-3 w-3" />
            {trip._count.packages} packages
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <MessageSquare className="h-3 w-3" />
            {trip._count.chats} chats
          </div>
        </div>
      )
    },
    {
      key: 'pricing',
      label: 'Pricing',
      render: (_: any, trip: Trip) => (
        <div className="text-sm">
          {trip.pricePerKg && (
            <div className="flex items-center gap-1 text-gray-900">
              <DollarSign className="h-3 w-3" />
              ${trip.pricePerKg}/kg
            </div>
          )}
          {(trip.minimumPrice || trip.maximumPrice) && (
            <div className="text-gray-500">
              ${trip.minimumPrice || 0} - ${trip.maximumPrice || 0}
            </div>
          )}
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
      key: 'actions',
      label: 'Actions',
      render: (_: any, trip: Trip) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === trip.id ? null : trip.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            disabled={actionLoading === trip.id}
          >
            {actionLoading === trip.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </button>

          {openActionDropdown === trip.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewTrip(trip)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                
                <button
                  onClick={() => handleEditTrip(trip)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit Trip
                </button>

                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={() => handleToggleStatus(trip)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-gray-50"
                >
                  {trip.status === 'POSTED' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Mark Active
                    </>
                  ) : trip.status === 'ACTIVE' ? (
                    <>
                      <Clock className="h-4 w-4" />
                      Mark Completed
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Reactivate
                    </>
                  )}
                </button>

                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={() => handleDeleteTrip(trip)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Trip
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }
  ]

  if (loading && trips.length === 0) {
    return <SkeletonLoader type="dashboard" />  
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Trips</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Modal Components
  const EditTripModal = () => (
    showEditModal && selectedTrip && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Edit Trip</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transport Mode
                </label>
                <select
                  value={editFormData.transportMode || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, transportMode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                >
                  <option value="plane">Plane</option>
                  <option value="car">Car</option>
                  <option value="train">Train</option>
                  <option value="bus">Bus</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Date
                </label>
                <input
                  type="datetime-local"
                  value={editFormData.departureDate || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, departureDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Date
                </label>
                <input
                  type="datetime-local"
                  value={editFormData.arrivalDate || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, arrivalDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editFormData.maxWeight || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, maxWeight: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per KG ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.pricePerKg || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, pricePerKg: parseFloat(e.target.value) || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editFormData.status || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                >
                  <option value="POSTED">Posted</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowEditModal(false)
                setEditFormData({})
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTrip}
              disabled={actionLoading === selectedTrip.id}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading === selectedTrip.id ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    )
  )

  const DeleteConfirmModal = () => (
    showDeleteConfirm && selectedTrip && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold">Delete Trip</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete the trip <span className="font-medium">{selectedTrip.title}</span>? 
            This action cannot be undone and will remove all associated packages and chats.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteTrip}
              disabled={actionLoading === selectedTrip.id}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {actionLoading === selectedTrip.id ? 'Deleting...' : 'Delete Trip'}
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
          <h1 className="text-3xl font-bold text-gray-900">Trips Management</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all platform trips</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add Trip
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
            title="Total Trips"
            value={metrics.totalTrips}
            icon={<Plane className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Trips"
            value={metrics.activeTrips}
            subtitle={`${((metrics.activeTrips / metrics.totalTrips) * 100 || 0).toFixed(1)}% of total`}
            icon={<Route className="h-5 w-5" />}
          />
          <MetricCard
            title="Completed Trips"
            value={metrics.completedTrips}
            subtitle={`${((metrics.completedTrips / metrics.totalTrips) * 100 || 0).toFixed(1)}% completion rate`}
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="Average Rating"
            value={metrics.averageRating.toFixed(1)}
            subtitle="Traveler satisfaction"
            icon={<Star className="h-5 w-5" />}
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
              placeholder="Search trips..."
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
            <option value="POSTED">Posted</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={selectedTransport}
            onChange={(e) => handleFilterChange('transport', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Transport</option>
            <option value="plane">Plane</option>
            <option value="car">Car</option>
            <option value="train">Train</option>
            <option value="bus">Bus</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedStatus('')
              setSelectedTransport('')
              setSelectedRoute('')
              setPage(1)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Trips Table */}
      <DataTable
        data={trips}
        columns={columns}
        pagination={{
          page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onPageChange: setPage
        }}
      />

      {/* Modals */}
      <EditTripModal />
      <DeleteConfirmModal />
    </div>
  )
}

