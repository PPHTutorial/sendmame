'use client'

import React, { useState } from 'react'
import { Button, Modal } from '@/components/ui'
import { VerificationCard } from '@/components/verification/VerificationCard'
import { EmailVerification } from '@/components/verification/EmailVerification'
import { PhoneVerification } from '@/components/verification/PhoneVerification'
import { IDVerification } from '@/components/verification/IDVerification'
import { FacialVerification } from '@/components/verification/FacialVerification'
import { AddressVerification } from '@/components/verification/AddressVerification'
import { ProtectedVerificationLayout } from '@/components/verification/ProtectedVerificationLayout'
import { useAuth } from '@/lib/hooks/api'
import { CheckCircle, Clock, XCircle, Shield, Mail, Phone, CreditCard, Camera, MapPin } from 'lucide-react'

export default function VerificationPage() {
    return (
        <ProtectedVerificationLayout>
            <VerificationContent />
        </ProtectedVerificationLayout>
    )
}

function VerificationContent() {
    const { getCurrentUser } = useAuth()
    const { data: user } = getCurrentUser

    const [activeVerification, setActiveVerification] = useState<string | null>(null)

    // Verification status based on user data
    const verificationStatus = {
        email: user?.isEmailVerified ? 'verified' : 'unverified',
        phone: user?.isPhoneVerified ? 'verified' : 'unverified',
        id: user?.isIDVerified ? 'verified' : 'unverified',
        facial: user?.isFacialVerified ? 'verified' : 'unverified',
        address: user?.isAddressVerified ? 'verified' : 'unverified'
    }

    // Get the next verification step that needs to be completed
    const getNextVerificationStep = () => {
        const verificationOrder = ['email', 'phone', 'id', 'facial', 'address']
        
        for (const step of verificationOrder) {
            if (verificationStatus[step as keyof typeof verificationStatus] !== 'verified') {
                return step
            }
        }
        
        return null // All verifications completed
    }

    const nextStep = getNextVerificationStep()

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />
            default:
                return <Clock className="w-5 h-5 text-gray-400" />
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'verified':
                return 'Verified'
            case 'pending':
                return 'Pending Review'
            case 'rejected':
                return 'Rejected'
            default:
                return 'Not Started'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified':
                return 'text-green-600 bg-green-50 border-green-200'
            case 'pending':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'rejected':
                return 'text-red-600 bg-red-50 border-red-200'
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const openVerification = (type: string) => {
        setActiveVerification(type)
    }

    const closeVerification = () => {
        setActiveVerification(null)
    }

    const renderActiveVerification = () => {
        const baseProps = { onClose: closeVerification }

        switch (activeVerification) {
            case 'email':
                return (
                    <Modal
                        isOpen={true}
                        onClose={closeVerification}
                        title="Email Verification"
                        size="lg"
                    >
                        <EmailVerification {...baseProps} />
                    </Modal>
                )
            case 'phone':
                return (
                    <Modal
                        isOpen={true}
                        onClose={closeVerification}
                        title="Phone Verification"
                        size="lg"
                    >
                        <PhoneVerification {...baseProps} />
                    </Modal>
                )
            case 'id':
                return (
                    <Modal
                        isOpen={true}
                        onClose={closeVerification}
                        title="ID Verification"
                        size="xl"
                    >
                        <IDVerification {...baseProps} />
                    </Modal>
                )
            case 'facial':
                return (
                    <Modal
                        isOpen={true}
                        onClose={closeVerification}
                        title="Facial Verification"
                        size="lg"
                    >
                        <FacialVerification {...baseProps} />
                    </Modal>
                )
            case 'address':
                return (
                    <Modal
                        isOpen={true}
                        onClose={closeVerification}
                        title="Address Verification"
                        size="lg"
                    >
                        <AddressVerification {...baseProps} />
                    </Modal>
                )
            default:
                return null
        }
    }

    // Calculate completion percentage
    const completedCount = Object.values(verificationStatus).filter(status => status === 'verified').length
    const totalCount = Object.values(verificationStatus).length
    const completionPercentage = Math.round((completedCount / totalCount) * 100)

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="w-10 h-10 text-teal-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Account Verification
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Complete your account verification to build trust with the community and unlock all platform features.
                        Higher verification levels lead to better visibility and opportunities.
                    </p>
                    <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                        {completedCount} of {totalCount} verifications completed
                    </div>
                </div>

                {/* Next Step Prompt */}
                {nextStep && (
                    <div className="mb-8 bg-gradient-to-r from-teal-500 to-teal-500 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Next Step</h3>
                                <p className="text-teal-100">
                                    Complete your {nextStep} verification to continue building your trust score.
                                </p>
                            </div>
                            <Button
                                onClick={() => openVerification(nextStep)}
                                variant="outline"
                                className="bg-white text-teal-600 hover:bg-teal-50 border-white"
                            >
                                Start Verification
                            </Button>
                        </div>
                    </div>
                )}

                {/* Verification Cards Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <VerificationCard
                        icon={<Mail className="w-6 h-6" />}
                        title="Email Verification"
                        description="Verify your email address to receive important notifications"
                        status={verificationStatus.email}
                        statusIcon={getStatusIcon(verificationStatus.email)}
                        statusText={getStatusText(verificationStatus.email)}
                        statusColor={getStatusColor(verificationStatus.email)}
                        required={true}
                        onStart={() => openVerification('email')}
                    />

                    <VerificationCard
                        icon={<Phone className="w-6 h-6" />}
                        title="Phone Verification"
                        description="Verify your phone number for enhanced security"
                        status={verificationStatus.phone}
                        statusIcon={getStatusIcon(verificationStatus.phone)}
                        statusText={getStatusText(verificationStatus.phone)}
                        statusColor={getStatusColor(verificationStatus.phone)}
                        required={true}
                        onStart={() => openVerification('phone')}
                    />

                    <VerificationCard
                        icon={<CreditCard className="w-6 h-6" />}
                        title="ID Verification"
                        description="Upload a government-issued ID for identity verification"
                        status={verificationStatus.id}
                        statusIcon={getStatusIcon(verificationStatus.id)}
                        statusText={getStatusText(verificationStatus.id)}
                        statusColor={getStatusColor(verificationStatus.id)}
                        required={true}
                        onStart={() => openVerification('id')}
                    />

                    <VerificationCard
                        icon={<Camera className="w-6 h-6" />}
                        title="Facial Verification"
                        description="Take a selfie to match with your ID photo"
                        status={verificationStatus.facial}
                        statusIcon={getStatusIcon(verificationStatus.facial)}
                        statusText={getStatusText(verificationStatus.facial)}
                        statusColor={getStatusColor(verificationStatus.facial)}
                        required={false}
                        onStart={() => openVerification('facial')}
                    />

                    <VerificationCard
                        icon={<MapPin className="w-6 h-6" />}
                        title="Address Verification"
                        description="Verify your address with a utility bill or bank statement"
                        status={verificationStatus.address}
                        statusIcon={getStatusIcon(verificationStatus.address)}
                        statusText={getStatusText(verificationStatus.address)}
                        statusColor={getStatusColor(verificationStatus.address)}
                        required={false}
                        onStart={() => openVerification('address')}
                    />
                </div>

                {/* Trust Score */}
                <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Score</h3>
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Current Score</span>
                                <span className="text-2xl font-bold text-teal-600">{completionPercentage}/100</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-gradient-to-r from-teal-500 to-green-500 h-4 rounded-full transition-all duration-300"
                                    style={{ width: `${completionPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                        A higher trust score increases your visibility and credibility on the platform.
                        Complete all verifications to achieve a 100% trust score.
                    </p>
                </div>
            </div>

            {/* Active Verification Modal */}
            {activeVerification && renderActiveVerification()}
        </div>
    )
}
