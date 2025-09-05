'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { Lock } from 'lucide-react'

export default function SessionsPage() {
  return (
    <DashboardPageTemplate
      title="Sessions"
      description="Active user sessions and security management"
      icon={Lock}
    />
  )
}

