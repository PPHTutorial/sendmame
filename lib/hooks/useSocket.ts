// Amenade Platform - Socket.IO Client Hook
'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/lib/hooks/api'

interface Message {
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

interface TypingUser {
  userId: string
  userName: string
  chatId: string
}

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  messages: Message[]
  typingUsers: TypingUser[]
  sendMessage: (chatId: string, content: string) => void
  joinChat: (chatId: string) => void
  leaveChat: (chatId: string) => void
  startTyping: (chatId: string) => void
  stopTyping: (chatId: string) => void
}

export function useSocket(): UseSocketReturn {
  const { getCurrentUser } = useAuth()
  const { data: user } = getCurrentUser
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])

  useEffect(() => {
    if (!user) return

    // Get auth token from cookies
    const getAuthToken = () => {
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'access_token') {
          return value
        }
      }
      return null
    }

    const token = getAuthToken()
    if (!token) return

    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      forceNew: true,
    })

    socketRef.current = socket

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setIsConnected(false)
    })

    // Message event handlers
    socket.on('message:received', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socket.on('chat:joined', (data: { chatId: string; messages: Message[] }) => {
      setMessages(data.messages)
    })

    // Typing event handlers
    socket.on('typing:start', (data: TypingUser) => {
      setTypingUsers(prev => {
        const exists = prev.find(user => user.userId === data.userId && user.chatId === data.chatId)
        return exists ? prev : [...prev, data]
      })
    })

    socket.on('typing:stop', (data: { userId: string; chatId: string }) => {
      setTypingUsers(prev => 
        prev.filter(user => !(user.userId === data.userId && user.chatId === data.chatId))
      )
    })

    // User status event handlers
    socket.on('user:online', (data: { userId: string; userName: string }) => {
      console.log(`${data.userName} is now online`)
    })

    socket.on('user:offline', (data: { userId: string }) => {
      console.log(`User ${data.userId} is now offline`)
    })

    // Error handler
    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
      setMessages([])
      setTypingUsers([])
    }
  }, [user])

  const sendMessage = (chatId: string, content: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message:send', { chatId, content })
    }
  }

  const joinChat = (chatId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('chat:join', { chatId })
    }
  }

  const leaveChat = (chatId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('chat:leave', { chatId })
    }
  }

  const startTyping = (chatId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing:start', { chatId })
    }
  }

  const stopTyping = (chatId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing:stop', { chatId })
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    messages,
    typingUsers,
    sendMessage,
    joinChat,
    leaveChat,
    startTyping,
    stopTyping,
  }
}

// Chat message component hook
export function useChatMessages(chatId: string) {
  const { messages, sendMessage, joinChat, leaveChat, startTyping, stopTyping, typingUsers } = useSocket()
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Filter messages for this chat
  const chatMessages = messages.filter(message => message.chatId === chatId)
  const chatTypingUsers = typingUsers.filter(user => user.chatId === chatId)

  useEffect(() => {
    if (chatId) {
      joinChat(chatId)
      return () => leaveChat(chatId)
    }
  }, [chatId, joinChat, leaveChat])

  const handleSendMessage = () => {
    if (newMessage.trim() && chatId) {
      sendMessage(chatId, newMessage.trim())
      setNewMessage('')
      handleStopTyping()
    }
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)
    
    if (value && !isTyping) {
      setIsTyping(true)
      startTyping(chatId)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
    }, 1000)
  }

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false)
      stopTyping(chatId)
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  return {
    messages: chatMessages,
    newMessage,
    typingUsers: chatTypingUsers,
    handleSendMessage,
    handleTyping,
    setNewMessage,
  }
}
