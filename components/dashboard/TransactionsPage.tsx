'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { Receipt } from 'lucide-react'

export default function TransactionsPage() {
  return (
    <DashboardPageTemplate
      title="Transactions"
      description="Payment transaction history and financial records"
      icon={Receipt}
    />
  )
}

