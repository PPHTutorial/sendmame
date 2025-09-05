'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { FileText } from 'lucide-react'

export default function AuditLogsPage() {
  return (
    <DashboardPageTemplate
      title="Audit Logs"
      description="System activity tracking and audit trail"
      icon={FileText}
    />
  )
}

