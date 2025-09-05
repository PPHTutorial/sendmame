'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { Plane } from 'lucide-react'

export default function TripsPage() {
  return (
    <DashboardPageTemplate
      title="Trips"
      description="Trip scheduling and routing management"
      icon={Plane}
    />
  )
}

