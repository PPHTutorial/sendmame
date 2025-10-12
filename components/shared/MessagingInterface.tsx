'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
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
  X,
  Edit2,
  Trash2,
  Check,
  MoreVertical as _MoreVertical
} from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'

interface AttachmentData {
  name: string;
  data: string; // base64 data
  type: string;
}

interface Message {
  id: string
  content: string
  senderId: string
  messageType: 'text' | 'image' | 'file' | 'location' | 'system'
  attachments: AttachmentData[]
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
  type: 'NOTIFICATION' | 'CHAT' | 'SUPPORT'
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
  onSendMessage: (content: string, type?: string, attachments?: AttachmentData[]) => void
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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [_showMessageActions, setShowMessageActions] = useState<string | null>(null)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [_isUploading, setIsUploading] = useState(false)
  const [attachmentType, setAttachmentType] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<AttachmentData[]>([])
  // No need for separate attachment previews as we show them directly
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number, address: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const _inputRef = useRef<HTMLInputElement>(null)
  const _messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!editingMessageId) {
      scrollToBottom()
    }
  }, [chat, editingMessageId])

  // Focus the input when editing starts
  useEffect(() => {
    if (editingMessageId) {
      const inputElement = document.getElementById('messageInput') as HTMLInputElement
      if (inputElement) {
        inputElement.focus()
      }
    }
  }, [editingMessageId])

  const handleSendMessage = () => {
    if (editingMessageId) {
      handleSaveEdit()
    } else if ((!newMessage.trim() && attachments.length === 0) || isLoading) {
      // Do nothing if there's no message and no attachments, or if we're loading
      return;
    } else {
      // If there are attachments, send them with the message
      if (attachments.length > 0) {
        // Use the message as an optional caption
        const caption = newMessage.trim();
        const messageType = attachmentType === 'image' ? 'image' : 'file';

        // Send with user's caption or a default message
        const messageContent = caption || `Sent ${attachments.length > 1 ? 'files' : 'a file'}`;

        // We've properly formatted attachments as AttachmentData objects
        console.log(attachments);
        onSendMessage(messageContent, messageType, attachments);

        // Reset state
        setAttachments([]);
        setAttachmentType(null);
      } else {
        // Just a regular text message
        onSendMessage(newMessage.trim(), 'text', []);
      }
      setNewMessage('');
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else if (e.key === 'Escape' && editingMessageId) {
      cancelEdit()
    }
  }

  const startEditing = (message: Message) => {
    if (message.senderId === currentUserId) {
      setEditingMessageId(message.id)
      setEditedContent(message.content)
      setNewMessage(message.content)
      setShowMessageActions(null)
    }
  }

  const handleSaveEdit = () => {
    if (editingMessageId && newMessage.trim() && !isLoading) {
      // In a real app, you would call an API to update the message
      console.log('Saving edit for message:', editingMessageId, 'New content:', newMessage.trim())

      // For this example, we'll just modify the UI state and let the developer implement the actual API call
      // onEditMessage(editingMessageId, newMessage.trim())

      // Reset editing state
      setEditingMessageId(null)
      setEditedContent('')
      setNewMessage('')
    }
  }

  const cancelEdit = () => {
    setEditingMessageId(null)
    setEditedContent('')
    setNewMessage('')
  }

  const handleDeleteMessage = (messageId: string) => {
    // In a real app, you would call an API to delete the message
    console.log('Deleting message:', messageId)

    // For this example, we'll just log the action and let the developer implement the actual API call
    // onDeleteMessage(messageId)

    setShowMessageActions(null)
  }

  const _toggleMessageActions = (messageId: string | null) => {
    setShowMessageActions(prev => prev === messageId ? null : messageId)
  }

  // Media button handlers
  const handleCallButton = () => {
    // In a real app, this would show contact info or initiate a call
    setShowContactInfo(prevState => !prevState)
    // Mock implementation - in a real app, you would integrate with a calling service
    alert(`Call ${otherParticipant?.user.firstName} ${otherParticipant?.user.lastName} at [Contact Number]`)
  }

  const handleVideoButton = () => {
    // In a real app, this would initiate a video call
    // Mock implementation - in a real app, you would integrate with a video calling service
    alert(`Starting video call with ${otherParticipant?.user.firstName} ${otherParticipant?.user.lastName}`)
  }

  const handleFileButton = () => {
    setAttachmentType('file')
    fileInputRef.current?.click()
  }

  const handleGalleryButton = () => {
    setAttachmentType('image')
    imageInputRef.current?.click()
  }

  const handleLocationButton = () => {
    setShowLocationPicker(true)
    // Mock implementation - in a real app, you would integrate with a map service
    // For now, we'll simulate selecting a location
    setTimeout(() => {
      const mockLocation = {
        lat: 37.7749,
        lng: -122.4194,
        address: "San Francisco, CA"
      }
      setSelectedLocation(mockLocation)
      handleSendLocation(mockLocation)
    }, 1000)
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);

      try {
        // Convert files to base64
        const files = Array.from(e.target.files);
        const processedAttachments: AttachmentData[] = [];

        for (const file of files) {
          const base64Data = await convertFileToBase64(file);
          processedAttachments.push({
            name: file.name,
            data: base64Data,
            type: file.type
          });
        }

        // Store the attachments in state
        setAttachments(processedAttachments);

        // Don't send the message yet, let the user add a caption if they want
        // The message will be sent when the user clicks the send button

        // Reset file input
        if (e.target.value) {
          e.target.value = '';
        }
      } catch (error) {
        console.error('Error processing files:', error);
        alert('Error processing files. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  }

  const handleSendLocation = (location: { lat: number, lng: number, address: string }) => {
    // In a real app, you would format the location data appropriately
    const locationContent = `Location: ${location.address} (${location.lat}, ${location.lng})`

    // In a real app, you would generate a static map image as base64 or a URL
    // For now, we'll just create a mock base64 map image
    const mockMapImageBase64 = "data:image/png;base64,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";

    // Create a location attachment with the mock map image
    const locationAttachment: AttachmentData = {
      name: location.address,
      data: mockMapImageBase64,
      type: 'image/png'
    };

    onSendMessage(locationContent, 'location', [locationAttachment]);

    // Reset state
    setShowLocationPicker(false);
    setSelectedLocation(null);
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
    <>
      {/* Contact Info Modal */}
      {showContactInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <button
                onClick={() => setShowContactInfo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-medium">
                    {otherParticipant?.user.firstName[0]}{otherParticipant?.user.lastName[0]}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">
                    {otherParticipant?.user.firstName} {otherParticipant?.user.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">User ID: {otherParticipant?.userId}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-600" />
                  <span>+1 (555) 123-4567</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This is a mock phone number. In a real app, this would show the user&apos;s actual contact details.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  alert('Initiating call...');
                  setShowContactInfo(false);
                }}
              >
                <Phone className="h-4 w-4 mr-2" /> Call
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowContactInfo(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Share Location</h3>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <div className="bg-gray-100 rounded-lg h-48 mb-3 flex items-center justify-center">
                <p className="text-gray-500">Map would be displayed here in a real app</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected Location:</p>
                <p className="text-sm text-gray-600">
                  {selectedLocation ? selectedLocation.address : 'Detecting your location...'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  if (selectedLocation) {
                    handleSendLocation(selectedLocation);
                  } else {
                    // Mock location
                    const mockLocation = {
                      lat: 37.7749,
                      lng: -122.4194,
                      address: "San Francisco, CA"
                    };
                    handleSendLocation(mockLocation);
                  }
                }}
              >
                <MapPin className="h-4 w-4 mr-2" /> Share
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLocationPicker(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Chat with ${otherParticipant?.user.firstName} ${otherParticipant?.user.lastName}`}
        size="xl"
      >
        <div className="flex flex-col h-[75vh]">
          {/* Header Info */}
          <div className="p-2 border-b bg-gray-50">
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
                        {/* <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {chat.package.status}
                      </span> */}
                      </div>
                    )}
                    {chat.trip && (
                      <div className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        <span>{chat.trip.title}</span>
                        {/* <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {chat.trip.status}
                      </span> */}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/*  <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button> */}
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 bg-white">
            {chat.messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="bg-gray-50 rounded-lg p-6 mx-auto max-w-sm">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
                    <Package className="h-6 w-6 text-blue-600" />
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
                const isEditing = message.id === editingMessageId
                return (
                  <div
                    key={message.id}
                    className={`flex group ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[75%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isOwnMessage && (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-medium text-gray-600">
                            {otherParticipant?.user.firstName[0]}{otherParticipant?.user.lastName[0]}
                          </span>
                        </div>
                      )}
                      <div className="space-y-1 relative">
                        {/* Message actions for own messages */}
                        {isOwnMessage && !isEditing && (
                          <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white shadow rounded-lg">
                            <div className="flex items-center">
                              <button
                                onClick={() => startEditing(message)}
                                className="p-1.5 hover:bg-gray-100 rounded-l-lg"
                              >
                                <Edit2 className="w-4 h-4 text-gray-500" />
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="p-1.5 hover:bg-gray-100 rounded-r-lg"
                              >
                                <Trash2 className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Message bubble with proper styling for chat bubbles */}
                        <div
                          className={`px-4 py-3 ${message.messageType === 'system'
                            ? 'bg-teal-50 border border-teal-100 rounded-lg text-teal-800'
                            : isOwnMessage
                              ? 'bg-teal-600 text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm'
                              : 'bg-gray-100 border text-gray-900 rounded-t-2xl rounded-br-2xl rounded-bl-sm'
                            }`}
                        >
                          {message.messageType === 'system' ? (
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                                System
                              </span>
                              {message.content}
                            </div>
                          ) : message.messageType === 'location' ? (
                            <div className="space-y-2">
                              {message.attachments.length > 0 && message.attachments[0].data ? (
                                <div className="relative h-32 w-full rounded overflow-hidden mb-2">
                                  <Image
                                    src={message.attachments[0].data}
                                    alt={message.attachments[0].name || "Location map"}
                                    fill
                                    style={{ objectFit: "cover" }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white bg-opacity-80 p-1 rounded-full">
                                      <MapPin className="h-6 w-6 text-red-500" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gray-200 rounded h-24 flex items-center justify-center mb-2">
                                  <MapPin className={`h-6 w-6 ${isOwnMessage ? 'text-white' : 'text-gray-700'}`} />
                                </div>
                              )}
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          ) : message.messageType === 'image' && message.attachments.length > 0 ? (
                            <div className="space-y-2">
                              <div className="space-y-2">
                                {message.attachments.map((attachment, index) => {
                                  return (
                                    <div key={index} className="rounded overflow-hidden">
                                      {attachment.data ? (
                                        <div className="relative h-48 w-full">
                                          <Image
                                            src={attachment.data}
                                            alt={attachment.name || "Image attachment"}
                                            fill
                                            style={{ objectFit: "contain" }}
                                          />
                                        </div>
                                      ) : (
                                        <div className="h-24 bg-gray-200 w-full flex items-center justify-center">
                                          <ImageIcon className={`h-8 w-8 ${isOwnMessage ? 'text-white' : 'text-gray-700'}`} />
                                          <span className="ml-2 text-sm">{attachment.name || 'Image'}</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              {message.content && (
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              )}
                            </div>
                          ) : message.messageType === 'file' && message.attachments.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <div className="mt-2 space-y-1 bg-opacity-20 bg-gray-600 rounded p-2">
                                {message.attachments.map((attachment, index) => (
                                  <div key={index} className="flex items-center gap-2 text-xs">
                                    <Paperclip className={`h-3 w-3 ${isOwnMessage ? 'text-white' : 'text-gray-700'}`} />
                                    <span className="truncate">{attachment.name || 'File'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}

                          {message.messageType !== 'image' && message.messageType !== 'file' && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs">
                                  <Paperclip className={`h-3 w-3 ${isOwnMessage ? 'text-white' : 'text-gray-700'}`} />
                                  <span className="truncate">{attachment.name || 'Attachment'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Message timestamp and edited indicator */}
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
          <div className="py-4 border-t bg-white border-gray-200">
            {/* Hidden file inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              multiple
              style={{ display: 'none' }}
            />
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />

            {/* Media buttons moved to top */}
            <div className="flex gap-2 mb-3 justify-start">
              <div className="flex-1 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCallButton}
                  className="rounded-full"
                  title="Call contact"
                >
                  <Phone className="h-4 w-4" />
                  {/* <span className="text-xs">Call</span> */}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleVideoButton}
                  className="rounded-full"
                  title="Start video call"
                >
                  <Video className="h-4 w-4" />
                  {/* <span className="text-xs">Video</span> */}
                </Button>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleFileButton}
                  className="rounded-full"
                  title="Send file or document"
                >
                  <Paperclip className="h-4 w-4" />
                  {/* <span className="text-xs">File</span> */}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGalleryButton}
                  className="rounded-full"
                  title="Send image from gallery"
                >
                  <ImageIcon className="h-4 w-4" />
                  {/* <span className="text-xs">Gallery</span> */}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLocationButton}
                  className="rounded-full"
                  title="Share location"
                >
                  <MapPin className="h-4 w-4" />
                  {/* <span className="text-xs">Location</span> */}
                </Button>
              </div>
            </div>

            {/* Input with send button positioned on it */}
            <div className="relative">
              {editingMessageId ? (
                <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-t-md border-t border-x border-blue-200">
                  <div className="flex items-center">
                    <Edit2 className="h-3 w-3 text-blue-500 mr-2" />
                    <span className="text-xs text-blue-700">Editing message</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEdit}
                    className="h-6 px-2 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              ) : attachments.length > 0 ? (
                <div className="flex flex-col bg-teal-50 px-3 py-2 rounded-t-md border-t border-x border-teal-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {attachmentType === 'image' ? (
                        <ImageIcon className="h-3 w-3 text-teal-500 mr-2 flex-shrink-0" />
                      ) : (
                        <Paperclip className="h-3 w-3 text-teal-500 mr-2 flex-shrink-0" />
                      )}
                      <span className="text-xs text-teal-700">
                        {attachments.length > 1
                          ? `${attachments.length} files selected`
                          : attachments[0]?.name}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAttachments([]);
                        setAttachmentType(null);
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  </div>

                  {/* Preview of the first image if it's an image attachment */}
                  {attachmentType === 'image' && attachments.length > 0 && attachments[0]?.data && (
                    <div className="mt-2 flex justify-center">
                      {/* Using next/image is recommended, but using img for simplicity */}
                      <div className="relative h-16 w-40">
                        <Image
                          src={attachments[0].data}
                          alt={attachments[0].name}
                          fill
                          style={{ objectFit: "contain" }}
                          className="rounded"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-1 text-xs text-teal-600">
                    Add a caption (optional) and press send
                  </div>
                </div>
              ) : null}
              <Input
                id="messageInput"
                value={editingMessageId ? editedContent : newMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  editingMessageId ? setEditedContent(e.target.value) : setNewMessage(e.target.value)
                }
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="pr-12"
                disabled={isLoading}
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={(editingMessageId ? !editedContent.trim() : !newMessage.trim()) || isLoading}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-8 w-8 p-0 flex items-center justify-center"
              >
                {editingMessageId ?
                  <Check className="h-4 w-4" /> :
                  <Send className="h-4 w-4" />
                }
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

