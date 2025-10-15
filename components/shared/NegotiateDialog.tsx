/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react'
import { DollarSign, X, Send, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../ui/button'
import { Input, Modal, Textarea } from '../ui'
import { toastErrorStyle, toastSuccessStyle } from '@/lib/utils'

interface NegotiateDialogProps {
  item: {
    id: string
    title?: string
    offeredPrice?: number
    finalPrice?: number
    type: 'package' | 'trip'
    sender?: any
    trip?: any
  }
  onClose: () => void
  isOpen: boolean
  onNegotiate: (itemId: string, proposedPrice: number, message: string) => Promise<void>
  currentUserId: string
}

export function NegotiateDialog({ item, isOpen, onClose, onNegotiate, currentUserId }: NegotiateDialogProps) {
  const [proposedPrice, setProposedPrice] = useState<number>(Number(item.finalPrice?.toFixed(2) || item.offeredPrice?.toFixed(2)) || 0)
  const [message, setMessage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!proposedPrice || proposedPrice <= 0) {
      toast.error('Please enter a valid price', toastErrorStyle)
      return
    }

    if (!message.trim()) {
      toast.error('Please add a message explaining your price proposal', toastErrorStyle)
      return
    }

    setIsSubmitting(true)
    try {
      await onNegotiate(item.id, proposedPrice, message)
      toast.success('Price negotiation sent successfully!', toastSuccessStyle)
      //TODO: Logic to send notification to the other party about the negotiation
      onClose()
    } catch (error) {
      console.error('Negotiation error:', error)
      toast.error('Failed to send negotiation. Please try again.', toastErrorStyle)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setProposedPrice(item.finalPrice || item.offeredPrice || 0)
    setMessage('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-[900]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Negotiate Price</h3>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 !p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Item Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 min-w-4 min-h-4" />
            <span>Current Price: ${item.offeredPrice?.toFixed(2)}</span>
            {item.finalPrice && item.finalPrice !== item.offeredPrice && (
              <span className="text-teal-600">(Agreed: ${item.finalPrice?.toFixed(2)})</span>
            )}
          </div>
        </div>

        {/* Price Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proposed Price ($)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 min-w-4 min-h-4 text-gray-400" />
            <Input  
              type="number"
              min="0"
              step="0.01"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter your proposed price"
            />
          </div>
          {proposedPrice !== (item.finalPrice || item.offeredPrice) && (
            <p className="text-xs text-gray-500 mt-1">
              {proposedPrice > (item.finalPrice || item.offeredPrice!)
                ? `+$${(proposedPrice - (item.finalPrice || item.offeredPrice!)).toFixed(2)} increase`
                : `-$${((item.finalPrice || item.offeredPrice!) - proposedPrice).toFixed(2)} decrease`
              }
            </p>
          )}
        </div>

        {/* Message Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
            placeholder="Explain your price proposal and any conditions..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-teal-600 hover:bg-teal-700"
            disabled={isSubmitting || !proposedPrice || !message.trim()}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 min-w-4 min-h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 min-w-4 min-h-4" />
                Send Negotiation
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}