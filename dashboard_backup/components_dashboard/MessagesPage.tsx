'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  return (
    <DashboardPageTemplate
      title="Messages"
      description="Communication hub and messaging system"
      icon={MessageSquare}
    />
  )
}

