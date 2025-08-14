/* eslint-disable react/no-unescaped-entities */
// Fakomame Platform - Authentication Components
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button, Input, Card } from '@/components/ui'
import { useAuth } from '@/lib/hooks/api'
import { RegisterData, LoginCredentials } from '@/lib/types'

// Register Form Component
export function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'SENDER'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      register.mutate(formData, {
        onSuccess: () => {
          toast.success('Account created successfully!')
          router.push('/dashboard')
          setIsLoading(false)
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Registration failed')
          setIsLoading(false)
        }
      })
    } catch (error: any) {
      toast.error('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600">Join Fakomame to send or carry packages</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-1">
              First Name
            </label>
            <Input
              className='text-black'
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-1">
              Last Name
            </label>
            <Input
              className='text-black'
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-500 mb-1">
            Email Address
          </label>
          <Input
            className='text-black'
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-500 mb-1">
            Phone Number
          </label>
          <Input
            className='text-black'
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1234567890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-500 mb-1">
            Account Type
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option className='text-black' value="SENDER">Package Sender</option>
            <option className='text-black' value="TRAVELER">Traveler</option>
            {/* <option className='text-black' value="BOTH">Both Sender & Traveler</option> */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-500 mb-1">
            Password
          </label>
          <Input
            className='text-black'
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full text-white"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </Card>
  )
}

// Login Form Component
export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      login.mutate(formData, {
        onSuccess: () => {
          toast.success('Welcome back!')
          router.push('/dashboard')
          setIsLoading(false)
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Login failed')
          setIsLoading(false)
        }
      })
    } catch (error: any) {
      toast.error('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: LoginCredentials) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your Fakomame account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-500 mb-1">
            Email Address
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
            
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-500 mb-1">
            Password
          </label>
          <Input
            className='text-black'
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full text-white"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </Card>
  )
}

// Auth Guard Component
interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/auth/login'
}: AuthGuardProps) {
  const router = useRouter()
  const { getCurrentUser } = useAuth()
  const { data: user, isLoading, error } = getCurrentUser

  React.useEffect(() => {
    if (!isLoading && requireAuth && (!user || error)) {
      router.push(redirectTo)
    }
  }, [user, isLoading, error, requireAuth, redirectTo, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (requireAuth && (!user || error)) {
    return null
  }

  return <>{children}</>
}

// User Profile Display Component
export function UserProfile() {
  const { getCurrentUser, logout } = useAuth()
  const { data: user, isLoading } = getCurrentUser
  const router = useRouter()

  const handleLogout = async () => {
    try {
      logout.mutate(undefined, {
        onSuccess: () => {
          toast.success('Logged out successfully')
          router.push('/')
        },
        onError: () => {
          toast.error('Logout failed')
        }
      })
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse flex items-center space-x-4">
        <div className="rounded-full bg-gray-300 h-10 w-10"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-20"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 text-white text-sm font-medium">
            {user.firstName[0]}{user.lastName[0]}
          </span>
        </div>
        <span className="text-sm font-medium text-neutral-500">
          {user.firstName} {user.lastName}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={logout.isPending}
      >
        Logout
      </Button>
    </div>
  )
}
