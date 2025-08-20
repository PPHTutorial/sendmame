'use client'

import React from 'react'
import { Modal } from '@/components/ui'

interface FilterDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  onApply?: () => void
  onClear?: () => void
  hasActiveFilters?: boolean
}

export function FilterDialog({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onApply, 
  onClear, 
  hasActiveFilters = false 
}: FilterDialogProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      size="lg"
    >
      <div className="space-y-6">
        {children}
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div>
            {hasActiveFilters && onClear && (
              <button
                onClick={onClear}
                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onApply || onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
