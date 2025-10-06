/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
    useAuth,
    useChats,
    useNotifications,
    useMessages,
    useSendMessage,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead
} from '@/lib/hooks/api'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { MessagingInterface } from '@/components/shared/MessagingInterface'
import {
    MessageCircle,
    Search,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Package,
    Plane,
    CheckCircle,
    Bell,
    AlertCircle,
    CreditCard
} from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { NavHeader } from '@/components/shared'
import { Footer } from '@/components/navigation'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

// Types for the messaging system (matching API response)
interface ApiChat {
    id: string
    type: 'PACKAGE_NEGOTIATION' | 'TRIP_COORDINATION' | 'SUPPORT'
    participants: Array<{
        id: string
        userId: string
        user: {
            id: string
            firstName: string
            lastName: string
            avatar: string | null
        }
    }>
    messages: Array<{
        id: string
        content: string
        senderId: string
        createdAt: string
        messageType: string
        attachments: any[]
        sender: {
            id: string
            firstName: string
            lastName: string
            avatar: string | null
        }
    }>
    package?: {
        id: string
        title: string
        status?: string
    }
    trip?: {
        id: string
        title: string
        status?: string
    }
    lastMessageAt: string | null
    createdAt: string
}

interface Notification {
    id: string
    type: 'PACKAGE_MATCH' | 'TRIP_REQUEST' | 'PAYMENT_RECEIVED' | 'DELIVERY_CONFIRMATION' | 'MESSAGE_RECEIVED' | 'SYSTEM_ALERT'
    title: string
    message: string
    isRead: boolean
    createdAt: string
    packageId?: string
    tripId?: string
    chatId?: string
    metadata: any
}

type ConversationItem = { type: 'chat'; data: ApiChat } | { type: 'notification'; data: Notification }

// Utility functions for formatting
const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp)
    if (isToday(date)) {
        return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
        return 'Yesterday'
    } else {
        return format(date, 'MMM dd')
    }
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'PACKAGE_MATCH':
            return Package
        case 'TRIP_REQUEST':
            return Plane
        case 'PAYMENT_RECEIVED':
            return CreditCard
        case 'DELIVERY_CONFIRMATION':
            return CheckCircle
        case 'MESSAGE_RECEIVED':
            return MessageCircle
        case 'SYSTEM_ALERT':
            return AlertCircle
        default:
            return Bell
    }
}

// Convert ApiChat to the format expected by MessagingInterface
const convertApiChatToMessagingInterface = (apiChat: ApiChat) => {
    return {
        id: apiChat.id,
        type: apiChat.type,
        packageId: apiChat.package?.id,
        tripId: apiChat.trip?.id,
        lastMessageAt: apiChat.lastMessageAt || undefined, // Convert null to undefined
        participants: apiChat.participants.map(p => ({
            ...p,
            user: {
                ...p.user,
                avatar: p.user.avatar || undefined // Convert null to undefined
            }
        })),
        messages: apiChat.messages.map(m => ({
            id: m.id,
            content: m.content,
            senderId: m.senderId,
            messageType: m.messageType as 'text' | 'image' | 'file' | 'location' | 'system',
            attachments: m.attachments || [],
            createdAt: m.createdAt,
            isEdited: false // Default value, could be enhanced with actual edit status
        })),
        package: apiChat.package ? {
            id: apiChat.package.id,
            title: apiChat.package.title,
            status: apiChat.package.status || 'ACTIVE'
        } : undefined,
        trip: apiChat.trip ? {
            id: apiChat.trip.id,
            title: apiChat.trip.title,
            status: apiChat.trip.status || 'ACTIVE'
        } : undefined
    }
}

