'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button, Input, Textarea, Card } from '@/components/ui'
import { useCreatePackage, useUpdatePackage } from '@/lib/hooks/api'
import { CreatePackageData } from '@/lib/types'
import { AdvancedImageUploader } from '@/components/shared/AdvancedImageUploader'
import { AddressInput } from '@/components/shared/AddressInput'
import type { LocationDetails } from '@/lib/types/places'

interface PackageFormProps {
  initialData?: any
  isEdit?: boolean
  packageId?: string
}

export function PackageForm({ initialData, isEdit = false, packageId }: PackageFormProps) {
  const router = useRouter()
  const createPackage = useCreatePackage()
  const updatePackage = useUpdatePackage()
  const [isLoading, setIsLoading] = useState(false)
  const [generatedBanner, setGeneratedBanner] = useState<string | null>(null)

  // Initialize form data with default values or initial data for editing
  const getInitialFormData = useCallback((): CreatePackageData => {
    if (initialData) {
      // Format the data from the API response for editing
      return {
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'DOCUMENTS',
        dimensions: {
          length: initialData.dimensions?.length || 0,
          width: initialData.dimensions?.width || 0,
          height: initialData.dimensions?.height || 0,
          weight: initialData.dimensions?.weight || 0
        },
        value: initialData.value || 0,
        isFragile: initialData.isFragile || false,
        requiresSignature: initialData.requiresSignature || false,
        pickupAddress: {
          street: initialData.pickupAddress?.street || '',
          city: initialData.pickupAddress?.city || '',
          state: initialData.pickupAddress?.state || '',
          country: initialData.pickupAddress?.country || '',
          postalCode: initialData.pickupAddress?.postalCode || '',
          latitude: initialData.pickupAddress?.latitude || 0,
          longitude: initialData.pickupAddress?.longitude || 0
        },
        deliveryAddress: {
          street: initialData.deliveryAddress?.street || '',
          city: initialData.deliveryAddress?.city || '',
          state: initialData.deliveryAddress?.state || '',
          country: initialData.deliveryAddress?.country || '',
          postalCode: initialData.deliveryAddress?.postalCode || '',
          latitude: initialData.deliveryAddress?.latitude || 0,
          longitude: initialData.deliveryAddress?.longitude || 0
        },
        pickupDate: initialData.pickupDate ? new Date(initialData.pickupDate).toISOString().split('T')[0] : '',
        deliveryDate: initialData.deliveryDate ? new Date(initialData.deliveryDate).toISOString().split('T')[0] : '',
        offeredPrice: initialData.offeredPrice || 0,
        currency: initialData.currency || 'USD',
        specialInstructions: initialData.specialInstructions || '',
        images: initialData.images || []
      }
    }

    return {
      title: '',
      description: '',
      category: 'DOCUMENTS',
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        weight: 0
      },
      value: 0,
      isFragile: false,
      requiresSignature: false,
      pickupAddress: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        latitude: 0,
        longitude: 0
      },
      deliveryAddress: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        latitude: 0,
        longitude: 0
      },
      pickupDate: '',
      deliveryDate: '',
      offeredPrice: 0,
      currency: 'USD',
      specialInstructions: '',
      images: []
    }
  }, [initialData])

  const [formData, setFormData] = useState<CreatePackageData>(getInitialFormData())

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && isEdit) {
      setFormData(getInitialFormData())
    }
  }, [initialData, isEdit, getInitialFormData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.pickupDate || !formData.deliveryDate) {
        toast.error('Please fill in all required fields', {
          style: {
            background: '#d12020',
            color: '#ffffff',
            fontSize: '14px',
            border: '1px solid #f5c6cb',
          }
        })
        return
      }

      // Ensure coordinates are set for addresses
      if (!formData.pickupAddress.latitude || !formData.pickupAddress.longitude) {
        toast.error('Please provide a valid pickup address with location', {
          style: {
            background: '#d12020',
            color: '#ffffff',
            fontSize: '14px',
            border: '1px solid #f5c6cb',
          }
        })
        return
      }

      if (!formData.deliveryAddress.latitude || !formData.deliveryAddress.longitude) {
        toast.error('Please provide a valid delivery address with location', {
          style: {
            background: '#d12020',
            color: '#ffffff',
            fontSize: '14px',
            border: '1px solid #f5c6cb',
          }
        })
        return
      }

      // The API expects the data in the same format as CreatePackageData
      // The API will extract coordinates and handle the database mapping
      if (isEdit && packageId) {
        // Update existing package
        updatePackage.mutate({ id: packageId, data: formData }, {
          onSuccess: () => {
            toast.success('Package updated successfully!', {
              style: {
                background: '#d1e7dd',
                color: '#0f5132',
                fontSize: '14px',
                border: '1px solid #badbcc',
              }
            })
            router.push(`/packages/${packageId}`)
          },
          onError: (error: any) => {
            toast.error(error.message || 'Failed to update package', {
              style: {
                background: '#d12020',
                color: '#ffffff',
                fontSize: '14px',
                border: '1px solid #ee0119',
              }
            })
          }
        })
      } else {
        // Create new package
        createPackage.mutate(formData, {
          onSuccess: (result) => {
            toast.success('Package created successfully!', {
              style: {
                background: '#d1e7dd',
                color: '#0f5132',
                fontSize: '14px',
                border: '1px solid #badbcc',
              }
            })
            router.push(`/packages/${result.id}`)
          },
          onError: (error: any) => {
            toast.error(error.message || 'Failed to create package', {
              style: {
                background: '#d12020',
                color: '#ffffff',
                fontSize: '14px',
                border: '1px solid #ee0119',
              }
            })
          }
        })
      }
    } catch (_error: any) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target



    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData((prev: CreatePackageData) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreatePackageData] as any),
          [child]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }))
    } else {
      setFormData((prev: CreatePackageData) => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 :
          type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }))
    }
  }

  const handleImagesChange = (images: string[]) => {
    setFormData((prev: CreatePackageData) => ({
      ...prev,
      images
    }))
  }

  const handlePickupAddressChange = (location: LocationDetails | null) => {
    if (location) {
      setFormData((prev: CreatePackageData) => ({
        ...prev,
        pickupAddress: {
          street: location.formatted_address,
          city: location.city || '',
          state: location.state || '',
          country: location.country || '',
          postalCode: location.postal_code || '',
          latitude: location.coordinates.lat,
          longitude: location.coordinates.lng
        }
      }))
    }
  }

  const handleDeliveryAddressChange = (location: LocationDetails | null) => {
    if (location) {
      setFormData((prev: CreatePackageData) => ({
        ...prev,
        deliveryAddress: {
          street: location.formatted_address,
          city: location.city || '',
          state: location.state || '',
          country: location.country || '',
          postalCode: location.postal_code || '',
          latitude: location.coordinates.lat,
          longitude: location.coordinates.lng
        }
      }))
    }
  }

  return (
    <Card className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Package</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What are you sending?
            </label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief description of your package"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the package contents"
              rows={6}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="DOCUMENTS">Documents</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="CLOTHING">Clothing</option>
                <option value="BOOKS">Books</option>
                <option value="FOOD">Food</option>
                <option value="GIFTS">Gifts</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="USD">USD</option>
                <option value="GHS">GHS</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="NGN">NGN</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Package Dimensions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (cm)
              </label>
              <Input
                type="number"
                name="dimensions.length"
                value={formData.dimensions.length}
                onChange={handleChange}
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (cm)
              </label>
              <Input
                type="number"
                name="dimensions.width"
                value={formData.dimensions.width}
                onChange={handleChange}
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <Input
                type="number"
                name="dimensions.height"
                value={formData.dimensions.height}
                onChange={handleChange}
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <Input
                type="number"
                name="dimensions.weight"
                value={formData.dimensions.weight}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>
        </div>

        {/* Pickup Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pickup Address</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Name or Address
              </label>             
                <AddressInput
                  //label="Pickup Location"
                  placeholder="Enter pickup address with Google Places autocomplete..."
                  value={formData.pickupAddress.street}
                  onChange={handlePickupAddressChange}
                  showCurrentLocationButton={true}
                  required
                />                
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Input
                  name="pickupAddress.city"
                  value={formData.pickupAddress.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <Input
                  name="pickupAddress.state"
                  value={formData.pickupAddress.state}
                  onChange={handleChange}
                  placeholder="State or Province"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <Input
                  name="pickupAddress.country"
                  value={formData.pickupAddress.country}
                  onChange={handleChange}
                  placeholder="Country"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <Input
                  name="pickupAddress.postalCode"
                  value={formData.pickupAddress.postalCode}
                  onChange={handleChange}
                  placeholder="Enter postal code manually if needed"
                  className="bg-white" // Ensure it's clearly editable
                />
              </div>
            </div>

            {/* Coordinates for pickup address */}
            <div className="hidden grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <Input
                  type="number"
                  name="pickupAddress.latitude"
                  value={formData.pickupAddress.latitude}
                  onChange={handleChange}
                  placeholder="e.g., 40.7128"
                  step="any"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <Input
                  type="number"
                  name="pickupAddress.longitude"
                  value={formData.pickupAddress.longitude}
                  onChange={handleChange}
                  placeholder="e.g., -74.0060"
                  step="any"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Tip: You can find coordinates by searching your address on Google Maps and clicking on the location pin.
            </p>
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Address</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Name orAddress
              </label>
               <AddressInput
                  //label="Pickup Location"
                  placeholder="Enter delivery address with Google Places autocomplete..."
                  value={formData.deliveryAddress.street}
                  onChange={handleDeliveryAddressChange}
                  showCurrentLocationButton={true}
                  required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Input
                  name="deliveryAddress.city"
                  value={formData.deliveryAddress.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <Input
                  name="deliveryAddress.state"
                  value={formData.deliveryAddress.state}
                  onChange={handleChange}
                  placeholder="State or Province"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <Input
                  name="deliveryAddress.country"
                  value={formData.deliveryAddress.country}
                  onChange={handleChange}
                  placeholder="Country"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <Input
                  name="deliveryAddress.postalCode"
                  value={formData.deliveryAddress.postalCode}
                  onChange={handleChange}
                  placeholder="Enter postal code manually if needed"
                  className="bg-white" // Ensure it's clearly editable
                />
              </div>
            </div>

            {/* Coordinates for delivery address */}
            <div className="hidden grid-cols-2 gap-4 mt-4 ">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <Input
                  type="number"
                  name="deliveryAddress.latitude"
                  value={formData.deliveryAddress.latitude}
                  onChange={handleChange}
                  placeholder="e.g., 40.7128"
                  step="any"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <Input
                  type="number"
                  name="deliveryAddress.longitude"
                  value={formData.deliveryAddress.longitude}
                  onChange={handleChange}
                  placeholder="e.g., -74.0060"
                  step="any"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Tip: You can find coordinates by searching your address on Google Maps and clicking on the location pin.
            </p>
          </div>
        </div>

        {/* Dates and Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Date
            </label>
            <Input
              type="date"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Date
            </label>
            <Input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package Value ({formData.currency})
            </label>
            <Input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Estimated package value"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Offered Price ({formData.currency})
            </label>
            <Input
              type="number"
              name="offeredPrice"
              value={formData.offeredPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Amount willing to pay for delivery"
              required
            />
          </div>
        </div>

        {/* Additional Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Instructions
          </label>
          <Textarea
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleChange}
            placeholder="Any special handling instructions..."
            rows={3}
          />
        </div>

        {/* Package Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Package Images
          </label>
          <AdvancedImageUploader
            images={formData.images || []}
            onImagesChange={handleImagesChange}
            maxImages={5}
            maxSizeMB={5}
            className="mb-4"
            onBannerGenerated={setGeneratedBanner}
          />

          {/* Display Generated Banner */}
          {generatedBanner && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Banner</h4>
              <img
                src={generatedBanner}
                alt="Generated package banner"
                className="w-full max-w-md rounded-lg shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isFragile"
              name="isFragile"
              checked={formData.isFragile}
              onChange={handleChange}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded accent-teal-900"
            />
            <label htmlFor="isFragile" className="ml-2 block text-sm text-gray-700">
              Fragile Item
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiresSignature"
              name="requiresSignature"
              checked={formData.requiresSignature}
              onChange={handleChange}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded accent-teal-900"
            />
            <label htmlFor="requiresSignature" className="ml-2 block text-sm text-gray-700">
              Requires Signature
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {isLoading
              ? (isEdit ? 'Updating...' : 'Creating...')
              : (isEdit ? 'Update Package' : 'Create Package')
            }
          </Button>
        </div>
      </form>
    </Card>
  )
}
