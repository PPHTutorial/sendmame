'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, MapPin, Calendar, Package, Truck, Search, MessageCircle, Home, Plane } from 'lucide-react'
import { format } from 'date-fns'
import { Button, Card, Input, Modal, Badge } from '../ui'

interface Trip {
    id: string
    title: string
    originAddress: any
    destinationAddress: any
    departureDate: string
    arrivalDate: string
    maxWeight: number
    pricePerKg: number
    transportMode: string
    status: string
    availableSpace: number
}

interface Package {
    id: string
    title: string
    description: string
    pickupAddress: any
    deliveryAddress: any
    pickupDate: string
    deliveryDate: string
    dimensions: any
    offeredPrice: number
    category: string
    status: string
}

interface AssignmentDialogProps {
    isOpen: boolean
    onClose: () => void
    type: 'package-to-trip' | 'trip-to-package'
    currentItem: Package | Trip | null
    availableItems: Trip[] | Package[]
    onAssign: (targetId: string, confirmations: SafetyConfirmations) => void
    isLoading?: boolean
    userId: string
}

interface SafetyConfirmations {
    legalCompliance: boolean
    damageInspection: boolean
    accurateDescription: boolean
    safetyMeasures: boolean
    termsAcceptance: boolean
}

export function AssignmentDialog({
    isOpen,
    onClose,
    type,
    currentItem: _currentItem,
    availableItems,
    onAssign,
    isLoading = false,
    userId
}: AssignmentDialogProps) {
    const [selectedId, setSelectedId] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')
    const [confirmations, setConfirmations] = useState<SafetyConfirmations>({
        legalCompliance: false,
        damageInspection: false,
        accurateDescription: false,
        safetyMeasures: false,
        termsAcceptance: false
    })
    const [step, setStep] = useState<'selection' | 'confirmation'>('selection')

    console.log(type)

    const isPackageToTrip = type === 'trip-to-package' ? true : false
    // Enhanced filter: match by city, state, country, and reasonable distance
    //const filteredTrips = tripsQuery.data?.data?.filter((trip: any) => trip.travelerId === userId) || []
    //const filteredPackages = packagesQuery.data?.data?.filter((pkg: any) => pkg.senderId === userId) || []

    console.log(availableItems)

    const filteredItems = availableItems
            .filter((item: any) => {
               // if (!searchQuery) return true
                const searchStr = searchQuery.toLowerCase()
                //mine data

                // Helper for address matching
                function addressMatch(addrA: any, addrB: any) {
                    if (!addrA || !addrB) return false
                    const cityMatch = addrA.city?.toLowerCase() === addrB.city?.toLowerCase()
                    const stateMatch = addrA.state?.toLowerCase() === addrB.state?.toLowerCase()
                    const countryMatch = addrA.country?.toLowerCase() === addrB.country?.toLowerCase()

                    return cityMatch && stateMatch && countryMatch
                }
                // Helper for distance (simple Haversine, fallback to city/state/country if no coords)
                function isReasonableDistance(latA: number, lonA: number, latB: number, lonB: number) {
                    if (!latA || !lonA || !latB || !lonB) return true // fallback
                    const toRad = (v: number) => v * Math.PI / 180
                    const R = 6371 // km
                    const dLat = toRad(latB - latA)
                    const dLon = toRad(lonB - lonA)
                    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                    const d = R * c
                    return d <= 500 // 500km is reasonable, adjust as needed
                }


                if (isPackageToTrip) {
                    // Trip: match package delivery address to trip destination
                    const deliveryAddr = (_currentItem as Package)?.deliveryAddress
                    const match = addressMatch(item.destinationAddress, deliveryAddr)
                    const distanceOk = isReasonableDistance(
                        item.destinationAddress?.latitude,
                        item.destinationAddress?.longitude,
                        deliveryAddr?.latitude,
                        deliveryAddr?.longitude
                    )
                    return (
                       // item.title.toLowerCase().includes(searchStr) &&
                       // item.description?.toLowerCase().includes(searchStr) &&
                        match && distanceOk
                    )
                } else {
                    // Package: match trip origin to package pickup
                    const deliveryAddr = (_currentItem as Trip)?.destinationAddress
                    const match = addressMatch(item.pickupAddress, deliveryAddr)
                    const distanceOk = isReasonableDistance(
                        item.pickupAddress?.latitude,
                        item.pickupAddress?.longitude,
                        deliveryAddr?.latitude,
                        deliveryAddr?.longitude
                    )
                    return (
                        //item.title.toLowerCase().includes(searchStr) &&
                        //item.description?.toLowerCase().includes(searchStr) &&
                        match && distanceOk
                    )
                }
            })

    const allConfirmationsChecked = Object.values(confirmations).every(Boolean)

    const handleConfirmationChange = (key: keyof SafetyConfirmations, checked: boolean) => {
        setConfirmations(prev => ({ ...prev, [key]: checked }))
    }

    const handleAssign = () => {
        if (selectedId && allConfirmationsChecked) {
            onAssign(selectedId, confirmations)
        }
    }

    const resetDialog = () => {
        setSelectedId('')
        setSearchQuery('')
        setConfirmations({
            legalCompliance: false,
            damageInspection: false,
            accurateDescription: false,
            safetyMeasures: false,
            termsAcceptance: false
        })
        setStep('selection')
    }

    useEffect(() => {
        if (!isOpen) {
            resetDialog()
        }
    }, [isOpen])

    const renderSelectionStep = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder={`Search ${isPackageToTrip ? 'trips' : 'packages'}...`}
                            value={searchQuery}
                            onChange={(e: { target: { value: React.SetStateAction<string> } }) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No {isPackageToTrip ? 'Trips' : 'Packages'} Match</p>
                    <p className="text-sm mt-2">
                        {isPackageToTrip
                            ? 'Post a matching trip to start accepting packages'
                            : 'Create a matching package to find available trips'
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto gap-4">
                    {filteredItems.map((item: any) => (
                        <Card
                            key={item.id}
                            className={`cursor-pointer transition-all hover:shadow-md m-1 ${selectedId === item.id ? 'ring-2 ring-teal-500 bg-teal-50' : ''
                                }`}
                            onClick={() => setSelectedId(item.id)}
                        >
                            {/* <div className="pb-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  <Badge variant={item.status === 'POSTED' ? 'default' : 'info'}>
                    {item.status}
                  </Badge>
                </div>
              </div> */}
                            <div className="pt-0">
                                <div className="space-y-2 text-sm text-gray-600">
                                    {isPackageToTrip ? (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <Plane className="h-4 w-4" />
                                                <span>
                                                    {item.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>
                                                    {item.originAddress?.city} → {item.destinationAddress?.city}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{format(new Date(item.departureDate), 'MMM dd, yyyy')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Truck className="h-4 w-4" />
                                                <span>{item.transportMode} • {item.maxWeight}kg capacity</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">${item.pricePerKg}/kg</span>
                                                <span>• {item.availableSpace}kg available</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <Home className="h-4 w-4" />
                                                <span>
                                                    {item.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>
                                                    {item.pickupAddress?.city} → {item.deliveryAddress?.city}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{format(new Date(item.pickupDate), 'MMM dd, yyyy')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                <span>{item.category} • {item.dimensions?.weight || 'N/A'}kg</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">${item.offeredPrice}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-neutral-300">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button
                    onClick={() => setStep('confirmation')}
                    disabled={!selectedId}
                >
                    Continue
                </Button>
            </div>
        </div>
    )

    const renderConfirmationStep = () => (
        <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-amber-800 mb-2">
                            Safety & Legal Compliance Required
                        </h4>
                        <p className="text-sm text-amber-700">
                            {!isPackageToTrip
                                ? 'As a package sender, you are responsible for ensuring your package complies with all laws and regulations.'
                                : 'As a traveler, you are responsible for verifying the legitimacy and safety of packages you agree to transport.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-3">
                    Please confirm the following safety measures:
                </h4>

                <div className="space-y-3">
                    <div className="flex gap-3 items-center">
                        <input
                            type="checkbox"
                            id="legal"
                            checked={confirmations.legalCompliance}
                            onChange={(e) => handleConfirmationChange('legalCompliance', e.target.checked)}
                            className="accent-teal-600 h-4 w-4 min-h-4 min-w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="legal" className="text-sm text-gray-700 cursor-pointer">
                            I confirm as a {!isPackageToTrip ? 'package contains no illegal substances or prohibited items' : 'traveler that I will make sure no illegal substances or prohibited items are being transported'}
                        </label>
                    </div>

                    <div className="flex gap-3 items-center">
                        <input
                            type="checkbox"
                            id="damage"
                            checked={confirmations.damageInspection}
                            onChange={(e) => handleConfirmationChange('damageInspection', e.target.checked)}
                            className="accent-teal-600 h-4 w-4 min-h-4 min-w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="damage" className="text-sm text-gray-700 cursor-pointer">
                            I confirm that as a {!isPackageToTrip ? 'package sender, I have properly packaged items to prevent damage during transport' : 'traveler, I will make sure the package has no visible damage or tampering'}.
                        </label>
                    </div>

                    <div className="flex gap-3 items-center">
                        <input
                            type="checkbox"
                            id="description"
                            checked={confirmations.accurateDescription}
                            onChange={(e) => handleConfirmationChange('accurateDescription', e.target.checked)}
                            className="accent-teal-600 h-4 w-4 min-h-4 min-w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="description" className="text-sm text-gray-700 cursor-pointer">
                            I confirm the package description, dimensions, and contents are {!isPackageToTrip ? 'accurate and complete' : 'as described by the sender'}
                        </label>
                    </div>

                    <div className="flex gap-3 items-center">
                        <input
                            type="checkbox"
                            id="safety"
                            checked={confirmations.safetyMeasures}
                            onChange={(e) => handleConfirmationChange('safetyMeasures', e.target.checked)}
                            className="accent-teal-600 h-4 w-4 min-h-4 min-w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="safety" className="text-sm text-gray-700 cursor-pointer">
                            I will follow all safety precautions and {!isPackageToTrip ? 'provide tracking information when requested' : 'maintain communication throughout the delivery process'}
                        </label>
                    </div>

                    <div className="flex gap-3 items-center">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={confirmations.termsAcceptance}
                            onChange={(e) => handleConfirmationChange('termsAcceptance', e.target.checked)}
                            className="accent-teal-600 h-4 w-4 min-h-4 min-w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                            I accept full responsibility and agree to <span className="font-medium text-teal-900">terms, conditions, policies and regulations</span> that protect all parties, system owners, and help maintain a trustworthy community
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <MessageCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-teal-800 mb-2">
                            Communication Channels
                        </h4>
                        <p className="text-sm text-teal-700">
                            A secure chat channel will be created for coordination. Use this for all communication about pickup, delivery, and tracking.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep('selection')}>Back</Button>
                <Button
                    onClick={handleAssign}
                    disabled={!allConfirmationsChecked || isLoading}
                    className="bg-teal-600 hover:bg-teal-700"
                >
                    {isLoading ? 'Assigning...' : 'Confirm Assignment'}
                </Button>
            </div>
        </div>
    )

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isPackageToTrip ? 'Assign Trip to Package' :'Assign Package to Trip' }
            size="lg" 
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    {step === 'selection'
                        ? `Select a ${isPackageToTrip ? 'trip' : 'package'} for assignment`
                        : 'Confirm safety and legal compliance'
                    }
                </p>

                {step === 'selection' ? renderSelectionStep() : renderConfirmationStep()}
            </div>
        </Modal>
    )
}
