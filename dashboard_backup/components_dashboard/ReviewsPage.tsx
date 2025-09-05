'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { Star } from 'lucide-react'

export default function ReviewsPage() {
  return (
    <DashboardPageTemplate
      title="Reviews"
      description="User ratings and feedback management"
      icon={Star}
    />
  )
}

