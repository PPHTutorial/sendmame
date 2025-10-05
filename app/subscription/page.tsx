/* eslint-disable react/no-unescaped-entities */
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui'

import {
    Check,
    X,
    CreditCard,
    ShieldCheck,
    Globe,
    Zap,
    Package,
    Star,
    ArrowRight,
    ChevronRight,
    Users,
    Clock,
    Sparkles
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface PricingPlan {
    id: string
    title: string
    price: number
    description: string
    badge: string | null
    buttonText: string
    buttonVariant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    mostPopular: boolean
    maxPost: number
    icon: React.ReactNode
}

// Define pricing plans
export const pricingPlans: PricingPlan[] = [
    {
        id: 'free',
        title: 'Personal',
        price: 0,
        description: 'Basic package delivery for individuals who casually send or deliver packages',
        badge: null,
        buttonText: 'Current Plan',
        buttonVariant: 'outline',
        mostPopular: false,
        maxPost: 3,
        icon: <Package className="h-6 w-6 text-gray-600" />

    },
    {
        id: 'standard',
        title: 'Premium',
        price: 7.99,
        description: 'Enhanced features for regular senders and travelers often transact more within a month',
        badge: 'Most Popular',
        buttonText: 'Subscribe Now',
        buttonVariant: 'default',
        mostPopular: true,
        maxPost: 10,
        icon: <Star className="h-6 w-6 text-teal-500" />
    },
    {
        id: 'premium',
        title: 'Enterprise',
        price: 19.99,
        description: 'Advanced solutions for businesses with tracking needs and premium support',
        badge: 'Best Value',
        buttonText: 'Subscribe Now',
        buttonVariant: 'outline',
        mostPopular: false,
        maxPost: 50,
        icon: <CreditCard className="h-6 w-6 text-gray-500" />
    }
]

// Define features with availability per plan
const features = [
    { name: 'Basic package tracking', free: true, standard: true, premium: true, category: 'Core Features' },
    { name: 'Email notifications', free: true, standard: true, premium: true, category: 'Core Features' },
    { name: 'Mobile app access', free: true, standard: true, premium: true, category: 'Core Features' },
    { name: 'Community support', free: true, standard: true, premium: true, category: 'Core Features' },
    { name: 'Package delivery history', free: true, standard: true, premium: true, category: 'Core Features' },

    { name: 'Real-time GPS tracking', free: false, standard: true, premium: true, category: 'Tracking & Notifications' },
    { name: 'Push notifications', free: false, standard: true, premium: true, category: 'Tracking & Notifications' },
    { name: 'SMS alerts', free: false, standard: true, premium: true, category: 'Tracking & Notifications' },
    { name: 'Delivery ETAs', free: false, standard: false, premium: true, category: 'Tracking & Notifications' },
    { name: 'Route optimization', free: false, standard: false, premium: true, category: 'Tracking & Notifications' },

    { name: 'Priority customer support', free: false, standard: true, premium: true, category: 'Support' },
    { name: '24/7 phone support', free: false, standard: false, premium: true, category: 'Support' },
    { name: 'Dedicated account manager', free: false, standard: false, premium: true, category: 'Support' },
    { name: 'Custom integrations', free: false, standard: false, premium: true, category: 'Support' },
    { name: 'SLA guarantees', free: false, standard: false, premium: true, category: 'Support' },

    { name: 'Total Posts per month', free: 'Three (3)', standard: 'Ten (10)', premium: 'Fifty (50)', category: 'Limits', isLimit: true },
    { name: 'Custom packaging labels', free: false, standard: true, premium: true, category: 'Premium Features' },
    { name: 'International shipping', free: false, standard: true, premium: true, category: 'Premium Features' },
    // { name: 'Package insurance', free: false, standard: false, premium: true, category: 'Premium Features' },

    { name: 'Analytics dashboard', free: false, standard: true, premium: true, category: 'Analytics & Reporting' },
    { name: 'Monthly reports', free: false, standard: true, premium: true, category: 'Analytics & Reporting' },
    { name: 'Custom reports', free: false, standard: false, premium: true, category: 'Analytics & Reporting' },
    { name: 'White-label solution', free: false, standard: false, premium: true, category: 'Enterprise Features' },
]

// Group features by category
const featuresByCategory = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
        acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
}, {} as Record<string, typeof features>);

