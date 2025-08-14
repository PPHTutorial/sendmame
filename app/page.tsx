/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import Link from 'next/link'
import { ArrowRightIcon, TruckIcon, UsersIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { GlobeIcon } from "lucide-react"

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <TruckIcon className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Fakomame</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/packages" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Browse Packages
              </Link>
              <Link href="/trips" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Find Trips
              </Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors">
                How It Works
              </Link>
            </nav>
            <div className="flex space-x-4">
              <Link 
                href="/auth/login"
                className="px-4 py-2 text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect
            <span className="text-indigo-600"> Senders </span>
            with
            <span className="text-purple-600"> Travelers</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Fakomame is a globally scalable platform that connects people who need to send packages 
            with travelers heading in the same direction. Fast, reliable, and cost-effective delivery 
            powered by community trust.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/auth/register?role=sender"
              className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Send a Package
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/auth/register?role=traveler"
              className="inline-flex items-center px-8 py-4 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Become a Traveler
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <TruckIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Get your packages delivered faster than traditional shipping services through our traveler network.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <UsersIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Driven</h3>
            <p className="text-gray-600">
              Built on trust and mutual benefit. Travelers earn money while senders get affordable delivery.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <GlobeIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Reach</h3>
            <p className="text-gray-600">
              Send packages anywhere in the world with our international network of verified travelers.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Insured</h3>
            <p className="text-gray-600">
              Every package is tracked and insured. Our verification system ensures trusted deliveries.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How Fakomame Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Post Your Package</h3>
              <p className="text-gray-600">
                Describe your package, pickup location, destination, and when you need it delivered.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Match with Travelers</h3>
              <p className="text-gray-600">
                Our platform connects you with verified travelers going your package's route.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Track & Receive</h3>
              <p className="text-gray-600">
                Track your package in real-time and receive it safely at your destination.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">50K+</div>
            <div className="text-gray-600">Packages Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">15K+</div>
            <div className="text-gray-600">Active Travelers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">120+</div>
            <div className="text-gray-600">Countries Served</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">4.9</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Join thousands of users who trust Fakomame for their package delivery needs.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Create Your Account
            <ArrowRightIcon className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TruckIcon className="w-6 h-6 text-indigo-600" />
                <span className="text-lg font-bold text-gray-900">Fakomame</span>
              </div>
              <p className="text-gray-600">
                Connecting the world through community-driven package delivery.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
              <div className="space-y-2">
                <Link href="/packages" className="block text-gray-600 hover:text-indigo-600">Browse Packages</Link>
                <Link href="/trips" className="block text-gray-600 hover:text-indigo-600">Find Trips</Link>
                <Link href="/how-it-works" className="block text-gray-600 hover:text-indigo-600">How It Works</Link>
                <Link href="/pricing" className="block text-gray-600 hover:text-indigo-600">Pricing</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <div className="space-y-2">
                <Link href="/help" className="block text-gray-600 hover:text-indigo-600">Help Center</Link>
                <Link href="/safety" className="block text-gray-600 hover:text-indigo-600">Safety</Link>
                <Link href="/contact" className="block text-gray-600 hover:text-indigo-600">Contact Us</Link>
                <Link href="/dispute" className="block text-gray-600 hover:text-indigo-600">Report Issue</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <div className="space-y-2">
                <Link href="/terms" className="block text-gray-600 hover:text-indigo-600">Terms of Service</Link>
                <Link href="/privacy" className="block text-gray-600 hover:text-indigo-600">Privacy Policy</Link>
                <Link href="/cookies" className="block text-gray-600 hover:text-indigo-600">Cookie Policy</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2025 Fakomame. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
