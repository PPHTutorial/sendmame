'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const LoginForm = dynamic(
  () => import('@/components/auth').then(mod => ({ default: mod.LoginForm })),
  { ssr: false }
)

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 via-transparent to-teal-500/20 animate-pulse"></div>
      </div>

      {/* Geometric Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-teal-400/5 rounded-full blur-2xl animate-float-slow"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Animated particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-teal-400 rounded-full animate-ping opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-teal-400 rounded-full animate-ping opacity-40 animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-teal-400 rounded-full animate-ping opacity-50 animation-delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen">
        

        {/* Right Panel - Login Form */}
        <div className="w-full flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-xl">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <svg className="w-8 h-8 text-teal-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Fakomame</h1>
            </div>

            {/* Login Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-teal-100">Sign in to continue your journey</p>
              </div>

              <LoginForm />

              {/* Sign up link */}
              <div className="mt-8 text-center">
                <p className="text-teal-100">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="text-teal-300 hover:text-teal-200 font-semibold transition-colors duration-200 hover:underline">
                    Create one now
                  </Link>
                </p>
              </div>

             
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-teal-200">
                By signing in, you agree to our{' '}
                <Link href="/terms" className="text-teal-300 hover:text-teal-200 transition-colors">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-teal-300 hover:text-teal-200 transition-colors">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite 2s;
        }
        
        .animate-float-slow {
          animation: float 8s ease-in-out infinite 1s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
      `}</style>
    </div>
  )
}
