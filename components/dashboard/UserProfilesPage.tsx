'use client'

import React from 'react'
import DashboardPageTemplate from './DashboardPageTemplate'
import { UserCheck } from 'lucide-react'

export default function UserProfilesPage() {
  return (
    <DashboardPageTemplate
      title="User Profiles"
      description="Detailed profile management and user information"
      icon={UserCheck}
    />
  )
}
