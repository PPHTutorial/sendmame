'use client'

import React from 'react'
import { Button } from '@/components/ui'
import {
  MapPin,
  Users,
  Shield,
  Globe,
  Award,
  Heart,
  CheckCircle,
  Star,
  ArrowRight,
  Package,
  Plane,
  Clock,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Footer } from '@/components/navigation'
import { NavHeader } from '@/components/shared'

// Stats
const stats = [
  { label: 'Packages Delivered', value: '50,000+', icon: Package },
  { label: 'Active Travelers', value: '10,000+', icon: Users },
  { label: 'Countries Served', value: '120+', icon: Globe },
  { label: 'Customer Satisfaction', value: '98%', icon: Star }
]

// Values
const values = [
  {
    title: 'Trust & Safety',
    description: 'Every user is verified, every package is ensured of safety and originality, and every transaction is secure.',
    icon: Shield
  },
  {
    title: 'Global Community',
    description: 'Connecting people across borders to make the world more accessible and connected.',
    icon: Globe
  },
  {
    title: 'Sustainability',
    description: 'Reducing environmental impact by utilizing existing travel routes and luggage space.',
    icon: Heart
  },
  {
    title: 'Innovation',
    description: 'Constantly improving our platform with the latest technology and user feedback.',
    icon: Award
  }
]

// Team (Mock data)
const team = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Co-Founder',
    bio: 'Former logistics executive with 15+ years experience in international shipping.',
    avatar: null
  },
  {
    name: 'Marcus Chen',
    role: 'CTO & Co-Founder',
    bio: 'Tech entrepreneur and software architect, previously at major fintech companies.',
    avatar: null
  },
  {
    name: 'Elena Rodriguez',
    role: 'Head of Operations',
    bio: 'Operations specialist focused on safety, compliance, and user experience.',
    avatar: null
  },
  {
    name: 'David Kim',
    role: 'Head of Product',
    bio: 'Product manager with expertise in marketplace platforms and user behavior.',
    avatar: null
  }
]

// How it works steps
const howItWorks = [
  {
    step: '1',
    title: 'Post Your Package',
    description: 'Create a listing with pickup/delivery details and your budget.',
    icon: Package
  },
  {
    step: '2',
    title: 'Find a Traveler',
    description: 'Travelers browse packages and offer to deliver yours.',
    icon: Users
  },
  {
    step: '3',
    title: 'Secure Handover',
    description: 'Meet at the pickup location and hand over your package safely.',
    icon: Shield
  },
  {
    step: '4',
    title: 'Track & Deliver',
    description: 'Track your package and confirm delivery at the destination.',
    icon: CheckCircle
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavHeader title={'AMENADE'} showMenuItems={true} />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-teal-600 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-30">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Making Global Delivery Personal
            </h1>
            <p className="text-xl md:text-2xl text-teal-100 mb-8 max-w-3xl mx-auto">
              Amenade connects travelers with people who need to send packages,
              creating a global network of trusted delivery powered by human connections.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <Link className="flex items-center gap-1" href="/packages/create">
                  <Package className="w-5 h-5 mr-2" />
                  Send a Package
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-input hover:bg-white hover:text-teal-600">
                <Link className="flex items-center gap-1" href="/trips/create">
                  <Plane className="w-5 h-5 mr-2" />
                  Offer to Deliver
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        {/* <div className="absolute inset-0 bg-black/50"></div> */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 text-teal-800" fill="currentColor" viewBox="0 0 100 20">
            <polygon points="0,20 100,0 100,20"></polygon>
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-teal-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                We believe that shipping should be affordable, fast, and personal. Traditional shipping
                companies charge high fees and take weeks for international delivery. We&apos;re changing
                that by connecting people who need to send packages with travelers who have spare
                luggage space.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our platform creates a win-win situation: senders get affordable, fast delivery,
                while travelers earn money to offset their travel costs. Everyone wins, and the
                environment benefits from reduced shipping carbon footprint.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span className="text-gray-700">Faster than traditional shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-teal-600" />
                  <span className="text-gray-700">Up to 70% cheaper</span>
                </div>
              </div>
            </div>
            <div className="lg:pl-8">
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Global Reach</h3>
                      <p className="text-gray-600 text-sm">Connecting 120+ countries worldwide</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Secure & Insured</h3>
                      <p className="text-gray-600 text-sm">Every package protected up to $500</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Verified Community</h3>
                      <p className="text-gray-600 text-sm">All users go through identity verification</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Amenade Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it simple to send packages anywhere in the world through our
              community of verified travelers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 text-white rounded-full text-xl font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>

                {/* Arrow for desktop */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-8 h-8 -ml-4">
                    <ArrowRight className="w-6 h-6 text-teal-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do and shape the Amenade community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white p-8 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-teal-100 rounded-lg">
                    <value.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re a passionate team of innovators, travelers, and logistics experts dedicated
              to making global shipping accessible to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {member.avatar ? (
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-gray-600">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-teal-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-teal-100 mb-8">
            Join thousands of users who are already sending and delivering packages worldwide.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <Link className="flex items-center gap-1" href="/packages/create">
                <Package className="w-5 h-5 mr-2" />
                Send a Package
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-input hover:bg-white hover:text-teal-600">
              <Link className="flex items-center gap-1" href="/trips/create">
                <Plane className="w-5 h-5 mr-2" />
                Offer to Deliver
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}