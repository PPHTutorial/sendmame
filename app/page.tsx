import React from 'react'
import { LandingPage } from '@/components/landing'
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/packages')
  return (
    <div className="min-h-screen">
      <LandingPage />
    </div>
  )
}
