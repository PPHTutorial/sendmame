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
    MessageSquare
} from 'lucide-react'

export default function SubscriptionSuccessPage() {
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Get session_id from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const session = urlParams.get('session_id')
        setSessionId(session)
        setIsLoading(false)
    }, [])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-gray-600">Verifying your subscription...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                                <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Welcome to SendMame Premium!
                        </h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            Your subscription has been activated successfully. You now have access to all premium features.
                        </p>
                        {sessionId && (
                            <p className="text-sm text-white/70 mt-4">
                                Session ID: {sessionId}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* What's Next */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="text-center mb-8">
                        <Crown className="w-12 h-12 text-teal-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            You&apos;re All Set!
                        </h2>
                        <p className="text-gray-600">
                            Here are some things you can do to get started with your premium account
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link href="/packages/create">
                            <div className="group p-6 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer">
                                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Send Your First Package</h3>
                                <p className="text-gray-600 text-sm">Create and send packages with premium features</p>
                                <div className="flex items-center text-teal-600 mt-3 group-hover:text-teal-700">
                                    <span className="text-sm font-medium">Get Started</span>
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>

                        <Link href="/trips/create">
                            <div className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create a Trip</h3>
                                <p className="text-gray-600 text-sm">Offer your travel services to senders worldwide</p>
                                <div className="flex items-center text-purple-600 mt-3 group-hover:text-purple-700">
                                    <span className="text-sm font-medium">Create Trip</span>
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>

                        <Link href="/dashboard">
                            <div className="group p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer">
                                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Home className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore Dashboard</h3>
                                <p className="text-gray-600 text-sm">View analytics and manage your account</p>
                                <div className="flex items-center text-amber-600 mt-3 group-hover:text-amber-700">
                                    <span className="text-sm font-medium">Go to Dashboard</span>
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Premium Features */}
                <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">
                            Your Premium Benefits
                        </h2>
                        <p className="text-white/90">
                            Enjoy these exclusive features with your subscription
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <Package className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium">Unlimited Packages</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium">Priority Support</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <Crown className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium">Premium Features</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium">24/7 Support</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="text-center">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/dashboard">
                            <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                                Go to Dashboard
                            </Button>
                        </Link>
                        <Link href="/packages">
                            <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 px-8 py-3 rounded-xl font-semibold transition-all duration-200">
                                Browse Packages
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}