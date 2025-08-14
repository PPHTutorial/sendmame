// Fakomame Platform - Chat Components
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button, Input, Card } from '@/components/ui'
import { useChatMessages } from '@/lib/hooks/useSocket'

interface ChatMessage {
  id: string
  content: string
  senderId: string
  sender: {
    id: string
    firstName: string
    lastName: string
  }
  createdAt: string
  chatId: string
}

interface ChatWindowProps {
  chatId: string
  title?: string
  className?: string
}

export function ChatWindow({ chatId, title = 'Chat', className = '' }: ChatWindowProps) {
  const { messages, newMessage, typingUsers, handleSendMessage, handleTyping, setNewMessage } = useChatMessages(chatId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  return (
    <Card className={`flex flex-col h-96 ${className}`}>
      {/* Chat Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        
        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>
              {typingUsers.map(user => user.userName).join(', ')} 
              {typingUsers.length === 1 ? ' is' : ' are'} typing...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            variant="primary"
          >
            Send
          </Button>
        </div>
      </div>
    </Card>
  )
}

interface MessageBubbleProps {
  message: ChatMessage
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isOwnMessage = false // TODO: Compare with current user ID
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwnMessage 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-900'
      }`}>
        {!isOwnMessage && (
          <div className="text-xs font-medium mb-1">
            {message.sender.firstName} {message.sender.lastName}
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap">
          {message.content}
        </div>
        <div className={`text-xs mt-1 ${
          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  )
}

// Helper function (moved outside component)
function formatTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

// Chat List Component
interface Chat {
  id: string
  lastMessage?: {
    content: string
    createdAt: string
    sender: {
      firstName: string
      lastName: string
    }
  }
  participants: Array<{
    user: {
      id: string
      firstName: string
      lastName: string
    }
  }>
  package?: {
    id: string
    title: string
  }
  trip?: {
    id: string
    fromAddress: string
    toAddress: string
  }
}

interface ChatListProps {
  chats: Chat[]
  onChatSelect: (chatId: string) => void
  selectedChatId?: string
}

export function ChatList({ chats, onChatSelect, selectedChatId }: ChatListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInDays === 1) {
      return 'Yesterday'
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="space-y-2">
      {chats.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No conversations yet
        </div>
      ) : (
        chats.map((chat) => {
          const otherParticipant = chat.participants.find(p => p.user.id !== 'current-user-id')?.user
          const chatTitle = chat.package?.title || 
                           (chat.trip ? `${chat.trip.fromAddress} → ${chat.trip.toAddress}` : 
                           (otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Chat'))
          
          return (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedChatId === chat.id 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {chatTitle}
                  </h4>
                  {chat.lastMessage && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {chat.lastMessage.sender.firstName}: {chat.lastMessage.content}
                    </p>
                  )}
                </div>
                {chat.lastMessage && (
                  <span className="text-xs text-gray-400 ml-2">
                    {formatDate(chat.lastMessage.createdAt)}
                  </span>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// Main Chat Interface Component
interface ChatInterfaceProps {
  className?: string
}

export function ChatInterface({ className = '' }: ChatInterfaceProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [chats] = useState<Chat[]>([]) // TODO: Fetch from API
  
  return (
    <div className={`flex h-full ${className}`}>
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Messages</h2>
        <ChatList 
          chats={chats}
          onChatSelect={setSelectedChatId}
          selectedChatId={selectedChatId || undefined}
        />
      </div>
      
      {/* Chat Window */}
      <div className="flex-1 p-4">
        {selectedChatId ? (
          <ChatWindow 
            chatId={selectedChatId}
            title="Chat"
            className="h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatInterface
