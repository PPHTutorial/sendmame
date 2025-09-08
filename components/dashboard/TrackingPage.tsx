'use client'

import React, { useEffect, useState } from 'react'
import { 
  Package, 
  MapPin, 
  Clock, 
  RefreshCw,
  Search,
  Download,
  Eye,
  MoreVertical,
  Truck,
  CheckCircle,
  AlertCircle,
  Navigation,
  XCircle
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface TrackingEvent {
  id: string
  packageId: string
  event: string
  description: string
  location: any
  timestamp: string
  package: {
    id: string
    title: string
    status: string
    sender: {
      firstName: string
      lastName: string
      email: string
    }
    receiver: {
      firstName: string
      lastName: string
      email: string
    }
  }
}

interface TrackingEventMetrics {
  totalEvents: number
  todayEvents: number
  pickupEvents: number
  deliveryEvents: number
  transitEvents: number
  exceptionEvents: number
}

export default function TrackingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [page, setPage] = useState(1)
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [selectedTrackingEvent, setSelectedTrackingEvent] = useState<TrackingEvent | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const queryClient = useQueryClient()

  // Fetch tracking events
  const { data: trackingEventsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-tracking-events', page, searchTerm, selectedEvent, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedEvent && { event: selectedEvent }),
        ...(dateRange && { dateRange })
      })
      
      const response = await fetch(`/api/dashboard/tracking-events?${params}`)
      if (!response.ok) throw new Error('Failed to fetch tracking events')
      return response.json()
    }
  })

  // Fetch tracking event metrics
  const { data: metrics } = useQuery({
    queryKey: ['tracking-event-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/tracking-events/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    }
  })

  // Handle actions
  const handleViewEvent = (trackingEvent: TrackingEvent) => {
    setSelectedTrackingEvent(trackingEvent)
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

  const getEventIcon = (event: string) => {
    switch (event.toLowerCase()) {
      case 'picked_up':
      case 'pickup': return <Package className="h-4 w-4 text-blue-500" />
      case 'in_transit':
      case 'transit': return <Truck className="h-4 w-4 text-yellow-500" />
      case 'delivered':
      case 'delivery': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'exception':
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Navigation className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventColor = (event: string) => {
    switch (event.toLowerCase()) {
      case 'picked_up':
      case 'pickup': return 'bg-blue-100 text-blue-800'
      case 'in_transit':
      case 'transit': return 'bg-yellow-100 text-yellow-800'
      case 'delivered':
      case 'delivery': return 'bg-green-100 text-green-800'
      case 'exception':
      case 'error': return 'bg-red-100 text-red-800'
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

  const formatLocation = (location: any) => {
    if (typeof location === 'string') return location
    if (location && typeof location === 'object') {
      return location.address || location.city || JSON.stringify(location)
    }
    return 'Unknown Location'
  }

  const columns = [
    {
      key: 'event',
      label: 'Event',
      render: (_: any, trackingEvent: TrackingEvent) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getEventIcon(trackingEvent.event)}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {trackingEvent.event.replace('_', ' ').toUpperCase()}
            </div>
            <div className="text-sm text-gray-500">Package: {trackingEvent.package.title}</div>
          </div>
        </div>
      )
    },
    {
      key: 'package',
      label: 'Package Details',
      render: (_: any, trackingEvent: TrackingEvent) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {trackingEvent.package.sender.firstName} {trackingEvent.package.sender.lastName}
          </div>
          <div className="text-gray-500">→ {trackingEvent.package.receiver.firstName} {trackingEvent.package.receiver.lastName}</div>
          <div className="text-xs text-gray-400">Status: {trackingEvent.package.status}</div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (_: any, trackingEvent: TrackingEvent) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {trackingEvent.description}
          </div>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (_: any, trackingEvent: TrackingEvent) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900">{formatLocation(trackingEvent.location)}</span>
        </div>
      )
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (_: any, trackingEvent: TrackingEvent) => (
        <div className="text-sm">
          <div>{formatDate(trackingEvent.timestamp)}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Event Type',
      render: (_: any, trackingEvent: TrackingEvent) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventColor(trackingEvent.event)}`}>
          {trackingEvent.event.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, trackingEvent: TrackingEvent) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === trackingEvent.id ? null : trackingEvent.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openActionDropdown === trackingEvent.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewEvent(trackingEvent)}
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
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Tracking Events</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Modal Components
  const EventDetailsModal = () => (
    showDetailsModal && selectedTrackingEvent && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Tracking Event Details</h3>
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
                <h4 className="font-medium text-gray-900 mb-3">Event Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Event:</span> {selectedTrackingEvent.event}</div>
                  <div><span className="font-medium">Description:</span> {selectedTrackingEvent.description}</div>
                  <div><span className="font-medium">Location:</span> {formatLocation(selectedTrackingEvent.location)}</div>
                  <div><span className="font-medium">Timestamp:</span> {formatDate(selectedTrackingEvent.timestamp)}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Package Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Title:</span> {selectedTrackingEvent.package.title}</div>
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getEventColor(selectedTrackingEvent.package.status)}`}>
                      {selectedTrackingEvent.package.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Sender</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedTrackingEvent.package.sender.firstName} {selectedTrackingEvent.package.sender.lastName}</div>
                  <div><span className="font-medium">Email:</span> {selectedTrackingEvent.package.sender.email}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recipient</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedTrackingEvent.package.receiver.firstName} {selectedTrackingEvent.package.receiver.lastName}</div>
                  <div><span className="font-medium">Email:</span> {selectedTrackingEvent.package.receiver.email}</div>
                </div>
              </div>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Tracking Events</h1>
          <p className="text-gray-600 mt-2">Monitor package tracking events and delivery progress</p>
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
            title="Total Events"
            value={metrics.totalEvents}
            icon={<Navigation className="h-5 w-5" />}
          />
          <MetricCard
            title="Today's Events"
            value={metrics.todayEvents}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Pickup Events"
            value={metrics.pickupEvents}
            icon={<Package className="h-5 w-5" />}
          />
          <MetricCard
            title="Delivery Events"
            value={metrics.deliveryEvents}
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="In Transit"
            value={metrics.transitEvents}
            icon={<Truck className="h-5 w-5" />}
          />
          <MetricCard
            title="Exceptions"
            value={metrics.exceptionEvents}
            icon={<AlertCircle className="h-5 w-5" />}
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
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Events</option>
            <option value="picked_up">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="exception">Exception</option>
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
              setSelectedEvent('')
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

      {/* Tracking Events Table */}
      <DataTable
        data={trackingEventsData?.trackingEvents || []}
        columns={columns}
        pagination={{
          page,
          pageSize: 20,
          total: trackingEventsData?.pagination?.total || 0,
          onPageChange: setPage
        }}
      />

      {/* Modals */}
      <EventDetailsModal />
    </div>
  )
}
    

