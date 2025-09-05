'use client'

import React from 'react'

import DashboardPageTemplate from './DashboardPageTemplate'
import { Headphones } from 'lucide-react'

export default function ChatsPage() {
  return (
    <DashboardPageTemplate
      title="Chat Management"
      description="Chat system oversight and moderation"
      icon={Headphones}
    />
  )
}

