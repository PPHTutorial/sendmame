'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { CreditCard, Upload, CheckCircle, Clock, X } from 'lucide-react'
import { useIDVerificationStatus, useUploadIDDocument } from '@/lib/hooks/api'

interface IDVerificationProps {
    onClose: () => void
}

export function IDVerification({ onClose }: IDVerificationProps) {
    const [step, setStep] = useState<'upload' | 'review' | 'success' | 'rejected'>('upload')
    const [idType, setIdType] = useState<'passport' | 'drivers_license' | 'national_id'>('national_id')
    const [frontImage, setFrontImage] = useState<File | null>(null)
    const [backImage, setBackImage] = useState<File | null>(null)

    const uploadIDMutation = useUploadIDDocument()

    const { data: verificationStatus, isLoading: statusLoading } = useIDVerificationStatus()

    // Update step based on verification status
    useEffect(() => {
        if (verificationStatus) {
            const { hasDocument, status, verifiedAt } = verificationStatus

            if (hasDocument) {
                if (status === 'VERIFIED' && verifiedAt) {
                    setStep('success')
                } else if (status === 'REJECTED') {
                    setStep('rejected')
                } else if (status === 'PENDING') {
                    setStep('review')
                }
            } else {
                setStep('upload')
            }
        }
    }, [verificationStatus])

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
        const file = e.target.files?.[0]
        if (file) {
            if (side === 'front') {
                setFrontImage(file)
            } else {
                setBackImage(file)
            }
        }
    }

    const handleSubmit = async () => {
        if (!frontImage || (idType !== 'passport' && !backImage)) return

        try {
            await uploadIDMutation.mutateAsync({
                file1: frontImage,
                file2: backImage,
                type: idType
            })
            setStep('review')
        } catch (error) {
            // Error handling is done by the hook
            console.error('Failed to upload ID:', error)
        }
    }

    const removeImage = (side: 'front' | 'back') => {
        if (side === 'front') {
            setFrontImage(null)
        } else {
            setBackImage(null)
        }
    }

    const renderImagePreview = (file: File | null, side: 'front' | 'back') => {
        if (!file) return null

        return (
            <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={URL.createObjectURL(file)}
                    alt={`ID ${side}`}
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                    onClick={() => removeImage(side)}
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">ID Submitted!</h3>
                <p className="text-gray-600 mb-6">
                    Your ID has been submitted for review. We&apos;ll notify you once it&apos;s verified.
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
                        Your ID is being reviewed by our verification team. This usually takes 1-3 business days.
                    </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-900 mb-2">What happens next?</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Our team will verify your ID within 1-3 business days</li>
                        <li>• You&apos;ll receive an email notification once complete</li>
                        <li>• If additional information is needed, we&apos;ll contact you</li>
                        <li>• Your trust score will increase once verified</li>
                    </ul>
                </div>

                <div className="flex space-x-3">
                    <Button onClick={onClose} className="flex-1">
                        Close
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setStep('upload')}
                    >
                        Upload New ID
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your ID</h3>
                <p className="text-gray-600">
                    Upload a clear photo of your government-issued ID for verification
                </p>
            </div>

            <div className="space-y-4">
                {/* ID Type Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Type
                    </label>
                    <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                        <option value="drivers_license">Driver&apos;s License</option>
                        <option value="passport">Passport</option>
                        <option value="national_id">National ID Card</option>
                    </select>
                </div>

                {/* Front Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {idType === 'passport' ? 'Passport Photo' : 'Front Side'}
                    </label>
                    {frontImage ? (
                        renderImagePreview(frontImage, 'front')
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'front')}
                            />
                        </label>
                    )}
                </div>

                {/* Back Image Upload (not needed for passport) */}
                {idType !== 'passport' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Back Side
                        </label>
                        {backImage ? (
                            renderImagePreview(backImage, 'back')
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'back')}
                                />
                            </label>
                        )}
                    </div>
                )}

                <div className="flex space-x-3">
                    <Button
                        onClick={handleSubmit}
                        disabled={!frontImage || (idType !== 'passport' && !backImage) || uploadIDMutation.isPending}
                        className="flex-1"
                    >
                        {uploadIDMutation.isPending ? (
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 animate-spin" />
                                <span>Uploading...</span>
                            </div>
                        ) : (
                            'Submit for Review'
                        )}
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-teal-900 mb-2">Requirements:</h4>
                <ul className="text-sm text-teal-700 space-y-1">
                    <li>• Photo must be clear and well-lit</li>
                    <li>• All text should be readable</li>
                    <li>• ID must be current and not expired</li>
                    <li>• No screenshots or photocopies</li>
                    <li>• Your face should be clearly visible</li>
                </ul>
            </div>
        </div>
    )
}
