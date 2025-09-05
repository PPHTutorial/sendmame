'use client'

import React from 'react'

interface DashboardPageProps {
  title: string
  description: string
  icon: React.ElementType
  children?: React.ReactNode
}

export default function DashboardPageTemplate({ 
  title, 
  description, 
  icon: Icon,
  children 
}: DashboardPageProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>

      {/* Content */}
      {children || (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Icon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title} Management</h3>
            <p className="text-gray-500 mb-6">{description}</p>
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Coming Soon:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Data visualization and analytics</p>
                <p>• Advanced filtering and search</p>
                <p>• Bulk operations and management</p>
                <p>• Real-time updates and notifications</p>
                <p>• Export and reporting features</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
