// Fakomame Platform - Socket.IO Server Configuration
import { Server as HTTPServer } from 'http'
import { Server as IOServer, Socket } from 'socket.io'
import { verifyToken } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Extended Socket interface with authentication
interface AuthenticatedSocket extends Socket {
  userId: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
    isActive: boolean
  }
}

// Socket authentication middleware
async function authenticateSocket(socket: Socket, next: any) {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return next(new Error('Authentication token required'))
    }

    const payload = await verifyToken(token)
    
    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
      }
    })

    if (!user || !user.isActive) {
      return next(new Error('User not found or inactive'))
    }

    // Attach user to socket
    ;(socket as AuthenticatedSocket).userId = user.id
    ;(socket as AuthenticatedSocket).user = user
    
    next()
  } catch (_error) {
    next(new Error('Invalid authentication token'))
  }
}

// Chat room management
function joinChatRoom(socket: AuthenticatedSocket, chatId: string) {
  socket.join(`chat:${chatId}`)
  console.log(`User ${socket.userId} joined chat room: ${chatId}`)
}

function leaveChatRoom(socket: AuthenticatedSocket, chatId: string) {
  socket.leave(`chat:${chatId}`)
  console.log(`User ${socket.userId} left chat room: ${chatId}`)
}

// Message handlers
async function handleSendMessage(io: IOServer, socket: AuthenticatedSocket, data: {
  chatId: string
  content: string
  type?: string
}) {
  try {
    const { chatId, content, type = 'text' } = data

    // Verify user is participant in this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: { userId: socket.userId }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      }
    })

    if (!chat) {
      socket.emit('error', { message: 'Chat not found or access denied' })
      return
    }

    // Create message in database
    const message = await prisma.message.create({
      data: {
        content,
        messageType: type,
        senderId: socket.userId,
        chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    // Emit message to all participants in the chat room
    io.to(`chat:${chatId}`).emit('message:received', {
      id: message.id,
      content: message.content,
      messageType: message.messageType,
      sender: message.sender,
      createdAt: message.createdAt,
      chatId,
    })

    // Update chat last activity
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    })

  } catch (error) {
    console.error('Error sending message:', error)
    socket.emit('error', { message: 'Failed to send message' })
  }
}

async function handleJoinChat(socket: AuthenticatedSocket, data: { chatId: string }) {
  try {
    const { chatId } = data

    // Verify user is participant in this chat
    const chatParticipant = await prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId: socket.userId
      }
    })

    if (!chatParticipant) {
      socket.emit('error', { message: 'Access denied to this chat' })
      return
    }

    joinChatRoom(socket, chatId)
    
    // Load recent messages
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    socket.emit('chat:joined', {
      chatId,
      messages: messages.reverse() // Send in chronological order
    })

  } catch (error) {
    console.error('Error joining chat:', error)
    socket.emit('error', { message: 'Failed to join chat' })
  }
}

// Typing indicators
function handleTypingStart(io: IOServer, socket: AuthenticatedSocket, data: { chatId: string }) {
  socket.to(`chat:${data.chatId}`).emit('typing:start', {
    userId: socket.userId,
    userName: `${socket.user.firstName} ${socket.user.lastName}`,
    chatId: data.chatId
  })
}

function handleTypingStop(io: IOServer, socket: AuthenticatedSocket, data: { chatId: string }) {
  socket.to(`chat:${data.chatId}`).emit('typing:stop', {
    userId: socket.userId,
    chatId: data.chatId
  })
}

// Connection status
async function handleUserOnline(io: IOServer, socket: AuthenticatedSocket) {
  // Update user's last active time
  await prisma.user.update({
    where: { id: socket.userId },
    data: { lastLoginAt: new Date() }
  })

  // Notify relevant users that this user is online
  socket.broadcast.emit('user:online', {
    userId: socket.userId,
    userName: `${socket.user.firstName} ${socket.user.lastName}`
  })
}

async function handleUserOffline(io: IOServer, socket: AuthenticatedSocket) {
  // Update user's last active time
  await prisma.user.update({
    where: { id: socket.userId },
    data: { lastLoginAt: new Date() }
  })

  // Notify relevant users that this user is offline
  socket.broadcast.emit('user:offline', {
    userId: socket.userId
  })
}

// Main Socket.IO setup function
export function setupSocketIO(httpServer: HTTPServer): IOServer {
  const io = new IOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  // Apply authentication middleware
  io.use(authenticateSocket)

  io.on('connection', (socket: Socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket
    console.log(`User connected: ${authenticatedSocket.userId} (${authenticatedSocket.user.firstName} ${authenticatedSocket.user.lastName})`)

    // Handle user coming online
    handleUserOnline(io, authenticatedSocket)

    // Chat event handlers
    socket.on('chat:join', (data) => handleJoinChat(authenticatedSocket, data))
    socket.on('chat:leave', (data) => leaveChatRoom(authenticatedSocket, data.chatId))
    
    // Message event handlers
    socket.on('message:send', (data) => handleSendMessage(io, authenticatedSocket, data))
    
    // Typing indicators
    socket.on('typing:start', (data) => handleTypingStart(io, authenticatedSocket, data))
    socket.on('typing:stop', (data) => handleTypingStop(io, authenticatedSocket, data))

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${authenticatedSocket.userId}`)
      handleUserOffline(io, authenticatedSocket)
    })

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for user ${authenticatedSocket.userId}:`, error)
    })
  })

  return io
}

export default setupSocketIO
