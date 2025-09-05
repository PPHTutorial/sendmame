'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { Shield } from 'lucide-react'

export default function VerificationsPage() {
  return (
    <DashboardPageTemplate
      title="Verifications"
      description="Document verification and identity management"
      icon={Shield}
    />
  )
}

