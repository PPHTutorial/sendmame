'use client'

import React, { useState, useEffect } from 'react'
import { Button, Input } from '@/components/ui'
import { Mail, CheckCircle, Clock } from 'lucide-react'
import { useAuth, useSendEmailVerification, useVerifyEmail } from '@/lib/hooks/api'

interface EmailVerificationProps {
    onClose: () => void
}

export function EmailVerification({ onClose }: EmailVerificationProps) {
    const { getCurrentUser } = useAuth()
    const { data: user } = getCurrentUser
    const sendEmailVerification = useSendEmailVerification()
    const verifyEmail = useVerifyEmail()
    
    const [email, setEmail] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [step, setStep] = useState<'email' | 'code' | 'success'>('email')

    // Set the user's registered email when component loads and check verification status
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email)
            
            // If user is already email verified, show success state
            if (user.isEmailVerified) {
                setStep('success')
            }
        }
    }, [user])

    const handleSendCode = async () => {
        if (!email) return

        sendEmailVerification.mutate(email, {
            onSuccess: () => {
                setStep('code')
            }
        })
    }

    const handleVerifyCode = async () => {
        if (!email || !verificationCode) return

        verifyEmail.mutate({ email, code: verificationCode }, {
            onSuccess: () => {
                setStep('success')
                // Automatically close after a short delay to show success
                setTimeout(() => {
                    onClose()
                }, 2000)
            }
        })
    }

    const handleResendCode = async () => {
        if (!email) return

        sendEmailVerification.mutate(email)
    }

    if (step === 'success') {
        return (
            <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Verified!</h3>
                <p className="text-gray-600 mb-6">
                    Your email address has been successfully verified.
                </p>
                <Button onClick={onClose}>
                    Close
                </Button>
            </div>
        )
    }

    if (step === 'code') {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                        <Mail className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h3>
                    <p className="text-gray-600">
                        We&apos;ve sent a 6-digit verification code to <strong>{email}</strong>
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Code
                        </label>
                        <Input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            maxLength={6}
                            className="text-center text-lg tracking-widest"
                        />
                    </div>

                    <div className="flex space-x-3">
                        <Button
                            onClick={handleVerifyCode}
                            disabled={!verificationCode || verificationCode.length !== 6 || verifyEmail.isPending}
                            className="flex-1"
                        >
                            {verifyEmail.isPending ? (
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 animate-spin" />
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                'Verify Code'
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleResendCode}
                            disabled={sendEmailVerification.isPending}
                        >
                            Resend
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Verify Your Email</h3>
                <p className="text-gray-600">
                    We&apos;ll send a verification code to your registered email address
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registered Email Address
                    </label>
                    <Input
                        type="email"
                        value={email}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                        placeholder={user ? "Loading..." : "No email found"}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        This is the email address you registered with
                    </p>
                </div>

                <div className="flex space-x-3">
                    <Button
                        onClick={handleSendCode}
                        disabled={!email || sendEmailVerification.isPending}
                        className="flex-1"
                    >
                        {sendEmailVerification.isPending ? (
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 animate-spin" />
                                <span>Sending...</span>
                            </div>
                        ) : (
                            'Send Verification Code'
                        )}
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-teal-900 mb-2">Why verify your email?</h4>
                <ul className="text-sm text-teal-700 space-y-1">
                    <li>• Receive important notifications about your packages and trips</li>
                    <li>• Secure your account with email-based authentication</li>
                    <li>• Enable password reset functionality</li>
                    <li>• Increase your trust score on the platform</li>
                </ul>
            </div>
        </div>
    )
}
