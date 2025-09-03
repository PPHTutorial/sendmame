'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Button, Input } from '@/components/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token || !email) {
      setIsValidToken(false)
    }
  }, [token, email])

  const validatePassword = (password: string) => {
    const errors = []
    if (password.length < 8) errors.push('At least 8 characters')
    if (!/(?=.*[a-z])/.test(password)) errors.push('One lowercase letter')
    if (!/(?=.*[A-Z])/.test(password)) errors.push('One uppercase letter')
    if (!/(?=.*\d)/.test(password)) errors.push('One number')
    if (!/(?=.*[@$!%*?&])/.test(password)) errors.push('One special character')
    return errors
  }

  const passwordErrors = validatePassword(formData.password)
  const isPasswordValid = passwordErrors.length === 0 && formData.password.length > 0
  const isConfirmPasswordValid = formData.confirmPassword === formData.password && formData.confirmPassword.length > 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isPasswordValid) {
      toast.error('Please enter a valid password')
      return
    }

    if (!isConfirmPasswordValid) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        email,
        password: formData.password
      })
      
      if (response.data.success) {
        setIsSuccess(true)
        toast.success('Password reset successfully!', {
          style: {
            background: '#10b981',
            color: '#fff',
          }
        })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Something went wrong. Please try again.'
      toast.error(errorMessage, {
        style: {
          background: '#ef4444',
          color: '#fff',
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/forgot-password')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Request New Reset Link
              </Button>
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-teal-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Password Reset Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sign In Now
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600">
              Enter your new password below to complete the reset process.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  required
                  className="w-full pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              <div className="mt-3 space-y-2">
                {passwordErrors.map((error, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <XCircle className="w-3 h-3 text-red-500" />
                    <span className="text-red-600">{error}</span>
                  </div>
                ))}
                {isPasswordValid && (
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-green-600">Password meets requirements</span>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  required
                  className="w-full pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword.length > 0 && (
                <div className="mt-2 text-sm">
                  {isConfirmPasswordValid ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">Passwords match</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-3 h-3 text-red-500" />
                      <span className="text-red-600">Passwords do not match</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !isPasswordValid || !isConfirmPasswordValid}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Resetting Password...</span>
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link 
              href="/login"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
