'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const LoginForm = dynamic(
  () => import('@/components/auth').then(mod => ({ default: mod.LoginForm })),
  { ssr: false }
)

export default function LoginPage() {
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
            Welcome Back
          </h2>
          <p className="text-gray-600">
            Sign in to continue your shipping journey
          </p>
        </div>

        {/* Form */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <LoginForm />
          
          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-green-600 hover:text-green-700 font-semibold">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 max-w-2xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-green-200">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 font-medium">Secure Platform</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-green-200">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 font-medium">Fast Delivery</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-green-200">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 font-medium">Global Network</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
