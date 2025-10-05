'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import {
    CheckCircle,
    Crown,
    ArrowRight,
    Home,
    Package,
    MessageSquare,
    Shield,
    Clock,
    Zap
} from 'lucide-react'

export default function SubscriptionSuccessPage() {
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Get session_id from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const session = urlParams.get('session_id')
        setSessionId(session)
        
        // Verify the payment and update user's subscription status if needed
        const verifyPayment = async (sessionId: string) => {
            try {
                const response = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sessionId }),
                });
                
                if (!response.ok) {
                    console.error('Failed to verify payment');
                }
            } catch (error) {
                console.error('Error verifying payment:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (session) {
            verifyPayment(session);
        } else {
            setIsLoading(false);
        }
    }, [])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-gray-700 font-medium">Verifying your payment...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Success Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <div className="flex justify-center mb-8">
                            <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center shadow-sm">
                                <CheckCircle className="w-14 h-14 text-teal-600" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                            Payment Successful
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Thank you for your purchase! Your premium features are now active.
                        </p>
                        {sessionId && (
                            <p className="text-sm text-gray-500 mt-4">
                                Transaction ID: {sessionId.substring(0, 8)}...{sessionId.substring(sessionId.length - 8)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* What's Next */}
                <div className="mb-16">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Get Started with Your Premium Account
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Your premium membership unlocks all features. Here are some ways to make the most of your subscription.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Link href="/packages/create" className="block">
                            <div className="group h-full bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
                                <div className="h-2 bg-teal-600"></div>
                                <div className="p-6">
                                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                                        <Package className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Create Package</h3>
                                    <p className="text-gray-600 mb-5">Post unlimited packages with premium visibility and priority matching.</p>
                                    <div className="flex items-center text-teal-600 group-hover:text-teal-700">
                                        <span className="font-medium">Get Started</span>
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link href="/trips/create" className="block">
                            <div className="group h-full bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
                                <div className="h-2 bg-teal-600"></div>
                                <div className="p-6">
                                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                                        <Crown className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Create Trip</h3>
                                    <p className="text-gray-600 mb-5">Offer your travel services globally with premium verification badge.</p>
                                    <div className="flex items-center text-teal-600 group-hover:text-teal-700">
                                        <span className="font-medium">Create Trip</span>
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link href="/dashboard" className="block">
                            <div className="group h-full bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
                                <div className="h-2 bg-teal-600"></div>
                                <div className="p-6">
                                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                                        <Home className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">View Dashboard</h3>
                                    <p className="text-gray-600 mb-5">Access detailed analytics and manage all your premium features.</p>
                                    <div className="flex items-center text-teal-600 group-hover:text-teal-700">
                                        <span className="font-medium">Go to Dashboard</span>
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Premium Features */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 mb-12">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-3 text-gray-900">
                            Your Premium Benefits
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            You now have access to these exclusive premium features
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
                                <Package className="w-5 h-5 text-teal-600" />
                            </div>
                            <p className="font-medium text-gray-900">Unlimited Posts</p>
                            <p className="text-sm text-gray-600 mt-1">Post packages & trips without limitations</p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
                                <CheckCircle className="w-5 h-5 text-teal-600" />
                            </div>
                            <p className="font-medium text-gray-900">Priority Matching</p>
                            <p className="text-sm text-gray-600 mt-1">Get matched with trusted partners first</p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
                                <Crown className="w-5 h-5 text-teal-600" />
                            </div>
                            <p className="font-medium text-gray-900">Premium Badge</p>
                            <p className="text-sm text-gray-600 mt-1">Stand out with verified premium status</p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
                                <MessageSquare className="w-5 h-5 text-teal-600" />
                            </div>
                            <p className="font-medium text-gray-900">Priority Support</p>
                            <p className="text-sm text-gray-600 mt-1">Get help from our team 24/7</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="text-center border-t border-gray-200 pt-12">
                    <h3 className="text-xl font-bold mb-6 text-gray-900">Ready to get started?</h3>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/dashboard">
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-medium shadow-sm hover:shadow transition-all duration-200 min-w-[180px]">
                                Go to Dashboard
                            </Button>
                        </Link>
                        <Link href="/packages">
                            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-lg font-medium transition-all duration-200 min-w-[180px]">
                                Browse Packages
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}