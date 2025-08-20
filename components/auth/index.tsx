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
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'SENDER'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      register.mutate(formData, {
        onSuccess: () => {
          toast.success('Account created successfully!', {
            style: {
              background: '#07921f',
              color: '#fff',
              fontSize: '14px',
            }
          })
          router.push('/dashboard')
          setIsLoading(false)
        },
        onError: (error: any) => {
          console.log('Registration error:', error)
          console.log('Resetting form data due to error', error)
          toast.error(error.message || 'Registration failed', {
            style: {
              background: '#f44336',
              color: '#fff',
              fontSize: '14px',
            }
          })
          setIsLoading(false)
          if (error?.response?.data?.field) {
            const errorField = error.response.data.field
            const fieldElement = document.querySelector(`input[name="${errorField}"], select[name="${errorField}"]`)
            if (fieldElement) {
              fieldElement.classList.add('border-red-500', 'ring-red-500')
              setTimeout(() => {
                fieldElement.classList.remove('border-red-500', 'ring-red-500')
              }, 3000)
            }
          }
        }
      })
    } catch (_error: any) {
      toast.error('An unexpected error occurred', {
        style: {
          background: '#f44336',
          color: '#fff',
          fontSize: '14px',
        }
      })
      setIsLoading(false)
    }
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
          <div className="relative">
            <Input
              className='text-black pr-10'
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.757 6.757M9.878 9.878a3 3 0 103.242 3.242m0-3.242l4.121 4.122m0 0l2.122 2.121M15.121 15.121L18.243 18.243m-6.122-6.122a3 3 0 00-4.243 4.243 3 3 0 004.243-4.243z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
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
  const [showPassword, setShowPassword] = useState(false)
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
          toast.success('Welcome back! You\'re successfully logged in.', {
            style: {
              background: '#07921f',
              color: '#fff',
              fontSize: '14px',
            }
          })
          router.replace('/')
          setIsLoading(false)
        },
        onError: (error: any) => {
          toast.error(error.message || 'Login failed', {
            style: {
              background: '#f44336',
              color: '#fff',
              fontSize: '14px',
            }
          })

          setIsLoading(false)
        }
      })
    } catch (_error: any) {
      toast.error('An unexpected error occurred', {
        style: {
          background: '#f44336',
          color: '#fff',
          fontSize: '14px',
        }
      })
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
          <div className="relative">
            <Input
              className='text-black pr-10'
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.757 6.757M9.878 9.878a3 3 0 103.242 3.242m0-3.242l4.121 4.122m0 0l2.122 2.121M15.121 15.121L18.243 18.243m-6.122-6.122a3 3 0 00-4.243 4.243 3 3 0 004.243-4.243z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
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
          toast.success('Logged out successfully', {
            style: {
              background: '#07921f',
              color: '#fff',
              fontSize: '14px',
            }
          })
          router.push('/')
        },
        onError: () => {
          toast.error('Logout failed', {
            style: {
              background: '#f44336',
              color: '#fff',
              fontSize: '14px',
            }
          })
        }
      })
    } catch (_error) {
      toast.error('Logout failed', {
        style: {
          background: '#f44336',
          color: '#fff',
          fontSize: '14px',
        }
      })
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
          {/* <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white text-sm font-medium">
            {user ? user.firstName[0] : "S"}{user ? user.lastName[0] : "L"}
          </span> */}
        </div>
        <span className="text-sm font-medium text-neutral-500">
          {user ? user.firstName : "John"} {user ? user.lastName : "Doe"}
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
