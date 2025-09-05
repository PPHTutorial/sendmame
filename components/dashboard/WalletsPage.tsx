'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { Wallet } from 'lucide-react'

export default function WalletsPage() {
  return (
    <DashboardPageTemplate
      title="Wallets"
      description="User wallet management and balance tracking"
      icon={Wallet}
    />
  )
}

