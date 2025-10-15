/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { Mail, Phone, Copy, X, TriangleAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../ui/button'
import { on } from 'events'
import { Modal } from '../ui'
import { toastErrorStyle, toastSuccessStyle, toastWarningStyle } from '@/lib/utils'

interface ContactDialogProps {
  contact: {
    id: string
    firstName: string
    lastName: string
    otherName?: string
    username?: string
    email: string
    phone?: string | null
  }
  onClose: () => void
  isOpen: boolean
}

export function ContactDialog({ contact, isOpen, onClose }: ContactDialogProps) {
  if (!isOpen) return null
  const handleCopy = (value?: string | null, label?: string) => {
    if (!value) {
      toast.error(`No ${label ?? 'value'} available to copy`, toastErrorStyle)
      return
    }
    navigator.clipboard.writeText(value)
    toast.success(`${label ?? 'Value'} copied to clipboard`, toastSuccessStyle)
  }

  return (

    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-[900]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          <button
            onClick={() => onClose?.()}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-600 font-medium">
                {contact?.firstName[0]}{contact?.lastName[0]}
              </span>
            </div>
            <div>
              <h4 className="font-medium">
                {contact?.firstName} {contact?.lastName}
              </h4>
              <p className="text-sm text-gray-600">User ID: {contact?.id}</p>
            </div>
          </div>
          <div className="flex flex-col space-y-2 items-center">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-600" />
              {contact.phone ? <div className="flex items-center gap-4 justify-between"><span className='text-xl font-extrabold'>{contact.phone}</span> <Copy size={16} className='hover:text-teal-600' onClick={() => handleCopy(contact.phone, 'phone number')} /></div> : <span>No Contact Number</span>}
            </div>

            {contact.phone && <p className="text-xs text-gray-500 mt-1 text-center">
              This is the user's contact phone number. You can call directly or copy it to your clipboard and call on a real device or when your phone is connected.
            </p>}
            {!contact.phone && <p className="text-xs text-gray-500 mt-1 text-center">
              This user has no contact phone number. Reach out to them via Email or the In-App Messaging.
            </p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
          disabled={!contact.phone}
            className="flex-1"
            onClick={() => {
              toast('Initiating call...', { ...toastWarningStyle, icon: <TriangleAlert className="h-4 w-4 text-yellow-400" /> });
              window.open(`tel:${contact.phone}`, '_self');
              onClose?.();
            }}
          >
            <Phone className="h-4 w-4 mr-2" /> Call
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onClose?.()}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>

  )
}
