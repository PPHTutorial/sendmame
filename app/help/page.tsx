'use client'

import React, { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  Book, 
  Video, 
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

// FAQ Data
const faqCategories = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I create an account?',
        answer: 'To create an account, click the "Sign Up" button on the homepage and fill in your personal information. You\'ll need to verify your email address to complete the registration process.'
      },
      {
        question: 'How do I post a package for delivery?',
        answer: 'Navigate to the "Packages" section and click "Send Package". Fill in the package details, pickup and delivery locations, dates, and set your budget. Your package will be visible to travelers who can deliver it.'
      },
      {
        question: 'How do I create a trip to carry packages?',
        answer: 'Go to the "Trips" section and click "Create Trip". Enter your departure and destination cities, travel dates, and the weight/space you can spare for packages. Set your price per kg and any restrictions.'
      }
    ]
  },
  {
    title: 'Payments & Security',
    items: [
      {
        question: 'How are payments processed?',
        answer: 'All payments are processed securely through Stripe. We hold funds in escrow until successful delivery is confirmed by both parties. This ensures safety for both senders and travelers.'
      },
      {
        question: 'What happens if my package is lost or damaged?',
        answer: 'We offer package protection up to $500 for standard items. Premium protection is available for higher-value items. Report any issues within 48 hours of expected delivery for investigation.'
      },
      {
        question: 'How do I verify other users?',
        answer: 'Check user profiles for verification badges (ID verified, phone verified). Read reviews from previous transactions. Start with smaller, less valuable packages to build trust.'
      }
    ]
  },
  {
    title: 'Delivery Process',
    items: [
      {
        question: 'How do I track my package?',
        answer: 'Once your package is accepted by a traveler, you\'ll receive tracking updates. You can also message the traveler directly through our platform for real-time updates.'
      },
      {
        question: 'What items can I send?',
        answer: 'Most personal items are allowed except prohibited items like liquids over 100ml, batteries, weapons, illegal substances, or perishables. Check our complete list of restricted items in the Terms of Service.'
      },
      {
        question: 'How do I confirm delivery?',
        answer: 'Both sender and recipient will receive a confirmation code. The recipient must provide this code to the traveler to confirm successful delivery. Payment is then released to the traveler.'
      }
    ]
  },
  {
    title: 'Account & Profile',
    items: [
      {
        question: 'How do I update my profile information?',
        answer: 'Go to Settings > Profile to update your personal information, contact details, and preferences. Some changes may require re-verification.'
      },
      {
        question: 'How do I delete my account?',
        answer: 'Contact our support team to request account deletion. We\'ll help you complete any pending transactions before permanently removing your account and data.'
      }
    ]
  }
]

// Quick Help Links
const quickHelpLinks = [
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step guides',
    icon: Video,
    href: '/help/tutorials',
    external: false
  },
  {
    title: 'User Guide',
    description: 'Comprehensive documentation',
    icon: Book,
    href: '/help/guide',
    external: false
  },
  {
    title: 'Community Forum',
    description: 'Get help from other users',
    icon: MessageCircle,
    href: 'https://community.sendmame.com',
    external: true
  },
  {
    title: 'Safety Guidelines',
    description: 'Best practices for secure delivery',
    icon: CheckCircle,
    href: '/help/safety',
    external: false
  }
]

// Contact Support Options
const supportOptions = [
  {
    title: 'Live Chat',
    description: 'Get instant help from our team',
    icon: MessageCircle,
    availability: 'Available 24/7',
    action: 'Start Chat',
    href: '#chat'
  },
  {
    title: 'Email Support',
    description: 'Send us a detailed message',
    icon: Mail,
    availability: 'Response within 24 hours',
    action: 'Send Email',
    href: 'mailto:support@sendmame.com'
  },
  {
    title: 'Phone Support',
    description: 'Speak directly with support',
    icon: Phone,
    availability: 'Mon-Fri 9AM-6PM GMT',
    action: 'Call Now',
    href: 'tel:+1-555-SENDMAME'
  }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Getting Started'])
  const [expandedFAQ, setExpandedFAQ] = useState<string[]>([])

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleFAQ = (question: string) => {
    setExpandedFAQ(prev =>
      prev.includes(question)
        ? prev.filter(q => q !== question)
        : [...prev, question]
    )
  }

  // Filter FAQs based on search
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <HelpCircle className="w-8 h-8 text-teal-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
                <p className="text-sm text-gray-600">Find answers and get help with SendMaMe</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Link href="/contact">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help articles, FAQs, or guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Help Links */}
            {!searchQuery && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Help</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickHelpLinks.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      className="bg-white p-6 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                          <link.icon className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{link.title}</h3>
                            {link.external && <ExternalLink className="w-4 h-4 text-gray-400" />}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {searchQuery ? 'Search Results' : 'Frequently Asked Questions'}
              </h2>
              
              {filteredCategories.length === 0 ? (
                <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">
                    Try different keywords or browse our help categories below.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCategories.map((category) => (
                    <div key={category.title} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {!searchQuery && (
                        <button
                          onClick={() => toggleCategory(category.title)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <h3 className="font-medium text-gray-900">{category.title}</h3>
                          {expandedCategories.includes(category.title) ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      )}
                      
                      {(searchQuery || expandedCategories.includes(category.title)) && (
                        <div className={searchQuery ? '' : 'border-t border-gray-100'}>
                          {category.items.map((item) => (
                            <div key={item.question} className="border-b border-gray-100 last:border-b-0">
                              <button
                                onClick={() => toggleFAQ(item.question)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                              >
                                <span className="font-medium text-gray-900 pr-4">{item.question}</span>
                                {expandedFAQ.includes(item.question) ? (
                                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                              </button>
                              
                              {expandedFAQ.includes(item.question) && (
                                <div className="px-6 pb-4">
                                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Contact Support */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Need More Help?</h3>
              <div className="space-y-4">
                {supportOptions.map((option) => (
                  <div key={option.title} className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <option.icon className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{option.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        <div className="flex items-center space-x-1 mt-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{option.availability}</span>
                        </div>
                        <Button size="sm" className="mt-3 w-full">
                          <Link href={option.href}>
                            {option.action}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Articles */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Popular Articles</h3>
              <div className="space-y-3">
                <Link href="/help/getting-started" className="block text-sm text-teal-600 hover:text-teal-800">
                  → Getting started with SendMaMe
                </Link>
                <Link href="/help/safety" className="block text-sm text-teal-600 hover:text-teal-800">
                  → Safety tips for package delivery
                </Link>
                <Link href="/help/payments" className="block text-sm text-teal-600 hover:text-teal-800">
                  → How payments and refunds work
                </Link>
                <Link href="/help/verification" className="block text-sm text-teal-600 hover:text-teal-800">
                  → Account verification process
                </Link>
                <Link href="/help/troubleshooting" className="block text-sm text-teal-600 hover:text-teal-800">
                  → Common issues and solutions
                </Link>
              </div>
            </div>

            {/* Status Page */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">All systems operational</span>
              </div>
              <Link href="/status" className="text-sm text-teal-600 hover:text-teal-800 mt-2 block">
                View status page →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}