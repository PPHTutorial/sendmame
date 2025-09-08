'use client'

import React, { useEffect, useState } from 'react'
import { 
  MessageCircle, 
  Users, 
  Clock, 
  RefreshCw,
  Search,
  Download,
  Eye,
  MoreVertical,
  Package,
  Plane,
  HelpCircle,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface Chat {
  id: string
  type: string
  isActive: boolean
  lastMessageAt: string
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
    title: string
    status: string
  }
  messages: {
    content: string
    messageType: string
    createdAt: string
    sender: {
      firstName: string
      lastName: string
    }
  }[]
  _count: {
    messages: number
  }
}

interface _ChatMetrics {
  totalChats: number
  activeChats: number
  todayChats: number
  packageNegotiationChats: number
  tripCoordinationChats: number
  supportChats: number
  totalMessages: number
}

export default function ChatsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [page, setPage] = useState(1)
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const _queryClient = useQueryClient()

  // Fetch chats
  const { data: chatsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-chats', page, searchTerm, selectedType, selectedStatus, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedType && { type: selectedType }),
        ...(selectedStatus && { isActive: selectedStatus }),
        ...(dateRange && { dateRange })
      })
      
      const response = await fetch(`/api/dashboard/chats?${params}`)
      if (!response.ok) throw new Error('Failed to fetch chats')
      return response.json()
    }
  })

  // Fetch chat metrics
  const { data: metrics } = useQuery({
    queryKey: ['chat-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/chats/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    }
  })

  // Handle actions
  const handleViewChat = (chat: Chat) => {
    setSelectedChat(chat)
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PACKAGE_NEGOTIATION': return <Package className="h-4 w-4 text-blue-500" />
      case 'TRIP_COORDINATION': return <Plane className="h-4 w-4 text-green-500" />
      case 'SUPPORT': return <HelpCircle className="h-4 w-4 text-purple-500" />
      default: return <MessageCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PACKAGE_NEGOTIATION': return 'bg-blue-100 text-blue-800'
      case 'TRIP_COORDINATION': return 'bg-green-100 text-green-800'
      case 'SUPPORT': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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

  const formatChatType = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const columns = [
    {
      key: 'chat',
      label: 'Chat',
      render: (_: any, chat: Chat) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getTypeIcon(chat.type)}
            {chat.isActive ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {formatChatType(chat.type)}
            </div>
            <div className="text-sm text-gray-500">ID: {chat.id.slice(0, 8)}...</div>
          </div>
        </div>
      )
    },
    {
      key: 'participants',
      label: 'Participants',
      render: (_: any, chat: Chat) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 flex items-center gap-1">
            <Users className="h-4 w-4" />
            {chat.participants.length} participant{chat.participants.length !== 1 ? 's' : ''}
          </div>
          <div className="text-gray-500">
            {chat.participants.slice(0, 2).map(p => 
              `${p.user.firstName} ${p.user.lastName}`
            ).join(', ')}
            {chat.participants.length > 2 && ` +${chat.participants.length - 2} more`}
          </div>
        </div>
      )
    },
    {
      key: 'related',
      label: 'Related To',
      render: (_: any, chat: Chat) => (
        <div className="text-sm">
          {chat.package ? (
            <div>
              <div className="font-medium text-gray-900 flex items-center gap-1">
                <Package className="h-4 w-4" />
                Package
              </div>
              <div className="text-gray-500">{chat.package.title}</div>
            </div>
          ) : chat.trip ? (
            <div>
              <div className="font-medium text-gray-900 flex items-center gap-1">
                <Plane className="h-4 w-4" />
                Trip
              </div>
              <div className="text-gray-500">{chat.trip.title}</div>
            </div>
          ) : (
            <span className="text-gray-400">General Chat</span>
          )}
        </div>
      )
    },
    {
      key: 'lastMessage',
      label: 'Last Message',
      render: (_: any, chat: Chat) => (
        <div className="text-sm max-w-xs">
          {chat.messages.length > 0 ? (
            <div>
              <div className="font-medium text-gray-900 truncate">
                {chat.messages[0].sender.firstName}: {chat.messages[0].content}
              </div>
              <div className="text-gray-500">{formatDate(chat.messages[0].createdAt)}</div>
            </div>
          ) : (
            <span className="text-gray-400">No messages</span>
          )}
        </div>
      )
    },
    {
      key: 'messages',
      label: 'Messages',
      render: (_: any, chat: Chat) => (
        <div className="text-sm text-center">
          <div className="font-medium text-gray-900">
            {chat._count.messages}
          </div>
          <div className="text-gray-500">total</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, chat: Chat) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(chat.isActive)}`}>
          {chat.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (_: any, chat: Chat) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(chat.type)}`}>
          {formatChatType(chat.type)}
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
                  onClick={() => handleViewChat(chat)}
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
            <h3 className="font-medium text-red-800">Error Loading Chats</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Modal Components
  const ChatDetailsModal = () => (
    showDetailsModal && selectedChat && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Chat Details</h3>
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
                <h4 className="font-medium text-gray-900 mb-3">Chat Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">ID:</span> {selectedChat.id}</div>
                  <div><span className="font-medium">Type:</span> {formatChatType(selectedChat.type)}</div>
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedChat.isActive)}`}>
                      {selectedChat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div><span className="font-medium">Messages:</span> {selectedChat._count.messages}</div>
                  <div><span className="font-medium">Created:</span> {formatDate(selectedChat.createdAt)}</div>
                  {selectedChat.lastMessageAt && (
                    <div><span className="font-medium">Last Message:</span> {formatDate(selectedChat.lastMessageAt)}</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Related Entity</h4>
                <div className="space-y-2 text-sm">
                  {selectedChat.package ? (
                    <>
                      <div><span className="font-medium">Package:</span> {selectedChat.package.title}</div>
                      <div><span className="font-medium">Package Status:</span> {selectedChat.package.status}</div>
                    </>
                  ) : selectedChat.trip ? (
                    <>
                      <div><span className="font-medium">Trip:</span> {selectedChat.trip.title}</div>
                      <div><span className="font-medium">Trip Status:</span> {selectedChat.trip.status}</div>
                    </>
                  ) : (
                    <div className="text-gray-400 italic">No related entity</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Participants ({selectedChat.participants.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedChat.participants.map((participant, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-8 w-8 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {participant.user.firstName} {participant.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{participant.user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedChat.messages.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Messages</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedChat.messages.slice(0, 10).map((message, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="h-6 w-6 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {message.sender.firstName} {message.sender.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{message.content}</p>
                      </div>
                    </div>
                  ))}
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
          <h1 className="text-3xl font-bold text-gray-900">Chat Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage user communications and conversations</p>
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
            title="Total Chats"
            value={metrics.totalChats}
            icon={<MessageCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Chats"
            value={metrics.activeChats}
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="Today's Chats"
            value={metrics.todayChats}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Package Talks"
            value={metrics.packageNegotiationChats}
            icon={<Package className="h-5 w-5" />}
          />
          <MetricCard
            title="Trip Coordination"
            value={metrics.tripCoordinationChats}
            icon={<Plane className="h-5 w-5" />}
          />
          <MetricCard
            title="Support Chats"
            value={metrics.supportChats}
            icon={<HelpCircle className="h-5 w-5" />}
          />
          <MetricCard
            title="Total Messages"
            value={metrics.totalMessages}
            icon={<MessageCircle className="h-5 w-5" />}
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
              placeholder="Search chats..."
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
            <option value="PACKAGE_NEGOTIATION">Package Negotiation</option>
            <option value="TRIP_COORDINATION">Trip Coordination</option>
            <option value="SUPPORT">Support</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
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

      {/* Chats Table */}
      <DataTable
        data={chatsData?.chats || []}
        columns={columns}
        pagination={{
          page,
          pageSize: 20,
          total: chatsData?.pagination?.total || 0,
          onPageChange: setPage
        }}
      />

      {/* Modals */}
      <ChatDetailsModal />
    </div>
  )
}

