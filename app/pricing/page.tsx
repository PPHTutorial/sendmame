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
    ChevronRight
} from 'lucide-react'

// Define pricing plans
const pricingPlans = [
    {
        id: 'free',
        title: 'Personal',
        price: 0,
        description: 'Basic package delivery for individuals',
        badge: null,
        buttonText: 'Get Started',
        buttonVariant: 'outline',
        mostPopular: false
    },
    {
        id: 'standard',
        title: 'Premium',
        price: 9.99,
        description: 'Enhanced features for regular senders',
        badge: 'Most Popular',
        buttonText: 'Start Free Trial',
        buttonVariant: 'primary',
        mostPopular: true
    },
    {
        id: 'premium',
        title: 'Enterprise',
        price: 29.99,
        description: 'Advanced solutions for businesses',
        badge: 'Best Value',
        buttonText: 'Contact Sales',
        buttonVariant: 'outline',
        mostPopular: false
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
    { name: 'Delivery ETAs', free: false, standard: true, premium: true, category: 'Tracking & Notifications' },
    { name: 'Route optimization', free: false, standard: true, premium: true, category: 'Tracking & Notifications' },
    
    { name: 'Priority customer support', free: false, standard: true, premium: true, category: 'Support' },
    { name: '24/7 phone support', free: false, standard: false, premium: true, category: 'Support' },
    { name: 'Dedicated account manager', free: false, standard: false, premium: true, category: 'Support' },
    { name: 'Custom integrations', free: false, standard: false, premium: true, category: 'Support' },
    { name: 'SLA guarantees', free: false, standard: false, premium: true, category: 'Support' },
    
    { name: 'Packages per month', free: '5', standard: '50', premium: 'Unlimited', category: 'Limits', isLimit: true },
    { name: 'Custom packaging labels', free: false, standard: true, premium: true, category: 'Premium Features' },
    { name: 'International shipping', free: false, standard: true, premium: true, category: 'Premium Features' },
    { name: 'Package insurance', free: false, standard: true, premium: true, category: 'Premium Features' },
    { name: 'API access', free: false, standard: false, premium: true, category: 'Premium Features' },
    
    { name: 'Analytics dashboard', free: false, standard: true, premium: true, category: 'Analytics & Reporting' },
    { name: 'Monthly reports', free: false, standard: true, premium: true, category: 'Analytics & Reporting' },
    { name: 'Custom reports', free: false, standard: false, premium: true, category: 'Analytics & Reporting' },
    { name: 'White-label solution', free: false, standard: false, premium: true, category: 'Enterprise Features' },
    { name: 'Multiple team members', free: false, standard: '3 users', premium: 'Unlimited users', category: 'Enterprise Features', isLimit: true }
]

// Group features by category
const featuresByCategory = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
        acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
}, {} as Record<string, typeof features>);

