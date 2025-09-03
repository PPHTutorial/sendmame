/* eslint-disable react/no-unescaped-entities */
// Fakomame Platform - Landing Page Components
'use client'

import React from 'react'
import { Button } from '@/components/ui'
import Link from 'next/link'
import { NavigationHeader } from '../navigation'
import AnimatedBg from '../background/animatedbg'
import { services } from '@/lib/data/services'

// Hero Section Component
export function HeroSection() {
    return (
        <section className="flex bg-gradient-to-br from-teal-900 via-teal-700 to-teal-800 text-white overflow-hidden min-h-110 lg:min-h-[65vh] flex-col items-center">
            <div className=" w-full mx-auto px-4 sm:p-4 lg:p-8">
                <NavigationHeader />
            </div>



            {/* Heading */}
            <div className="flex flex-col justify-center max-w-sm md:max-w-2xl mx-auto text-center mt-8">
                <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                    Package, Crate, and Ship with Confidence
                </h1>
                <p className="text-sm md:text-lg text-gray-300 mt-4 md:mt-8">
                    Don't wait for festive seasons, special occasions, end of year or pay expensive shipping fees just to send your packages to family and friends. Just post with us and we'll connect you with travellers.
                </p>
            </div>

            <div className="flex items-center mt-16 gap-8">
                <Link href="/packages/create">
                    <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black! lg:px-8 py-4 text-lg font-extrabold shadow-xl">
                        Post Package
                    </Button>
                </Link>
                <Link href="/packages">
                    <Button variant="outline" className="border-teal-800 text-teal-600 bg-teal-950! hover:bg-white hover:text-teal-800 lg:px-8 py-4 text-lg font-extrabold">
                        Browse Packages
                    </Button>
                </Link>
                
            </div>


        </section>
    )
}

// Service Card Component
interface ServiceCardProps {
    icon: React.ReactNode
    title: string
    description: string
    highlighted?: boolean
}

