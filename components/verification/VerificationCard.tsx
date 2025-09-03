'use client'

import React from 'react'
import { Button } from '@/components/ui'

interface VerificationCardProps {
    title: string
    description: string
    icon: React.ReactNode
    status: string
    required: boolean
    onStart: () => void
    statusIcon: React.ReactNode
    statusText: string
    statusColor: string
}

export function VerificationCard({
    title,
    description,
    icon,
    status,
    required,
    onStart,
    statusIcon,
    statusText,
    statusColor
}: VerificationCardProps) {
    const getButtonText = () => {
        switch (status) {
            case 'verified':
                return 'View Details'
            case 'pending':
                return 'Check Status'
            case 'rejected':
                return 'Retry'
            default:
                return 'Start Verification'
        }
    }

    const getButtonVariant = () => {
        switch (status) {
            case 'verified':
                return 'outline'
            case 'pending':
                return 'outline'
            case 'rejected':
                return 'default'
            default:
                return 'default'
        }
    }

    return (
        <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-teal-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
            {/* Status Indicator Bar */}
            <div className={`h-1 w-full ${
                status === 'verified' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                status === 'rejected' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                'bg-gradient-to-r from-gray-200 to-gray-300'
            }`} />

            <div className="p-6">
                {/* Header with Icon and Status */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        {/* Icon Container */}
                        <div className={`relative p-3 rounded-xl ${
                            status === 'verified' ? 'bg-green-50 ring-2 ring-green-100' :
                            status === 'pending' ? 'bg-yellow-50 ring-2 ring-yellow-100' :
                            status === 'rejected' ? 'bg-red-50 ring-2 ring-red-100' :
                            'bg-teal-50 ring-2 ring-teal-100'
                        } transition-all duration-300 group-hover:scale-110`}>
                            <div className={`${
                                status === 'verified' ? 'text-green-600' :
                                status === 'pending' ? 'text-yellow-600' :
                                status === 'rejected' ? 'text-red-600' :
                                'text-teal-600'
                            }`}>
                                {icon}
                            </div>
                            
                            {/* Status Badge Overlay */}
                            <div className="absolute -top-1 -right-1">
                                {statusIcon}
                            </div>
                        </div>

                        {/* Title and Required Badge */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
                            {required && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full">
                                    Required
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Status Text */}
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                        {statusText}
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{description}</p>

                {/* Action Button */}
                <div className="flex justify-end">
                    <Button
                        variant={getButtonVariant() as any}
                        onClick={onStart}
                        className={`px-6 py-2 font-medium transition-all duration-200 ${
                            status === 'verified' 
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                : status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                                : status === 'rejected'
                                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                : 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600'
                        }`}
                    >
                        {getButtonText()}
                    </Button>
                </div>

                {/* Progress Indicator for incomplete verifications */}
                {status === 'unverified' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>Progress</span>
                            <span>0%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-teal-600 h-1.5 rounded-full w-0 transition-all duration-300"></div>
                        </div>
                    </div>
                )}

                {/* Success Message for verified items */}
                {status === 'verified' && (
                    <div className="mt-4 pt-4 border-t border-green-100">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-sm text-green-700 font-medium">
                                Verification complete! Trust score increased.
                            </p>
                        </div>
                    </div>
                )}

                {/* Pending Message */}
                {status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-yellow-100">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                            <p className="text-sm text-yellow-700">
                                Under review. We&apos;ll notify you once verified.
                            </p>
                        </div>
                    </div>
                )}

                {/* Rejection Message */}
                {status === 'rejected' && (
                    <div className="mt-4 pt-4 border-t border-red-100">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <p className="text-sm text-red-700">
                                Verification failed. Please check requirements and retry.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
        </div>
    )
}
