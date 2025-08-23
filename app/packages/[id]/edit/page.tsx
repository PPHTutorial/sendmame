'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { usePackage } from '@/lib/hooks/api'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PackageForm } from '@/components/packages/PackageForm'

export default function EditPackagePage() {
  const params = useParams()
  const packageId = params.id as string

  const { data: packageData, isLoading, error } = usePackage(packageId)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Package Not Found</h1>
          <p className="text-gray-600">The package you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Package</h1>
          <p className="mt-2 text-gray-600">Update your package details below.</p>
        </div>
        
        <PackageForm 
          initialData={packageData}
          isEdit={true}
          packageId={packageId}
        />
      </div>
    </div>
  )
}