export default function SubscriptionPage() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubscribe = async (planId: string) => {
        setIsLoading(true)
        setSelectedPlan(planId)

        if (planId !== 'free') {

            try {
                // Find the selected plan details
                const selectedPlan = pricingPlans.find(plan => plan.id === planId);
                if (!selectedPlan) {
                    throw new Error('Plan not found');
                }

                const planData = {
                    planId: selectedPlan.id,
                    title: selectedPlan.title,
                    price: Math.round(selectedPlan.price * 100), // Convert to cents for Stripe
                    description: selectedPlan.description
                };

                const response = await fetch('/api/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(planData)
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
        } else {
            toast.success('You are already on the Free plan.')
            setIsLoading(false)
            setSelectedPlan(null)
        }
    }

    function getPrice(price: number): React.ReactNode {
        // Return "Free" if price is 0, otherwise format the value to two decimal places.
        if (price === 0) {
            return 'Free';
        }
        return `£${price.toFixed(2)}`;
    }

    function getPricingPeriod() {
        return "/month"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">

            {/* Pricing content */}
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900">Choose Your Plan</h1>
                    <p className="mt-4 text-lg text-gray-600">Simplemonthly payment plans to suit your package delivery needs.</p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                    {pricingPlans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col bg-white rounded-xl shadow-lg border ${plan.mostPopular
                                ? 'border-teal-500 shadow-teal-100 ring-2 ring-teal-500 scale-105 z-10'
                                : 'border-gray-100'
                                } p-6 gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3 right-6">
                                    <div className="bg-teal-500 text-white text-xs font-semibold py-1 px-3 rounded-full shadow-sm">
                                        {plan.badge}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-3 mb-2">
                                <div className={`p-3 rounded-full ${plan.id === 'free' ? 'bg-gray-100' :
                                    plan.id === 'standard' ? 'bg-teal-100' :
                                        'bg-blue-100'
                                    }`}>
                                    {plan.icon}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{plan.title}</h2>
                            </div>

                            <p className="mt-2 text-gray-600 text-sm">{plan.description}</p>

                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-extrabold text-gray-900">{getPrice(plan.price)}</span>
                                <span className="text-gray-500 ml-2 text-sm">{getPricingPeriod()}</span>
                            </div>

                            <ul className="mt-6 space-y-4 flex-1 mb-6">
                                {features.filter(feature =>
                                    (plan.id === 'free' && feature.free) ||
                                    (plan.id === 'standard' && feature.standard && (!feature.free || feature.isLimit)) ||
                                    (plan.id === 'premium' && feature.premium && (!feature.standard || feature.isLimit))
                                ).slice(0, 12).map((feature, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <Check className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${plan.id === 'free' ? 'text-gray-500' :
                                            plan.id === 'standard' ? 'text-teal-500' :
                                                'text-teal-700'
                                            }`} />
                                        <span className="text-sm text-gray-700">
                                            {feature.isLimit
                                                ? `${feature.name}: ${feature[plan.id as 'free' | 'standard' | 'premium']}`
                                                : feature.name
                                            }
                                        </span>
                                    </li>
                                ))}
                                {/* <li className="flex items-center text-teal-600 text-sm font-medium pt-2">
                                    <ArrowRight className="h-4 w-4 mr-1" />
                                    See all features
                                </li> */}
                            </ul>

                            <Button
                                onClick={() => handleSubscribe(plan.id)}
                                variant={plan.buttonVariant as any}
                                disabled={isLoading && selectedPlan === plan.id}
                                className={`mt-auto ${plan.buttonVariant === 'default'
                                    ? 'bg-teal-600 text-white hover:bg-teal-700 hover:text-teal-200'
                                    : ''
                                    }`}
                            >
                                {isLoading && selectedPlan === plan.id ? (
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        {plan.buttonText}
                                    </div>
                                )}
                            </Button>

                            {/* {plan.id !== 'free' && (
                                <div className="text-center text-xs text-gray-500 mt-2">
                                    14-day money back guarantee
                                </div>
                            )} */}
                        </div>
                    ))}
                </div>

                {/* Feature comparison */}
                <div className="mt-24 bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-teal-600 px-8 py-6">
                        <h2 className="text-2xl font-bold text-white">Compare Features</h2>
                        <p className="text-teal-100">Find the perfect plan for your shipping needs</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Features</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Personal</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 bg-teal-50">Premium</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
                                    <React.Fragment key={category}>
                                        <tr className="bg-gray-50">
                                            <td colSpan={4} className="px-6 py-3 text-sm font-medium text-teal-700">{category}</td>
                                        </tr>
                                        {categoryFeatures.map((feature, featureIndex) => (
                                            <tr key={`${category}-${featureIndex}`} className={featureIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-6 py-3 text-sm text-gray-700">{feature.name}</td>
                                                <td className="px-6 py-3 text-center">
                                                    {feature.isLimit ? (
                                                        <span className="text-sm">{feature.free}</span>
                                                    ) : (
                                                        feature.free ? (
                                                            <Check className="h-5 w-5 mx-auto text-teal-500" />
                                                        ) : (
                                                            <X className="h-5 w-5 mx-auto text-gray-400" />
                                                        )
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-center bg-teal-50">
                                                    {feature.isLimit ? (
                                                        <span className="text-sm font-medium">{feature.standard}</span>
                                                    ) : (
                                                        feature.standard ? (
                                                            <Check className="h-5 w-5 mx-auto text-teal-500" />
                                                        ) : (
                                                            <X className="h-5 w-5 mx-auto text-gray-400" />
                                                        )
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    {feature.isLimit ? (
                                                        <span className="text-sm">{feature.premium}</span>
                                                    ) : (
                                                        feature.premium ? (
                                                            <Check className="h-5 w-5 mx-auto text-teal-500" />
                                                        ) : (
                                                            <X className="h-5 w-5 mx-auto text-gray-400" />
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Testimonials */}
                <div className="mt-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            Thousands of businesses and individuals trust our platform for their shipping needs
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                name: "Sarah Johnson",
                                role: "Small Business Owner",
                                quote: "The Premium plan has been a game-changer for my business. The real-time tracking and custom packaging have improved our customer satisfaction tremendously.",
                                avatar: "SJ",
                            },
                            {
                                name: "Michael Chen",
                                role: "E-commerce Director",
                                quote: "We switched to the Enterprise plan six months ago and haven't looked back. The dedicated support and custom integrations have streamlined our entire shipping process.",
                                avatar: "MC",
                            },
                            {
                                name: "Alex Rodriguez",
                                role: "Frequent Traveler",
                                quote: "Even the Free plan offers amazing value. I use it for personal deliveries and the tracking is reliable and easy to use. Highly recommended!",
                                avatar: "AR",
                            }
                        ].map((testimonial, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col">
                                <div className="flex-1">
                                    <div className="text-teal-600 mb-2 text-2xl">"</div>
                                    <p className="text-gray-700 italic mb-4">{testimonial.quote}</p>
                                    <div className="text-teal-600 text-right text-2xl">"</div>
                                </div>
                                <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-medium mr-3">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{testimonial.name}</p>
                                        <p className="text-gray-500 text-sm">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            Find answers to common questions about our subscription plans
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 mb-16">
                        {[
                            {
                                question: "Can I change my plan later?",
                                answer: "Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes to your plan will be reflected immediately in your account."
                            },
                            {
                                question: "How does the free trial work?",
                                answer: "Our 14-day free trial gives you full access to all premium features. No credit card is required to start. You can cancel anytime during the trial period with no charges."
                            },
                            {
                                question: "What payment methods do you accept?",
                                answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and for Enterprise customers, we also offer invoice-based payments."
                            },
                            {
                                question: "Are there any hidden fees?",
                                answer: "No, the price you see is the price you pay. There are no setup fees, hidden charges, or additional costs beyond what's listed in your selected plan."
                            },
                            {
                                question: "How secure is your package delivery?",
                                answer: "We employ industry-standard security measures including end-to-end encryption, secure authentication, and real-time tracking to ensure your packages are delivered safely."
                            },
                            {
                                question: "Do you offer discounts for annual billing?",
                                answer: "Yes! Save up to 20% with our annual billing option compared to monthly payments. Contact our sales team for more details."
                            },
                        ].map((faq, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-16 mb-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl overflow-hidden shadow-xl">
                    <div className="px-8 py-12 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Ready to get started?</h3>
                            <p className="text-teal-100 max-w-xl">
                                Join thousands of satisfied customers who trust us with their valuable shipments worldwide
                            </p>
                        </div>
                        <div className="mt-6 sm:mt-0 sm:ml-6">
                            <Link href="/" className="flex items-center rounded-full bg-white text-teal-600 hover:bg-teal-50 font-medium px-6 py-3">
                                Start Free Trial
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}