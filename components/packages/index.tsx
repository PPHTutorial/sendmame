// Fakomame Platform - Package Creation Form
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button, Input, Textarea, Card } from '@/components/ui'

export function PackageForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'DOCUMENTS',
    pickupCity: '',
    deliveryCity: '',
    offeredPrice: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement actual API call
      console.log('Creating package:', formData)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Package created successfully!')
      router.push('/packages')
  } catch (_error: any) {
      toast.error('Failed to create package')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Send a Package</h2>
        <p className="text-gray-600 mt-2">
          Tell us about your package and we&apos;ll find a traveler to deliver it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Package Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Important documents for business meeting"
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your package in detail..."
          rows={3}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          >
            <option value="DOCUMENTS">Documents</option>
            <option value="ELECTRONICS">Electronics</option>
            <option value="CLOTHING">Clothing</option>
            <option value="BOOKS">Books</option>
            <option value="GIFTS">Gifts</option>
            <option value="MEDICINE">Medicine</option>
            <option value="FOOD">Food</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Pickup City"
            name="pickupCity"
            value={formData.pickupCity}
            onChange={handleChange}
            placeholder="e.g., New York"
            required
          />

          <Input
            label="Delivery City"
            name="deliveryCity"
            value={formData.deliveryCity}
            onChange={handleChange}
            placeholder="e.g., London"
            required
          />
        </div>

        <Input
          label="Offered Price ($)"
          name="offeredPrice"
          type="number"
          value={formData.offeredPrice}
          onChange={handleChange}
          min="0"
          step="0.01"
          helper="How much are you willing to pay for delivery?"
          required
        />

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          Create Package Listing
        </Button>
      </form>
    </Card>
  )
}
