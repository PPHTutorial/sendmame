'use client'

import React, { useEffect, useState } from 'react'
import { Button, Input } from '@/components/ui'
import { MapPin, Upload, CheckCircle, Clock, X } from 'lucide-react'
import { useAddressVerificationStatus, useUploadAddressDocument } from '@/lib/hooks/api'

interface AddressVerificationProps {
    onClose: () => void
}

export function AddressVerification({ onClose }: AddressVerificationProps) {
    const [step, setStep] = useState<'address' | 'document' | 'review' | 'success' | 'rejected'>('address')
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States'
    })
    const [documentType, setDocumentType] = useState<'utility_bill' | 'bank_statement' | 'lease_agreement'>('utility_bill')
    const [documentImage, setDocumentImage] = useState<File | null>(null)

    const uploadAddressMutation = useUploadAddressDocument()
    const { data: verificationStatus, isLoading: statusLoading } = useAddressVerificationStatus()

    // Update step based on verification status
    useEffect(() => {
        console.log('Facial verification status:', verificationStatus)
        if (verificationStatus) {
            const { hasDocument, status, verifiedAt } = verificationStatus

            if (hasDocument) {
                console.log('Document exists with status:', status)
                if (status === 'VERIFIED' && verifiedAt) {
                    setStep('success')
                } else if (status === 'REJECTED') {
                    setStep('rejected')
                } else if (status === 'PENDING') {
                    setStep('review')
                }
            } else {
                setStep('address')
            }
        }
    }, [verificationStatus])

    const handleAddressChange = (field: keyof typeof address, value: string) => {
        setAddress(prev => ({ ...prev, [field]: value }))
    }

    const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setDocumentImage(file)
        }
    }

    const removeDocument = () => {
        setDocumentImage(null)
    }

    const handleAddressSubmit = () => {
        if (!address.street || !address.city || !address.state || !address.postalCode) {
            alert('Please fill in all address fields')
            return
        }
        setStep('document')
    }

    const handleDocumentSubmit = async () => {
        if (!documentImage) return

        try {
            // Upload the address verification document with address data using hook
            await uploadAddressMutation.mutateAsync({
                file: documentImage,
                documentType,
                address: address,
            })
            setStep('review')
        } catch (error) {
            console.error('Failed to upload document:', error)
            // Error handling is done by the hook
        }
    }

    const renderDocumentPreview = () => {
        if (!documentImage) return null

        return (
            <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={URL.createObjectURL(documentImage)}
                    alt="Address verification document"
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                    onClick={removeDocument}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        )
    }

    if (step === 'success') {
        return (
            <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Address Submitted!</h3>
                <p className="text-gray-600 mb-6">
                    Your address verification has been submitted for review.
                </p>
                <Button onClick={onClose}>
                    Close
                </Button>
            </div>
        )
    }

    if (step === 'review') {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Under Review</h3>
                    <p className="text-gray-600">
                        Your address verification is being reviewed. This usually takes 2-5 business days.
                    </p>
                </div>

                {/* Address Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Submitted Address:</h4>
                    <p className="text-sm text-gray-700">
                        {verificationStatus.metadata.address.street}<br />
                        {verificationStatus.metadata.address.city}, {verificationStatus.metadata.address.state} {verificationStatus.metadata.address.postalCode}<br />
                        {verificationStatus.metadata.address.country}
                    </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-900 mb-2">What happens next?</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Our team will verify your document within 2-5 business days</li>
                        <li>• You&apos;ll receive an email notification once complete</li>
                        <li>• If additional information is needed, we&apos;ll contact you</li>
                        <li>• Verified addresses unlock location-based features</li>
                    </ul>
                </div>

                <div className="flex space-x-3">
                    <Button onClick={onClose} className="flex-1">
                        Close
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setStep('address')}
                    >
                        Submit New Address
                    </Button>
                </div>
            </div>
        )
    }

    if (step === 'document') {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Proof of Address</h3>
                    <p className="text-gray-600">
                        Upload a document that shows your name and address
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Document Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Document Type
                        </label>
                        <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="utility_bill">Utility Bill</option>
                            <option value="bank_statement">Bank Statement</option>
                            <option value="lease_agreement">Lease Agreement</option>
                        </select>
                    </div>

                    {/* Document Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Document
                        </label>
                        {documentImage ? (
                            renderDocumentPreview()
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                    onChange={handleDocumentUpload}
                                />
                            </label>
                        )}
                    </div>

                    <div className="flex space-x-3">
                        <Button
                            onClick={handleDocumentSubmit}
                            disabled={!documentImage || uploadAddressMutation.isPending}
                            className="flex-1"
                        >
                            {uploadAddressMutation.isPending ? (
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 animate-spin" />
                                    <span>Uploading...</span>
                                </div>
                            ) : (
                                'Submit for Review'
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setStep('address')}
                        >
                            Back
                        </Button>
                    </div>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-teal-900 mb-2">Document Requirements:</h4>
                    <ul className="text-sm text-teal-700 space-y-1">
                        <li>• Document must be dated within the last 3 months</li>
                        <li>• Your full name must be clearly visible</li>
                        <li>• Address must match what you entered</li>
                        <li>• Document must be official (no handwritten notes)</li>
                        <li>• All text should be readable</li>
                    </ul>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Verify Your Address</h3>
                <p className="text-gray-600">
                    Enter your current residential address for verification
                </p>
            </div>

            <div className="space-y-4">
                {/* Street Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                    </label>
                    <Input
                        type="text"
                        placeholder="123 Main Street"
                        value={address.street}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                    />
                </div>

                {/* City */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                    </label>
                    <Input
                        type="text"
                        placeholder="New York"
                        value={address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                    />
                </div>

                {/* State and Postal Code */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            State/Province
                        </label>
                        <Input
                            type="text"
                            placeholder="NY"
                            value={address.state}
                            onChange={(e) => handleAddressChange('state', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code
                        </label>
                        <Input
                            type="text"
                            placeholder="10001"
                            value={address.postalCode}
                            onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                        />
                    </div>
                </div>

                {/* Country */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                    </label>
                    <select
                        value={address.country}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Germany">Germany</option>
                        <option value="Ghana">Ghana</option>
                        <option value="France">France</option>
                        <option value="Australia">Australia</option>
                        <option value="Japan">Japan</option>
                    </select>
                </div>

                <div className="flex space-x-3">
                    <Button
                        onClick={handleAddressSubmit}
                        className="flex-1"
                    >
                        Continue to Document Upload
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-teal-900 mb-2">Why verify your address?</h4>
                <ul className="text-sm text-teal-700 space-y-1">
                    <li>• Enable location-based package and trip matching</li>
                    <li>• Increase trust with other users in your area</li>
                    <li>• Access to local community features</li>
                    <li>• Required for some premium services</li>
                </ul>
            </div>
        </div>
    )
}
