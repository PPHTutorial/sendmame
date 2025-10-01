'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui'
import {
    Check,
    Crown,
    Zap,
    Package,
    Plane,
    Shield,
    HeadphonesIcon,
    CreditCard,
    Sparkles
} from 'lucide-react'

const pricingTiers = [
    {
        id: 'starter',
        name: 'Starter',
        price: 9.99,
        interval: 'month',
        description: 'Perfect for occasional senders',
        icon: Package,
        color: 'from-slate-500 to-slate-600',
        bgColor: 'from-slate-50 to-slate-100',
        borderColor: 'border-slate-200',
        features: [
            'Up to 5 packages per month',
            'Basic tracking',
            'Email support',
            'Mobile app access',
            'Standard delivery options'
        ],
        popular: false
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 24.99,
        interval: 'month',
        description: 'For regular business users',
        icon: Plane,
        color: 'from-teal-500 to-teal-600',
        bgColor: 'from-teal-50 to-teal-100',
        borderColor: 'border-teal-200',
        features: [
            'Unlimited packages',
            'Real-time GPS tracking',
            'Priority customer support',
            'Express delivery options',
            'Custom packaging labels',
            'Monthly analytics report',
            'API access'
        ],
        popular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 49.99,
        interval: 'month',
        description: 'For large organizations',
        icon: Crown,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'from-blue-50 to-blue-100',
        borderColor: 'border-blue-200',
        features: [
            'Everything in Professional',
            'Dedicated account manager',
            'White-label solution',
            'Advanced analytics dashboard',
            'Custom integrations',
            '24/7 phone support',
            'Bulk operations',
            'SLA guarantees'
        ],
        popular: false
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 99.99,
        interval: 'month',
        description: 'Ultimate delivery experience',
        icon: Sparkles,
        color: 'from-indigo-500 to-purple-600',
        bgColor: 'from-indigo-50 to-purple-100',
        borderColor: 'border-indigo-200',
        features: [
            'Everything in Enterprise',
            'VIP concierge service',
            'Instant same-day delivery',
            'Global network priority',
            'Custom insurance options',
            'Real-time notifications',
            'Advanced route optimization',
            'Executive support line'
        ],
        popular: false
    }
]

export default function SubscriptionPage() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubscribe = async (planId: string) => {
        setIsLoading(true)
        setSelectedPlan(planId)

        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            })

            if (!response.ok) {
                throw new Error('Failed to create checkout session')
            }

            const { url } = await response.json()
            window.location.href = url
        } catch (error) {
            console.error('Subscription error:', error)
            alert('Failed to start subscription process. Please try again.')
        } finally {
            setIsLoading(false)
            setSelectedPlan(null)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-blue-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                                <Crown className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            Choose Your Plan
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
                            Unlock the full potential of global delivery with our flexible subscription plans
                        </p>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {pricingTiers.map((tier) => {
                        const Icon = tier.icon
                        const isSelected = selectedPlan === tier.id

                        return (
                            <div
                                key={tier.id}
                                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                                    tier.popular ? 'ring-2 ring-teal-500 scale-105' : ''
                                }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                <div className={`bg-gradient-to-r ${tier.bgColor} p-8 rounded-t-2xl`}>
                                    <div className={`w-16 h-16 bg-gradient-to-r ${tier.color} rounded-xl flex items-center justify-center shadow-lg mb-4`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                                    <p className="text-gray-600 mb-4">{tier.description}</p>
                                    <div className="flex items-baseline">
                                        <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
                                        <span className="text-gray-600 ml-2">/{tier.interval}</span>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <ul className="space-y-4 mb-8">
                                        {tier.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className={`w-5 h-5 bg-gradient-to-r ${tier.color} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={() => handleSubscribe(tier.id)}
                                        disabled={isLoading}
                                        className={`w-full h-12 bg-gradient-to-r ${tier.color} hover:opacity-90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                                            isSelected ? 'animate-pulse' : ''
                                        }`}
                                    >
                                        {isLoading && isSelected ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Processing...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4" />
                                                Subscribe Now
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Features Comparison */}
                <div className="mt-20 bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Why Choose SendMame?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Join thousands of satisfied customers who trust us with their valuable shipments worldwide
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
                            <p className="text-gray-600">
                                Advanced security measures and real-time tracking ensure your packages arrive safely
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                            <p className="text-gray-600">
                                Express delivery options and optimized routes get your packages where they need to be
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <HeadphonesIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
                            <p className="text-gray-600">
                                Our dedicated support team is always ready to help with any questions or concerns
                            </p>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-16 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h3>
                            <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
                            <p className="text-gray-600">We offer a 14-day free trial for all plans. No credit card required to get started.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                            <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
                            <p className="text-gray-600">Absolutely! You can cancel your subscription at any time with no cancellation fees.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}