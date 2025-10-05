'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Package, Map, Plus, X } from 'lucide-react'

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed right-6 bottom-6 z-40 md:hidden">
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col items-end space-y-3">
          <Link href="/packages/create">
            <button className="flex items-center space-x-2 bg-white text-teal-600 shadow-lg rounded-full py-2 px-4">
              <span className="font-medium text-sm">Send Package</span>
              <div className="bg-teal-600 rounded-full p-2">
                <Package className="w-4 h-4 text-white" />
              </div>
            </button>
          </Link>
          <Link href="/trips/create">
            <button className="flex items-center space-x-2 bg-white text-teal-600 shadow-lg rounded-full py-2 px-4">
              <span className="font-medium text-sm">Create Trip</span>
              <div className="bg-teal-600 rounded-full p-2">
                <Map className="w-4 h-4 text-white" />
              </div>
            </button>
          </Link>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-gray-800 rotate-45' : 'bg-teal-600'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  )
}