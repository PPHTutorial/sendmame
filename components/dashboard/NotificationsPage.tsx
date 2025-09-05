'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <DashboardPageTemplate
      title="Notifications"
      description="System notification management and alerts"
      icon={Bell}
    />
  )
}

