'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { useTrip } from '@/lib/hooks/api'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { TripForm } from '@/components/trips/TripForm'

export default function EditTripPage() {
  const params = useParams()
  const tripId = params.id as string

  const { data: tripData, isLoading, error } = useTrip(tripId)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !tripData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip Not Found</h1>
          <p className="text-gray-600">The trip you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Trip</h1>
          <p className="mt-2 text-gray-600">Update your trip details below.</p>
        </div> */}
        
        <TripForm 
          initialData={tripData}
          isEdit={true}
          tripId={tripId}
        />
  
    </div>
  )
}
