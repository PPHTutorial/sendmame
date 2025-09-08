'use client'

import React, { useState } from 'react'
import { 
  MessageSquare, 
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Download,
  Eye,
  MoreVertical,
  Ban,
  Flag,
  Archive,
  Send,
  User
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  messageType: string
  isEdited: boolean
  isDeleted: boolean
  readBy: Record<string, string>
  createdAt: string
  updatedAt: string
  sender: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  chat: {
    id: string
    packageId?: string
    tripId?: string
    participants: {
      user: {
        id: string
        firstName: string
        lastName: string
      }
    }[]
    package?: {
      id: string
      title: string
    }
    trip?: {
      id: string
    }
  }
}

interface Chat {
  id: string
  packageId?: string
  tripId?: string
  lastMessageAt: string
  isActive: boolean
  createdAt: string
  participants: {
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
  }[]
  package?: {
    id: string
    title: string
    status: string
  }
  trip?: {
    id: string
    status: string
  }
  _count: {
    messages: number
  }
}

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<'messages' | 'chats'>('messages')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<Message | Chat | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showModerationModal, setShowModerationModal] = useState(false)

  const queryClient = useQueryClient()

  // Fetch messages or chats based on active tab
  const { data: itemsData, isLoading, error } = useQuery({
    queryKey: [`dashboard-${activeTab}`, page, searchTerm, typeFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter })
      })
      
      const response = await fetch(`/api/dashboard/${activeTab}?${params}`)
      if (!response.ok) throw new Error(`Failed to fetch ${activeTab}`)
      return response.json()
    }
  })

  // Fetch metrics
  const { data: metrics } = useQuery({
    queryKey: ['messages-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/messages/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    }
  })

  // Moderate message mutation
  const moderateMutation = useMutation({
    mutationFn: async ({ messageId, action, reason }: { messageId: string, action: 'hide' | 'flag' | 'archive', reason?: string }) => {
      const response = await fetch(`/api/dashboard/messages/${messageId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      })
      if (!response.ok) throw new Error('Failed to moderate message')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`dashboard-${activeTab}`] })
      queryClient.invalidateQueries({ queryKey: ['messages-metrics'] })
      setShowModerationModal(false)
    }
  })

  // Handle actions
  const handleViewDetails = (item: Message | Chat) => {
    setSelectedItem(item)
    setShowDetailsModal(true)
    setOpenActionDropdown(null)
  }

  const handleModerate = (item: Message | Chat) => {
    setSelectedItem(item)
    setShowModerationModal(true)
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

  const getMessageTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'text':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'system':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'notification':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }



  // Messages columns
  const messageColumns = [
    {
      key: 'sender',
      label: 'Sender',
      render: (_: any, message: Message) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {message.sender.firstName} {message.sender.lastName}
            </div>
            <div className="text-sm text-gray-500">{message.sender.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'content',
      label: 'Message',
      render: (_: any, message: Message) => (
        <div className="max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            {getMessageTypeIcon(message.messageType)}
            <span className="text-xs text-gray-500 uppercase">{message.messageType}</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
        </div>
      )
    },
    {
      key: 'chat',
      label: 'Context',
      render: (_: any, message: Message) => (
        <div className="text-sm">
          {message.chat.package && (
            <div className="font-medium text-blue-600 mb-1">
              📦 {message.chat.package.title}
            </div>
          )}
          {message.chat.trip && (
            <div className="font-medium text-purple-600 mb-1">
              🚗 Trip {message.chat.trip.id.slice(0, 8)}...
            </div>
          )}
          <div className="text-gray-500">
            {message.chat.participants.length} participants
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, message: Message) => (
        <div className="space-y-1">
          {Object.keys(message.readBy || {}).length > 0 ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Read
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Unread
            </span>
          )}
          {message.isDeleted && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <Flag className="h-3 w-3 mr-1" />
              Deleted
            </span>
          )}
        </div>
      )
    },
    {
      key: 'date',
      label: 'Sent',
      render: (value: string) => (
        <div className="text-sm text-gray-500">
          {formatDate(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, message: Message) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === message.id ? null : message.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openActionDropdown === message.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewDetails(message)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                
                <button
                  onClick={() => handleModerate(message)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                >
                  <Flag className="h-4 w-4" />
                  Moderate
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }
  ]

  // Chat columns
  const chatColumns = [
    {
      key: 'participants',
      label: 'Participants',
      render: (_: any, chat: Chat) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <div className="text-sm">
            {chat.participants.map((p, idx) => (
              <div key={p.user.id} className={idx > 0 ? 'text-gray-500' : 'font-medium text-gray-900'}>
                {p.user.firstName} {p.user.lastName}
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      key: 'context',
      label: 'Context',
      render: (_: any, chat: Chat) => (
        <div className="text-sm">
          {chat.package && (
            <div className="font-medium text-blue-600 mb-1">
              📦 {chat.package.title}
              <div className="text-xs text-gray-500 capitalize">Status: {chat.package.status}</div>
            </div>
          )}
          {chat.trip && (
            <div className="font-medium text-purple-600 mb-1">
              🚗 Trip {chat.trip.id.slice(0, 8)}...
              <div className="text-xs text-gray-500 capitalize">Status: {chat.trip.status}</div>
            </div>
          )}
          {!chat.package && !chat.trip && (
            <span className="text-gray-400">General Chat</span>
          )}
        </div>
      )
    },
    {
      key: 'messages',
      label: 'Messages',
      render: (_: any, chat: Chat) => (
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">
            {chat._count.messages}
          </div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      )
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      render: (_: any, chat: Chat) => (
        <div className="text-sm text-gray-500">
          {formatDate(chat.lastMessageAt)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, chat: Chat) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          chat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {chat.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, chat: Chat) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === chat.id ? null : chat.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openActionDropdown === chat.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewDetails(chat)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Chat
                </button>
                
                <button
                  onClick={() => handleModerate(chat)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                >
                  <Archive className="h-4 w-4" />
                  Archive Chat
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
            <h3 className="font-medium text-red-800">Error Loading {activeTab}</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Modal Components
  const DetailsModal = () => (
    showDetailsModal && selectedItem && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              {activeTab === 'messages' ? 'Message Details' : 'Chat Details'}
            </h3>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            {activeTab === 'messages' && 'content' in selectedItem && (
              <>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Message Content</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">{selectedItem.content}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Sender Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {selectedItem.sender.firstName} {selectedItem.sender.lastName}</div>
                      <div><span className="font-medium">Email:</span> {selectedItem.sender.email}</div>
                      <div><span className="font-medium">User ID:</span> {selectedItem.sender.id}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Message Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Type:</span> <span className="capitalize">{selectedItem.messageType}</span></div>
                      <div><span className="font-medium">Status:</span> {Object.keys(selectedItem.readBy || {}).length > 0 ? 'Read' : 'Unread'}</div>
                      <div><span className="font-medium">Edited:</span> {selectedItem.isEdited ? 'Yes' : 'No'}</div>
                      <div><span className="font-medium">Deleted:</span> {selectedItem.isDeleted ? 'Yes' : 'No'}</div>
                      <div><span className="font-medium">Sent:</span> {formatDate(selectedItem.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'chats' && 'participants' in selectedItem && (
              <>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Participants ({selectedItem.participants.length})</h4>
                  <div className="space-y-2">
                    {selectedItem.participants.map((p) => (
                      <div key={p.user.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{p.user.firstName} {p.user.lastName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Chat Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Chat ID:</span> {selectedItem.id}</div>
                      <div><span className="font-medium">Messages:</span> {selectedItem._count.messages}</div>
                      <div><span className="font-medium">Status:</span> {selectedItem.isActive ? 'Active' : 'Inactive'}</div>
                      <div><span className="font-medium">Created:</span> {formatDate(selectedItem.createdAt)}</div>
                      <div><span className="font-medium">Last Activity:</span> {formatDate(selectedItem.lastMessageAt)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Context</h4>
                    <div className="space-y-2 text-sm">
                      {selectedItem.package && (
                        <>
                          <div><span className="font-medium">Package:</span> {selectedItem.package.title}</div>
                          <div><span className="font-medium">Package ID:</span> {selectedItem.package.id}</div>
                          <div><span className="font-medium">Package Status:</span> <span className="capitalize">{selectedItem.package.status}</span></div>
                        </>
                      )}
                      {selectedItem.trip && (
                        <>
                          <div><span className="font-medium">Trip ID:</span> {selectedItem.trip.id}</div>
                          <div><span className="font-medium">Trip Status:</span> <span className="capitalize">{selectedItem.trip.status}</span></div>
                        </>
                      )}
                      {!selectedItem.package && !selectedItem.trip && (
                        <div className="text-gray-500">General conversation</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  )

  const ModerationModal = () => (
    showModerationModal && selectedItem && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">
            Moderate {activeTab === 'messages' ? 'Message' : 'Chat'}
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={() => moderateMutation.mutate({ 
                messageId: selectedItem.id, 
                action: 'hide' 
              })}
              disabled={moderateMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              <Ban className="h-4 w-4" />
              Hide {activeTab === 'messages' ? 'Message' : 'Chat'}
            </button>
            
            <button
              onClick={() => moderateMutation.mutate({ 
                messageId: selectedItem.id, 
                action: 'flag' 
              })}
              disabled={moderateMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Flag className="h-4 w-4" />
              Flag as Inappropriate
            </button>
            
            <button
              onClick={() => moderateMutation.mutate({ 
                messageId: selectedItem.id, 
                action: 'archive' 
              })}
              disabled={moderateMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              <Archive className="h-4 w-4" />
              Archive
            </button>
            
            <button
              onClick={() => setShowModerationModal(false)}
              className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
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
          <h1 className="text-3xl font-bold text-gray-900">Messages & Chats</h1>
          <p className="text-gray-600 mt-2">Manage user communications and conversations</p>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('messages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'messages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Messages
            </div>
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Chats
            </div>
          </button>
        </nav>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Messages"
            value={metrics.totalMessages}
            icon={<MessageSquare className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Chats"
            value={metrics.activeChats}
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            title="Today's Messages"
            value={metrics.todayMessages}
            subtitle="24h activity"
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Flagged Content"
            value={metrics.flaggedMessages}
            icon={<Flag className="h-5 w-5" />}
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
              placeholder={`Search ${activeTab}...`}
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
            {activeTab === 'messages' ? (
              <>
                <option value="text">Text Messages</option>
                <option value="system">System Messages</option>
                <option value="notification">Notifications</option>
              </>
            ) : (
              <>
                <option value="package">Package Chats</option>
                <option value="trip">Trip Chats</option>
                <option value="general">General Chats</option>
              </>
            )}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="flagged">Flagged</option>
            {activeTab === 'messages' && (
              <>
                <option value="read">Read</option>
                <option value="unread">Unread</option>
              </>
            )}
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

      {/* Data Table */}
      <DataTable
        data={itemsData?.[activeTab] || []}
        columns={activeTab === 'messages' ? messageColumns : chatColumns}
        pagination={{
          page,
          pageSize: 20,
          total: itemsData?.pagination?.total || 0,
          onPageChange: setPage
        }}
      />

      {/* Modals */}
      <DetailsModal />
      <ModerationModal />
    </div>
  )
}

