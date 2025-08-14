'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button, Input, Textarea, Card } from '@/components/ui'
import { useCreatePackage, usePackages } from '@/lib/hooks/api'
import { CreatePackageData } from '@/lib/types'

export function PackageForm() {
  const router = useRouter()
  const createPackage  = useCreatePackage()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreatePackageData>({
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
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      createPackage.mutate(formData, {
        onSuccess: () => {
          toast.success('Package created successfully!')
          router.push('/packages')
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to create package')
        }
      })
    } catch (error: any) {
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

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Package</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package Title
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
              rows={3}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="USD">USD</option>
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
                Street Address
              </label>
              <Input
                name="pickupAddress.street"
                value={formData.pickupAddress.street}
                onChange={handleChange}
                placeholder="Street address"
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
                  placeholder="Postal Code"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Address</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <Input
                name="deliveryAddress.street"
                value={formData.deliveryAddress.street}
                onChange={handleChange}
                placeholder="Street address"
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
                  placeholder="Postal Code"
                  required
                />
              </div>
            </div>
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

        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isFragile"
              name="isFragile"
              checked={formData.isFragile}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? 'Creating...' : 'Create Package'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
