'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { AlertTriangle } from 'lucide-react'

export default function DisputesPage() {
  return (
    <DashboardPageTemplate
      title="Disputes"
      description="Dispute resolution center and conflict management"
      icon={AlertTriangle}
    />
  )
}

