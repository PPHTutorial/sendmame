'use client'

import React, { useEffect, useState } from 'react'
import { 
  Settings, 
  Database, 
  Shield, 
  Calendar,
  RefreshCw,
  Search,
  Download,
  Eye,
  MoreVertical,
  XCircle,
  Trash2,
  AlertCircle,
  Clock,
  Edit,
  Plus,
  Key,
  FileText,
  Save,
  X,
  Loader2
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface SystemConfig {
  id: string
  key: string
  value: string
  description?: string
  updatedAt: string
}

interface _SystemConfigMetrics {
  totalConfigs: number
  recentlyUpdated: number
  configsWithDescription: number
  configsWithoutDescription: number
  todayUpdated: number
  thisWeekUpdated: number
}

export default function SystemConfigPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [selectedConfig, setSelectedConfig] = useState<SystemConfig | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editForm, setEditForm] = useState({ key: '', value: '', description: '' })
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedingProgress, setSeedingProgress] = useState('')
  const [showSeedModal, setShowSeedModal] = useState(false)

  const queryClient = useQueryClient()

  // Fetch system configs
  const { data: configsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-system-configs', page, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetch(`/api/dashboard/system-config?${params}`)
      if (!response.ok) throw new Error('Failed to fetch system configs')
      return response.json()
    }
  })

  // Fetch system config metrics
  const { data: metrics } = useQuery({
    queryKey: ['system-config-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/system-config/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    }
  })

  // Handle actions
  const handleViewConfig = (config: SystemConfig) => {
    setSelectedConfig(config)
    setShowDetailsModal(true)
    setOpenActionDropdown(null)
  }

  const handleEditConfig = (config: SystemConfig) => {
    setSelectedConfig(config)
    setEditForm({
      key: config.key,
      value: config.value,
      description: config.description || ''
    })
    setShowEditModal(true)
    setOpenActionDropdown(null)
  }

  const handleCreateConfig = () => {
    setEditForm({ key: '', value: '', description: '' })
    setShowCreateModal(true)
  }

  const handleSeedDatabase = async () => {
    setIsSeeding(true)
    setSeedingProgress('Starting comprehensive database seeding...')
    
    try {
      const response = await fetch('/api/dashboard/system-config/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error('Seeding failed')
      }
      
      const data = await response.json()
      setSeedingProgress(`Seeding completed! ${data.message}`)
      
      // Refresh all data after seeding
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-system-configs'] })
        queryClient.invalidateQueries({ queryKey: ['system-config-metrics'] })
        setIsSeeding(false)
        setSeedingProgress('')
        setShowSeedModal(false)
      }, 2000)
      
    } catch (error) {
      console.error('Seeding error:', error)
      setSeedingProgress('Seeding failed. Please try again.')
      setIsSeeding(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      const url = showCreateModal 
        ? '/api/dashboard/system-config'
        : `/api/dashboard/system-config`
      
      const method = showCreateModal ? 'POST' : 'PUT'
      const body = showCreateModal 
        ? editForm 
        : { id: selectedConfig?.id, ...editForm }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (!response.ok) throw new Error('Failed to save config')
      
      setShowEditModal(false)
      setShowCreateModal(false)
      setSelectedConfig(null)
      setOpenActionDropdown(null)
      
      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['dashboard-system-configs'] })
      queryClient.invalidateQueries({ queryKey: ['system-config-metrics'] })
    } catch (err) {
      console.error('Error saving config:', err)
    }
  }

  const handleDeleteConfig = async () => {
    if (!selectedConfig) return
    
    try {
      const response = await fetch(`/api/dashboard/system-config?id=${selectedConfig.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete config')
      
      setShowDeleteConfirm(false)
      setSelectedConfig(null)
      setOpenActionDropdown(null)
      
      // Refetch data
      queryClient.invalidateQueries({ queryKey: ['dashboard-system-configs'] })
      queryClient.invalidateQueries({ queryKey: ['system-config-metrics'] })
    } catch (err) {
      console.error('Error deleting config:', err)
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateString = (str: string, maxLength: number = 50) => {
    if (str.length <= maxLength) return str
    return str.substring(0, maxLength) + '...'
  }

  const getConfigIcon = (key: string) => {
    const keyLower = key.toLowerCase()
    if (keyLower.includes('database') || keyLower.includes('db')) return <Database className="h-4 w-4" />
    if (keyLower.includes('security') || keyLower.includes('secret') || keyLower.includes('password')) return <Shield className="h-4 w-4" />
    if (keyLower.includes('api') || keyLower.includes('endpoint')) return <Settings className="h-4 w-4" />
    return <Key className="h-4 w-4" />
  }

  const columns = [
    {
      key: 'key',
      label: 'Configuration Key',
      render: (_: any, config: SystemConfig) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            {getConfigIcon(config.key)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{config.key}</div>
            {config.description && (
              <div className="text-sm text-gray-500">{truncateString(config.description, 50)}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'value',
      label: 'Value',
      render: (_: any, config: SystemConfig) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {config.value.includes('password') || config.value.includes('secret') || config.key.toLowerCase().includes('password') 
              ? '••••••••' 
              : truncateString(config.value, 40)
            }
          </div>
        </div>
      )
    },
    {
      key: 'metadata',
      label: 'Metadata',
      render: (_: any, config: SystemConfig) => (
        <div className="text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{config.description ? 'Has Description' : 'No Description'}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Key className="h-3 w-3" />
            <span>ID: {config.id.slice(0, 8)}...</span>
          </div>
        </div>
      )
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      render: (_: any, config: SystemConfig) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(config.updatedAt)}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, config: SystemConfig) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === config.id ? null : config.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openActionDropdown === config.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewConfig(config)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                <button
                  onClick={() => handleEditConfig(config)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit Config
                </button>
                <button
                  onClick={() => {
                    setSelectedConfig(config)
                    setShowDeleteConfirm(true)
                    setOpenActionDropdown(null)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Config
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
            <h3 className="font-medium text-red-800">Error Loading System Configuration</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Modal Components
  const ConfigDetailsModal = () => (
    showDetailsModal && selectedConfig && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Configuration Details</h3>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Key className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Configuration Key</div>
                    <div className="text-sm text-gray-600">{selectedConfig.key}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Database className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Configuration Value</div>
                    <div className="text-sm text-gray-600 break-words">
                      {selectedConfig.key.toLowerCase().includes('password') || 
                       selectedConfig.key.toLowerCase().includes('secret') ||
                       selectedConfig.value.includes('password') 
                        ? '••••••••••••••••'
                        : selectedConfig.value
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedConfig.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Description</h4>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-400 mt-1" />
                  <div>
                    <div className="text-sm text-gray-700">{selectedConfig.description}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-3">System Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Config ID:</span> {selectedConfig.id}</div>
                <div><span className="font-medium">Last Updated:</span> {formatDate(selectedConfig.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  )

  const EditConfigModal = () => (
    (showEditModal || showCreateModal) && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              {showCreateModal ? 'Create Configuration' : 'Edit Configuration'}
            </h3>
            <button
              onClick={() => {
                setShowEditModal(false)
                setShowCreateModal(false)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuration Key
              </label>
              <input
                type="text"
                value={editForm.key}
                onChange={(e) => setEditForm({ ...editForm, key: e.target.value })}
                disabled={!showCreateModal}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter configuration key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuration Value
              </label>
              <textarea
                value={editForm.value}
                onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                placeholder="Enter configuration value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
                placeholder="Enter configuration description"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSaveConfig}
              className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {showCreateModal ? 'Create Config' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setShowEditModal(false)
                setShowCreateModal(false)
              }}
              className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  )

  const DeleteConfirmModal = () => (
    showDeleteConfirm && selectedConfig && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Delete Configuration</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete the configuration &quot;{selectedConfig.key}&quot;? This action cannot be undone and may affect system functionality.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleDeleteConfig}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Config
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(false)
                setSelectedConfig(null)
              }}
              className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
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
          <h1 className="text-3xl font-bold text-gray-900">System Configuration</h1>
          <p className="text-gray-600 mt-2">Manage application settings and system parameters</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSeedModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Database className="h-4 w-4" />
            Seed Database
          </button>
          <button
            onClick={handleCreateConfig}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Config
          </button>
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
            title="Total Configs"
            value={metrics.totalConfigs}
            icon={<Settings className="h-5 w-5" />}
          />
          <MetricCard
            title="Recently Updated"
            value={metrics.recentlyUpdated}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="With Description"
            value={metrics.configsWithDescription}
            icon={<FileText className="h-5 w-5" />}
          />
          <MetricCard
            title="Without Description"
            value={metrics.configsWithoutDescription}
            icon={<AlertCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="Updated Today"
            value={metrics.todayUpdated}
            icon={<Calendar className="h-5 w-5" />}
          />
          <MetricCard
            title="Updated This Week"
            value={metrics.thisWeekUpdated}
            icon={<Database className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search configurations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
            />
          </div>

          <button
            onClick={() => {
              setSearchTerm('')
              setPage(1)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Filters
          </button>

          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-500">
              {configsData?.systemConfigs?.length || 0} configurations
            </span>
          </div>
        </div>
      </div>

      {/* System Configs Table */}
      <DataTable
        data={configsData?.systemConfigs || []}
        columns={columns}
        pagination={{
          page,
          pageSize: 20,
          total: configsData?.pagination?.total || 0,
          onPageChange: setPage
        }}
      />

      {/* Modals */}
      <ConfigDetailsModal />
      <EditConfigModal />
      <DeleteConfirmModal />
      
      {/* Seed Database Modal */}
      {showSeedModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Seed Database</h3>
                <p className="text-sm text-gray-600">Populate database with comprehensive test data</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Warning</p>
                    <p>This will add extensive test data to your database including users, packages, trips, chats, and transactions. This operation may take a few minutes to complete.</p>
                  </div>
                </div>
              </div>

              {isSeeding && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    <span className="text-sm text-gray-600">Seeding database...</span>
                  </div>
                  {seedingProgress && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                      {seedingProgress}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  if (!isSeeding) {
                    setShowSeedModal(false)
                    setSeedingProgress('')
                  }
                }}
                disabled={isSeeding}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSeeding ? 'Please wait...' : 'Cancel'}
              </button>
              <button
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Start Seeding
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

