'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button, Input, Select } from '@/components/ui'
import { ImageUploader } from '@/components/shared/ImageUploader'
import { AddressInput } from '@/components/shared/AddressInput'
import { useCreateTrip } from '@/lib/hooks/api'
import { createTripSchema } from '@/lib/validations'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Package, DollarSign } from 'lucide-react'
import type { LocationDetails } from '@/lib/types/places'
import { NavHeader, FloatingActionButton } from '@/components/shared'

export default function CreateTripPage() {
  const router = useRouter()
  const createTrip = useCreateTrip()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<any>({
    images: []
  })

  // Address state management
  const [originAddress, setOriginAddress] = useState<LocationDetails | null>(null)
  const [destinationAddress, setDestinationAddress] = useState<LocationDetails | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      packageTypes: [],
      restrictions: [],
      transportMode: 'car'
    }
  })

  const handleImagesChange = (images: string[]) => {
    setFormData((prev: any) => ({
      ...prev,
      images
    }))
  }

  // Handle address selection from Google Places
  const handleOriginAddressChange = (location: LocationDetails | null) => {
    setOriginAddress(location)
    if (location) {
      // Update form values
      setValue('originAddress.street', location.formatted_address)
      setValue('originAddress.city', location.city)
      setValue('originAddress.state', location.state)
      setValue('originAddress.country', location.country)
      setValue('originAddress.postalCode', location.postal_code)
      setValue('originAddress.latitude', location.coordinates.lat)
      setValue('originAddress.longitude', location.coordinates.lng)
    }
  }

  const handleDestinationAddressChange = (location: LocationDetails | null) => {
    setDestinationAddress(location)
    if (location) {
      // Update form values
      setValue('destinationAddress.street', location.formatted_address)
      setValue('destinationAddress.city', location.city)
      setValue('destinationAddress.state', location.state)
      setValue('destinationAddress.country', location.country)
      setValue('destinationAddress.postalCode', location.postal_code)
      setValue('destinationAddress.latitude', location.coordinates.lat)
      setValue('destinationAddress.longitude', location.coordinates.lng)
    }
  }

  const onSubmit = async (data: any) => {
    try {
      const tripData = {
        ...data,
        arrivalDate: new Date(data.arrivalDate).toISOString(),
        departureDate: new Date(data.departureDate).toISOString(),
        images: formData.images
      }
      const result = await createTrip.mutateAsync(tripData)
      console.log(result)
      toast.success('Trip posted successfully!')
      router.push(`/trips/${result.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create trip')
    }
  }

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 4))
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const transportModeOptions = [
    { value: 'car', label: 'Car' },
    { value: 'plane', label: 'Plane' },
    { value: 'train', label: 'Train' },
    { value: 'bus', label: 'Bus' },
    { value: 'ship', label: 'Ship' },
    { value: 'other', label: 'Other' }
  ]

  const packageTypeOptions = [
    'Documents',
    'Electronics',
    'Clothing',
    'Food & Beverages',
    'Medical Supplies',
    'Books',
    'Gifts',
    'Sports Equipment',
    'Art & Collectibles',
    'Other'
  ]

  const restrictionOptions = [
    'No fragile items',
    'No liquids',
    'No electronics',
    'No food items',
    'No valuable items',
    'No oversized items',
    'Temperature sensitive items only',
    'Signed packages only'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <NavHeader 
        title="Create Trip" 
        showCreateTrip={false}
        showMenuItems={false}
      />
      
      {/* Floating Action Button for Mobile */}
      <FloatingActionButton />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Back Navigation */}
        <div className="mb-6 mt-4">
          <Link href="/trips" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trips
          </Link>
          <p className="mt-2 text-gray-600">
            Share your travel plans and earn money by delivering packages
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNumber
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  {stepNumber}
                </div>
                <span className={`ml-2 text-sm font-medium ${step >= stepNumber ? 'text-teal-600' : 'text-gray-500'
                  }`}>
                  {stepNumber === 1 && 'Route'}
                  {stepNumber === 2 && 'Details'}
                  {stepNumber === 3 && 'Capacity'}
                  {stepNumber === 4 && 'Pricing'}
                </span>
                {stepNumber < 4 && (
                  <div className={`w-12 h-0.5 mx-4 ${step > stepNumber ? 'bg-teal-600' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Route Information */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <MapPin className="h-6 w-6 text-teal-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Travel Route</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Origin Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">From (Origin)</h3>

                  <AddressInput
                    label="Origin Address"
                    placeholder="Enter origin address..."
                    onChange={handleOriginAddressChange}
                    showCurrentLocationButton={true}
                    types="address"
                    required
                  />

                  {/* Manual override fields - shown after address selection */}
                  {originAddress && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Address Details (editable)</h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <Input
                            {...register('originAddress.city')}
                            placeholder="City"
                            error={errors.originAddress?.city?.message}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <Input
                            {...register('originAddress.state')}
                            placeholder="State"
                            error={errors.originAddress?.state?.message}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <Input
                            {...register('originAddress.country')}
                            placeholder="Country"
                            error={errors.originAddress?.country?.message}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code
                          </label>
                          <Input
                            {...register('originAddress.postalCode')}
                            placeholder="Enter postal code manually if needed"
                            error={errors.originAddress?.postalCode?.message}
                          />
                        </div>
                      </div>

                      <div className="hidden grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitude
                          </label>
                          <Input
                            type="number"
                            step="any"
                            {...register('originAddress.latitude', { valueAsNumber: true })}
                            placeholder="40.7128"
                            error={errors.originAddress?.latitude?.message}
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitude
                          </label>
                          <Input
                            type="number"
                            step="any"
                            {...register('originAddress.longitude', { valueAsNumber: true })}
                            placeholder="-74.0060"
                            error={errors.originAddress?.longitude?.message}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Destination Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">To (Destination)</h3>

                  <AddressInput
                    label="Destination Address"
                    placeholder="Enter destination address..."
                    onChange={handleDestinationAddressChange}
                    showCurrentLocationButton={true}
                    types="address"
                    required
                  />

                  {/* Manual override fields - shown after address selection */}
                  {destinationAddress && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Address Details (editable)</h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <Input
                            {...register('destinationAddress.city')}
                            placeholder="City"
                            error={errors.destinationAddress?.city?.message}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <Input
                            {...register('destinationAddress.state')}
                            placeholder="State"
                            error={errors.destinationAddress?.state?.message}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <Input
                            {...register('destinationAddress.country')}
                            placeholder="Country"
                            error={errors.destinationAddress?.country?.message}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code
                          </label>
                          <Input
                            {...register('destinationAddress.postalCode')}
                            placeholder="Enter postal code manually if needed"
                            error={errors.destinationAddress?.postalCode?.message}
                          />
                        </div>
                      </div>

                      <div className="hidden grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitude
                          </label>
                          <Input
                            type="number"
                            step="any"
                            {...register('destinationAddress.latitude', { valueAsNumber: true })}
                            placeholder="34.0522"
                            error={errors.destinationAddress?.latitude?.message}
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitude
                          </label>
                          <Input
                            type="number"
                            step="any"
                            {...register('destinationAddress.longitude', { valueAsNumber: true })}
                            placeholder="-118.2437"
                            error={errors.destinationAddress?.longitude?.message}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Travel Details */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <Calendar className="h-6 w-6 text-teal-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Travel Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    {...register('departureDate')}
                    error={errors.departureDate?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    {...register('arrivalDate')}
                    error={errors.arrivalDate?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transport Mode
                  </label>
                  <Select
                    {...register('transportMode')}
                    options={[
                      { value: '', label: 'Select transport mode' },
                      ...transportModeOptions
                    ]}
                    error={errors.transportMode?.message}
                  />
                </div>
              </div>

              {/* Trip Images */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Photos
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Add photos of your vehicle, transport mode, or travel route to build trust with senders.
                </p>
                <ImageUploader
                  images={formData.images || []}
                  onImagesChange={handleImagesChange}
                  maxImages={5}
                />
              </div>
            </div>
          )}

          {/* Step 3: Capacity & Restrictions */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <Package className="h-6 w-6 text-teal-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Capacity & Restrictions</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Weight (kg)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    {...register('maxWeight', { valueAsNumber: true })}
                    placeholder="10"
                    error={errors.maxWeight?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Maximum Dimensions
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Length (cm)</label>
                      <Input
                        type="number"
                        step="0.1"
                        {...register('maxDimensions.length', { valueAsNumber: true })}
                        placeholder="50"
                        error={errors.maxDimensions?.length?.message}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Width (cm)</label>
                      <Input
                        type="number"
                        step="0.1"
                        {...register('maxDimensions.width', { valueAsNumber: true })}
                        placeholder="30"
                        error={errors.maxDimensions?.width?.message}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Height (cm)</label>
                      <Input
                        type="number"
                        step="0.1"
                        {...register('maxDimensions.height', { valueAsNumber: true })}
                        placeholder="20"
                        error={errors.maxDimensions?.height?.message}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Accepted Package Types
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {packageTypeOptions.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          value={type}
                          {...register('packageTypes')}
                          className="accent-teal-600 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Restrictions
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {restrictionOptions.map((restriction) => (
                      <label key={restriction} className="flex items-center">
                        <input
                          type="checkbox"
                          value={restriction}
                          {...register('restrictions')}
                          className="accent-teal-600 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{restriction}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pricing */}
          {step === 4 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <DollarSign className="h-6 w-6 text-teal-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Kilogram ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('pricePerKg', { valueAsNumber: true })}
                    placeholder="5.00"
                    error={errors.pricePerKg?.message}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Optional: Set a rate per kilogram for flexible pricing
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Price ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('minimumPrice', { valueAsNumber: true })}
                      placeholder="10.00"
                      error={errors.minimumPrice?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Price ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('maximumPrice', { valueAsNumber: true })}
                      placeholder="100.00"
                      error={errors.maximumPrice?.message}
                    />
                  </div>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-teal-900 mb-2">Pricing Tips</h3>
                  <ul className="text-sm text-teal-700 space-y-1">
                    <li>• Consider distance, transportation costs, and your time</li>
                    <li>• Price per kg works well for multiple small packages</li>
                    <li>• Set minimum/maximum prices to control earnings range</li>
                    <li>• Research similar trips for competitive pricing</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              Previous
            </Button>

            {step < 4 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSubmitting ? 'Posting Trip...' : 'Post Trip'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
