'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { CreditCard } from 'lucide-react'

export default function PaymentMethodsPage() {
  return (
    <DashboardPageTemplate
      title="Payment Methods"
      description="Payment gateway integration and method management"
      icon={CreditCard}
    />
  )
}

