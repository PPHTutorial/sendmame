'use client'

import Link from 'next/link'
import { Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            You don&apos;t have permission to access this resource. 
            This area is restricted to administrators only.
          </p>
          
          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            </Link>
            
            <Link href="/account/profile" className="block">
              <Button variant="outline" className="w-full">
                Go to My Profile
              </Button>
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 mt-6">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
