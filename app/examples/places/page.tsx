/* eslint-disable react/no-unescaped-entities */
// Example page demonstrating Google Places API integration
'use client'

import React, { useState } from 'react'
import { AddressInput } from '@/components/shared/AddressInput'
import { PlacesSearch } from '@/components/shared/PlacesSearch'
import type { LocationDetails } from '@/lib/types/places'

export default function PlacesExamplePage() {
  const [selectedAddress, setSelectedAddress] = useState<LocationDetails | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<LocationDetails | null>(null)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Google Places API Integration</h1>
            <p className="mt-2 text-gray-600">
              Demonstration of address input with autocomplete and places search functionality
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Address Input Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Input</h2>
              <p className="text-gray-600 mb-6">
                Type an address to see autocomplete suggestions powered by Google Places API.
              </p>
              
              <AddressInput
                label="Delivery Address"
                placeholder="Enter pickup or delivery address..."
                onChange={setSelectedAddress}
                showCurrentLocationButton={true}
                required
              />

              {selectedAddress && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Selected Address Details:</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedAddress.name}
                    </div>
                    <div>
                      <span className="font-medium">Address:</span> {selectedAddress.formatted_address}
                    </div>
                    <div>
                      <span className="font-medium">Coordinates:</span>{' '}
                      {selectedAddress.coordinates.lat.toFixed(6)}, {selectedAddress.coordinates.lng.toFixed(6)}
                    </div>
                    {selectedAddress.city && (
                      <div>
                        <span className="font-medium">City:</span> {selectedAddress.city}
                      </div>
                    )}
                    {selectedAddress.state && (
                      <div>
                        <span className="font-medium">State:</span> {selectedAddress.state}
                      </div>
                    )}
                    {selectedAddress.country && (
                      <div>
                        <span className="font-medium">Country:</span> {selectedAddress.country}
                      </div>
                    )}
                    {selectedAddress.postal_code && (
                      <div>
                        <span className="font-medium">Postal Code:</span> {selectedAddress.postal_code}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Places Search Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Places Search</h2>
              <p className="text-gray-600 mb-6">
                Search for places, restaurants, hotels, and other points of interest.
              </p>
              
              <PlacesSearch
                placeholder="Search for restaurants, hotels, attractions..."
                onPlaceSelect={setSelectedPlace}
                showFilters={true}
              />

              {selectedPlace && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Selected Place Details:</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedPlace.name}
                    </div>
                    <div>
                      <span className="font-medium">Address:</span> {selectedPlace.formatted_address}
                    </div>
                    <div>
                      <span className="font-medium">Coordinates:</span>{' '}
                      {selectedPlace.coordinates.lat.toFixed(6)}, {selectedPlace.coordinates.lng.toFixed(6)}
                    </div>
                    {selectedPlace.phone && (
                      <div>
                        <span className="font-medium">Phone:</span> {selectedPlace.phone}
                      </div>
                    )}
                    {selectedPlace.website && (
                      <div>
                        <span className="font-medium">Website:</span>{' '}
                        <a 
                          href={selectedPlace.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedPlace.website}
                        </a>
                      </div>
                    )}
                    {selectedPlace.rating && (
                      <div>
                        <span className="font-medium">Rating:</span> {selectedPlace.rating}/5
                        {selectedPlace.user_ratings_total && (
                          <span className="text-gray-500"> ({selectedPlace.user_ratings_total} reviews)</span>
                        )}
                      </div>
                    )}
                    {selectedPlace.types && selectedPlace.types.length > 0 && (
                      <div>
                        <span className="font-medium">Types:</span>{' '}
                        {selectedPlace.types.slice(0, 5).map(type => type.replace(/_/g, ' ')).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
            <div className="space-y-2 text-blue-800">
              <p>
                <strong>Address Input:</strong> Start typing an address in the left panel. You'll see autocomplete 
                suggestions powered by Google Places API. Click on any suggestion to select it.
              </p>
              <p>
                <strong>Places Search:</strong> Use the right panel to search for specific types of places like 
                restaurants, hotels, or attractions. You can filter by type and radius.
              </p>
              <p>
                <strong>Current Location:</strong> Click the location button to use your current GPS coordinates 
                for more relevant results.
              </p>
            </div>
          </div>

          {/* Environment Setup Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">Setup Required</h3>
            <div className="space-y-2 text-yellow-800">
              <p>
                To use this functionality, you need to:
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Get a Google Maps API key from the Google Cloud Console</li>
                <li>Enable the Places API, Geocoding API, and Maps JavaScript API</li>
                <li>Add your API key to your environment variables as <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code></li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
