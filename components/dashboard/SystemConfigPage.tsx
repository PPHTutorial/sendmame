'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { Settings } from 'lucide-react'

export default function SystemConfigPage() {
  return (
    <DashboardPageTemplate
      title="System Config"
      description="Global system settings and configuration"
      icon={Settings}
    />
  )
}