export function ServiceCard({ icon, title, description, highlighted = false }: ServiceCardProps) {
    return (
        <div className={`group relative bg-white rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 lg:py-20  ${highlighted ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-white shadow-2xl' : 'border-neutral-200 hover:border-teal-500'
            }`}>
            <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${highlighted
                    ? 'bg-gradient-to-br from-teal-800 to-teal-900 text-white shadow-lg'
                    : 'bg-teal-50 text-teal-900 group-hover:bg-teal-800 group-hover:text-white group-hover:shadow-lg'
                    }`}>
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
                {highlighted ? (
                    <Button className="bg-gradient-to-r from-teal-800 to-teal-900 hover:from-teal-900 hover:to-teal-700 text-white px-6 py-2 shadow-lg">
                        Get Started →
                    </Button>
                ) : (
                    <Button variant="outline" className="border-teal-800 text-teal-900 hover:bg-teal-800 hover:text-white px-6 py-2">
                        Learn More
                    </Button>
                )}
            </div>
        </div>
    )
}

// Services Grid Component
export function ServicesGrid() {

    return (
        <section className="bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Why Choose Fakomame?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Experience the future of package delivery with our innovative platform connecting senders with travelers worldwide.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
                    {services.map((service, index) => (
                        <ServiceCard
                            key={index}
                            icon={service.icon}
                            title={service.title}
                            description={service.description}
                            highlighted={service.highlighted}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

// Quality Experience Section
export function QualitySection() {
    return (
        <section className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="bg-gradient-to-br from-teal-50 to-teal-50 rounded-3xl p-8 relative overflow-hidden">
                            {/* Illustration */}
                            <div className="relative z-10">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Package card */}
                                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                                        <div className="w-12 h-12 bg-teal-800 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                                            📦
                                        </div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Package Ready</h4>
                                        <p className="text-sm text-gray-600">Secure packaging completed</p>
                                        <div className="mt-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium inline-block">
                                            Ready for pickup
                                        </div>
                                    </div>

                                    {/* Route card */}
                                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                                        <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                                            🗺️
                                        </div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Optimal Route</h4>
                                        <p className="text-sm text-gray-600">AI-powered route selection</p>
                                        <div className="mt-3 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-medium inline-block">
                                            2.5 hrs saved
                                        </div>
                                    </div>

                                    {/* Traveler card */}
                                    <div className="bg-white rounded-2xl p-6 shadow-lg col-span-2">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                                AM
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800">Anna Martinez</h4>
                                                <p className="text-sm text-gray-600">Verified Traveler</p>
                                                <div className="flex items-center mt-1">
                                                    <div className="text-yellow-400 text-sm">★★★★★</div>
                                                    <span className="text-xs text-gray-500 ml-1">4.9 (234 reviews)</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-green-600">$45</div>
                                                <div className="text-xs text-gray-500">Est. delivery</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background decoration */}
                            <div className="absolute top-4 right-4 w-20 h-20 bg-teal-200 rounded-full opacity-20"></div>
                            <div className="absolute bottom-4 left-4 w-16 h-16 bg-teal-200 rounded-full opacity-20"></div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <div className="mb-6">
                            <span className="inline-block px-4 py-2 bg-teal-100 text-teal-900 rounded-full text-sm font-medium">
                                🎯 Smart Matching
                            </span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            Experience the<br />
                            <span className="bg-gradient-to-r from-teal-900 to-teal-600 bg-clip-text text-transparent">
                                Future of Delivery
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Our AI-powered platform connects you with the perfect traveler for your package delivery needs.
                            Enjoy real-time tracking, secure transactions, and the peace of mind that comes with our verified community.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-teal-800 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-gray-700 font-medium">AI-powered traveler matching</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-teal-800 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-gray-700 font-medium">Real-time GPS tracking</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-teal-800 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-gray-700 font-medium">Secure payment protection</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-teal-800 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-gray-700 font-medium">Insurance coverage included</span>
                            </div>
                        </div>

                        <Button className="bg-gradient-to-r from-teal-800 to-teal-600 hover:from-teal-900 hover:to-teal-700 text-white px-8 py-4 text-lg font-semibold shadow-xl">
                            Calculate Shipping Cost →
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}

// How It Works Section
export function HowItWorksSection() {
    const steps = [
        {
            number: "01",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            ),
            title: "Create Your Shipment",
            description: "Post details about your package and destination. Set your budget and timeline."
        },
        {
            number: "02",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            title: "Get Matched with Travelers",
            description: "Our AI matches you with verified travelers going your route. Compare offers and choose the best fit.",
            highlighted: true
        },
        {
            number: "03",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: "Track & Receive",
            description: "Track your package in real-time until it's safely delivered to your recipient."
        }
    ]

    return (
        <section className="bg-gradient-to-br from-gray-50 to-teal-50 py-20 text-">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        How It Works
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Send your packages in three simple steps. It&apos;s fast, secure, and affordable.
                    </p>
                </div>

                <div className="relative">
                    {/* Connection lines */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-teal-200 transform -translate-y-1/2"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {steps.map((step, index) => (
                            <div key={index} className={`relative text-center ${step.highlighted ? 'transform lg:-translate-y-4' : ''
                                }`}>
                                <div className={`relative z-10 bg-white rounded-3xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-2xl ${step.highlighted
                                    ? 'border-teal-200 bg-gradient-to-br from-teal-50 to-white'
                                    : 'border-gray-100 hover:border-teal-200'
                                    }`}>
                                    {/* Step number */}
                                    <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${step.highlighted ? 'bg-gradient-to-r from-teal-800 to-teal-600' : 'bg-gray-400'
                                        }`}>
                                        {step.number}
                                    </div>

                                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 mt-4 ${step.highlighted
                                        ? 'bg-gradient-to-br from-teal-800 to-teal-600 text-white'
                                        : 'bg-teal-50 text-teal-900'
                                        }`}>
                                        {step.icon}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-16">
                    <p className="text-gray-600 mb-6 text-lg">
                        Ready to send your first package?
                    </p>
                    <Link href="/register">
                        <Button className="bg-gradient-to-r from-teal-800 to-teal-600 hover:from-teal-900 hover:to-teal-700 text-white px-8 py-4 text-lg font-semibold shadow-xl">
                            Get Started Now →
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

// CTA Section
export function CTASection() {
    return (
        <section className="bg-gradient-to-br from-teal-900 via-teal-700 to-teal-800 text-white py-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute top-40 right-20 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 left-1/4 w-52 h-52 bg-yellow-400/20 rounded-full blur-xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                            Ready to revolutionize<br />
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                your shipping?
                            </span>
                        </h2>
                        <p className="text-teal-100 text-xl mb-8 leading-relaxed">
                            Join thousands of satisfied customers who have discovered the future of package delivery.
                            Fast, secure, and affordable shipping worldwide.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <Link href="/register">
                                <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-8 py-4 text-lg font-bold shadow-xl">
                                    Start Shipping Now
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-teal-900 px-8 py-4 text-lg font-semibold">
                                    Contact Sales
                                </Button>
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        <div className="flex items-center space-x-8">
                            <div className="text-center">
                                <div className="text-2xl font-bold">4.9★</div>
                                <div className="text-sm text-teal-200">Rating</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">50K+</div>
                                <div className="text-sm text-teal-200">Users</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">99%</div>
                                <div className="text-sm text-teal-200">Satisfaction</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                            <h3 className="text-2xl font-bold mb-6 text-center">Get Started Today</h3>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 p-4 bg-white/10 rounded-xl">
                                    <div className="w-8 h-8 bg-teal-800 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium">Free account setup</span>
                                </div>

                                <div className="flex items-center space-x-3 p-4 bg-white/10 rounded-xl">
                                    <div className="w-8 h-8 bg-teal-800 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium">No monthly fees</span>
                                </div>

                                <div className="flex items-center space-x-3 p-4 bg-white/10 rounded-xl">
                                    <div className="w-8 h-8 bg-teal-800 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium">24/7 customer support</span>
                                </div>

                                <div className="flex items-center space-x-3 p-4 bg-white/10 rounded-xl">
                                    <div className="w-8 h-8 bg-teal-800 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium">Insurance included</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// Complete Landing Page
export function LandingPage() {
    
    return (
        <div className="min-h-screen">
            <HeroSection />
            <ServicesGrid />
            <QualitySection />
            <HowItWorksSection />
            <CTASection />
        </div>
    )
}

//dorgbavueyramlydia@gmail.com
//3920230054
//Kofofridua NMC/NMCC
//7am - 11 am