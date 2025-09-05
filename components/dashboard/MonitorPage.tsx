'use client'

import React from 'react'
import DashboardPageTemplate from './DashboardPageTemplate'
import { Activity } from 'lucide-react'

export default function MonitorPage() {
  return (
    <DashboardPageTemplate
      title="Real-time Monitor"
      description="Live system monitoring and performance tracking"
      icon={Activity}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CPU Usage</span>
              <span className="text-sm font-medium">45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Active Users</h3>
          <div className="text-3xl font-bold text-blue-600">342</div>
          <p className="text-sm text-gray-500">Currently online</p>
        </div>
      </div>
    </DashboardPageTemplate>
  )
}
