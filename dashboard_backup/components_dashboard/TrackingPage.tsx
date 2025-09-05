'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { MapPin } from 'lucide-react'

export default function TrackingPage() {
  return (
    <DashboardPageTemplate
      title="Tracking Events"
      description="Package location tracking and delivery monitoring"
      icon={MapPin}
    />
  )
}