// Partner logos
const partnerLogos = [
    { name: 'Slack', logo: 'slack' },
    { name: 'Stripe', logo: 'stripe' },
    { name: 'Avalwake', logo: 'avalwake' },
    { name: 'Spotify', logo: 'spotify' },
    { name: 'Booking.com', logo: 'booking' },
    { name: 'Gusto', logo: 'gusto' },
]

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month')
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleSubscribe = (planId: string) => {
        setSelectedPlan(planId)
        setIsLoading(true)
        
        // Simulate API call for demo purposes
        setTimeout(() => {
            console.log('Subscribing to plan:', planId)
            // TODO: Integrate with Stripe checkout
            setIsLoading(false)
            // For demo, reset after 2 seconds
            setTimeout(() => setSelectedPlan(null), 2000)
        }, 1500)
    }

    // Calculate prices based on billing cycle
    const getPrice = (basePrice: number) => {
        if (billingCycle === 'year') {
            return (basePrice * 10).toFixed(2); // 2 months free with annual billing
        }
        return basePrice.toFixed(2);
    }

    // Get pricing period label
    const getPricingPeriod = () => {
        return billingCycle === 'year' ? '/year' : '/month';
    }

    return (
        <div className="min-h-screen bg-teal-950 text-white">
            {/* Header Section */}
            <div className="max-w-screen-xl mx-auto px-4 pt-20 pb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Security. Privacy. Freedom.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">for Everyone.</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                    Send and track packages securely with our trusted service, used by millions worldwide.
                </p>
                
                {/* Billing toggle */}
                <div className="inline-flex items-center bg-gray-800/50 backdrop-blur-sm rounded-full p-1 mb-8">
                    <button
                        onClick={() => setBillingCycle('month')}
                        className={`px-4 py-2 text-sm rounded-full transition ${
                            billingCycle === 'month' 
                            ? 'bg-teal-600 text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('year')}
                        className={`px-4 py-2 text-sm rounded-full transition ${
                            billingCycle === 'year' 
                            ? 'bg-teal-600 text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Yearly
                        <span className="ml-1 text-xs bg-teal-700 text-white px-1.5 py-0.5 rounded-full">
                            Save 17%
                        </span>
                    </button>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-screen-xl mx-auto px-4 mb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                {pricingPlans.map((plan) => (
                    <div 
                        key={plan.id}
                        className={`relative rounded-2xl overflow-hidden ${
                            plan.mostPopular 
                            ? 'border-2 border-teal-500 bg-gray-900 transform md:-translate-y-4' 
                            : 'border border-gray-800 bg-gray-900/60'
                        }`}
                    >
                        {/* Plan Badge */}
                        {plan.badge && (
                            <div className="absolute top-4 right-4">
                                <span className="inline-block bg-teal-500/20 text-teal-300 text-xs font-medium px-2.5 py-1 rounded-full">
                                    {plan.badge}
                                </span>
                            </div>
                        )}
                        
                        {/* Plan Header */}
                        <div className="p-6">
                            <div className="flex items-center mb-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    plan.id === 'free' ? 'bg-gray-700' :
                                    plan.id === 'standard' ? 'bg-teal-500' :
                                    'bg-blue-600'
                                }`}>
                                    {plan.id === 'free' ? (
                                        <Package size={20} />
                                    ) : plan.id === 'standard' ? (
                                        <Zap size={20} />
                                    ) : (
                                        <Globe size={20} />
                                    )}
                                </div>
                                <h3 className="text-xl font-medium ml-3">{plan.title}</h3>
                            </div>
                            
                            <div className="mb-4 flex items-end">
                                <span className="text-4xl font-bold">${getPrice(plan.price)}</span>
                                {plan.price > 0 && (
                                    <span className="text-gray-400 ml-1">{getPricingPeriod()}</span>
                                )}
                            </div>
                            
                            <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                            
                                <Button 
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={isLoading}
                                className={`w-full mb-4 ${
                                    plan.buttonVariant === 'primary'
                                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                    : 'bg-transparent border border-gray-600 hover:border-gray-500 text-white'
                                } ${selectedPlan === plan.id ? 'opacity-80' : ''}`}
                            >
                                {isLoading && selectedPlan === plan.id ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        {plan.buttonText}
                                        {plan.buttonVariant === 'primary' && <ArrowRight className="ml-2 h-4 w-4" />}
                                    </>
                                )}
                            </Button>                            {plan.id !== 'free' && (
                                <div className="text-center text-xs text-gray-500">
                                    14-day money back guarantee
                                </div>
                            )}
                        </div>
                        
                        {/* Plan Features */}
                        <div className="p-6 bg-black/20 border-t border-gray-800">
                            <p className="text-sm text-gray-400 mb-4">
                                {plan.id === 'free' ? 'Basic features included:' : 
                                 plan.id === 'standard' ? 'Everything in Free, plus:' :
                                 'Everything in Premium, plus:'}
                            </p>
                            <ul className="space-y-3">
                                {features.filter(feature => 
                                    (plan.id === 'free' && feature.free) || 
                                    (plan.id === 'standard' && feature.standard && (!feature.free || feature.isLimit)) ||
                                    (plan.id === 'premium' && feature.premium && (!feature.standard || feature.isLimit))
                                ).slice(0, 6).map((feature, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <Check className="h-5 w-5 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">
                                            {feature.isLimit 
                                                ? `${feature.name}: ${feature[plan.id as 'free' | 'standard' | 'premium']}`
                                                : feature.name
                                            }
                                        </span>
                                        {idx === 5 && features.filter(f => 
                                            (plan.id === 'free' && f.free) || 
                                            (plan.id === 'standard' && f.standard && (!f.free || f.isLimit)) ||
                                            (plan.id === 'premium' && f.premium && (!f.standard || f.isLimit))
                                        ).length > 6 && (
                                            <ChevronRight className="h-4 w-4 text-teal-400 ml-auto flex-shrink-0" />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            {/* Partners Section */}
            <div className="max-w-screen-xl mx-auto px-4 py-12 text-center">
                <p className="text-gray-500 text-sm mb-8">
                    Our trusted partners already enjoying secure and safe deliveries
                </p>
                <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                    {partnerLogos.map((partner) => (
                        <div key={partner.name} className="bg-gray-900 px-6 py-4 rounded-lg text-gray-400">
                            {partner.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Comparison Table */}
            <div className="max-w-screen-xl mx-auto px-4 py-16">
                <h2 className="text-2xl font-bold mb-4">Compare Plans</h2>
                <p className="text-gray-400 max-w-2xl mb-12">
                    Find the perfect plan for your needs. Detailed feature comparison to help you make the right choice.
                </p>
                
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="col-span-1">
                        <span className="font-medium text-lg">Plans</span>
                    </div>
                    {pricingPlans.map((plan) => (
                        <div key={plan.id} className="col-span-1">
                            <div className={`inline-flex items-center gap-2 ${plan.mostPopular ? 'text-teal-400' : ''}`}>
                                {plan.mostPopular && <Star className="w-4 h-4 fill-teal-400" />}
                                <span className="font-medium">{plan.title}</span>
                            </div>
                            <div className="mt-1 flex items-baseline">
                                <span className="font-bold text-2xl">${getPrice(plan.price)}</span>
                                <span className="text-gray-500 ml-1 text-sm">{getPricingPeriod()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Features Table */}
                {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
                    <div key={category} className="mb-8">
                        <h3 className="text-lg font-medium text-gray-300 mb-4">{category}</h3>
                        {categoryFeatures.map((feature, idx) => (
                            <div 
                                key={idx} 
                                className={`grid grid-cols-4 gap-4 py-4 ${
                                    idx !== categoryFeatures.length - 1 ? 'border-b border-gray-800' : ''
                                }`}
                            >
                                <div className="col-span-1 text-sm text-gray-400">
                                    {feature.name}
                                </div>
                                <div className="col-span-1 text-center">
                                    {typeof feature.free === 'boolean' ? (
                                        feature.free ? 
                                            <Check className="h-5 w-5 text-teal-400 mx-auto" /> : 
                                            <X className="h-5 w-5 text-gray-600 mx-auto" />
                                    ) : (
                                        <span className="text-sm">{feature.free}</span>
                                    )}
                                </div>
                                <div className="col-span-1 text-center">
                                    {typeof feature.standard === 'boolean' ? (
                                        feature.standard ? 
                                            <Check className="h-5 w-5 text-teal-400 mx-auto" /> : 
                                            <X className="h-5 w-5 text-gray-600 mx-auto" />
                                    ) : (
                                        <span className="text-sm">{feature.standard}</span>
                                    )}
                                </div>
                                <div className="col-span-1 text-center">
                                    {typeof feature.premium === 'boolean' ? (
                                        feature.premium ? 
                                            <Check className="h-5 w-5 text-teal-400 mx-auto" /> : 
                                            <X className="h-5 w-5 text-gray-600 mx-auto" />
                                    ) : (
                                        <span className="text-sm">{feature.premium}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {/* CTA Buttons */}
                <div className="grid grid-cols-4 gap-4 mt-12">
                    <div className="col-span-1"></div>
                    {pricingPlans.map((plan) => (
                        <div key={plan.id} className="col-span-1">
                            <Button
                                onClick={() => handleSubscribe(plan.id)}
                                className={`w-full ${
                                    plan.buttonVariant === 'primary'
                                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                    : 'bg-transparent border border-gray-600 hover:border-gray-500 text-white'
                                }`}
                            >
                                {plan.buttonText}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-screen-xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Find answers to common questions about our pricing plans and services
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
                            answer: "Yes! Save 17% with our annual billing option compared to monthly payments. This discount is automatically applied when you select yearly billing."
                        },
                    ].map((faq, idx) => (
                        <div key={idx} className="bg-gray-900/60 rounded-xl p-6 border border-gray-800">
                            <h3 className="text-lg font-medium mb-2">{faq.question}</h3>
                            <p className="text-gray-400 text-sm">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Testimonials */}
            <div className="max-w-screen-xl mx-auto px-4 py-16 bg-gray-900/30">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold mb-4">What Our Customers Say</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Trusted by thousands of businesses and individuals worldwide
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {[
                        {
                            name: "Sarah Johnson",
                            role: "Small Business Owner",
                            avatar: "SJ",
                            quote: "The Premium plan has been a game-changer for my business. The real-time tracking and custom packaging have improved our customer satisfaction tremendously."
                        },
                        {
                            name: "Michael Chen",
                            role: "E-commerce Director",
                            avatar: "MC",
                            quote: "We switched to the Enterprise plan six months ago and haven't looked back. The dedicated support and custom integrations have streamlined our entire shipping process."
                        },
                        {
                            name: "Alex Rodriguez",
                            role: "Frequent Traveler",
                            avatar: "AR",
                            quote: "Even the Free plan offers amazing value. I use it for personal deliveries and the tracking is reliable and easy to use. Highly recommended!"
                        }
                    ].map((testimonial, idx) => (
                        <div key={idx} className="bg-gray-900 rounded-xl p-6 border border-gray-800 flex flex-col">
                            <div className="flex-1">
                                <p className="text-gray-300 italic mb-6">"{testimonial.quote}"</p>
                            </div>
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium mr-3">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <p className="font-medium">{testimonial.name}</p>
                                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ CTA */}
            <div className="max-w-screen-xl mx-auto px-4 py-12 bg-gray-900/50 rounded-lg my-16 grid md:grid-cols-5 gap-8 items-center">
                <div className="md:col-span-1">
                    <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-teal-400" />
                    </div>
                </div>
                <div className="md:col-span-3">
                    <h3 className="text-xl font-bold mb-2">Need a custom solution for your business?</h3>
                    <p className="text-gray-400">
                        Our team is ready to help you find the perfect solution for your company's delivery needs.
                    </p>
                </div>
                <div className="md:col-span-1">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                        Contact Sales
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <div className="max-w-screen-xl mx-auto px-4 py-8 border-t border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Amenade. All rights reserved.</p>
                    </div>
                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-white text-sm">Terms</a>
                        <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy</a>
                        <a href="#" className="text-gray-400 hover:text-white text-sm">Security</a>
                        <a href="#" className="text-gray-400 hover:text-white text-sm">Contact</a>
                    </div>
                </div>
            </div>
        </div>
    )
}