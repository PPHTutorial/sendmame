'use client'

import React, { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send,
  CheckCircle,
  AlertCircle,
  Globe,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react'
import Link from 'next/link'
import { NavHeader } from '@/components/shared'
import { Footer } from '@/components/navigation'
import { useAuth } from '@/lib/hooks/api'

// Contact Methods
const contactMethods = [
  {
    title: 'Customer Support',
    description: 'Get help with your account, packages, and trips',
    icon: MessageCircle,
    details: [
      { label: 'Email', value: 'support@amenade.com', href: 'mailto:support@amenade.com' },
      { label: 'Phone', value: '+1 (555) SEND-MAME', href: 'tel:+1-555-736-3626' },
      { label: 'Hours', value: '24/7 Live Chat, Phone: Mon-Fri 9AM-6PM GMT' }
    ]
  },
  {
    title: 'Business Inquiries',
    description: 'Partnerships, enterprise solutions, and business development',
    icon: Mail,
    details: [
      { label: 'Email', value: 'business@amenade.com', href: 'mailto:business@amenade.com' },
      { label: 'Phone', value: '+1 (555) 123-4567', href: 'tel:+1-555-123-4567' },
      { label: 'Hours', value: 'Mon-Fri 9AM-5PM GMT' }
    ]
  },
  {
    title: 'Press & Media',
    description: 'Media inquiries, press releases, and brand assets',
    icon: Globe,
    details: [
      { label: 'Email', value: 'press@amenade.com', href: 'mailto:press@amenade.com' },
      { label: 'Response', value: 'Within 24 hours' }
    ]
  }
]

// Offices
const offices = [
  {
    title: 'Headquarters',
    address: '123 Innovation Drive\nTech District\nLondon, UK EC1A 1BB',
    phone: '+44 20 1234 5678',
    email: 'london@amenade.com'
  },
  {
    title: 'US Office',
    address: '456 Startup Boulevard\nSilicon Valley\nSan Francisco, CA 94105',
    phone: '+1 (415) 555-0123',
    email: 'usa@amenade.com'
  },
  {
    title: 'EU Operations',
    address: '789 Digital Street\nStartup Quarter\nBerlin, Germany 10117',
    phone: '+49 30 12345678',
    email: 'eu@amenade.com'
  }
]

// Social Media Links
const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/amenade', handle: '@amenade' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/amenade', handle: '/company/amenade' },
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/amenade', handle: '@amenade' }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'support'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { getCurrentUser } = useAuth()
  const { data: user } = getCurrentUser

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Mock form submission - In a real app, this would call an API
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'support'
      })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
       <NavHeader title='Amenade' email={user?.email} name={`${user?.firstName} ${user?.lastName}`} showMenuItems={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
        <p className="text-gray-700 mb-10">
          We&apos;re here to help! Whether you have questions about your account, need assistance with a package, or want to provide feedback, our team is ready to assist you. Please fill out the form below or reach us through any of the provided contact methods.
        </p>
        <div className="flex flex-col gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a message</h2>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Message sent successfully!</h3>
                  <p className="text-gray-600 mb-4">
                    Thank you for contacting us. We&apos;ll get back to you within 24 hours.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="support">Customer Support</option>
                      <option value="business">Business Inquiry</option>
                      <option value="press">Press & Media</option>
                      <option value="technical">Technical Issue</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please provide details about your inquiry..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-vertical"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Before contacting support:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                          <li>Check our <Link href="/help" className="underline hover:text-blue-900">Help Center</Link> for quick answers</li>
                          <li>Make sure you&apos;re logged into your account</li>
                          <li>Include relevant order/trip numbers if applicable</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Get in Touch</h3>
              <div className="space-y-6">
                {contactMethods.map((method) => (
                  <div key={method.title}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <method.icon className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{method.title}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                    <div className="ml-11 space-y-2">
                      {method.details.map((detail) => (
                        <div key={detail.label} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{detail.label}:</span>
                          {detail.href ? (
                            <Link
                              href={detail.href}
                              className="text-teal-600 hover:text-teal-800 font-medium"
                            >
                              {detail.value}
                            </Link>
                          ) : (
                            <span className="text-gray-900 font-medium">{detail.value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Office Locations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Our Offices</h3>
              <div className="space-y-4">
                {offices.map((office) => (
                  <div key={office.title} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                    <h4 className="font-medium text-gray-900 mb-2">{office.title}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 whitespace-pre-line">{office.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <Link href={`tel:${office.phone.replace(/\s/g, '')}`} className="text-teal-600 hover:text-teal-800">
                          {office.phone}
                        </Link>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <Link href={`mailto:${office.email}`} className="text-teal-600 hover:text-teal-800">
                          {office.email}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
              <div className="space-y-3">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-teal-100 transition-colors">
                      <social.icon className="w-4 h-4 text-gray-600 group-hover:text-teal-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{social.name}</div>
                      <div className="text-sm text-gray-600">{social.handle}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Response Times</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Live Chat</div>
                    <div className="text-xs text-gray-600">Instant response (24/7)</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Email Support</div>
                    <div className="text-xs text-gray-600">Within 24 hours</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Phone Support</div>
                    <div className="text-xs text-gray-600">Mon-Fri 9AM-6PM GMT</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}