'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { Building2 } from 'lucide-react'

export default function AccountsPage() {
  return (
    <DashboardPageTemplate
      title="Accounts"
      description="OAuth and external account integration"
      icon={Building2}
    />
  )
}

