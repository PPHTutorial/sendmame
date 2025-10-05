// Amenade Platform - Authentication Components
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { Button, Input } from '@/components/ui'
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
          router.push('/')
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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="group">
              <label className="block text-sm font-medium text-teal-100 mb-2">
                First Name
              </label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-teal-200/60 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-200 backdrop-blur-sm"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-teal-100 mb-2">
                Last Name
              </label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-teal-200/60 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-200 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-teal-100 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-teal-200/60 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-200 backdrop-blur-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="w-5 h-5 text-teal-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-teal-100 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-teal-200/60 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-200 backdrop-blur-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="w-5 h-5 text-teal-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-teal-100 mb-2">
              Account Type
            </label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-200 backdrop-blur-sm appearance-none"
              >
                <option className='text-black bg-white' value="SENDER">Package Sender</option>
                <option className='text-black bg-white' value="TRAVELER">Traveler</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-teal-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-teal-100 mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-teal-200/60 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all duration-200 backdrop-blur-sm"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-teal-800 hover:text-teal-200 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.757 6.757M9.878 9.878a3 3 0 103.242 3.242m0-3.242l4.121 4.122m0 0l2.122 2.121M15.121 15.121L18.243 18.243m-6.122-6.122a3 3 0 00-4.243 4.243 3 3 0 004.243-4.243z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-2 text-xs text-teal-200/80">
              Password must be at least 8 characters long
            </div>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-teal-400 focus:ring-teal-400 border-white/20 rounded bg-white/5 accent-teal-600 assent-teal-600"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="text-teal-100">
              I agree to the{' '}
              <Link href="/terms" className="text-teal-300 hover:text-teal-200 transition-colors">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-teal-300 hover:text-teal-200 transition-colors">
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-500 hover:from-teal-600 hover:to-teal-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <span className="relative z-10">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-teal-200">Or continue with</span>
          </div>
        </div>

        {/* Google Sign Up */}
        <Button
          type="button"
          onClick={() => {
            // Use NextAuth signIn for Google
            import('next-auth/react').then(({ signIn }) => {
              signIn('google', { callbackUrl: '/' })
            })
          }}
          variant="outline"
          className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20 py-3 px-4 rounded-xl transition-all duration-200"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </div>
        </Button>
      </form>
    </div>
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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="group">
            <label className="block text-sm font-medium text-emerald-100 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-200 backdrop-blur-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-emerald-100 mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-200 backdrop-blur-sm"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-800 hover:text-emerald-200 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.757 6.757M9.878 9.878a3 3 0 103.242 3.242m0-3.242l4.121 4.122m0 0l2.122 2.121M15.121 15.121L18.243 18.243m-6.122-6.122a3 3 0 00-4.243 4.243 3 3 0 004.243-4.243z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember_me"
              name="remember_me"
              type="checkbox"
              className="h-4 w-4 text-emerald-400 focus:ring-emerald-400 border-white/20 rounded bg-white/5 accent-teal-600"
            />
            <label htmlFor="remember_me" className="ml-2 block text-sm text-emerald-100">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link href="/forgot-password" className="text-emerald-300 hover:text-emerald-200 transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <span className="relative z-10">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </Button>

        {/* Divider */}
        <div className="mt-8 flex items-center">
          <div className="flex-1 border-t border-white/20"></div>
          <div className="px-4 text-sm text-teal-100">or continue with</div>
          <div className="flex-1 border-t border-white/20"></div>
        </div>

        {/* Google Sign In */}

        <div className="mt-6 grid grid-cols-1 gap-3">
          <button className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/20 transition-all duration-200 hover:shadow-lg group"
            onClick={() => {
              // Use NextAuth signIn for Google
              import('next-auth/react').then(({ signIn }) => {
                signIn('google', { callbackUrl: '/' })
              })
            }}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-white font-medium group-hover:text-teal-100 transition-colors">Continue with Google</span>
          </button>
        </div>
      </form>
    </div>
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
  redirectTo = '/login'
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
