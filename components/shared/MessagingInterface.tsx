'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import { 
  Send, 
  Phone, 
  Video, 
  Paperclip, 
  Image as ImageIcon,
  MapPin,
  Package,
  Truck,
  X
} from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'

interface Message {
  id: string
  content: string
  senderId: string
  messageType: 'text' | 'image' | 'file' | 'location' | 'system'
  attachments: string[]
  createdAt: string
  isEdited: boolean
}

interface ChatParticipant {
  id: string
  userId: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    profile?: {
      profilePicture?: string
    }
  }
}

interface Chat {
  id: string
  type: 'PACKAGE_NEGOTIATION' | 'TRIP_COORDINATION' | 'SUPPORT'
  packageId?: string
  tripId?: string
  participants: ChatParticipant[]
  messages: Message[]
  lastMessageAt?: string
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
}

interface MessagingInterfaceProps {
  isOpen: boolean
  onClose: () => void
  chat: Chat | null
  currentUserId: string
  onSendMessage: (content: string, type?: string) => void
  isLoading?: boolean
}

export function MessagingInterface({
  isOpen,
  onClose,
  chat,
  currentUserId,
  onSendMessage,
  isLoading = false
}: MessagingInterfaceProps) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
console.log('Chat data:', chat)
  useEffect(() => {
    scrollToBottom()
  }, [chat])

  const handleSendMessage = () => {
    if (newMessage.trim() && !isLoading) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageTime = (createdAt: string) => {
    const date = new Date(createdAt)
    if (isToday(date)) {
      return format(date, 'hh:mm a')
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'hh:mm a')}`
    } else {
      return format(date, 'MM dd, hh:mm a')
    }
  }

  const getOtherParticipant = () => {
    return chat?.participants.find(p => p.userId !== currentUserId)
  }

  const otherParticipant = getOtherParticipant()

  if (!chat) {
    return null
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={`Chat with ${otherParticipant?.user.firstName} ${otherParticipant?.user.lastName}`}
      size="xl"
    >
      <div className="flex flex-col h-[70vh]">
        {/* Header Info */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-medium">
                  {otherParticipant?.user.firstName[0]}{otherParticipant?.user.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className="font-medium">
                  {otherParticipant?.user.firstName} {otherParticipant?.user.lastName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {chat.package && (
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      <span>{chat.package.title}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {chat.package.status}
                      </span>
                    </div>
                  )}
                  {chat.trip && (
                    <div className="flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      <span>{chat.trip.title}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {chat.trip.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {chat.messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="bg-gray-50 rounded-lg p-6 mx-auto max-w-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-full mx-auto mb-4">
                  <Package className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Start the conversation</h3>
                <p className="text-sm text-gray-600">
                  Coordinate pickup, delivery details, and stay updated on your package journey.
                </p>
              </div>
            </div>
          ) : (
            chat.messages.map((message) => {
              const isOwnMessage = message.senderId === currentUserId
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[75%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isOwnMessage && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs font-medium text-gray-600">
                          {otherParticipant?.user.firstName[0]}{otherParticipant?.user.lastName[0]}
                        </span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          isOwnMessage
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 border text-gray-900'
                        }`}
                      >
                        {message.messageType === 'system' ? (
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              System
                            </span>
                            {message.content}
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                        
                        {message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs">
                                <Paperclip className="h-3 w-3" />
                                <span className="truncate">{attachment}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`text-xs text-gray-500 px-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                        {formatMessageTime(message.createdAt)}
                        {message.isEdited && <span className="ml-1">(edited)</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white border-gray-200">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="sm" className="mb-2">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="mb-2">
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="mb-2">
              <MapPin className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={isLoading}
              />
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="mb-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
