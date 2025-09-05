'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { Shield } from 'lucide-react'

export default function SafetyPage() {
  return (
    <DashboardPageTemplate
      title="Safety Confirmations"
      description="Safety verification system and security protocols"
      icon={Shield}
    />
  )
}

