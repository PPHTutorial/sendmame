'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const RegisterForm = dynamic(
  () => import('@/components/auth').then(mod => ({ default: mod.RegisterForm })),
  { ssr: false }
)

export default function RegisterPage() {
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
        {/* Left Panel - Registration Form */}
        <div className="w-full  flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-xl">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <svg className="w-8 h-8 text-teal-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Amenade</h1>
            </div>

            {/* Register Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Join Amenade</h2>
                <p className="text-teal-100">Connect with travelers worldwide</p>
              </div>

              <RegisterForm />

              {/* Sign in link */}
              <div className="mt-8 text-center">
                <p className="text-teal-100">
                  Already have an account?{' '}
                  <Link href="/login" className="text-teal-300 hover:text-teal-200 font-semibold transition-colors duration-200 hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>

              {/* Divider */}
              <div className="mt-8 flex items-center">
                <div className="flex-1 border-t border-white/20"></div>
                <div className="px-4 text-sm text-teal-100">or continue with</div>
                <div className="flex-1 border-t border-white/20"></div>
              </div>

              {/* Social Register Buttons */}
              <div className="mt-6 grid grid-cols-1 gap-3">
                <button className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/20 transition-all duration-200 hover:shadow-lg group">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-white font-medium group-hover:text-teal-100 transition-colors">Continue with Google</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-teal-200">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-teal-300 hover:text-teal-200 transition-colors">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-teal-300 hover:text-teal-200 transition-colors">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Benefits */}
        {/*  */}
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
