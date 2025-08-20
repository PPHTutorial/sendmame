'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const RegisterForm = dynamic(
  () => import('@/components/auth').then(mod => ({ default: mod.RegisterForm })),
  { ssr: false }
)

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute left-0 top-0 h-full w-48 text-green-200 opacity-30" fill="currentColor" viewBox="0 0 100 100">
          <circle cx="10" cy="10" r="1"/>
          <circle cx="20" cy="20" r="1"/>
          <circle cx="30" cy="10" r="1"/>
          <circle cx="40" cy="20" r="1"/>
          <circle cx="10" cy="30" r="1"/>
          <circle cx="20" cy="40" r="1"/>
          <circle cx="30" cy="30" r="1"/>
          <circle cx="40" cy="40" r="1"/>
        </svg>
        <svg className="absolute right-0 bottom-0 h-full w-48 text-green-200 opacity-30" fill="currentColor" viewBox="0 0 100 100">
          <circle cx="60" cy="70" r="1"/>
          <circle cx="70" cy="80" r="1"/>
          <circle cx="80" cy="70" r="1"/>
          <circle cx="90" cy="80" r="1"/>
        </svg>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <svg className="w-12 h-12 text-green-600 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-green-800 mb-2">Fakomame</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Join Fakomame
          </h2>
          <p className="text-gray-600">
            Connect with travelers worldwide and start shipping
          </p>
        </div>

        {/* Form */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <RegisterForm />
          
          {/* Sign in link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-12 max-w-2xl mx-auto px-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Why Choose Fakomame?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Earn Money</h4>
                  <p className="text-sm text-gray-600">Make money by carrying packages when you travel</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Send Packages</h4>
                  <p className="text-sm text-gray-600">Send packages faster and cheaper than traditional shipping</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Safe & Secure</h4>
                  <p className="text-sm text-gray-600">All packages are insured and tracked for your peace of mind</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Global Network</h4>
                  <p className="text-sm text-gray-600">Connect with travelers worldwide for international shipping</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