export default function MessagesPage() {
    const router = useRouter()
    const { getCurrentUser } = useAuth()
    const { data: user, isLoading: authLoading } = getCurrentUser

    // API hooks
    const { data: chatsData, isLoading: chatsLoading, error: chatsError, refetch: refetchChats } = useChats()
    const { data: notificationsData, isLoading: notificationsLoading, error: notificationsError, refetch: refetchNotifications } = useNotifications()
    const markNotificationAsRead = useMarkNotificationAsRead()
    const _markAllNotificationsAsRead = useMarkAllNotificationsAsRead()
    const sendMessageMutation = useSendMessage()

    
    const [selectedItem, setSelectedItem] = useState<ConversationItem | null>(null)
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'all' | 'messages' | 'notifications'>('all')
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isMobileView, setIsMobileView] = useState(false)
    const [showMobileSidebar, setShowMobileSidebar] = useState(true)
    const [filteredItems, setFilteredItems] = useState<ConversationItem[]>([])

    // Refs
    const sidebarRef = useRef<HTMLDivElement>(null)

    // Get messages for selected chat
    const { data: _messagesData, isLoading: messagesLoading } = useMessages(
        selectedChatId || '',
        { enabled: !!selectedChatId }
    )

    const chats: ApiChat[] = useMemo(() => chatsData?.data || [], [chatsData])
    const notifications: Notification[] = useMemo(() => notificationsData?.data?.notifications || [], [notificationsData])

    const allItems: ConversationItem[] = useMemo(() => [
        ...chats.map(chat => ({ type: 'chat' as const, data: chat })),
        ...notifications.map(notification => ({ type: 'notification' as const, data: notification }))
    ].sort((a, b) => {
        const aTime = a.type === 'chat'
            ? new Date(a.data.lastMessageAt || a.data.createdAt)
            : new Date(a.data.createdAt)
        const bTime = b.type === 'chat'
            ? new Date(b.data.lastMessageAt || b.data.createdAt)
            : new Date(b.data.createdAt)
        return bTime.getTime() - aTime.getTime()
    }), [chats, notifications])

    useEffect(() => {
        const filtered = allItems.filter(item => {
            if (activeTab === 'messages' && item.type.toLowerCase() !== 'chat') return false
            if (activeTab === 'notifications' && item.type.toLowerCase() !== 'notification') return false

            if (!searchQuery) return true

            const query = searchQuery.toLowerCase()
            if (item.type === 'chat') {
                const otherParticipant = item.data.participants.find(
                    p => p.user.id !== user?.id
                )?.user
                const title = item.data.package?.title || item.data.trip?.title || ''
                const lastMessage = item.data.messages[0]?.content || ''

                return (
                    otherParticipant?.firstName.toLowerCase().includes(query) ||
                    otherParticipant?.lastName.toLowerCase().includes(query) ||
                    title.toLowerCase().includes(query) ||
                    lastMessage.toLowerCase().includes(query)
                )
            } else {
                return (
                    item.data.title.toLowerCase().includes(query) ||
                    item.data.message.toLowerCase().includes(query)
                )
            }
        })

        setFilteredItems(filtered)
    }, [allItems, activeTab, searchQuery, user])

    // Handle item selection
    const handleItemClick = (item: ConversationItem) => {
        setSelectedItem(item)

        if (item.type === 'chat') {
            setSelectedChatId(item.data.id)
        } else {
            setSelectedChatId(null)
            // Mark notification as read
            if (!item.data.isRead) {
                markNotificationAsRead.mutate(item.data.id, {
                    onSuccess: () => {
                        refetchNotifications()
                        toast.success('Notification marked as read')
                    }
                })
            }
        }

        // On mobile, hide sidebar when item is selected
        if (isMobileView) {
            setShowMobileSidebar(false)
        }
    }

    // Handle notification actions
    const handleNotificationAction = (notification: Notification, action: string) => {
        // TODO: Implement notification actions based on type
        console.log('Notification action:', action, notification)
        toast.success(`Action ${action} performed`)
    }

    // Handle sending messages
    const handleSendMessage = async (content: string, _type?: string, attachments?: any[]) => {
        if (!selectedChatId) return

        try {
            await sendMessageMutation.mutateAsync({
                chatId: selectedChatId,
                data: {
                    content,
                    attachments: attachments || [],
                    chatId: selectedChatId
                }
            })
            // Refetch messages and chats
            refetchChats()
        } catch (_error) {
            toast.error('Failed to send message')
        }
    }

    // Show loading if auth is loading
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    // Redirect if not authenticated
    if (!user) {
        return null
    }

    const isLoading = chatsLoading || notificationsLoading

    return (
        <div className="min-h-screen bg-white">
            <NavHeader title="Amenade" showMenuItems={true} />

            <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto">
                {/* Left Sidebar - Messages & Notifications List */}
                <div
                    ref={sidebarRef}
                    className={cn(
                        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
                        isMobileView
                            ? showMobileSidebar
                                ? "w-full absolute inset-y-0 left-0 z-10"
                                : "w-0 overflow-hidden"
                            : isSidebarCollapsed
                                ? "w-16"
                                : "w-80"
                    )}
                >
                    {/* Header */}
                    <div className="py-8 border-b border-gray-200 pr-4">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className={cn(
                                "text-xl font-semibold text-gray-900",
                                isSidebarCollapsed && !isMobileView && "hidden"
                            )}>
                                Messages
                            </h1>

                            {/* Mobile close button */}
                            {isMobileView && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowMobileSidebar(false)}
                                    className="p-2"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            )}

                            {/* Desktop toggle button */}
                            {!isMobileView && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                    className="p-0"
                                >
                                    {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                                </Button>
                            )}
                        </div>

                        {/* Search Bar */}
                        {(!isSidebarCollapsed || isMobileView) && (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    {(!isSidebarCollapsed || isMobileView) && (
                        <div className="py-2 border-b border-gray-200 pr-4">
                            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                                {[
                                    { key: 'all', label: 'All', count: allItems.length },
                                    { key: 'messages', label: 'Chats', count: chats.length },
                                    { key: 'notifications', label: 'Notifications', count: notifications.filter(n => !n.isRead).length }
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key as any)}
                                        className={cn(
                                            "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors",
                                            activeTab === tab.key
                                                ? "bg-white text-teal-600 shadow-sm"
                                                : "text-gray-600 hover:text-gray-900"
                                        )}
                                    >
                                        {tab.label}
                                        {tab.count > 0 && (
                                            <span className={cn(
                                                "ml-2 px-2 py-0.5 text-xs rounded-full",
                                                activeTab === tab.key
                                                    ? "bg-teal-100 text-teal-600"
                                                    : "bg-gray-200 text-gray-600"
                                            )}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <LoadingSpinner />
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                {(!isSidebarCollapsed || isMobileView) ? (
                                    <div>
                                        <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p>No conversations found</p>
                                    </div>
                                ) : (
                                    <MessageCircle className="w-6 h-6 mx-auto text-gray-300" />
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredItems.map((item) => (
                                    <ConversationItem
                                        key={item.type === 'chat' ? item.data.id : item.data.id}
                                        item={item}
                                        isSelected={selectedItem?.type === item.type &&
                                            (item.type === 'chat' ? selectedItem.data.id === item.data.id : selectedItem.data.id === item.data.id)}
                                        onClick={() => handleItemClick(item)}
                                        collapsed={isSidebarCollapsed && !isMobileView}
                                        currentUserId={user?.id}
                                        onNotificationAction={handleNotificationAction}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Messaging Interface */}
                <div className="flex-1 flex flex-col">
                    {selectedItem ? (
                        selectedItem.type === 'chat' ? (
                            <MessagingInterface
                                isOpen={true}
                                onClose={() => setSelectedItem(null)}
                                chat={convertApiChatToMessagingInterface(selectedItem.data)}
                                currentUserId={user?.id || ''}
                                onSendMessage={handleSendMessage}
                                isLoading={messagesLoading}
                            />
                        ) : (
                            <NotificationDetail
                                notification={selectedItem.data}
                                onAction={handleNotificationAction}
                            />
                        )
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            {isMobileView && !showMobileSidebar && (
                                <Button
                                    onClick={() => setShowMobileSidebar(true)}
                                    className="fixed top-4 left-4 z-20 md:hidden"
                                    size="sm"
                                >
                                    <Menu className="w-4 h-4" />
                                </Button>
                            )}
                            <div className="text-center">
                                <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Select a conversation
                                </h3>
                                <p className="text-gray-500">
                                    Choose a chat or notification to get started
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    )
}

// Individual conversation item component
interface ConversationItemProps {
    item: ConversationItem
    isSelected: boolean
    onClick: () => void
    collapsed: boolean
    currentUserId?: string
    onNotificationAction: (notification: Notification, action: string) => void
}

function ConversationItem({
    item,
    isSelected,
    onClick,
    collapsed,
    currentUserId,
    onNotificationAction: _onNotificationAction
}: ConversationItemProps) {
    if (item.type === 'chat') {
        const chat = item.data
        const otherParticipant = chat.participants.find(p => p.user.id !== currentUserId)?.user
        const lastMessage = chat.messages[0]
        const hasUnreadMessages = lastMessage && lastMessage.senderId !== currentUserId

        return (
            <div
                onClick={onClick}
                className={cn(
                    "p-3 cursor-pointer transition-colors border-l-4",
                    isSelected
                        ? "bg-teal-50 border-teal-500"
                        : "bg-white border-transparent hover:bg-gray-50"
                )}
            >
                <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        {otherParticipant?.avatar ? (
                            <img
                                src={otherParticipant.avatar}
                                alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                    {otherParticipant ? `${otherParticipant.firstName[0]}${otherParticipant.lastName[0]}` : '?'}
                                </span>
                            </div>
                        )}
                        {hasUnreadMessages && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full"></div>
                        )}
                    </div>

                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Unknown User'}
                                </h4>
                                <span className="text-xs text-gray-500">
                                    {formatTimestamp(chat.lastMessageAt || chat.createdAt)}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                                {chat.package?.title || chat.trip?.title || 'Conversation'}
                            </p>
                            {lastMessage && (
                                <p className="text-sm text-gray-600 truncate">
                                    {lastMessage.senderId === currentUserId ? 'You: ' : ''}
                                    {lastMessage.content}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    } else {
        const notification = item.data
        const Icon = getNotificationIcon(notification.type)

        return (
            <div
                onClick={onClick}
                className={cn(
                    "p-3 cursor-pointer transition-colors border-l-4",
                    isSelected
                        ? "bg-blue-50 border-blue-500"
                        : notification.isRead
                            ? "bg-white border-transparent hover:bg-gray-50"
                            : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                )}
            >
                <div className="flex items-center space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            notification.isRead ? "bg-gray-100" : "bg-blue-100"
                        )}>
                            <Icon className={cn(
                                "w-5 h-5",
                                notification.isRead ? "text-gray-600" : "text-blue-600"
                            )} />
                        </div>
                    </div>

                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className={cn(
                                    "text-sm truncate",
                                    notification.isRead ? "text-gray-900" : "font-medium text-gray-900"
                                )}>
                                    {notification.title}
                                </h4>
                                <span className="text-xs text-gray-500">
                                    {formatTimestamp(notification.createdAt)}
                                </span>
                            </div>
                            <p className={cn(
                                "text-sm truncate",
                                notification.isRead ? "text-gray-600" : "text-gray-700"
                            )}>
                                {notification.message}
                            </p>
                            {!notification.isRead && (
                                <div className="mt-1">
                                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

// Notification detail component
interface NotificationDetailProps {
    notification: Notification
    onAction: (notification: Notification, action: string) => void
}

function NotificationDetail({ notification, onAction }: NotificationDetailProps) {
    const Icon = getNotificationIcon(notification.type)

    return (
        <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{notification.title}</h2>
                        <p className="text-gray-600">{formatTimestamp(notification.createdAt)}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6">
                <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{notification.message}</p>
                </div>

                {/* Action buttons based on notification type */}
                <div className="mt-6 flex space-x-3">
                    {notification.type === 'TRIP_REQUEST' && (
                        <>
                            <Button onClick={() => onAction(notification, 'accept')} className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accept
                            </Button>
                            <Button variant="outline" onClick={() => onAction(notification, 'decline')}>
                                <X className="w-4 h-4 mr-2" />
                                Decline
                            </Button>
                        </>
                    )}
                    {notification.type === 'PACKAGE_MATCH' && (
                        <Button onClick={() => onAction(notification, 'view')}>
                            <Package className="w-4 h-4 mr-2" />
                            View Package
                        </Button>
                    )}
                    {notification.type === 'DELIVERY_CONFIRMATION' && (
                        <Button onClick={() => onAction(notification, 'confirm')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Delivery
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}